import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRoundReport } from "./LobbyPanel";
import { ProgressMatrix } from "./ProgressMatrix";
import { LiveLeaderboard } from "./LiveLeaderboard";
import { cn } from "@/lib/utils";

function fmtMmSs(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function LiveBoard({
  password,
  code,
  budgetMin,
  startedAt,
  status,
}: {
  password: string;
  code: string;
  budgetMin: number;
  startedAt: string | null;
  status?: string;
}) {
  const { report, loading, updatedAt } = useRoundReport(password, code, 8000);
  const teams = report?.teams ?? [];

  // Eigener Sekundentakt: die Restzeit läuft flüssig, unabhängig davon,
  // wann die Daten das letzte Mal geladen wurden.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const iv = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(iv);
  }, []);

  const startMs = startedAt ? Date.parse(startedAt) : null;

  // Endpunkt der Runde: Zeitbudget aufgebraucht oder Runde abgeschlossen.
  // Ab da stehen alle Uhren im Dashboard still.
  const budgetEndMs = startMs === null ? null : startMs + budgetMin * 60_000;
  const lastEventMs = teams.reduce<number | null>((acc, t) => {
    const ms = t.lastEventAt ? Date.parse(t.lastEventAt) : NaN;
    if (!Number.isFinite(ms)) return acc;
    return acc === null ? ms : Math.max(acc, ms);
  }, null);
  const closedEndMs =
    status === "closed" ? (lastEventMs ?? budgetEndMs ?? null) : null;
  const endMs =
    budgetEndMs === null
      ? null
      : closedEndMs === null
        ? budgetEndMs
        : Math.min(budgetEndMs, closedEndMs);

  const effectiveNow = endMs === null ? now : Math.min(now, endMs);
  const roundOver = endMs !== null && now >= endMs;
  const elapsedMs = startMs === null ? null : effectiveNow - startMs;
  const remainingMs =
    elapsedMs === null ? null : Math.max(0, budgetMin * 60_000 - elapsedMs);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2 rounded-sm border border-border bg-card p-3">
        <div>
          <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            {remainingMs === null
              ? "Runde noch nicht gestartet"
              : roundOver
                ? "Runde beendet"
                : "Restzeit"}
          </p>
          <p
            className={cn(
              "font-mono-typed text-3xl font-bold tabular-nums",
              remainingMs !== null && remainingMs <= 10 * 60_000 && "text-stamp",
            )}
          >
            {remainingMs === null ? "–" : fmtMmSs(remainingMs)}
          </p>
          {elapsedMs !== null && (
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              {roundOver ? "Dauer" : "läuft seit"} {Math.floor(elapsedMs / 60_000)} min von{" "}
              {budgetMin}
            </p>
          )}
        </div>
        <div className="text-right">
          <RefreshCw
            className={cn("ml-auto h-3.5 w-3.5 text-muted-foreground", loading && "animate-spin")}
          />
          <p className="font-mono-typed mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            {teams.length} Teams
          </p>
          {updatedAt !== null && (
            <p className="font-mono-typed text-[10px] text-muted-foreground">
              Stand{" "}
              {new Date(updatedAt).toLocaleTimeString("de-CH", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      <ProgressMatrix
        teams={teams}
        startedAt={startedAt}
        now={effectiveNow}
        roundOver={roundOver}
      />

      <LiveLeaderboard teams={teams} />
    </div>
  );
}
