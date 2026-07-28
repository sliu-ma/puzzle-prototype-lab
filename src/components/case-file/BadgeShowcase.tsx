import { BADGES, getEarnedBadges } from "@/lib/badges";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/** Übersichts-Grid aller Badges. Freigeschaltet farbig, sonst ausgegraut. */
export function BadgeShowcase() {
  const earned = getEarnedBadges();

  return (
    <div className="mt-8 rounded-sm border border-border bg-paper/60 p-5">
      <p className="font-mono-typed text-[10px] uppercase tracking-[0.3em] text-stamp">
        Deine Auszeichnungen
      </p>
      <h3 className="mt-1 font-serif text-xl font-bold sm:text-2xl">
        Badges ({earned.size} / {BADGES.length})
      </h3>

      <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {BADGES.map((b) => {
          const has = earned.has(b.id);
          return (
            <li
              key={b.id}
              className={cn(
                "flex flex-col items-center gap-2 rounded-sm border p-4 text-center transition-transform",
                has
                  ? "border-emerald-500/40 bg-emerald-500/5 hover:-translate-y-0.5"
                  : "border-border bg-secondary/40",
              )}
            >
              <div className="relative h-24 w-24">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className={cn(
                    "h-full w-full object-contain transition-all",
                    has ? "" : "grayscale opacity-30",
                  )}
                />
                {!has && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p
                className={cn(
                  "font-serif text-sm font-semibold leading-tight",
                  has ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {b.title}
              </p>
              <p className="font-serif text-[11px] italic leading-snug text-foreground/70">
                {has ? b.description : b.criteria}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
