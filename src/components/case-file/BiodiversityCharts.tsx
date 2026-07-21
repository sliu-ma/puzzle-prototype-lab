import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Bird, Fish, Bug, Rabbit, Squirrel, Turtle, Snail, Cat, Dog } from "lucide-react";
import { cn } from "@/lib/utils";
import versiegelungAsset from "@/assets/ursachen/versiegelung.jpg.asset.json";
import pestizideAsset from "@/assets/ursachen/pestizide.jpg.asset.json";
import begradigungAsset from "@/assets/ursachen/begradigung.jpg.asset.json";

/** Rote Liste: 3 von 9 Arten gefährdet (≈ 1/3). */
export function RoteListeChart() {
  const icons = [Bird, Bug, Fish, Rabbit, Turtle, Squirrel, Snail, Cat, Dog];
  // Drei zufällig verteilte "gefährdete" Positionen
  const endangered = new Set([0, 3, 6]);

  return (
    <div className="flex h-full flex-col rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        Untersuchte Arten in der Schweiz
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span className="font-serif text-4xl font-bold leading-none">⅓</span>
        <span className="font-mono-typed text-[11px] leading-tight text-muted-foreground">
          gefährdet oder ausgestorben
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-0 justify-items-center">
        {icons.map((Icon, i) => {
          const isEndangered = endangered.has(i);
          return (
            <div
              key={i}
              className="flex aspect-square w-full items-center justify-center"
              aria-label={isEndangered ? "gefährdet" : "nicht gefährdet"}
            >
              <Icon
                className={cn("h-16 w-16 sm:h-10 sm:w-10", isEndangered ? "text-rose-600" : "text-muted-foreground/60")}
                strokeWidth={2}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-3 flex items-center gap-3 text-[10px] font-mono-typed">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-rose-500/60 bg-rose-500/30" />
          <span className="text-rose-700">gefährdet</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-border bg-paper" />
          <span className="text-muted-foreground">nicht gefährdet</span>
        </span>
      </div>
    </div>
  );
}

const URSACHEN = [
  {
    title: "Versiegelung",
    desc: "Parkplätze, Strassen und Gebäude bedecken den Boden. Pflanzen und Tiere verlieren ihren Lebensraum.",
    src: versiegelungAsset.url,
  },
  {
    title: "Pestizide",
    desc: "Chemische Pflanzenschutzmittel schaden Insekten, Vögeln und dem Boden — auch weit weg vom Feld.",
    src: pestizideAsset.url,
  },
  {
    title: "Begradigte Gewässer",
    desc: "Kanalisierte Flüsse bieten Fischen, Amphibien und Uferpflanzen kaum noch Rückzugsräume.",
    src: begradigungAsset.url,
  },
];

/** Kleines Bild-Karussell mit den drei Haupt-Ursachen. */
export function UrsachenCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goto = (idx: number) => {
    const clamped = Math.max(0, Math.min(URSACHEN.length - 1, idx));
    const el = scrollerRef.current;
    if (!el) return;
    const child = el.children[clamped] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setActive(clamped);
  };

  return (
    <div className="flex h-full flex-col rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        Drei Ursachen · Bild {active + 1}/{URSACHEN.length}
      </p>

      <div className="relative mt-3">
        <div
          ref={scrollerRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            const w = el.clientWidth;
            const idx = Math.round(el.scrollLeft / w);
            if (idx !== active) setActive(idx);
          }}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {URSACHEN.map((u) => (
            <div key={u.title} className="w-full shrink-0 snap-center">
              <div className="overflow-hidden rounded-sm border border-border bg-paper">
                <img src={u.src} alt={u.title} className="h-32 w-full object-cover sm:h-40" loading="lazy" />
                <div className="p-2">
                  <p className="font-serif text-sm font-bold">{u.title}</p>
                  <p className="mt-1 text-[11px] leading-snug text-foreground/80">{u.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Vorherige Ursache"
          onClick={() => goto(active - 1)}
          disabled={active === 0}
          className="absolute left-1 top-16 -translate-y-1/2 rounded-full border border-border bg-card/90 p-1 shadow-sm hover:bg-secondary disabled:opacity-30 sm:top-20"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Nächste Ursache"
          onClick={() => goto(active + 1)}
          disabled={active === URSACHEN.length - 1}
          className="absolute right-1 top-16 -translate-y-1/2 rounded-full border border-border bg-card/90 p-1 shadow-sm hover:bg-secondary disabled:opacity-30 sm:top-20"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-auto flex items-center justify-center gap-1.5 pt-2">
        {URSACHEN.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ursache ${i + 1}`}
            onClick={() => goto(i)}
            className={cn("h-1.5 rounded-full transition-all", i === active ? "w-5 bg-stamp" : "w-1.5 bg-border")}
          />
        ))}
      </div>
    </div>
  );
}

/** Vielfalt = Lebensgrundlage. Vier Icons/Werte. */
export function VielfaltGrid() {
  const items = [
    { icon: "💧", label: "Trinkwasser" },
    { icon: "🌬️", label: "Saubere Luft" },
    { icon: "🌱", label: "Fruchtbare Böden" },
    { icon: "🐝", label: "Bestäubung" },
  ];
  return (
    <div className="flex h-full flex-col rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        Was uns die Biodiversität schenkt
      </p>
      {/* Untereinander bis sm, dann 2x2 */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 rounded-sm border border-border bg-paper px-2 py-1.5">
            <span className="text-lg leading-none">{it.icon}</span>
            <span className="font-mono-typed text-[11px]">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
