import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import versiegelungAsset from "@/assets/ursachen/versiegelung.jpg.asset.json";
import pestizideAsset from "@/assets/ursachen/pestizide.jpg.asset.json";
import begradigungAsset from "@/assets/ursachen/begradigung.jpg.asset.json";

/** Rote Liste: rund 1/3 der untersuchten Arten in der Schweiz gefährdet. */
export function RoteListeChart() {
  const pct = 33;
  return (
    <div className="rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        Untersuchte Arten in der Schweiz
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" className="fill-none stroke-border" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              className="fill-none stroke-rose-500/80"
              strokeWidth="4"
              strokeDasharray={`${pct} ${100 - pct}`}
              pathLength={100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-xl font-bold leading-none">⅓</span>
            <span className="font-mono-typed text-[8px] uppercase text-muted-foreground">
              gefährdet
            </span>
          </div>
        </div>
        <div className="min-w-0 text-[11px] leading-snug">
          <div className="font-mono-typed text-rose-700">
            Gefährdet oder ausgestorben
          </div>
          <div className="mt-1 font-mono-typed text-muted-foreground">
            → Rote Liste (BAFU)
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full",
              i < 10 ? "bg-rose-500/80" : "bg-border",
            )}
          />
        ))}
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
    <div className="rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
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
                <img
                  src={u.src}
                  alt={u.title}
                  className="h-32 w-full object-cover sm:h-40"
                  loading="lazy"
                />
                <div className="p-2">
                  <p className="font-serif text-sm font-bold">{u.title}</p>
                  <p className="mt-1 text-[11px] leading-snug text-foreground/80">
                    {u.desc}
                  </p>
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

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {URSACHEN.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ursache ${i + 1}`}
            onClick={() => goto(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === active ? "w-5 bg-stamp" : "w-1.5 bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Vielfalt = Lebensgrundlage. Vier Icons/Werte in Kompaktraster. */
export function VielfaltGrid() {
  const items = [
    { icon: "💧", label: "Trinkwasser" },
    { icon: "🌬️", label: "Saubere Luft" },
    { icon: "🌱", label: "Fruchtbare Böden" },
    { icon: "🐝", label: "Bestäubung" },
  ];
  return (
    <div className="rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        Was uns die Biodiversität schenkt
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center gap-2 rounded-sm border border-border bg-paper px-2 py-1.5"
          >
            <span className="text-lg leading-none">{it.icon}</span>
            <span className="font-mono-typed text-[11px]">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
