import { useCallback, useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import {
  getRoundState,
  teacherListMessages,
  teacherSendMessage,
} from "@/lib/rounds.functions";
import { cn } from "@/lib/utils";

type Sent = {
  id: string;
  teamId: string | null;
  teamName: string | null;
  body: string;
  createdAt: string;
};

type Props = {
  password: string;
  code: string;
  /** Gruppen mit den bereits bestätigten Nachrichten (für «gelesen von»). */
  acks?: { name: string; ids: string[] }[];
  /** Vorausgewählte Zielgruppe (z. B. nach «Antworten» im Hilfefeed). */
  initialTarget?: string | null;
  /** Wird beim Senden zurückgesetzt, damit die Vorauswahl nur einmal greift. */
  onTargetConsumed?: () => void;
};

const MAX = 300;

function timeLabel(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}

/** Kurznachricht der Lehrperson an alle Gruppen oder an eine einzelne Gruppe. */
export function MessagePanel({ password, code, acks = [] }: Props) {
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<string>("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Sent[]>([]);

  const load = useCallback(() => {
    void teacherListMessages({ data: { password, code } })
      .then(setSent)
      .catch(() => undefined);
  }, [password, code]);

  useEffect(() => {
    load();
    void getRoundState({ data: { code } })
      .then((res) => setTeams(res.found ? res.teams : []))
      .catch(() => undefined);
  }, [load, code]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    try {
      await teacherSendMessage({
        data: { password, code, teamId: target === "all" ? null : target, body: text },
      });
      setBody("");
      setError(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Senden fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-4 rounded-sm border border-border bg-secondary/40 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        Nachricht an die Gruppen
      </p>

      <form onSubmit={(e) => void send(e)} className="mt-2 space-y-2">
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="min-h-[44px] w-full rounded-sm border border-border bg-paper px-3 text-[16px]"
        >
          <option value="all">Alle Gruppen</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <textarea
          value={body}
          maxLength={MAX}
          rows={2}
          onChange={(e) => setBody(e.target.value)}
          placeholder="z. B. Treffpunkt um 16:00 beim Bahnhof Heerbrugg"
          className="w-full rounded-sm border border-border bg-paper px-3 py-2 text-[16px] focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/25"
        />

        <div className="flex items-center justify-between gap-3">
          <span className="font-mono-typed text-[10px] text-muted-foreground">
            {body.length}/{MAX}
          </span>
          <button
            type="submit"
            disabled={busy || body.trim().length === 0}
            className={cn(
              "flex min-h-[48px] items-center justify-center gap-2 rounded-sm bg-primary px-5 font-serif font-semibold text-primary-foreground",
              (busy || body.trim().length === 0) && "opacity-60",
            )}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Senden
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-2 rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <p className="mt-1 text-xs text-muted-foreground">
        Die Gruppen sehen die Nachricht innert rund zehn Sekunden als Pop-up.
      </p>

      {sent.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-border pt-2">
          {sent.map((m) => {
            const relevant = m.teamId
              ? acks.filter((a) => a.name === m.teamName)
              : acks;
            const read = relevant.filter((a) => a.ids.includes(m.id));
            return (
              <li key={m.id} className="text-xs text-muted-foreground">
                <span className="font-mono-typed text-[10px] uppercase tracking-wider">
                  {timeLabel(m.createdAt)} · {m.teamName ?? "Alle Gruppen"}
                  {relevant.length > 0 && (
                    <>
                      {" · "}
                      <span className={read.length === relevant.length ? "text-emerald-700" : ""}>
                        gelesen {read.length}/{relevant.length}
                      </span>
                    </>
                  )}
                </span>
                <p className="text-foreground/80">{m.body}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

}
