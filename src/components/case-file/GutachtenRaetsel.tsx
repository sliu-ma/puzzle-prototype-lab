import { useState } from "react";
import { usePersistentSet } from "@/lib/persist";


type FehlerId = "f1" | "f2" | "f3" | "f4" | "f5";
const alleFehlerIds: FehlerId[] = ["f1", "f2", "f3", "f4", "f5"];
const MAX_MARKIERUNGEN = alleFehlerIds.length;

type Chunk =
  | { kind: "error"; id: FehlerId; value: string }
  | { kind: "decoy"; id: string; value: string };

type Section = { heading: string; chunks: Chunk[] };
type Fakt = { groesse: string; wert: string };
type ChartKind = "bar" | "gauge" | "radial";
type ChartDatum = { label: string; value: number; suspekt?: boolean };
type Chart = { kind: ChartKind; titel: string; einheit: string; daten: ChartDatum[]; hinweis?: string };

type Gutachten = {
  id: "A" | "B" | "C";
  titel: string;
  art: "Fossil" | "Erneuerbar";
  akzent: string;
  auftraggeber: string;
  verfasser: string;
  datum: string;
  body: Section[];
  empfehlungText: string;
  chart: Chart;
  unterschrift: string;
  fakten: Fakt[];
};

const E = (id: FehlerId, value: string): Chunk => ({ kind: "error", id, value });
const D = (id: string, value: string): Chunk => ({ kind: "decoy", id, value });

const gutachten: Gutachten[] = [
  {
    id: "A",
    titel: 'Erdgas-Kraftwerk "Thermika Ost"',
    art: "Fossil",
    akzent: "bg-sky-900",
    auftraggeber: "Helvetia Energie AG",
    verfasser: "Ing.-Büro Brennwert GmbH",
    datum: "14. März 2025",
    body: [
      {
        heading: "1. Technische Bewertung",
        chunks: [
          E("f1", "Erdgas stösst im Betrieb 95 Gramm CO₂ pro Kilowattstunde aus. Das ist fast klimaneutral."),
          D("a2", "Das Kraftwerk ist eine Gas- und Dampf-Anlage (GuD) mit einen Wirkungsgrad von rund 60 Prozent. Der Wirkungsgrad zeigt: Wie viel von der eingesetzten Energie kommt am Ende als Strom heraus?"),
          D("a1", "Der Bau des Kraftwerks dauert höchstens 24 Monate."),
        ],
      },
      {
        heading: "2. Standortbewertung",
        chunks: [
          D("a3", "Das Gasnetz ist in der Nähe. Eine Leitung von 2,1 Kilometer Länge verbindet das Kraftwerk mit dem Gasnetz."),
          D("a4", "Für den Bau müssen Bäume gefällt werden. Insgesamt geht es um 4,2 Hektar Wald."),
          D("a5", "Die Gemeinde besitzt das Waldstück bereits. Es muss kein neues Land gekauft werden."),
        ],
      },
    ],
    empfehlungText: "Wir empfehlen: Die Gemeinde soll den Bau des Erdgaskraftwerks «Thermika Ost» sofort beschliessen.",
    chart: {
      kind: "bar",
      titel: "CO₂-Ausstoss im Betrieb",
      einheit: "g CO₂/kWh",
      daten: [
        { label: "Erdgas (laut Gutachten)", value: 95, suspekt: true },
        { label: "Steinkohle", value: 820 },
      ],
      hinweis: "Diagramm A-3",
    },
    unterschrift: "Gez. Dipl.-Ing. T. Brennwert",
    fakten: [
      { groesse: "CO₂ Erdgas-Kraftwerk (real)", wert: "≈ 400 g/kWh" },
      { groesse: "Wirkungsgrad GuD-Erdgas", wert: "≈ 60 %" },
      { groesse: "Bauzeit", wert: "≈ 24 Monate" },
    ],
  },
  {
    id: "B",
    titel: 'Kohle-Reservekraftwerk "Sicher & Stabil"',
    art: "Fossil",
    akzent: "bg-stone-800",
    auftraggeber: "Helvetia Energie AG",
    verfasser: "Dr. Kohlhaas Consulting",
    datum: "27. März 2025",
    body: [
      {
        heading: "1. Technische Bewertung",
        chunks: [
          E("f2", "Moderne Steinkohlekraftwerke haben einen Wirkungsgrad von 78 Prozent. Das bedeutet: 78 Prozent der eingesetzten Energie werden zu Strom."),
          E("f3", "Kohle ist erneuerbar. Kohle ist eine Brückentechnologie. Das bedeutet: Kohle wird nur für eine Übergangszeit genutzt, bis es eine bessere Lösung gibt."),
          D("b1", "Steinkohle stösst rund 820 Gramm CO₂ pro Kilowattstunde aus."),
        ],
      },
      {
        heading: "2. Standortbewertung",
        chunks: [
          D("b2", "Für die Anlage braucht es eine eigene Zufahrtsstrasse. Auf dieser Strasse fahren grosse Lastwagen.\u00a0"),
          D("b3", "Für den Betrieb braucht es eine Genehmigung nach dem kantonalen Luftreinhaltegesetz."),
          D("b4", "Der Standort liegt nicht in einer Gewässerschutzzone.\u00a0"),
        ],
      },
    ],
    empfehlungText: "Wir empfehlen: Die Gemeinde soll das Reservekraftwerk am geplanten Standort bauen.",
    chart: {
      kind: "gauge",
      titel: "Wirkungsgrad-Vergleich",
      einheit: "%",
      daten: [
        { label: "Steinkohle (Gutachten)", value: 78, suspekt: true },
        { label: "Erdgas GuD", value: 60 },
        { label: "Wind onshore", value: 45 },
        { label: "Photovoltaik", value: 22 },
      ],
      hinweis: "Diagramm B-2",
    },
    unterschrift: "Gez. Dr. R. Kohlhaas",
    fakten: [
      { groesse: "Wirkungsgrad Kohle-Kraftwerk (real)", wert: "≈ 45 %" },
      { groesse: "CO₂ Steinkohle", wert: "≈ 820 g/kWh" },
      { groesse: "Erneuerbar?", wert: "NEIN, fossiler Träger" },
    ],
  },
  {
    id: "C",
    titel: 'Bürger-Solarpark "GrünStrom" mit Batteriespeicher',
    art: "Erneuerbar",
    akzent: "bg-emerald-800",
    auftraggeber: "Bürgerinitiative Lindental",
    verfasser: "Energiewende e.V.",
    datum: "02. April 2025",
    body: [
      {
        heading: "1. Technische Bewertung",
        chunks: [
          E("f4", "Photovoltaik-Anlagen im Schweizer Mittelland haben durchschnittlich 250 Volllaststunden pro Jahr. Volllaststunden zeigen, wie lange eine Anlage mit voller Leistung Strom erzeugt."),
          D("c1", "Im Betrieb stösst die Anlage 0 Gramm CO₂ pro Kilowattstunde aus."),
          D("c2", "Die Amortisationszeit der ganzen Anlage beträgt rund 8 Jahre. Amortisationszeit bedeutet: die Zeit, bis sich die Anlage finanziell bezahlt macht."),
        ],
      },
      {
        heading: "2. Standortbewertung",
        chunks: [
          D("c3", "Die Anlage wird auf einer Fläche gebaut, die schon versiegelt ist. Für den Bau muss also kein Wald gerodet werden."),
          D("c4", "Ein Batteriespeicher mit 12 Megawattstunden (MWh) speichert Strom. So gibt es auch dann Strom, wenn keine Sonne scheint."),
          E("f5", "Batteriespeicher halten etwa 8 Jahre."),
        ],
      },
    ],
    empfehlungText: "Das Projekt wird auf Grundlage der überarbeiteten Ertragsrechnung zur Ablehnung empfohlen.",
    chart: {
      kind: "bar",
      titel: "Volllaststunden Photovoltaik",
      einheit: "h/Jahr",
      daten: [
        { label: "Schweizer Mittelland (Gutachten)", value: 250, suspekt: true },
        { label: "Alpenstandorte", value: 1400 },
      ],
      hinweis: "Diagramm C-1",
    },
    unterschrift: "i. A. d. Energiewende e.V.",
    fakten: [
      { groesse: "Volllaststunden PV (Schweizer Mittelland)", wert: "≈ 900–1'100 h/Jahr" },
      { groesse: "CO₂ Photovoltaik (Betrieb)", wert: "0 g/kWh" },
      { groesse: "Batteriespeicher (Li-Ion)", wert: "≈ 15–25 Jahre \nLebensdauer" },
      { groesse: "Erneuerbar?", wert: "JA, Sonnenenergie" },
    ],
  },
];

export function GutachtenRaetsel({ onErfolg }: { onErfolg: () => void }) {
  const [markiert, setMarkiert] = usePersistentSet<string>(
    "akte-5-gutachten-markiert",
    () => new Set(),
  );

  const [puls, setPuls] = useState(0);
  const [aktuell, setAktuell] = useState(0);
  const [fehler, setFehler] = useState<string | null>(null);

  const toggle = (id: string) => {
    setFehler(null);
    setMarkiert((m) => {
      const next = new Set(m);
      if (next.has(id)) next.delete(id);
      else {
        if (next.size >= MAX_MARKIERUNGEN) return m;
        next.add(id);
      }
      return next;
    });
  };

  const pruefen = () => {
    if (markiert.size !== MAX_MARKIERUNGEN) {
      setPuls((n) => n + 1);
      setFehler(`Du musst genau ${MAX_MARKIERUNGEN} Aussagen markieren.`);
      return;
    }
    const errSet = new Set<string>(alleFehlerIds);
    let ok = true;
    for (const id of markiert) if (!errSet.has(id)) { ok = false; break; }
    if (ok) onErfolg();
    else {
      setPuls((n) => n + 1);
      setFehler("Mindestens eine Markierung stimmt nicht. Vergleiche Text, Diagramm und Faktenkarte erneut.");
    }
  };

  const budgetVoll = markiert.size >= MAX_MARKIERUNGEN;
  const g = gutachten[aktuell];

  return (
    <div className="rounded-sm border border-border bg-paper p-3 sm:p-5">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-foreground/80">
          Markiere die <strong>{MAX_MARKIERUNGEN} Aussagen</strong>, die nicht stimmen können.&nbsp;
        </p>
        <div className="flex items-center gap-2">
          <div
            key={puls}
            className={`min-w-[88px] rounded-sm border bg-paper px-3 py-1.5 text-center text-sm ${
              puls > 0 ? "animate-pulse border-destructive/60" : "border-border"
            }`}
          >
            <div className="font-mono-typed text-[9px] uppercase tracking-wider text-stamp">
              Markierungen
            </div>
            <div className="font-serif font-bold">
              {markiert.size} / {MAX_MARKIERUNGEN}
            </div>
          </div>
          <button
            onClick={pruefen}
            disabled={markiert.size === 0}
            className="rounded-sm bg-primary px-4 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prüfen →
          </button>
        </div>
      </div>

      {/* Akten-Tabs */}
      <div className="mb-3 flex items-center gap-1.5">
        {gutachten.map((gg, i) => (
          <button
            key={gg.id}
            onClick={() => setAktuell(i)}
            className={`rounded-t-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
              i === aktuell
                ? `${gg.akzent} text-white`
                : "bg-secondary text-foreground/70 hover:bg-secondary/80"
            }`}
          >
            Akte {gg.id}
          </button>
        ))}
      </div>

      {/* Gutachten */}
      <article className="overflow-hidden rounded-sm border border-border bg-paper-deep/20">
        <header className={`flex items-start justify-between gap-3 ${g.akzent} px-4 py-3 text-white`}>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.25em] opacity-80">
              Gutachten {g.id} · {g.art}
            </div>
            <h3 className="mt-1 font-serif text-lg leading-tight">{g.titel}</h3>
            <div className="mt-1 text-[11px] opacity-80">
              {g.auftraggeber} · {g.verfasser} · {g.datum}
            </div>
          </div>
          <div className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
            {g.art}
          </div>
        </header>

        <div className="grid gap-4 p-4 md:grid-cols-[1.3fr_1fr] md:items-start">
          <div className="order-2 font-serif text-[14px] leading-relaxed md:order-1 md:col-start-1 md:row-start-1 md:self-start">
            {g.body.map((s, i) => (
              <section key={i} className="mb-3">
                <h4 className="mb-1 font-serif text-[15px] font-semibold">{s.heading}</h4>
                <div className="space-y-1.5">
                  {s.chunks.map((c) => (
                    <ChunkItem
                      key={c.id}
                      chunk={c}
                      markiert={markiert}
                      budgetVoll={budgetVoll}
                      onToggle={toggle}
                    />
                  ))}
                </div>
              </section>
            ))}

            <section className="mb-1 rounded-sm border border-border bg-secondary/40 p-3">
              <h4 className="mb-1 font-serif text-[15px] font-semibold">3. Empfehlung</h4>
              <p className="text-[14px]">{g.empfehlungText}</p>
              <div className="mt-2 text-right text-[11px] italic text-foreground/60">
                {g.unterschrift}
              </div>
            </section>
          </div>

          <div className="contents md:order-2 md:col-start-2 md:row-start-1 md:block md:self-start md:space-y-4">
            <div className="order-3 md:order-none">
              <ChartFigur chart={g.chart} />
            </div>

            <div className="order-1 md:order-none">
              <Faktenkasten fakten={g.fakten} />
            </div>
          </div>
        </div>
      </article>

      {fehler && (
        <div className="mt-3 rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {fehler}
        </div>
      )}
    </div>
  );
}

function ChunkItem({
  chunk,
  markiert,
  budgetVoll,
  onToggle,
}: {
  chunk: Chunk;
  markiert: Set<string>;
  budgetVoll: boolean;
  onToggle: (id: string) => void;
}) {
  const id = chunk.id;
  const isMarked = markiert.has(id);
  const disabled = !isMarked && budgetVoll;
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      disabled={disabled}
      className={`block w-full rounded-sm px-2 py-1.5 text-left transition ${
        isMarked
          ? "bg-amber-100 font-bold text-foreground line-through decoration-foreground decoration-2"
          : disabled
            ? "opacity-60"
            : "hover:bg-secondary"
      }`}
    >
      {chunk.value}
    </button>
  );
}

function ChartFigur({ chart }: { chart: Chart }) {
  return (
    <figure className="rounded-sm border border-border bg-paper p-3">
      <figcaption className="mb-2 font-serif text-[12px] font-semibold">
        {chart.titel}{" "}
        <span className="font-normal text-foreground/60">({chart.einheit})</span>
      </figcaption>
      {chart.kind === "bar" && <BarChart chart={chart} />}
      {chart.kind === "gauge" && <GaugeChart chart={chart} />}
      {chart.kind === "radial" && <PictogramChart chart={chart} />}
      {chart.hinweis && (
        <div className="mt-2 text-right text-[10px] italic text-foreground/60">
          {chart.hinweis}
        </div>
      )}
    </figure>
  );
}

function BarChart({ chart }: { chart: Chart }) {
  const max = Math.max(...chart.daten.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {chart.daten.map((d, i) => {
        const pct = Math.max(0.02, d.value / max);
        const color = d.suspekt ? "#d97706" : "#5a4f3a";
        return (
          <div key={i}>
            <div className="mb-0.5 flex justify-between text-[11px]">
              <span className="truncate pr-2 text-foreground/70">{d.label}</span>
              <span className="font-semibold tabular-nums" style={{ color }}>{d.value}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded bg-secondary">
              <div className="h-full rounded" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GaugeChart({ chart }: { chart: Chart }) {
  return (
    <div className="space-y-3">
      {chart.daten.map((d, i) => {
        const pct = Math.min(1, d.value / 100);
        const angle = 180 - pct * 180;
        const rad = (angle * Math.PI) / 180;
        const color = d.suspekt ? "#d97706" : "#5a4f3a";
        return (
          <div key={i} className="flex items-center gap-3">
            <svg width="90" height="52" viewBox="0 0 90 52">
              <path d="M 8 48 A 37 37 0 0 1 82 48" stroke="#ece4cf" strokeWidth="8" fill="none" strokeLinecap="round" />
              <path d="M 8 48 A 37 37 0 0 1 82 48" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${pct * 116} 200`} />
              <line x1="45" y1="48" x2={45 + 32 * Math.cos(rad)} y2={48 - 32 * Math.sin(rad)} stroke="#1e1b14" strokeWidth="2" strokeLinecap="round" />
              <circle cx="45" cy="48" r="3" fill="#1e1b14" />
            </svg>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[11px] text-foreground/70">{d.label}</span>
                <span className="font-serif text-sm font-semibold tabular-nums" style={{ color }}>{d.value}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PictogramChart({ chart }: { chart: Chart }) {
  const einheit = 200;
  return (
    <div className="space-y-2">
      {chart.daten.map((d, i) => {
        const n = Math.max(1, Math.round(d.value / einheit));
        const color = d.suspekt ? "#d97706" : "#5a4f3a";
        return (
          <div key={i}>
            <div className="mb-0.5 flex justify-between text-[11px]">
              <span className="truncate pr-2 text-foreground/70">{d.label}</span>
              <span className="font-semibold tabular-nums" style={{ color }}>{d.value} h</span>
            </div>
            <div className="flex flex-wrap items-center gap-0.5">
              {Array.from({ length: n }).map((_, k) => (
                <SunIcon key={k} color={color} />
              ))}
            </div>
          </div>
        );
      })}
      <div className="pt-1 text-[10px] text-foreground/60">1 Symbol = {einheit} h</div>
    </div>
  );
}

function SunIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="7" r="2.6" fill={color} />
      <g stroke={color} strokeWidth="1.2" strokeLinecap="round">
        <line x1="7" y1="0.8" x2="7" y2="2.4" />
        <line x1="7" y1="11.6" x2="7" y2="13.2" />
        <line x1="0.8" y1="7" x2="2.4" y2="7" />
        <line x1="11.6" y1="7" x2="13.2" y2="7" />
        <line x1="2.4" y1="2.4" x2="3.5" y2="3.5" />
        <line x1="10.5" y1="10.5" x2="11.6" y2="11.6" />
        <line x1="2.4" y1="11.6" x2="3.5" y2="10.5" />
        <line x1="10.5" y1="3.5" x2="11.6" y2="2.4" />
      </g>
    </svg>
  );
}

function Faktenkasten({ fakten }: { fakten: Fakt[] }) {
  return (
    <aside className="relative rounded-sm border-2 border-dashed border-emerald-700/60 bg-emerald-50 p-3 shadow-sm">
      <div className="absolute -top-3 left-3 flex items-center gap-1 rounded bg-emerald-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
        ✓ Marlenes Faktenkarte
      </div>
      <p className="mb-2 mt-1 text-[11px] italic text-emerald-900/80">
        Von Marlene gegengeprüfte Vergleichswerte.
      </p>
      <div className="divide-y divide-emerald-700/20">
        {fakten.map((f, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 py-1.5 text-[12px]">
            <span className="text-emerald-900/80">{f.groesse}</span>
            <span className="shrink-0 text-right font-semibold text-emerald-950 whitespace-pre-line">{f.wert}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
