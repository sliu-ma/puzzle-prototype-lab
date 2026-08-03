import { useState } from "react";
import { ChevronDown, Trophy, Users } from "lucide-react";
import { getTeam } from "@/lib/progress";
import { getBadge } from "@/lib/badges";
import type { ScoreBreakdown } from "@/lib/score";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  points: number;
  self: boolean;
};

/**
 * Leaderboard für den aktuellen Lauf. Weitere Teams folgen, sobald die
 * Ereignisse serverseitig landen; die Struktur ist darauf vorbereitet.
 */
export function Leaderboard({
  score,
  variant = "dialog",
}: {
  score: ScoreBreakdown;
  variant?: "dialog" | "outro";
}) {
  const [showDetails, setShowDetails] = useState(false);
  const team = typeof window !== "undefined" ? getTeam() : null;

  const rows: Row[] = [
    {
      id: "self",
      name: team?.name?.trim() || "Mein Team",
      points: score.total,
      self: true,
    },
  ];
  const max = Math.max(1, ...rows.map((r) => r.points));
  const leader = rows[0];

  return (
    <div className={cn("space-y-5", variant === "outro" && "space-y-3")}>
      {/* Podest */}
      {variant === "dialog" && (

      <div className="relative overflow-hidden rounded-sm border border-border bg-secondary/40 p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-stamp" />
          Rangliste · Lauf 1
        </div>
        <p className="mt-3 font-serif text-xl font-semibold text-foreground">
          {leader.name}
        </p>
        <p className="font-mono-typed text-4xl font-bold tabular-nums text-foreground">
          {leader.points}
        </p>
        <p className="text-xs text-muted-foreground">Punkte · Rang 1</p>
        <div
          aria-hidden
          className="mx-auto mt-3 h-2 w-24 rounded-full bg-stamp/60"
        />
      </div>

      {/* Zeilen */}
      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className={cn(
              "relative overflow-hidden rounded-sm border px-3 py-2.5",
              r.self
                ? "border-stamp/60 bg-card shadow-sm"
                : "border-border bg-card/70",
            )}
          >
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 bg-stamp/10"
              style={{ width: `${Math.round((r.points / max) * 100)}%` }}
            />
            <div className="relative flex items-center gap-3">
              <span className="font-mono-typed w-5 text-sm font-bold tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <span className="flex-1 truncate font-serif text-sm font-semibold text-foreground">
                {r.name}
                {r.self && (
                  <span className="ml-2 rounded-sm bg-secondary px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                    ihr
                  </span>
                )}
              </span>
              <span className="font-mono-typed text-sm font-bold tabular-nums text-foreground">
                {r.points}
              </span>
            </div>
          </li>
        ))}
        <li className="flex items-center gap-2 rounded-sm border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          Weitere Teams erscheinen, sobald die Ermittlungen verbunden sind.
        </li>
      </ol>

      {/* Aufschlüsselung */}
      <div className="rounded-sm border border-border bg-card/70">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          className="flex w-full items-center justify-between px-3 py-2.5 text-left font-serif text-sm font-semibold text-foreground"
        >
          Meine Punkte
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              showDetails && "rotate-180",
            )}
          />
        </button>
        {showDetails && (
          <dl className="space-y-1.5 border-t border-border px-3 py-3 text-sm">
            <Line
              label={`Etappen (${score.stages.length} gelöst)`}
              value={score.stagePoints}
            />
            {score.hintPenalty > 0 && (
              <Line
                label="Abzug durch Hinweise"
                value={-score.hintPenalty}
                muted
              />
            )}
            <Line
              label={`Abzeichen (${score.badges.length})`}
              value={score.badgePoints}
            />
            <Line
              label={`Hearing (${score.hearingCorrect} richtig, ${score.hearingWrong} falsch)`}
              value={score.hearingPoints}
            />
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-serif font-semibold">
              <span>Total</span>
              <span className="font-mono-typed tabular-nums">{score.total}</span>
            </div>
            {score.badges.length > 0 && (
              <p className="pt-1 text-xs text-muted-foreground">
                {score.badges
                  .map((b) => getBadge(b.badgeId)?.title ?? b.badgeId)
                  .join(" · ")}
              </p>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  muted,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={cn("text-sm", muted ? "text-destructive" : "text-foreground")}>
        {label}
      </dt>
      <dd
        className={cn(
          "font-mono-typed tabular-nums",
          muted ? "text-destructive" : "text-foreground",
        )}
      >
        {value > 0 ? `+${value}` : value}
      </dd>
    </div>
  );
}
