import { useState } from "react";
import { ComicPanel } from "./ComicPanel";
import type { Panel } from "@/lib/story-beats";
import { cn } from "@/lib/utils";

interface Props {
  panels: Panel[];
  onDone: () => void;
  ctaLabel?: string;
}

export function StoryIntro({ panels, onDone, ctaLabel = "Bereit für das Rätsel? →" }: Props) {
  const [i, setI] = useState(0);
  const last = i === panels.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        {panels.map((_, k) => (
          <span
            key={k}
            className={cn(
              "h-1.5 rounded-full transition-all",
              k <= i ? "w-8 bg-ink" : "w-4 bg-ink/20",
            )}
          />
        ))}
      </div>

      <ComicPanel key={i} panel={panels[i]} />

      <div className="flex justify-between gap-3">
        <button
          onClick={onDone}
          className="rounded-sm border border-border bg-card px-3 py-2 font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground hover:bg-secondary"
        >
          Intro überspringen
        </button>
        {last ? (
          <button
            onClick={onDone}
            className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            {ctaLabel}
          </button>
        ) : (
          <button
            onClick={() => setI(i + 1)}
            className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            Weiter →
          </button>
        )}
      </div>
    </div>
  );
}
