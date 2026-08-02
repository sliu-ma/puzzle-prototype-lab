import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock, Lightbulb, Medal, Trophy } from "lucide-react";
import { useLeaderboard } from "@/lib/use-leaderboard";
import { getRoundSession } from "@/lib/round";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rangliste")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search["code"] === "string" ? (search["code"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Live-Rangliste | Ermittlung Thermika Ost" },
      {
        name: "description",
        content:
          "Live-Rangliste der Ermittlungsteams: gelöste Etappen, benötigte Zeit und genutzte Hinweise.",
      },
      { property: "og:title", content: "Live-Rangliste | Ermittlung Thermika Ost" },
      {
        property: "og:description",
        content: "Wer ist wie weit? Live-Stand aller Ermittlungsteams der Runde.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RanglistePage,
});

function RanglistePage() {
  const session = useMemo(() => getRoundSession(), []);
  const [input, setInput] = useState("");
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("code");
    const initial = fromUrl ?? session?.roundCode ?? null;
    if (initial) {
      setCode(initial.toUpperCase());
      setInput(initial.toUpperCase());
    }
  }, [session]);

  const { loading, error, roundTitle, teams } = useLeaderboard(code);

  return (
    <main className="min-h-screen bg-paper px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono-typed text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Übersicht
        </Link>

        <h1 className="mt-4 font-serif text-3xl font-bold">Live-Rangliste</h1>
        <p className="mt-1 font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
          {code ? `Runde ${code}${roundTitle ? ` · ${roundTitle}` : ""}` : "Rundencode eingeben"}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCode(input.trim().toUpperCase() || null);
          }}
          className="mt-5 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Rundencode"
            autoCapitalize="characters"
            className="min-w-0 flex-1 rounded-sm border border-border bg-card px-3 py-2 font-mono-typed text-sm uppercase tracking-wider focus:border-stamp focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-sm bg-primary px-4 py-2 font-serif text-sm font-semibold text-primary-foreground"
          >
            Anzeigen
          </button>
        </form>

        {loading && (
          <p className="mt-6 font-serif text-sm text-muted-foreground">Lade Rangliste …</p>
        )}
        {error && (
          <p className="mt-6 rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && !error && code && teams.length === 0 && (
          <p className="mt-6 font-serif text-sm text-muted-foreground">
            Noch keine Teams in dieser Runde.
          </p>
        )}

        <ol className="mt-6 space-y-2">
          {teams.map((t, i) => {
            const isOwn = session?.teamId === t.id;
            return (
              <li
                key={t.id}
                className={cn(
                  "rounded-sm border bg-card p-3",
                  isOwn ? "border-stamp bg-secondary/40" : "border-border",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary font-mono-typed text-xs font-bold">
                    {i === 0 ? <Trophy className="h-3.5 w-3.5 text-stamp" /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-base font-bold">
                      {t.name}
                      {isOwn && (
                        <span className="ml-2 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                          euer Team
                        </span>
                      )}
                    </p>
                    {t.members.length > 0 && (
                      <p className="truncate font-serif text-xs text-muted-foreground">
                        {t.members.join(", ")}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-typed text-[11px] text-muted-foreground">
                      <span>{Math.min(t.stagesDone, 5)} / 5 Etappen</span>
                      <span className="inline-flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" /> {t.hintsUsed}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Medal className="h-3 w-3" /> {t.badges.length}
                      </span>
                      {t.finished && (
                        <span className="inline-flex items-center gap-1 text-stamp">
                          <Clock className="h-3 w-3" />
                          {t.durationMin ? `${t.durationMin} Min` : "fertig"}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-stamp transition-all duration-500"
                        style={{ width: `${(Math.min(t.stagesDone, 5) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Rangfolge: Etappen, dann Zeit, dann Hinweise
        </p>
      </div>
    </main>
  );
}
