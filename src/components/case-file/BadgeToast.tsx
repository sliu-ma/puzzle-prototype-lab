import { useEffect, useState } from "react";
import type { Badge } from "@/lib/badges";

/**
 * Global gemountetes Overlay, das bei einem `badge:earned`-Event
 * eine kurze Animation mit Badge-Grafik + Beschreibung zeigt.
 */
export function BadgeToast() {
  const [badge, setBadge] = useState<Badge | null>(null);

  useEffect(() => {
    const onEarn = (e: Event) => {
      const detail = (e as CustomEvent<Badge>).detail;
      if (!detail) return;
      setBadge(detail);
      // Haptisches Feedback, wenn verfügbar.
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate?.([40, 40, 40]);
      }
      const timer = window.setTimeout(() => setBadge(null), 4200);
      return () => window.clearTimeout(timer);
    };
    window.addEventListener("badge:earned", onEarn as EventListener);
    return () =>
      window.removeEventListener("badge:earned", onEarn as EventListener);
  }, []);

  if (!badge) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 px-6 backdrop-blur-sm animate-fade-in"
      role="alertdialog"
      aria-live="polite"
      onClick={() => setBadge(null)}
    >
      <div className="flex max-w-sm flex-col items-center gap-4 text-center animate-scale-in">
        <p className="font-mono-typed text-[11px] uppercase tracking-[0.3em] text-stamp">
          Badge freigeschaltet
        </p>
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-emerald-400/30 blur-2xl animate-pulse"
          />
          <img
            src={badge.imageUrl}
            alt={badge.title}
            className="h-40 w-40 object-contain drop-shadow-xl sm:h-48 sm:w-48"
          />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {badge.title}
        </h2>
        <p className="font-serif text-[15px] italic leading-relaxed text-foreground/80">
          {badge.description}
        </p>
        <p className="mt-2 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
          Tippe, um fortzufahren
        </p>
      </div>
    </div>
  );
}
