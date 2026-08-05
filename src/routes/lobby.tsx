import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Users, Check, AlertTriangle } from "lucide-react";
import { getRoundState } from "@/lib/rounds.functions";
import {
  clearPendingJoin,
  getPendingJoin,
  setRoundSession,
  type PendingJoin,
} from "@/lib/round-client";
import { registerTeam, resetAll, setBudgetMin } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lobby")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Wartezimmer, Klassenrunde startet gleich" },
      {
        name: "description",
        content:
          "Euer Team ist angemeldet. Sobald die Lehrperson die Runde startet, beginnt die Ermittlung für alle gleichzeitig.",
      },
      { property: "og:title", content: "Wartezimmer, Klassenrunde startet gleich" },
      {
        property: "og:description",
        content: "Angemeldete Teams der Runde und gemeinsamer Start durch die Lehrperson.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LobbyPage,
});

function LobbyPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<PendingJoin | null>(null);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = useState<string>("lobby");
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const p = getPendingJoin();
    if (!p) {
      void navigate({ to: "/" });
      return;
    }
    setPending(p);
  }, [navigate]);

  const beginGame = useCallback(
    (p: PendingJoin, startedAt: string | null, budgetMin: number) => {
      if (started.current) return;
      started.current = true;
      const startTs = startedAt ? new Date(startedAt).getTime() : Date.now();
      // Countdown 3 – 2 – 1 – Los, danach startet die ganze Klasse gemeinsam.
      setCountdown(3);
      let n = 3;
      const iv = window.setInterval(() => {
        n -= 1;
        setCountdown(n);
        if (n > 0) return;
        window.clearInterval(iv);
        resetAll();
        setBudgetMin(budgetMin);
        registerTeam(p.teamName, p.code, p.members, startTs);
        setRoundSession({
          code: p.code,
          title: p.title,
          teamId: p.teamId,
          token: p.token,
          startedAt,
        });
        clearPendingJoin();
        // Briefing zuerst: die Startseite zeigt den IntroScreen.
        window.setTimeout(() => void navigate({ to: "/" }), 900);
      }, 1000);
    },
    [navigate],
  );



  if (removed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 p-5">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h1 className="mt-3 font-serif text-2xl font-bold">
            Euer Team ist nicht mehr in der Runde
          </h1>
          <p className="mt-2 text-sm text-foreground/80">
            Die Lehrperson hat das Team entfernt oder die Runde gelöscht. Meldet euch
            nochmals an.
          </p>
          <button
            type="button"
            onClick={() => {
              clearPendingJoin();
              void navigate({ to: "/" });
            }}
            className="mt-4 min-h-[48px] w-full rounded-sm bg-primary px-5 font-serif font-semibold text-primary-foreground"
          >
            Zurück zur Anmeldung
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-10">
      <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
        Wartezimmer · Runde {pending.code}
      </p>
      <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">
        {pending.title || "Klassenrunde"}
      </h1>

      <div className="mt-5 rounded-sm border border-border bg-secondary/50 p-4">
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-stamp" />
          <span className="font-serif text-lg font-bold">{pending.teamName}</span>
        </div>
        <p className="mt-1 text-sm text-foreground/70">
          {pending.members.join(", ")}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-sm border border-dashed border-border p-4">
        <Loader2 className="h-5 w-5 animate-spin text-stamp" />
        <p className="text-sm text-foreground/80">
          {status === "closed"
            ? "Die Anmeldung ist geschlossen. Warten auf den Start."
            : "Warten auf die Lehrperson. Handy nicht schliessen."}
        </p>
      </div>

      <h2 className="mt-6 flex items-center gap-2 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        Angemeldete Teams ({teams.length})
      </h2>
      <ul className="mt-2 space-y-1.5">
        {teams.map((t) => (
          <li
            key={t.id}
            className={cn(
              "rounded-sm border border-border bg-card px-3 py-2 font-serif",
              t.id === pending.teamId && "border-stamp bg-stamp/10 font-bold",
            )}
          >
            {t.name}
            {t.id === pending.teamId && (
              <span className="ml-2 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                Ihr
              </span>
            )}
          </li>
        ))}
      </ul>

      {error && (
        <p className="mt-4 rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </main>
  );
}
