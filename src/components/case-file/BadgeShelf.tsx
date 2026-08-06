import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BADGES, getEarnedBadges, getBadgeEarnedAt, formatCriteria, type Badge } from "@/lib/badges";
import { getBudgetMin } from "@/lib/progress";
import { cn } from "@/lib/utils";

/**
 * Badge-Regal für die Übersicht: verdiente Badges farbig,
 * offene als gedämpfte Silhouette. Tap öffnet die Details.
 */
export function BadgeShelf() {
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Badge | null>(null);

  useEffect(() => {
    const sync = () => setEarned(getEarnedBadges());
    sync();
    window.addEventListener("badge:earned", sync);
    window.addEventListener("maya-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("badge:earned", sync);
      window.removeEventListener("maya-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isEarned = (id: string) => earned.has(id);
  const earnedAt = selected ? getBadgeEarnedAt(selected.id) : null;

  return (
    <section className="rounded-sm border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono-typed text-[10px] uppercase tracking-[0.18em] text-stamp">
          Abzeichen
        </p>
        <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
          {earned.size} von {BADGES.length}
        </p>
      </div>

      <ul className="-mx-1 mt-3 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
        {[...BADGES]
          .sort((a, b) => Number(isEarned(b.id)) - Number(isEarned(a.id)))
          .map((b) => {
          const unlocked = isEarned(b.id);
          return (
            <li key={b.id} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => setSelected(b)}
                aria-label={unlocked ? b.title : "Noch nicht verdientes Abzeichen"}
                className={cn(
                  "relative flex h-16 w-16 items-center justify-center rounded-full border transition-transform active:scale-95",
                  unlocked
                    ? "border-stamp/40 bg-stamp/5"
                    : "border-dashed border-border bg-secondary/60",
                )}
              >
                <img
                  src={b.imageUrl}
                  alt=""
                  aria-hidden
                  className={cn(
                    "h-12 w-12 object-contain transition-all",
                    !unlocked && "opacity-25 grayscale",
                  )}
                />
                {!unlocked && (
                  <Lock className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-card p-0.5 text-muted-foreground" />
                )}
              </button>
            </li>
          );
        })}
      </ul>


      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-sm border-stamp/30 bg-paper sm:rounded-sm">
          {selected && (
            <div className="text-center">
              <img
                src={selected.imageUrl}
                alt=""
                aria-hidden
                className={cn(
                  "mx-auto h-32 w-32 object-contain",
                  !isEarned(selected.id) && "opacity-25 grayscale",
                )}
              />
              <DialogTitle asChild>
                <h3 className="mt-3 font-serif text-xl font-bold">
                  {isEarned(selected.id) ? selected.title : "Noch nicht verdient"}
                </h3>
              </DialogTitle>
              <DialogDescription asChild>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/85">
                  {isEarned(selected.id) ? selected.description : selected.criteria}
                </p>
              </DialogDescription>
              {isEarned(selected.id) && earnedAt && (
                <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                  Verliehen um{" "}
                  {earnedAt.toLocaleTimeString("de-CH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  Uhr
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
