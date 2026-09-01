import type { ReportTeam } from "./LobbyPanel";
import { Rank, Status } from "@/components/case-file/Leaderboard";
import { cn } from "@/lib/utils";

/** Kompakte Live-Rangliste der Runde: Rang, Team, Etappen, Punkte. */
export function LiveLeaderboard({ teams }: { teams: ReportTeam[] }) {
  if (teams.length === 0) return null;

  const rows = [...teams].sort(
    (a, b) => b.points - a.points || a.name.localeCompare(b.name),
  );

  return (
    <div className="mt-4">
      <p className="mb-2 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        Rangliste
      </p>
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
    </div>
  );
}
