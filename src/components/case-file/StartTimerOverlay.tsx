import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Clock, ArrowRight } from "lucide-react";

const TOTAL = 90 * 60; // Sekunden

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function StartTimerOverlay({ onConfirm }: { onConfirm: () => void }) {
  const [left, setLeft] = useState(TOTAL);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = window.setInterval(() => {
      setLeft((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 px-5 py-8 backdrop-blur-sm">
      <div className="animate-fade-in w-full max-w-md text-center">
        <p className="flex items-center justify-center gap-2 font-mono-typed text-[11px] uppercase tracking-[0.25em] text-stamp">
          <Clock className="h-4 w-4" />
          Die Zeit läuft
        </p>

        <p className="mt-5 font-mono-typed text-[19vw] font-bold leading-none tabular-nums text-foreground sm:text-8xl">
          {fmt(left)}
        </p>

        <p className="mt-6 text-[15px] leading-relaxed text-foreground/85">
          In 90 Minuten entscheidet der Gemeinderat über das Gaskraftwerk.
        </p>

        <button
          type="button"
          onClick={onConfirm}
          className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 font-serif text-base font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Los geht&apos;s
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
