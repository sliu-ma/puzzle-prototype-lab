import { RefreshCw, Projector } from "lucide-react";
import { useState } from "react";
import { useRoundReport } from "./LobbyPanel";
import { cn } from "@/lib/utils";

export function LiveBoard({
  password,
  code,
  budgetMin,
  startedAt,
}: {
  password: string;
  code: string;
  budgetMin: number;
  startedAt: string | null;
}) {
  const { report, loading } = useRoundReport(password, code, 8000);
  const [beamer, setBeamer] = useState(false);
  const teams = report?.teams ?? [];

  const elapsedMin = startedAt
    ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 60_000)
    : null;
  const remainingMin =
    elapsedMin === null ? null : Math.max(0, budgetMin - elapsedMin);

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>
          {elapsedMin === null
            ? "Runde noch nicht gestartet"
            : `Läuft seit ${elapsedMin} min · ${remainingMin} min übrig`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBeamer((b) => !b)}
            className="flex items-center gap-1 rounded-sm border border-border px-2 py-1"
          >
            <Projector className="h-3.5 w-3.5" />
            Beamer
          </button>
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </div>
      </div>

      {teams.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Noch keine Gruppe unterwegs.</p>
      ) : (
        <ol className="mt-2 space-y-1.5">
          {teams.map((t, i) => (
            <li
              key={t.teamId}
              className="flex items-center gap-2 rounded-sm border border-border bg-card/70 px-2.5 py-2"
            >
              <span
                className={cn(
                  "font-mono-typed w-6 font-bold tabular-nums text-muted-foreground",
                  beamer && "text-2xl",
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate font-serif font-semibold",
                  beamer && "text-3xl",
                )}
              >
                {t.name}
              </span>
              {!beamer && (
                <span className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t.stagesSolved}/5 · {t.hintsUsed} Hinweise
                </span>
              )}
              <span
                aria-hidden
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  t.finishedAt ? "bg-stamp" : "animate-pulse bg-primary/60",
                )}
                title={t.finishedAt ? "fertig" : "spielt"}
              />
              <span
                className={cn(
                  "font-mono-typed font-bold tabular-nums",
                  beamer && "text-3xl",
                )}
              >
                {t.points}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
