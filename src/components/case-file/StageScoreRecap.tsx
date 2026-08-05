import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Trophy, ArrowUp } from "lucide-react";
import { getTeam } from "@/lib/progress";
import { getRoundSession } from "@/lib/round-client";
import { getRoundLeaderboard } from "@/lib/rounds.functions";
import { getScore, readScoreEvents } from "@/lib/score-events";
import { BADGE_OVERLAY, isBadgeOverlayOpen } from "@/lib/overlay-bus";
import { Rank, Status } from "./Leaderboard";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  points: number;
  self: boolean;
  finished: boolean;
};


function useCountUp(target: number, from: number, run: boolean) {
  const [shown, setShown] = useState(from);
  useEffect(() => {
    if (!run) return;
    if (from === target) {
      setShown(target);
      return;
    }
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, from, run]);
  return shown;
}

function rankOf(rows: Row[]) {
  const sorted = [...rows].sort(
    (a, b) => b.points - a.points || a.name.localeCompare(b.name),
  );
  return sorted;
}

/**
 * Einmaliger Zwischenstand nach einer gelösten Etappe: Punkte der Etappe
 * zählen hoch, danach klettert das eigene Team animiert im Rang.
 * Wartet, bis kein Badge-Overlay mehr offen ist, und erscheint pro Etappe nur einmal.
 */
export function StageScoreRecap({ stage }: { stage: number }) {
  const key = `akte-${stage}-recap-seen`;
  const [open, setOpen] = useState(false);
  const [badgeBusy, setBadgeBusy] = useState(false);
  const [remote, setRemote] = useState<
    { teamId: string; name: string; points: number; finished: boolean }[] | null
  >(null);
  const [phase, setPhase] = useState<"old" | "new">("old");
  const [runCount, setRunCount] = useState(false);

  // Freigabe: nur wenn diese Etappe noch keinen Zwischenstand gezeigt hat.
  useEffect(() => {
    let seen = true;
    try {
      seen = window.localStorage.getItem(key) === "1";
    } catch {
      seen = false;
    }
    if (seen) return;
    setBadgeBusy(isBadgeOverlayOpen());
    const onOverlay = (e: Event) =>
      setBadgeBusy(!!(e as CustomEvent<{ open: boolean }>).detail?.open);
    window.addEventListener(BADGE_OVERLAY, onOverlay as EventListener);
    setOpen(true);
    return () =>
      window.removeEventListener(BADGE_OVERLAY, onOverlay as EventListener);
  }, [key]);

  const visible = open && !badgeBusy;

  // Rangliste laden, sobald wirklich sichtbar.
  const session = typeof window !== "undefined" ? getRoundSession() : null;
  useEffect(() => {
    if (!visible || !session) return;
    let cancelled = false;
    getRoundLeaderboard({ data: { code: session.code } })
      .then((res) => {
        if (!cancelled && res.found) setRemote(res.rows);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, session?.code]);

  // Ablauf: Zeilen ⟶ Punkte hochzählen ⟶ Rangaufstieg.
  useEffect(() => {
    if (!visible) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setRunCount(true);
      setPhase("new");
      return;
    }
    const t1 = window.setTimeout(() => setRunCount(true), 500);
    const t2 = window.setTimeout(() => setPhase("new"), 2000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [visible]);

  const score = visible ? getScore() : null;
  const events = visible ? readScoreEvents() : [];

  const stageEntry = score?.stages.find((s) => s.stage === stage);
  const solvedAt =
    events.find((e) => e.type === "stage_solved" && e.stage === stage)?.at ?? 0;
  const prevSolvedAt = events
    .filter((e) => e.type === "stage_solved" && e.stage < stage)
    .reduce((m, e) => Math.max(m, e.at), 0);

  const stageBadges = events.filter(
    (e): e is Extract<typeof e, { type: "badge_earned" }> =>
      e.type === "badge_earned" && e.at >= prevSolvedAt && e.at <= solvedAt + 60_000,
  );
  const stageBadgePoints = stageBadges.reduce(
    (s, b) =>
      s + (score?.badges.find((x) => x.badgeId === b.badgeId)?.points ?? 0),
    0,
  );

  const total = score?.total ?? 0;
  const gain = (stageEntry?.points ?? 0) + stageBadgePoints;
  const oldTotal = Math.max(0, total - gain);
  const shown = useCountUp(total, oldTotal, visible && runCount);

  const team = typeof window !== "undefined" ? getTeam() : null;
  const selfName = team?.name?.trim() || "Mein Team";

  const base: Row[] =
    remote && remote.length > 0
      ? remote.map((r) => ({
          id: r.teamId,
          name: r.name,
          points: r.points,
          self: r.teamId === session?.teamId,
          finished: r.finished,
        }))
      : [];
  if (base.length > 0 && !base.some((r) => r.self)) {
    base.push({ id: "self", name: selfName, points: total, self: true, finished: false });
  }

  const oldRows = rankOf(
    base.map((r) => (r.self ? { ...r, points: oldTotal, name: selfName } : r)),
  );
  const newRows = rankOf(
    base.map((r) => (r.self ? { ...r, points: total, name: selfName } : r)),
  );
  const rows = phase === "old" ? oldRows : newRows;
  const oldRank = oldRows.findIndex((r) => r.self) + 1;
  const newRank = newRows.findIndex((r) => r.self) + 1;
  const climbed = oldRank > 0 && newRank > 0 && newRank < oldRank;

  // FLIP: eigene Zeile wandert sichtbar auf den neuen Platz.
  const listRef = useRef<HTMLOListElement | null>(null);
  const posRef = useRef<Map<string, number>>(new Map());
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>("[data-row-id]"));
    const next = new Map<string, number>();
    for (const el of items) {
      const id = el.dataset.rowId!;
      const top = el.offsetTop;
      const prev = posRef.current.get(id);
      next.set(id, top);
      if (prev !== undefined && prev !== top) {
        el.style.transition = "none";
        el.style.transform = `translateY(${prev - top}px)`;
        el.style.zIndex = "1";
        requestAnimationFrame(() => {
          el.style.transition = "transform 650ms cubic-bezier(0.22, 1, 0.36, 1)";
          el.style.transform = "translateY(0)";
        });
      }
    }
    posRef.current = next;
  }, [phase, rows.length]);




  const close = () => {
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible || !score) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-background/80 backdrop-blur-sm animate-fade-in sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Zwischenstand"
    >
      <div className="w-full max-w-md rounded-t-lg border border-border bg-card p-5 shadow-xl sm:rounded-sm">
        <p className="text-center font-mono-typed text-[10px] uppercase tracking-[0.25em] text-stamp">
          Zwischenstand · Etappe {stage} von 5
        </p>

        {/* Punkte */}
        <div className="mt-5 flex flex-col items-center">
          <Trophy className="mb-3 h-5 w-5 text-stamp" />
          <p className="pt-1 font-mono-typed text-5xl font-bold leading-tight tabular-nums text-foreground">

            {shown}
          </p>
          <p className="mt-1 font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Punkte total
          </p>
          {gain > 0 && (
            <p
              className="mt-1 font-mono-typed text-sm font-bold text-emerald-700 animate-fade-in"
              style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
            >
              +{gain} in dieser Etappe
            </p>
          )}
        </div>




        {/* Rangaufstieg oder Solo-Verlauf */}
        {rows.length > 1 ? (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Rangliste{session ? ` · Runde ${session.code}` : ""}
              </p>
              {oldRank > 0 && newRank > 0 && (
                <p
                  className={cn(
                    "flex items-center gap-1 font-mono-typed text-[10px] uppercase tracking-wider",
                    climbed ? "text-emerald-700" : "text-muted-foreground",
                  )}
                >
                  {climbed && <ArrowUp className="h-3 w-3" />}
                  Rang {oldRank} → {newRank}
                </p>
              )}
            </div>
            <ol
              ref={listRef}
              className="relative max-h-56 divide-y divide-border overflow-y-auto rounded-sm border border-border bg-card/70"
            >
              {rows.map((r, i) => (
                <li
                  key={r.id}
                  data-row-id={r.id}
                  className={cn(
                    "relative flex items-center gap-3 bg-card px-3 py-2.5",
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
                  <span className="font-mono-typed text-sm font-bold tabular-nums text-foreground">
                    {r.self ? shown : r.points}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="mt-4">
            <p className="mb-2 font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Euer Punkteverlauf
            </p>
            <ol className="divide-y divide-border rounded-sm border border-border bg-card/70">
              {score.stages.map((s) => (
                <li
                  key={s.stage}
                  className={cn(
                    "flex items-center justify-between gap-3 px-3 py-2",
                    s.stage === stage && "bg-stamp/8",
                  )}
                >
                  <span className="font-serif text-sm">Etappe {s.stage}</span>
                  <span className="font-mono-typed text-sm font-bold tabular-nums">
                    {s.points}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <button
          type="button"
          onClick={close}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3 font-serif text-base font-semibold text-primary-foreground"
        >
          Weiter <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
