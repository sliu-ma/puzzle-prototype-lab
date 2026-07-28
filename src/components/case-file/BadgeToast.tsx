import { useEffect, useState } from "react";
import type { Badge } from "@/lib/badges";
import { Sparkles } from "lucide-react";

/**
 * Global gemountetes Overlay, das bei einem `badge:earned`-Event
 * eine pompöse Animation mit Badge-Grafik + Beschreibung zeigt.
 * Kein Auto-Dismiss — nur Tap/Klick oder ESC schließt.
 */
export function BadgeToast() {
  const [badge, setBadge] = useState<Badge | null>(null);

  useEffect(() => {
    const onEarn = (e: Event) => {
      const detail = (e as CustomEvent<Badge>).detail;
      if (!detail) return;
      setBadge(detail);
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

  if (!badge) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-background/85 px-6 backdrop-blur-md animate-fade-in"
      role="alertdialog"
      aria-live="polite"
      onClick={() => setBadge(null)}
    >
      {/* Radial glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(52,211,153,0.35) 0%, rgba(52,211,153,0.08) 40%, transparent 70%)",
        }}
      />

      {/* Floating sparkles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: 14 }).map((_, i) => {
          const left = (i * 73) % 100;
          const top = (i * 47) % 100;
          const delay = (i % 7) * 0.25;
          const size = 10 + (i % 4) * 4;
          return (
            <Sparkles
              key={i}
              className="absolute text-emerald-300/70 animate-pulse"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>

      <div className="relative flex max-w-sm flex-col items-center gap-4 text-center">
        <p
          className="font-mono-typed text-[11px] uppercase tracking-[0.35em] text-stamp animate-fade-in"
          style={{ animationDelay: "0.05s", animationFillMode: "backwards" }}
        >
          ★ Badge freigeschaltet ★
        </p>

        <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64">
          {/* Rotating conic ray-crown */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-full opacity-70"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(52,211,153,0) 0deg, rgba(52,211,153,0.6) 30deg, rgba(52,211,153,0) 60deg, rgba(250,204,21,0.5) 120deg, rgba(52,211,153,0) 160deg, rgba(52,211,153,0.6) 210deg, rgba(52,211,153,0) 250deg, rgba(250,204,21,0.5) 310deg, rgba(52,211,153,0) 360deg)",
              animation: "spin 8s linear infinite",
              filter: "blur(6px)",
            }}
          />
          {/* Pulsing inner glow */}
          <div
            aria-hidden
            className="absolute inset-6 rounded-full bg-emerald-400/40 blur-2xl animate-pulse"
          />
          {/* Badge */}
          <img
            src={badge.imageUrl}
            alt={badge.title}
            className="relative h-40 w-40 object-contain drop-shadow-[0_10px_25px_rgba(16,185,129,0.55)] animate-scale-in sm:h-48 sm:w-48"
            style={{ animationDuration: "0.6s" }}
          />
        </div>

        <h2
          className="font-serif text-3xl font-bold text-foreground animate-fade-in"
          style={{ animationDelay: "0.35s", animationFillMode: "backwards" }}
        >
          {badge.title}
        </h2>
        <p
          className="font-serif text-[15px] italic leading-relaxed text-foreground/85 animate-fade-in"
          style={{ animationDelay: "0.55s", animationFillMode: "backwards" }}
        >
          {badge.description}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setBadge(null);
          }}
          className="mt-3 rounded-sm bg-primary px-6 py-2.5 font-serif text-sm font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg animate-fade-in"
          style={{ animationDelay: "0.75s", animationFillMode: "backwards" }}
        >
          Weiter
        </button>
        <p
          className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground animate-fade-in"
          style={{ animationDelay: "0.9s", animationFillMode: "backwards" }}
        >
          Tippen zum Schliessen
        </p>
      </div>
    </div>
  );
}
