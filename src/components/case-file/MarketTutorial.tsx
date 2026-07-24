import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface TutorialStep {
  targetRef: RefObject<HTMLElement | null>;
  text: string;
  placement?: "below" | "above" | "auto";
  padding?: number;
}

interface Props {
  open: boolean;
  steps: TutorialStep[];
  onClose: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function MarketTutorial({ open, steps, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vh, setVh] = useState(0);
  const [vw, setVw] = useState(0);

  const step = steps[index];

  useEffect(() => {
    if (!open) setIndex(0);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !step) return;
    const measure = () => {
      const el = step.targetRef.current;
      setVh(window.innerHeight);
      setVw(window.innerWidth);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      const pad = step.padding ?? 8;
      setRect({
        top: r.top - pad,
        left: r.left - pad,
        width: r.width + pad * 2,
        height: r.height + pad * 2,
      });
      // Ensure target is on screen
      const inView =
        r.top >= 0 && r.bottom <= window.innerHeight;
      if (!inView) {
        el.scrollIntoView({ behavior: "auto", block: "center" });
      }
    };
    measure();
    // Re-measure after scrollIntoView settles
    const t = window.setTimeout(measure, 120);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, index, step]);

  if (!open || !step) return null;

  const isLast = index === steps.length - 1;
  const next = () => (isLast ? onClose() : setIndex((i) => i + 1));

  // Fallback: no rect → centered bubble only
  const hasRect = !!rect && rect.width > 0 && rect.height > 0;

  // Bubble placement
  let bubbleStyle: React.CSSProperties = {
    left: 16,
    right: 16,
    top: vh / 2 - 60,
  };
  if (hasRect && rect) {
    const spaceBelow = vh - (rect.top + rect.height);
    const spaceAbove = rect.top;
    const place =
      step.placement === "auto" || !step.placement
        ? spaceBelow > 140 || spaceBelow >= spaceAbove
          ? "below"
          : "above"
        : step.placement;
    if (place === "below") {
      bubbleStyle = {
        left: 16,
        right: 16,
        top: Math.min(rect.top + rect.height + 12, vh - 160),
      };
    } else {
      bubbleStyle = {
        left: 16,
        right: 16,
        bottom: Math.min(vh - rect.top + 12, vh - 160),
      };
    }
  }

  const overlay = (
    <div
      className="fixed inset-0 z-[100] animate-fade-in"
      onClick={next}
      role="dialog"
      aria-label="Tutorial"
    >
      {hasRect && rect ? (
        <>
          {/* Top */}
          <div
            className="absolute left-0 right-0 top-0 bg-black/70"
            style={{ height: Math.max(0, rect.top) }}
          />
          {/* Bottom */}
          <div
            className="absolute left-0 right-0 bg-black/70"
            style={{
              top: rect.top + rect.height,
              bottom: 0,
            }}
          />
          {/* Left */}
          <div
            className="absolute bg-black/70"
            style={{
              top: rect.top,
              left: 0,
              width: Math.max(0, rect.left),
              height: rect.height,
            }}
          />
          {/* Right */}
          <div
            className="absolute bg-black/70"
            style={{
              top: rect.top,
              left: rect.left + rect.width,
              right: 0,
              height: rect.height,
            }}
          />
          {/* Spotlight ring */}
          <div
            className="pointer-events-none absolute rounded-md ring-2 ring-paper/90 shadow-[0_0_0_9999px_transparent] animate-pulse"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/70" />
      )}

      {/* Skip */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-3 top-3 rounded-full bg-paper/90 px-3 py-1 font-mono-typed text-[11px] uppercase tracking-wider text-ink shadow"
      >
        Überspringen
      </button>

      {/* Bubble */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute mx-auto max-w-md rounded-md border border-border bg-paper p-4 shadow-2xl animate-fade-in",
        )}
        style={bubbleStyle}
      >
        <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
          Tipp {index + 1} / {steps.length}
        </p>
        <p className="mt-1 font-serif text-base leading-snug text-ink">
          {step.text}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-4 rounded-full",
                  i <= index ? "bg-ink" : "bg-border",
                )}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="rounded-sm bg-ink px-3 py-1.5 font-serif text-sm font-semibold text-paper hover:bg-ink/90"
          >
            {isLast ? "Los geht's" : "Weiter"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
