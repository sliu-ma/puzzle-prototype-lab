import { useEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import type { ReportTeam } from "./LobbyPanel";
import { Rank, Status } from "@/components/case-file/Leaderboard";
import { cn } from "@/lib/utils";

/** Kompakte Live-Rangliste der Runde: Rang, Team, Etappen, Punkte. */
export function LiveLeaderboard({ teams, code }: { teams: ReportTeam[]; code?: string }) {
  const [big, setBig] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Beim Öffnen der Grossansicht auch den Browser-Vollbildmodus versuchen.
  useEffect(() => {
    if (!big) {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
      return;
    }
    boxRef.current?.requestFullscreen?.().catch(() => undefined);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBig(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [big]);

  if (teams.length === 0) return null;

  const rows = [...teams].sort(
    (a, b) => b.points - a.points || a.name.localeCompare(b.name),
  );

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
          Rangliste
        </p>
        <button
          type="button"
          onClick={() => setBig(true)}
          className="flex items-center gap-1 rounded-sm border border-border bg-card px-2 py-1 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        >
          <Maximize2 className="h-3 w-3" />
          Grossansicht
        </button>
      </div>
      <ol className="divide-y divide-border overflow-hidden rounded-sm border border-border bg-card">
        {rows.map((t, i) => (
          <li key={t.teamId} className="flex items-center gap-3 px-3 py-2.5">
            <Rank index={i} self={false} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-serif text-sm font-semibold text-foreground">
                {t.name}
              </span>
              <span className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                {Math.min(t.stagesSolved, 5)}/5 Etappen
              </span>
            </span>
            <Status finished={!!t.finishedAt} />
            <span className="text-right">
              <span className={cn("block font-mono-typed text-sm font-bold tabular-nums text-foreground")}>
                {t.points}
              </span>
              <span className="block text-[0.6rem] text-muted-foreground">Punkte</span>
            </span>
          </li>
        ))}
      </ol>

      {/* Grossansicht für Beamer */}
      <div
        ref={boxRef}
        className={cn(
          "bg-background",
          big
            ? "fixed inset-0 z-50 flex flex-col overflow-y-auto p-[3vh_4vw]"
            : "hidden",
        )}
      >
        {big && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono-typed text-[1.4vh] uppercase tracking-[0.3em] text-muted-foreground">
                  Majas Mission{code ? ` · Runde ${code}` : ""}
                </p>
                <h2 className="mt-1 font-serif text-[5vh] font-bold leading-tight text-foreground">
                  Rangliste
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setBig(false)}
                className="flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-2 font-mono-typed text-[1.4vh] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Schliessen
              </button>
            </div>

            <ol className="mt-[3vh] divide-y divide-border overflow-hidden rounded-sm border border-border bg-card">
              {rows.map((t, i) => (
                <li key={t.teamId} className="flex items-center gap-[2vw] px-[2vw] py-[1.6vh]">
                  <span className="w-[4vw] min-w-10 shrink-0 text-center font-mono-typed text-[4vh] font-bold tabular-nums text-stamp">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-[3.6vh] font-semibold leading-tight text-foreground">
                      {t.name}
                    </span>
                    <span className="font-mono-typed text-[1.5vh] uppercase tracking-wider text-muted-foreground">
                      {Math.min(t.stagesSolved, 5)}/5 Etappen
                      {t.finishedAt ? " · abgeschlossen" : ""}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-mono-typed text-[4.4vh] font-bold leading-none tabular-nums text-foreground">
                      {t.points}
                    </span>
                    <span className="block font-mono-typed text-[1.4vh] uppercase tracking-wider text-muted-foreground">
                      Punkte
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
