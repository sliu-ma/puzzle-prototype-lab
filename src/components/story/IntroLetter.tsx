import { useEffect, useState } from "react";
import { Stamp } from "@/components/case-file/Stamp";

const LINES = [
  "Maja, wenn Du das liest,",
  "bin ich schon weg.",
  "Heute Abend, 19 Uhr,",
  "entscheidet der Rat",
  "über das Gaskraftwerk.",
  "Fünf Hinweise — im Dorf.",
  "Folge ihnen. — Elvira",
];

type Props = {
  open: boolean;
  onContinue: () => void;
};

export function IntroLetter({ open, onContinue }: Props) {
  const [visible, setVisible] = useState(0);
  const [stamped, setStamped] = useState(false);

  useEffect(() => {
    if (!open) return;
    setVisible(0);
    setStamped(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible(i + 1), 350 + i * 420));
    });
    timers.push(setTimeout(() => setStamped(true), 350 + LINES.length * 420 + 200));
    return () => timers.forEach(clearTimeout);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-3 py-6 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="relative w-full max-w-md rotate-[-1deg] rounded-sm border border-ink/15 bg-paper px-6 py-8 shadow-2xl sm:px-10 sm:py-12"
        style={{ backgroundImage: "linear-gradient(180deg, oklch(0.98 0.012 85), oklch(0.96 0.02 80))" }}
      >
        {stamped && (
          <div className="absolute right-3 top-3 sm:right-6 sm:top-6">
            <Stamp rotate={8} className="text-base sm:text-lg">
              Eilig
            </Stamp>
          </div>
        )}

        <p className="font-mono-typed text-[10px] uppercase tracking-[0.25em] text-stamp">
          Brief · in Elviras Küche
        </p>

        <div className="mt-5 space-y-2 font-serif text-lg leading-relaxed text-foreground sm:text-xl">
          {LINES.slice(0, visible).map((line, i) => (
            <p key={i} className={i === visible - 1 ? "typewriter-line" : undefined}>
              {line}
            </p>
          ))}
          {visible < LINES.length && (
            <span className="inline-block h-5 w-0.5 animate-pulse bg-stamp align-middle" />
          )}
        </div>

        {stamped && (
          <div className="mt-8 flex justify-end animate-fade-in">
            <button
              onClick={onContinue}
              className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              Brief schliessen →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
