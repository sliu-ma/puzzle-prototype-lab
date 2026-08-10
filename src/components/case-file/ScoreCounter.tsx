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
import { Leaderboard } from "./Leaderboard";
import { type ScoreBreakdown } from "@/lib/score";

import { cn } from "@/lib/utils";

type Delta = { key: number; value: number };

const EMPTY: ScoreBreakdown = {
  total: 0,
  stages: [],
  stagePoints: 0,
  stageRawPoints: 0,
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
              {d.value >= 0 ? `+${d.value}` : `\u2212${Math.abs(d.value)}`}
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
        <DialogContent className="max-h-[85vh] max-w-sm overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Leaderboard</DialogTitle>
          </DialogHeader>
          <Leaderboard score={score} />
        </DialogContent>
      </Dialog>

    </>
  );
}
