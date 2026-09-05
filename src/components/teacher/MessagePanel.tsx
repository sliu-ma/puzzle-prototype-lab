import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { teacherSendMessage } from "@/lib/rounds.functions";
import { cn } from "@/lib/utils";

type Props = {
  password: string;
  code: string;
  /** Empfänger: null = alle Gruppen. */
  teamId: string | null;
  /** Wird nach erfolgreichem Senden aufgerufen (Verlauf neu laden). */
  onSent?: () => void;
};

const MAX = 300;

/** Schreibfeld eines Chatraums (alle Gruppen oder eine einzelne Gruppe). */
export function MessageComposer({ password, code, teamId, onSent }: Props) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setBusy(true);
    try {
      await teacherSendMessage({ data: { password, code, teamId, body: text } });
      setBody("");
      setError(null);
      onSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Senden fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={(e) => void send(e)} className="mt-3 space-y-2">
      <textarea
        value={body}
        maxLength={MAX}
        rows={2}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          teamId
            ? "Antwort an diese Gruppe …"
            : "z. B. Treffpunkt um 16:00 beim Bahnhof Heerbrugg"
        }
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
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Senden
        </button>
      </div>
      {error && (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Die Gruppe sieht die Nachricht innert rund zehn Sekunden als Pop-up.
      </p>
    </form>
  );
}
