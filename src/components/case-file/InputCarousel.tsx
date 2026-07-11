import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Hand } from "lucide-react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { cn } from "@/lib/utils";

export type InputCard = {
  title: string;
  body: string;
  hint: string;
};

interface InputCarouselProps {
  kicker: string;
  title: string;
  intro: string;
  cards: InputCard[];
  backLabel?: string;
  onBack: () => void;
  nextLabel: string;
  onNext: () => void;
}

const HINT_KEY = "maya-input-swipe-hint";

export function InputCarousel({
  kicker,
  title,
  intro,
  cards,
  backLabel = "← Zurück",
  onBack,
  nextLabel,
  onNext,
}: InputCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [showFirstHint, setShowFirstHint] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(HINT_KEY) !== "1") {
        setShowFirstHint(true);
        const t = setTimeout(() => setShowFirstHint(false), 4500);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (isDesktop) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(idx)) setActive(idx);
          }
        });
      },
      { root: scroller, threshold: [0.6] },
    );
    cardRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [cards.length, isDesktop]);

  const dismissFirstHint = () => {
    if (!showFirstHint) return;
    setShowFirstHint(false);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const scrollTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(cards.length - 1, idx));
    const el = cardRefs.current[clamped];
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    dismissFirstHint();
  };

  const isLast = active === cards.length - 1;
  const remaining = cards.length - 1 - active;
  const showNext = isDesktop || isLast;

  return (
    <div className="space-y-5">
      <PaperCard rotate={-0.3} className="overflow-hidden">
        <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
          {kicker}
        </p>
        <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">{title}</h2>
        <p className="mt-3 text-foreground/80">{intro}</p>

        {/* Swipe explainer — nur auf Mobile */}
        <div className="mt-5 flex items-center justify-between gap-3 rounded-sm border border-dashed border-stamp/40 bg-stamp/5 px-3 py-2 md:hidden">
          <div className="flex items-center gap-2 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
            <Hand className="h-3.5 w-3.5" />
            Wischen für nächste Karte
          </div>
          <div className="flex items-center gap-1 text-stamp">
            <span className="font-mono-typed text-[11px]">
              {active + 1}/{cards.length}
            </span>
            <ChevronRight className="h-4 w-4 animate-pulse" />
          </div>
        </div>

        {/* Desktop/Tablet: Grid — Mobile: Carousel */}
        <div className="relative mt-4">
          <div
            ref={scrollerRef}
            onScroll={dismissFirstHint}
            className={cn(
              // Mobile: horizontales snap-carousel
              "-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              // Desktop/Tablet: Grid, kein scroll
              "md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:snap-none",
            )}
            style={{ scrollPaddingInline: "1.5rem" }}
          >
            {cards.map((c, i) => (
              <div
                key={c.title}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                data-idx={i}
                className="w-[82%] max-w-[360px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink"
              >
                <div className="h-full rounded-sm border border-border bg-paper p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                      Karte {i + 1} / {cards.length}
                    </p>
                    <span className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground md:hidden">
                      {i === cards.length - 1 ? "Letzte Karte" : "→"}
                    </span>
                  </div>
                  <h4 className="mt-1 font-serif text-xl font-bold">{c.title}</h4>
                  <p className="mt-2 text-sm text-foreground/85">{c.body}</p>
                  <p className="mt-3 border-t border-dashed border-border pt-2 text-xs italic text-foreground/60">
                    {c.hint}
                  </p>
                </div>
              </div>
            ))}
          </div>




          {/* First-time floating hint — nur Mobile */}
          {showFirstHint && !isLast && (
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink px-3 py-2 font-mono-typed text-[10px] uppercase tracking-wider text-paper shadow-lg animate-pulse md:hidden">
              👉 Wischen
            </div>
          )}

          {/* Desktop arrows — nur wenn nicht Grid (also sm bis md), hier komplett aus */}
          <button
            type="button"
            aria-label="Vorherige Karte"
            onClick={() => scrollTo(active - 1)}
            disabled={active === 0}
            className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-card p-1.5 shadow-sm hover:bg-secondary disabled:opacity-30 sm:block md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Nächste Karte"
            onClick={() => scrollTo(active + 1)}
            disabled={isLast}
            className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-border bg-card p-1.5 shadow-sm hover:bg-secondary disabled:opacity-30 sm:block md:hidden"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Dots — nur Mobile */}
        <div className="mt-3 flex items-center justify-center gap-2 md:hidden">
          {cards.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Karte ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === active ? "w-6 bg-stamp" : "w-2 bg-border",
              )}
            />
          ))}
        </div>
      </PaperCard>

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
        >
          {backLabel}
        </button>

        {showNext ? (
          <button
            onClick={onNext}
            className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            {nextLabel}
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-sm border border-dashed border-border bg-paper-deep/30 px-3 py-2 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            Noch {remaining} {remaining === 1 ? "Karte" : "Karten"} · weiterwischen
            <ChevronRight className="h-3.5 w-3.5 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
