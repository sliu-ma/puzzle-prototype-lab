import { Shirt, CookingPot, Thermometer, Coins, TrendingDown } from "lucide-react";

type Tipp = {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  action: string;
  effect: string;
  /** 0–100 – visueller Balken für die Wirkung */
  bar: number;
};

const TIPPS: Tipp[] = [
  {
    icon: Shirt,
    action: "Wäsche bei 60 statt 95 Grad waschen",
    effect: "bis −35 % Strom",
    bar: 35,
  },
  {
    icon: CookingPot,
    action: "Mit Deckel kochen",
    effect: "bis −40 % Strom",
    bar: 40,
  },
  {
    icon: Thermometer,
    action: "Wohnraum max. 20 °C heizen",
    effect: "−6 % pro °C weniger",
    bar: 45,
  },
];

/** Karte 2: Drei Alltagstipps mit Icon + kleinem Wirkungs-Balken. */
export function AlltagsTippsGrid() {
  return (
    <div className="flex h-full flex-col rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        Kleine Handgriffe · grosse Wirkung
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {TIPPS.map((t) => {
          const Icon = t.icon;
          return (
            <li
              key={t.action}
              className="flex items-center gap-3 rounded-sm border border-border bg-paper px-2.5 py-2"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-stamp/40 bg-paper-deep/40 text-stamp">
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[13px] leading-tight">
                  {t.action}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-stamp/70"
                      style={{ width: `${t.bar}%` }}
                    />
                  </div>
                  <span className="font-mono-typed text-[10px] text-stamp whitespace-nowrap">
                    {t.effect}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-auto pt-3 font-mono-typed text-[10px] text-muted-foreground">
        {"\n"}
      </p>
    </div>
  );
}

/** Karte 3: Vergleich der jährlichen Energiekosten mit/ohne Massnahmen. */
export function SparPotenzialChart() {
  const ohne = 2400;
  const mit = 1680;
  const diff = 720;
  const max = ohne;

  return (
    <div className="flex h-full flex-col rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        Energiekosten pro Jahr · Einfamilienhaus
      </p>

      <div className="mt-3 flex flex-col gap-3">
        {/* Ohne Massnahmen */}
        <div>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="font-serif text-[12px]">Ohne Massnahmen</span>
            <span className="font-mono-typed text-[11px] text-foreground">
              CHF {ohne.toLocaleString("de-CH")}.–
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-sm border border-border bg-paper">
            <div
              className="h-full bg-rose-500/60"
              style={{ width: `${(ohne / max) * 100}%` }}
            />
          </div>
        </div>

        {/* Mit Massnahmen */}
        <div>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="font-serif text-[12px]">Mit Massnahmen</span>
            <span className="font-mono-typed text-[11px] text-foreground">
              CHF {mit.toLocaleString("de-CH")}.–
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-sm border border-border bg-paper">
            <div
              className="h-full bg-emerald-500/60"
              style={{ width: `${(mit / max) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ersparnis Highlight */}
      <div className="mt-4 flex items-center gap-3 rounded-sm border border-stamp/50 bg-paper px-3 py-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-stamp/50 bg-paper-deep/40 text-stamp">
          <Coins className="h-4 w-4" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
            Ersparnis
          </p>
          <p className="font-serif text-lg font-bold leading-tight">
            CHF {diff}.–
          </p>
        </div>
        <TrendingDown className="h-5 w-5 text-emerald-600" strokeWidth={2} />
      </div>

      <p className="mt-auto pt-3 font-mono-typed text-[10px] text-muted-foreground">
        → Richtwert · variiert je nach Haus
      </p>
    </div>
  );
}
