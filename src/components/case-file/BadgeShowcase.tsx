import { useRef, useState } from "react";
import {
  BADGES,
  getEarnedBadges,
  getBadgeEarnedAt,
  formatCriteria,
  type Badge,
} from "@/lib/badges";
import { getBudgetMin } from "@/lib/progress";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function formatEarnedAt(d: Date | null): string {
  if (!d) return "";
  try {
    return d.toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d.toISOString();
  }
}

/** Karussell aller Badges, Klick öffnet Detail-Dialog mit Datum bzw. Kriterium. */
export function BadgeShowcase() {
  const earned = getEarnedBadges();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<Badge | null>(null);

  const scrollTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(BADGES.length - 1, idx));
    setActive(clamped);
    const el = cardRefs.current[clamped];
    if (el)
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const selectedHas = selected ? earned.has(selected.id) : false;
  const selectedEarnedAt =
    selected && selectedHas ? getBadgeEarnedAt(selected.id) : null;

  return (
    <div className="mt-6 rounded-sm border border-border bg-paper/60 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-serif text-base font-bold sm:text-lg">
          Badges ({earned.size} / {BADGES.length})
        </h3>
        <p className="font-mono-typed text-[9px] uppercase tracking-[0.25em] text-stamp">
          Auszeichnungen
        </p>
      </div>

      <div className="relative mt-2">
        <div
          ref={scrollerRef}
          className="-mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-3 pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollPaddingInline: "0.75rem" }}
        >
          {BADGES.map((b, i) => {
            const has = earned.has(b.id);
            return (
              <button
                key={b.id}
                type="button"
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                onClick={() => {
                  setSelected(b);
                  scrollTo(i);
                }}
                className={cn(
                  "flex h-24 w-24 shrink-0 snap-center items-center justify-center rounded-sm p-1.5 transition-all sm:h-28 sm:w-28",
                  has && "hover:-translate-y-0.5",
                )}
                aria-label={b.title}
              >
                <div className="relative h-full w-full">
                  <img
                    src={b.imageUrl}
                    alt=""
                    className={cn(
                      "h-full w-full object-contain transition-all",
                      has ? "drop-shadow-md" : "grayscale opacity-30",
                    )}
                  />
                  {!has && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {BADGES.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Vorheriges Badge"
              onClick={() => scrollTo(active - 1)}
              disabled={active === 0}
              className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-card p-1 shadow-sm hover:bg-secondary disabled:opacity-30 sm:block"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Nächstes Badge"
              onClick={() => scrollTo(active + 1)}
              disabled={active === BADGES.length - 1}
              className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-card p-1 shadow-sm hover:bg-secondary disabled:opacity-30 sm:block"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {BADGES.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {BADGES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Badge ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-4 bg-stamp" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-sm">
          {selected && (
            <>
              <div className="flex justify-center pt-2">
                <div className="relative h-40 w-40">
                  <img
                    src={selected.imageUrl}
                    alt=""
                    className={cn(
                      "h-full w-full object-contain",
                      selectedHas ? "drop-shadow-md" : "grayscale opacity-40",
                    )}
                  />
                  {!selectedHas && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <DialogHeader>
                <DialogTitle
                  className={cn(
                    "text-center font-serif text-xl",
                    !selectedHas && "text-muted-foreground",
                  )}
                >
                  {selected.title}
                </DialogTitle>
                <DialogDescription className="text-center font-serif text-[15px] text-foreground/85">
                  {selectedHas
                    ? selected.description
                    : formatCriteria(selected.criteria, getBudgetMin())}
                </DialogDescription>
              </DialogHeader>
              <p
                className={cn(
                  "text-center font-mono-typed text-[11px] uppercase tracking-wider",
                  selectedHas ? "text-emerald-700" : "text-muted-foreground",
                )}
              >
                {selectedHas && selectedEarnedAt
                  ? `Erhalten am ${formatEarnedAt(selectedEarnedAt)}`
                  : "Noch nicht erhalten"}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
