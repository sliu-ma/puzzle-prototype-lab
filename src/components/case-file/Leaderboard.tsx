import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, RefreshCw, Users } from "lucide-react";
import { getTeam, getEndTs } from "@/lib/progress";
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
  finished: boolean;
};

const MEDALS = [
  {
    disc: "bg-gradient-to-br from-medal-gold-light via-medal-gold to-medal-gold-deep ring-medal-gold-deep/50",
    text: "text-medal-gold-deep",
    ribbon: "bg-medal-gold-deep",
  },
  {
    disc: "bg-gradient-to-br from-medal-silver-light via-medal-silver to-medal-silver-deep ring-medal-silver-deep/50",
    text: "text-medal-silver-deep",
    ribbon: "bg-medal-silver-deep",
  },
  {
    disc: "bg-gradient-to-br from-medal-bronze-light via-medal-bronze to-medal-bronze-deep ring-medal-bronze-deep/50",
    text: "text-medal-bronze-deep",
    ribbon: "bg-medal-bronze-deep",
  },
] as const;

/** Rangziffer: Platz 1–3 als Medaille mit Band, ab Platz 4 nur Ziffer. */
function Rank({ index, self }: { index: number; self: boolean }) {
  const medal = MEDALS[index];
  if (medal) {
    return (
      <span className="relative flex h-8 w-9 shrink-0 items-center justify-center">
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0 left-1/2 h-3 w-3.5 -translate-x-1/2 translate-y-1 opacity-80 [clip-path:polygon(0_0,100%_0,100%_100%,50%_62%,0_100%)]",
            medal.ribbon,
          )}
        />
        <span
          className={cn(
            "relative flex h-7 w-7 items-center justify-center rounded-full shadow-sm ring-1 ring-inset",
            medal.disc,
          )}
        >
          <span
            aria-hidden
            className="absolute inset-[3px] rounded-full border border-background/30"
          />
          <span
            className={cn(
              "relative font-mono-typed text-xs font-bold tabular-nums",
              medal.text,
            )}
          >
            {index + 1}
          </span>
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex w-9 shrink-0 justify-center font-mono-typed text-sm font-bold tabular-nums",
        self ? "text-stamp" : "text-muted-foreground",
      )}
    >
      {index + 1}
    </span>
  );
}

/** Status: nur visuell — fertig (Häkchen) oder noch unterwegs (pulsierender Punkt). */
function Status({ finished }: { finished: boolean }) {
  return finished ? (
    <span
      title="abgeschlossen"
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-status-done/20 text-status-done"
    >
      <Check className="h-3 w-3" strokeWidth={3} />
      <span className="sr-only">abgeschlossen</span>
    </span>
  ) : (
    <span
      title="noch am Spielen"
      className="flex h-5 w-5 shrink-0 items-center justify-center"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-status-active" />
      <span className="sr-only">noch am Spielen</span>
    </span>
  );
}

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
  const selfFinished = typeof window !== "undefined" ? !!getEndTs() : false;
  const [remote, setRemote] = useState<
    { teamId: string; name: string; points: number; finished: boolean }[] | null
  >(null);
  const [loading, setLoading] = useState(!!session);

  const load = () => {
    if (!session) return;
    setLoading(true);
    getRoundLeaderboard({ data: { code: session.code } })
      .then((res) => {
        if (res.found) setRemote(res.rows);
      })
      .catch(() => undefined)
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
    rows = remote.map((r) => {
      const self = r.teamId === session?.teamId;
      return {
        id: r.teamId,
        name: r.name,
        points: self ? score.total : r.points,
        self,
        finished: self ? selfFinished || r.finished : r.finished,
      };
    });
    if (!rows.some((r) => r.self)) {
      rows.push({
        id: "self",
        name: selfName,
        points: score.total,
        self: true,
        finished: selfFinished,
      });
    }
    rows.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  } else {
    rows = [
      {
        id: "self",
        name: selfName,
        points: score.total,
        self: true,
        finished: selfFinished,
      },
    ];
  }

  const myIndex = rows.findIndex((r) => r.self);
  const me = rows[myIndex] ?? rows[0]!;
  const selfRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    if (rows.length > 6) {
      selfRef.current?.scrollIntoView({ block: "nearest" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myIndex, rows.length]);

  return (
    <div className={cn("space-y-5", variant === "outro" && "space-y-3")}>
      {/* Eigener Stand: nur Name + Punkte */}
      <div
        className={cn(
          "rounded-sm border border-stamp/40 bg-secondary/40 text-center",
          variant === "outro" ? "p-3" : "p-4",
        )}
      >
        <p className="font-serif text-base font-semibold text-foreground">
          {me.name}
        </p>
        <p className="font-mono-typed text-4xl font-bold leading-none tabular-nums text-stamp">
          {me.points}
        </p>
        <p className="mt-1 font-mono-typed text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
          Punkte
        </p>
      </div>

      {/* Rangliste */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="font-mono-typed text-[0.62rem] uppercase tracking-[0.2em] text-muted-foreground">
            Rangliste{session ? ` · Runde ${session.code}` : ""}
          </p>
          {session && (
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-1 font-mono-typed text-[0.62rem] uppercase tracking-wider text-muted-foreground"
            >
              <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
              Aktualisieren
            </button>
          )}
        </div>

        <ol className="max-h-72 divide-y divide-border overflow-y-auto rounded-sm border border-border bg-card/70">
          {rows.map((r, i) => (
            <li
              key={r.id}
              ref={r.self ? selfRef : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5",
                r.self && "bg-stamp/8 ring-1 ring-inset ring-stamp/50",
              )}
            >
              <Rank index={i} self={r.self} />
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span
                  className={cn(
                    "truncate font-serif text-sm font-semibold",
                    r.self ? "text-stamp" : "text-foreground",
                  )}
                >
                  {r.name}
                </span>
                {r.self && (
                  <span className="shrink-0 rounded-sm bg-stamp px-1.5 py-0.5 font-mono-typed text-[0.55rem] uppercase tracking-wider text-primary-foreground">
                    Ihr
                  </span>
                )}
              </span>
              <Status finished={r.finished} />
              <span className="text-right">
                <span className="block font-mono-typed text-sm font-bold tabular-nums text-foreground">
                  {r.points}
                </span>
                <span className="block text-[0.6rem] text-muted-foreground">
                  Punkte
                </span>
              </span>
            </li>
          ))}
        </ol>

        {!session && (
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" />
            Ohne Rundencode spielt ihr allein. Fragt eure Lehrperson nach dem Code.
          </p>
        )}
      </div>

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
