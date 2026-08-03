import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getScore, SCORE_CHANGED } from "@/lib/score-events";
import { getStartTs } from "@/lib/progress";
import { getBadge } from "@/lib/badges";
import { HINT_CAP, type ScoreBreakdown } from "@/lib/score";
import { cn } from "@/lib/utils";

type Delta = { key: number; value: number };

const EMPTY: ScoreBreakdown = {
  total: 0,
  stages: [],
  stagePoints: 0,
  hintPenalty: 0,
  badges: [],
  badgePoints: 0,
  hearingCorrect: 0,
  hearingWrong: 0,
  hearingPoints: 0,
};

function useCountUp(target: number) {
  const [shown, setShown] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    const dur = 700;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  useEffect(() => {
    fromRef.current = shown;
  }, [shown]);
  return shown;
}

export function ScoreCounter() {
  const [active, setActive] = useState(false);
  const [score, setScore] = useState<ScoreBreakdown>(EMPTY);
  const [deltas, setDeltas] = useState<Delta[]>([]);
  const [open, setOpen] = useState(false);
  const queue = useRef<number[]>([]);
  const busy = useRef(false);

  useEffect(() => {
    const sync = () => {
      setActive(!!getStartTs());
      setScore(getScore());
    };
    sync();
    const onChange = (e: Event) => {
      sync();
      const detail = (e as CustomEvent<{ delta: number }>).detail;
      if (detail && detail.delta !== 0) {
        queue.current.push(detail.delta);
        pump();
      }
    };
    const pump = () => {
      if (busy.current) return;
      const next = queue.current.shift();
      if (next === undefined) return;
      busy.current = true;
      const key = Date.now() + Math.random();
      setDeltas((d) => [...d, { key, value: next }]);
      window.setTimeout(() => {
        setDeltas((d) => d.filter((x) => x.key !== key));
        busy.current = false;
        pump();
      }, 1400);
    };
    window.addEventListener(SCORE_CHANGED, onChange);
    window.addEventListener("maya-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SCORE_CHANGED, onChange);
      window.removeEventListener("maya-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const shown = useCountUp(score.total);

  if (!active) return null;

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
          {deltas.map((d) => (
            <span
              key={d.key}
              className={cn(
                "animate-in fade-in slide-in-from-bottom-2 block font-mono-typed text-sm font-bold drop-shadow",
                d.value >= 0 ? "text-emerald-700" : "text-destructive",
              )}
            >
              {d.value >= 0 ? `+${d.value}` : `,${Math.abs(d.value)}`}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Punkte-Aufschlüsselung öffnen"
          className="flex items-center gap-1.5 rounded-sm border border-border bg-card/95 px-2.5 py-1.5 font-mono-typed text-sm text-foreground shadow-md backdrop-blur transition-transform active:scale-95"
        >
          <Trophy className="h-4 w-4 text-stamp" />
          <span className="font-semibold tabular-nums">{shown}</span>
          <span className="text-xs text-muted-foreground">P</span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Punktestand: {score.total}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <section>
              <p className="font-serif font-semibold">
                Etappen ({score.stagePoints} P)
              </p>
              {score.stages.length === 0 ? (
                <p className="text-muted-foreground">Noch keine Etappe gelöst.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {score.stages.map((s) => (
                    <li key={s.stage} className="flex justify-between gap-2">
                      <span>
                        Etappe {s.stage}
                        <span className="text-muted-foreground">
                          {" "}
                          · {Math.max(1, Math.round(s.durationSec / 60))} min
                          {s.hintLevel > 0 &&
                            ` · Hinweis-Deckel ${Math.round(HINT_CAP[s.hintLevel as 1 | 2 | 3] * 100)} %`}
                        </span>
                      </span>
                      <span className="font-mono-typed tabular-nums">{s.points}</span>
                    </li>
                  ))}
                </ul>
              )}
              {score.hintPenalty > 0 && (
                <p className="mt-1 text-destructive">
                  Abzug durch Hinweise: ,{score.hintPenalty} P
                </p>
              )}
            </section>

            <section>
              <p className="font-serif font-semibold">
                Abzeichen ({score.badgePoints} P)
              </p>
              {score.badges.length === 0 ? (
                <p className="text-muted-foreground">Noch kein Abzeichen verdient.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {score.badges.map((b) => (
                    <li key={b.badgeId} className="flex justify-between gap-2">
                      <span>{getBadge(b.badgeId)?.title ?? b.badgeId}</span>
                      <span className="font-mono-typed tabular-nums">+{b.points}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <p className="font-serif font-semibold">
                Hearing ({score.hearingPoints} P)
              </p>
              <p className="text-muted-foreground">
                {score.hearingCorrect} richtig, {score.hearingWrong} falsch
              </p>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
