import { useEffect, useMemo, useState } from "react";
import type { Badge } from "@/lib/badges";


const CONFETTI_COLORS = [
  "#8a1f1f", // stamp red
  "#e0b64a", // amber
  "#c9a274", // kraft
  "#f1e7d2", // paper deep
  "#3f3226", // ink brown
  "#d97757", // terracotta
];

type Piece = {
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
  drift: number;
};

function makePieces(n: number): Piece[] {
  return Array.from({ length: n }).map(() => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 2.4 + Math.random() * 1.8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
    drift: (Math.random() - 0.5) * 80,
  }));
}

/**
 * Global gemountetes Overlay, das bei einem `badge:earned`-Event
 * eine pompöse Animation mit Badge-Grafik + Konfetti zeigt.
 * Kein Auto-Dismiss — nur Tap/Klick oder ESC schließt.
 */
export function BadgeToast() {
  const [badge, setBadge] = useState<Badge | null>(null);
  const [confettiOn, setConfettiOn] = useState(false);
  const pieces = useMemo(() => (badge ? makePieces(48) : []), [badge]);

  useEffect(() => {
    const onEarn = (e: Event) => {
      const detail = (e as CustomEvent<Badge>).detail;
      if (!detail) return;
      setBadge(detail);
      setConfettiOn(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([40, 60, 40, 60, 120]);
      }
    };
    window.addEventListener("badge:earned", onEarn as EventListener);
    return () =>
      window.removeEventListener("badge:earned", onEarn as EventListener);
  }, []);

  useEffect(() => {
    if (!badge) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBadge(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [badge]);

  useEffect(() => {
    if (!confettiOn) return;
    const t = setTimeout(() => setConfettiOn(false), 4500);
    return () => clearTimeout(t);
  }, [confettiOn]);

  if (!badge) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden px-6 backdrop-blur-md animate-fade-in"
      style={{ backgroundColor: "rgba(20, 16, 12, 0.82)" }}
      role="alertdialog"
      aria-live="polite"
      onClick={() => setBadge(null)}
    >
      <style>{`
        @keyframes badge-confetti-fall {
          0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          100% { transform: translate3d(var(--drift, 0px), 110vh, 0) rotate(var(--spin, 720deg)); opacity: 1; }
        }
      `}</style>

      {/* Confetti layer — only visible for a limited time */}
      {confettiOn && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {pieces.map((p, i) => (
            <span
              key={i}
              className="absolute top-0 block"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size * 0.4,
                backgroundColor: p.color,
                transform: `rotate(${p.rotate}deg)`,
                animation: `badge-confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
                // @ts-expect-error CSS vars
                "--drift": `${p.drift}px`,
                "--spin": `${360 + Math.round(Math.random() * 720)}deg`,
                borderRadius: 1,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative flex max-w-xs flex-col items-center gap-3 text-center">
        <p
          className="font-mono-typed text-[11px] uppercase tracking-[0.35em] text-amber-200 animate-fade-in"
          style={{ animationDelay: "0.05s", animationFillMode: "backwards" }}
        >
          ★ Badge freigeschaltet ★
        </p>

        <div className="relative flex h-36 w-36 items-center justify-center sm:h-40 sm:w-40">
          {/* Badge */}
          <img
            src={badge.imageUrl}
            alt={badge.title}
            className="relative h-32 w-32 object-contain animate-scale-in sm:h-36 sm:w-36"
            style={{
              animationDuration: "0.6s",
              filter: "drop-shadow(0 10px 25px rgba(224,182,74,0.55))",
            }}
          />
        </div>

        <h2
          className="font-serif text-2xl font-bold text-paper animate-fade-in"
          style={{ animationDelay: "0.25s", animationFillMode: "backwards" }}
        >
          {badge.title}
        </h2>
        <p
          className="font-serif text-[14px] italic leading-relaxed text-paper/85 animate-fade-in"
          style={{ animationDelay: "0.45s", animationFillMode: "backwards" }}
        >
          {badge.description}
        </p>

        <p
          className="mt-1 font-mono-typed text-[10px] uppercase tracking-wider text-paper/60 animate-fade-in"
          style={{ animationDelay: "0.7s", animationFillMode: "backwards" }}
        >
          Tippen zum Schliessen
        </p>
      </div>
    </div>
  );
}
