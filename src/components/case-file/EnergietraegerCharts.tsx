import { Flame, Leaf, Ship, MapPin } from "lucide-react";

type Quelle = {
  name: string;
  co2: number;
  typ: "fossil" | "erneuerbar";
};

const QUELLEN: Quelle[] = [
  { name: "Wind", co2: 12, typ: "erneuerbar" },
  { name: "Wasserkraft", co2: 24, typ: "erneuerbar" },
  { name: "Geothermie", co2: 38, typ: "erneuerbar" },
  { name: "Sonne", co2: 48, typ: "erneuerbar" },
  { name: "Gas", co2: 490, typ: "fossil" },
  { name: "Kohle", co2: 820, typ: "fossil" },
];

/** Karte 1: CO₂-Vergleich Energieträger als Balkendiagramm. */
export function CO2VergleichChart() {
  const max = Math.max(...QUELLEN.map((q) => q.co2));

  return (
    <div className="flex h-full flex-col rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        CO₂ pro kWh Strom · Gramm
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {QUELLEN.map((q) => {
          const isFossil = q.typ === "fossil";
          return (
            <li key={q.name} className="flex items-center gap-2">
              <span className="flex w-24 shrink-0 items-center gap-1.5 font-serif text-[12px]">
                {isFossil ? (
                  <Flame className="h-3 w-3 text-rose-600" strokeWidth={2.2} />
                ) : (
                  <Leaf className="h-3 w-3 text-emerald-600" strokeWidth={2.2} />
                )}
                {q.name}
              </span>
              <div className="relative h-3.5 flex-1 overflow-hidden rounded-sm border border-border bg-paper">
                <div
                  className={
                    "h-full " +
                    (isFossil ? "bg-rose-500/70" : "bg-emerald-500/70")
                  }
                  style={{ width: `${(q.co2 / max) * 100}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right font-mono-typed text-[11px] text-foreground">
                {q.co2} g
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-dashed border-border pt-2 font-mono-typed text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-emerald-500/70" /> erneuerbar
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-rose-500/70" /> fossil
        </span>
      </div>
    </div>
  );
}

/** Karte 2: Anteil erneuerbarer Energien Schweiz 2023 (28 %). */
export function AnteilErneuerbarChart() {
  const anteil = 28;
  const rest = 100 - anteil;
  // Donut mit stroke-dasharray
  const size = 120;
  const r = 48;
  const c = 2 * Math.PI * r;
  const erneuerbarLen = (anteil / 100) * c;

  return (
    <div className="flex h-full flex-col rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        Energiemix Schweiz · 2023
      </p>

      <div className="mt-3 flex items-center gap-3">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className="stroke-rose-500/60"
            strokeWidth={14}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className="stroke-emerald-500/70"
            strokeWidth={14}
            strokeDasharray={`${erneuerbarLen} ${c - erneuerbarLen}`}
            strokeDashoffset={c / 4}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="butt"
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground font-serif"
            style={{ fontSize: 20, fontWeight: 700 }}
          >
            28 %
          </text>
        </svg>

        <ul className="flex min-w-0 flex-1 flex-col gap-2 text-[12px]">
          <li className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="h-3 w-3 shrink-0 rounded-sm bg-emerald-500/70" />
            <span className="font-serif">Erneuerbar</span>
            <span className="font-mono-typed text-foreground">{anteil} %</span>
          </li>
          <li className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="h-3 w-3 shrink-0 rounded-sm bg-rose-500/60" />
            <span className="font-serif">Fossil</span>
            <span className="font-mono-typed text-foreground">{rest} %</span>
          </li>
        </ul>
      </div>


      <p className="mt-auto pt-3 font-mono-typed text-[10px] text-muted-foreground">
        {"\n"}
      </p>
    </div>
  );
}

/** Karte 3: Importabhängigkeit — 70 % Import, 30 % Inland. */
export function ImportabhaengigkeitChart() {
  const importAnteil = 70;
  const inland = 100 - importAnteil;

  return (
    <div className="flex h-full flex-col rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        Energiebedarf Schweiz · Herkunft
      </p>

      <div className="mt-3 flex flex-col gap-3">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-serif text-[12px]">
              <Ship className="h-3.5 w-3.5 text-rose-600" strokeWidth={2.2} />
              Import
            </span>
            <span className="font-mono-typed text-[11px] text-foreground">
              {importAnteil} %
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-sm border border-border bg-paper">
            <div
              className="h-full bg-rose-500/60"
              style={{ width: `${importAnteil}%` }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-serif text-[12px]">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.2} />
              Inland
            </span>
            <span className="font-mono-typed text-[11px] text-foreground">
              {inland} %
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-sm border border-border bg-paper">
            <div
              className="h-full bg-emerald-500/70"
              style={{ width: `${inland}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
