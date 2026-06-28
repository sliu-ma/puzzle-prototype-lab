import { useEffect, useState } from "react";
import { ChevronRight, X } from "lucide-react";
import type { StoryArc } from "@/lib/story-beats";
import { cn } from "@/lib/utils";

type Props = {
  arc: StoryArc;
  open: boolean;
  onClose: () => void;
  readyLabel?: string;
};

export function StoryIntro({ arc, open, onClose, readyLabel = "Bereit für das Rätsel?" }: Props) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (open) setIdx(0);
  }, [open]);

  if (!open) return null;

  const beat = arc.beats[idx];
  const last = idx === arc.beats.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 px-3 py-4 backdrop-blur-sm sm:items-center sm:py-10 animate-fade-in"
    >
      <div
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-md border border-border bg-gradient-to-br shadow-2xl",
          arc.accent,
        )}
      >
        <button
          onClick={onClose}
          aria-label="Story schliessen"
          className="absolute right-2 top-2 z-10 rounded-full bg-paper/80 p-1.5 text-foreground/70 hover:bg-paper"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="border-b border-ink/10 bg-paper/70 px-4 py-2 backdrop-blur-sm">
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
            {arc.emoji} {arc.ort} · {arc.thema}
          </p>
        </div>

        {/* Panel */}
        <div key={idx} className="panel-pop px-4 py-6 sm:px-6 sm:py-8">
          {beat.badge && (
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-foreground/60">
              {beat.badge}
            </p>
          )}
          <p className="mt-2 font-serif text-lg leading-snug text-foreground sm:text-xl">
            {beat.scene}
          </p>
          {beat.maja && (
            <div className="mt-5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-stamp bg-paper font-mono-typed text-xs font-bold text-stamp">
                M
              </div>
              <div className="relative rounded-2xl rounded-tl-sm border border-ink/15 bg-paper px-3 py-2 shadow-sm">
                <p className="font-serif italic text-[15px] leading-snug">
                  „{beat.maja}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-ink/10 bg-paper/70 px-4 py-3 backdrop-blur-sm">
          <div className="flex gap-1.5">
            {arc.beats.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-6 rounded-full transition-colors",
                  i === idx ? "bg-stamp" : "bg-ink/20",
                )}
              />
            ))}
          </div>
          {last ? (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {readyLabel} <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setIdx((i) => i + 1)}
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 font-serif text-sm hover:bg-secondary"
            >
              Weiter <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
