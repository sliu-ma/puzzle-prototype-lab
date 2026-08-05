import { useEffect, useState } from "react";
import { ChevronDown, Trophy, Users, RefreshCw } from "lucide-react";
import { getTeam } from "@/lib/progress";
import { getBadge } from "@/lib/badges";
import { getRoundSession } from "@/lib/round-client";
import { getRoundLeaderboard } from "@/lib/rounds.functions";
import type { ScoreBreakdown } from "@/lib/score";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  points: number;
  self: boolean;
};

/**
 * Leaderboard für den aktuellen Lauf. Läuft das Team in einer Klassen-Runde,
 * werden die anderen Teams live vom Server geladen.
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
  const session = typeof window !== "undefined" ? getRoundSession() : null;
  const [remote, setRemote] = useState<
    { teamId: string; name: string; points: number }[] | null
  >(null);
  const [loading, setLoading] = useState(!!session);

  const [offline, setOffline] = useState(false);

  const load = () => {
    if (!session) return;
    setLoading(true);
    getRoundLeaderboard({ data: { code: session.code } })
      .then((res) => {
        setOffline(!!res.unavailable);
        if (res.found) setRemote(res.rows);
      })
      .catch(() => setOffline(true))
      .finally(() => setLoading(false));
  };


  useEffect(() => {
    if (!session) return;
    load();
    const iv = window.setInterval(load, 20_000);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.code]);

  const selfName = team?.name?.trim() || "Mein Team";

  let rows: Row[];
  if (remote && remote.length > 0) {
    rows = remote.map((r) => ({
      id: r.teamId,
      name: r.name,
      points: r.teamId === session?.teamId ? score.total : r.points,
      self: r.teamId === session?.teamId,
    }));
    if (!rows.some((r) => r.self)) {
      rows.push({ id: "self", name: selfName, points: score.total, self: true });
    }
    rows.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  } else {
    rows = [{ id: "self", name: selfName, points: score.total, self: true }];
  }

  const max = Math.max(1, ...rows.map((r) => r.points));
  const leader = rows[0]!;
  const myRank = rows.findIndex((r) => r.self) + 1;

  return (
    <div className={cn("space-y-5", variant === "outro" && "space-y-3")}>
      {/* Podest */}
      {variant === "dialog" && (
        <div className="relative overflow-hidden rounded-sm border border-border bg-secondary/40 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-stamp" />
            {session ? `Runde ${session.code}` : "Rangliste · Lauf 1"}
          </div>
          <p className="mt-3 font-serif text-xl font-semibold text-foreground">
            {leader.name}
          </p>
          <p className="font-mono-typed text-4xl font-bold tabular-nums text-foreground">
            {leader.points}
          </p>
          <p className="text-xs text-muted-foreground">
            Punkte · Rang 1{myRank > 1 ? ` · ihr seid Rang ${myRank}` : ""}
          </p>
          <div
            aria-hidden
            className="mx-auto mt-3 h-2 w-24 rounded-full bg-stamp/60"
          />
        </div>
      )}

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
        {session ? (
          <li className="flex items-center justify-between gap-2 rounded-sm border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Runde {session.code}
              {session.title ? ` · ${session.title}` : ""}
            </span>
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-1 font-mono-typed uppercase tracking-wider"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Aktualisieren
            </button>
          </li>
        ) : (
          <li className="flex items-center gap-2 rounded-sm border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Ohne Rundencode spielt ihr allein. Fragt eure Lehrperson nach dem Code.
          </li>
        )}
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
