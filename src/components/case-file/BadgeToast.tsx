import { useEffect, useMemo, useState } from "react";
import type { Badge } from "@/lib/badges";
import { setBadgeOverlayOpen } from "@/lib/overlay-bus";


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
 * Kein Auto-Dismiss, nur Tap/Klick oder ESC schliesst.
 */
export function BadgeToast() {
  const [queue, setQueue] = useState<Badge[]>([]);
  const [confettiOn, setConfettiOn] = useState(false);
  const badge = queue[0] ?? null;
  const pieces = useMemo(
    () => (badge ? makePieces(48) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [badge?.id],
  );

  useEffect(() => {
    const onEarn = (e: Event) => {
      const detail = (e as CustomEvent<Badge>).detail;
      if (!detail) return;
      setQueue((q) => (q.some((b) => b.id === detail.id) ? q : [...q, detail]));
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([40, 60, 40, 60, 120]);
      }
    };
    window.addEventListener("badge:earned", onEarn as EventListener);
    return () =>
      window.removeEventListener("badge:earned", onEarn as EventListener);
  }, []);

  const dismiss = () => setQueue((q) => q.slice(1));

  useEffect(() => {
    if (!badge) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [badge]);

  // Konfetti bei jedem neuen Badge neu starten und nach 4.5s stoppen.
  useEffect(() => {
    if (!badge) return;
    setConfettiOn(true);
    const t = setTimeout(() => setConfettiOn(false), 4500);
    return () => clearTimeout(t);
  }, [badge?.id]);

  // Andere Overlays (z. B. der Zwischenstand) warten, bis hier zu ist.
  useEffect(() => {
    setBadgeOverlayOpen(!!badge);
    return () => setBadgeOverlayOpen(false);
  }, [badge]);

  if (!badge) return null;


  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden px-6 backdrop-blur-md animate-fade-in"
      style={{ backgroundColor: "rgba(20, 16, 12, 0.82)" }}
      role="alertdialog"
      aria-live="polite"
      onClick={dismiss}
    >
      <style>{`
        @keyframes badge-confetti-fall {
          0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          100% { transform: translate3d(var(--drift, 0px), 110vh, 0) rotate(var(--spin, 720deg)); opacity: 1; }
        }
      `}</style>

      {/* Confetti layer, only visible for a limited time */}
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
        {queue.length > 1 && (
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.25em] text-paper/60">
            1 von {queue.length}
          </p>
        )}


        <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
          {/* Badge */}
          <img
            src={badge.imageUrl}
            alt={badge.title}
            className="relative h-72 w-72 object-contain animate-scale-in sm:h-80 sm:w-80"
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
          {queue.length > 1 ? "Tippen für das nächste Abzeichen" : "Tippen zum Schliessen"}
        </p>
      </div>
    </div>
  );
}
