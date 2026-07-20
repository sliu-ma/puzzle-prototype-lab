import { Bike, Car, Train } from "lucide-react";

/** 45 % aller Autofahrten in CH sind kürzer als 5 km. */
export function ShortTripsShare() {
  const pct = 45;
  return (
    <div className="rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        Autofahrten in der Schweiz
      </p>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" className="fill-none stroke-border" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              className="fill-none stroke-emerald-500/80"
              strokeWidth="4"
              strokeDasharray={`${pct} ${100 - pct}`}
              pathLength={100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-serif text-xl font-bold leading-none">{pct}%</span>
            <span className="font-mono-typed text-[8px] uppercase text-muted-foreground">&lt; 5 km</span>
          </div>
        </div>
        <div className="min-w-0 text-[11px] leading-snug">
          <div className="flex items-center gap-1.5 font-mono-typed">
            <Car className="h-3.5 w-3.5 text-rose-500" />
            <span>Kurzstrecke im Auto</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 font-mono-typed text-emerald-700">
            <Bike className="h-3.5 w-3.5" />
            <span>Ideal für Velo &amp; zu Fuss</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-dashed border-border pt-2 font-mono-typed text-[11px]">
        <span className="text-muted-foreground">Meist nur 1 Person im Auto</span>
        <span className="font-bold text-emerald-700">Potenzial hoch</span>
      </div>
    </div>
  );
}

/** Vergleich Vollkosten pro Kilometer: Auto 74 Rp vs ÖV 46 Rp. */
export function CostPerKm() {
  const max = 80;
  const auto = 74;
  const oev = 46;
  const diff = auto - oev;
  const pct = (v: number) => `${(v / max) * 100}%`;

  return (
    <div className="rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        Vollkosten pro Kilometer
      </p>

      <div className="mt-3 space-y-3">
        <Row
          icon={<Car className="h-3.5 w-3.5" />}
          label="Auto"
          value="74 Rp."
          width={pct(auto)}
          color="bg-rose-400/80"
        />
        <Row
          icon={<Train className="h-3.5 w-3.5" />}
          label="ÖV"
          value="46 Rp."
          width={pct(oev)}
          color="bg-emerald-500/80"
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-dashed border-border pt-2 font-mono-typed text-[11px]">
        <span className="text-muted-foreground">Mehrkosten Auto</span>
        <span className="font-bold text-rose-600">+{diff} Rp. / km</span>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  width,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  width: string;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono-typed text-[11px]">
        <span className="inline-flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        <span className="font-bold">{value}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-border/60">
        <div className={`h-full ${color} transition-all`} style={{ width }} />
      </div>
    </div>
  );
}

/** 1 Zug = 90 Autos (∅ Auslastung). */
export function TrainVsCars() {
  return (
    <div className="space-y-3 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/20 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        1 Zug ersetzt …
      </p>

      <CompareRow
        badge="∅ Auslastung"
        count={90}
        display={90}
        cols={15}
      />
    </div>
  );
}

function CompareRow({
  badge,
  count,
  display,
  cols,
  note,
}: {
  badge: string;
  count: number;
  display: number;
  cols: number;
  note?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Train className="h-4 w-4 text-emerald-600" />
        <span className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
          {badge}
        </span>
        <span className="ml-auto font-mono-typed text-xs font-bold">= {count} Autos</span>
      </div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: display }).map((_, i) => (
          <Car key={i} className="h-3 w-3 text-rose-500/80" />
        ))}
      </div>
      {note && (
        <p className="mt-1 font-mono-typed text-[10px] italic text-muted-foreground">
          {note}
        </p>
      )}
    </div>
  );
}
