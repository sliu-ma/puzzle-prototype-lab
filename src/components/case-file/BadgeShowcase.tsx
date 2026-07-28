import { useRef, useState } from "react";
import {
  BADGES,
  getEarnedBadges,
  getBadgeEarnedAt,
  type Badge,
} from "@/lib/badges";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
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

/** Karussell aller Badges — Klick öffnet Detailbereich mit Datum bzw. Kriterium. */
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

  return (
    <div className="mt-8 rounded-sm border border-border bg-paper/60 p-5">
      <p className="font-mono-typed text-[10px] uppercase tracking-[0.3em] text-stamp">
        Deine Auszeichnungen
      </p>
      <h3 className="mt-1 font-serif text-xl font-bold sm:text-2xl">
        Badges ({earned.size} / {BADGES.length})
      </h3>
      <p className="mt-1 font-serif text-xs italic text-foreground/60">
        Tippe auf ein Badge für Details.
      </p>

      <div className="relative mt-5">
        <div
          ref={scrollerRef}
          className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollPaddingInline: "1.25rem" }}
        >
          {BADGES.map((b, i) => {
            const has = earned.has(b.id);
            const isSelected = selected?.id === b.id;
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
                  "w-[60%] max-w-[220px] shrink-0 snap-center rounded-sm border p-4 text-center transition-all sm:w-[220px]",
                  has
                    ? "border-emerald-500/40 bg-emerald-500/5 hover:-translate-y-0.5"
                    : "border-border bg-secondary/40",
                  isSelected && "ring-2 ring-stamp/60",
                )}
                aria-label={b.title}
              >
                <div className="relative mx-auto h-28 w-28">
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
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-2 font-serif text-sm font-semibold leading-tight",
                    has ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {b.title}
                </p>
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
              className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-card p-1.5 shadow-sm hover:bg-secondary disabled:opacity-30 sm:block"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Nächstes Badge"
              onClick={() => scrollTo(active + 1)}
              disabled={active === BADGES.length - 1}
              className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-card p-1.5 shadow-sm hover:bg-secondary disabled:opacity-30 sm:block"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {BADGES.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {BADGES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Badge ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === active ? "w-6 bg-stamp" : "w-2 bg-border",
              )}
            />
          ))}
        </div>
      )}

      {/* Detail */}
      <div className="mt-5 min-h-[120px] rounded-sm border border-dashed border-border bg-paper p-4">
        {selected ? (
          (() => {
            const has = earned.has(selected.id);
            const earnedAt = has ? getBadgeEarnedAt(selected.id) : null;
            return (
              <div className="animate-fade-in">
                <h4
                  className={cn(
                    "font-serif text-lg font-bold",
                    has ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {selected.title}
                </h4>
                {has ? (
                  <>
                    <p className="mt-1 font-serif text-sm text-foreground/85">
                      {selected.description}
                    </p>
                    {earnedAt && (
                      <p className="mt-3 font-mono-typed text-[11px] uppercase tracking-wider text-emerald-700">
                        Erhalten am {formatEarnedAt(earnedAt)}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="mt-1 font-serif text-sm italic text-foreground/70">
                      {selected.criteria}
                    </p>
                    <p className="mt-3 font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground">
                      Noch nicht erhalten
                    </p>
                  </>
                )}
              </div>
            );
          })()
        ) : (
          <p className="font-serif text-sm italic text-foreground/60">
            Wähle ein Badge, um mehr zu erfahren.
          </p>
        )}
      </div>
    </div>
  );
}
