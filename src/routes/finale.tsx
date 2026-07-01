import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, XCircle, Gauge, RefreshCw, ArrowUp, ArrowDown, Sparkles, Clock } from "lucide-react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { StageGate } from "@/components/case-file/StageGate";
import { completeStage, getHearingClock, getStartTs } from "@/lib/progress";
import { cn } from "@/lib/utils";
import bioLogo from "@/assets/labels/bio.png.asset.json";
import ipSuisseLogo from "@/assets/labels/ip-suisse.png.asset.json";
import demeterLogo from "@/assets/labels/demeter.png.asset.json";

export const Route = createFileRoute("/finale")({
  head: () => ({
    meta: [
      { title: "Finale — Hearing im Gemeindesaal" },
      {
        name: "description",
        content:
          "Das Hearing: Überzeuge den Gemeinderat mit Fakten aus allen fünf Etappen.",
      },
    ],
  }),
  component: FinaleGated,
});

function FinaleGated() {
  return (
    <StageGate stage={6}>
      <FinalePage />
    </StageGate>
  );
}

/* -------------------------------------------------- */
/*  Fragen-Datenmodell                                  */
/* -------------------------------------------------- */

type Thema = "Mobilität" | "Konsum" | "Biodiversität" | "Wohnen" | "Energie";

type Base = {
  id: number;
  thema: Thema;
  ratsmitglied: string;
  frage: string;
  erklaerung: string;
};

type SingleFrage = Base & {
  type: "single";
  optionen: string[];
  korrekt: number;
};

type MultiFrage = Base & {
  type: "multi";
  optionen: string[];
  korrekt: number[]; // alle korrekten Indizes (genau diese auswählen)
};

type ShortFrage = Base & {
  type: "short";
  akzeptiert: string[]; // normalisierte Vergleichswerte
  hint?: string;
};

type MatchFrage = Base & {
  type: "match";
  links: { id: string; label: string; icon?: string }[];
  rechts: { id: string; label: string }[];
  paare: Record<string, string>; // linkId -> rechtsId
};

type OrderFrage = Base & {
  type: "order";
  items: { id: string; label: string }[];
  reihenfolge: string[]; // korrekte Reihenfolge der ids
  hint: string;
};

type BucketFrage = Base & {
  type: "bucket";
  items: { id: string; label: string }[];
  buckets: { id: string; label: string }[];
  solution: Record<string, string>; // itemId -> bucketId
};

type Frage = SingleFrage | MultiFrage | ShortFrage | MatchFrage | OrderFrage | BucketFrage;

const FRAGEN: Frage[] = [
  // Mobilität
  {
    id: 1,
    type: "single",
    thema: "Mobilität",
    ratsmitglied: "Ratsmitglied Schmid",
    frage:
      "Wie viel mehr CO₂ verursacht ein Inlandflug gegenüber dem Zug auf gleicher Strecke ungefähr?",
    optionen: ["Etwa gleich viel", "Rund 3-mal mehr", "Rund 30-mal mehr"],
    korrekt: 2,
    erklaerung:
      "Ein Inlandflug stösst etwa 30-mal mehr CO₂ pro Person aus als der Zug (BAFU, mobitool.ch).",
  },
  {
    id: 2,
    type: "multi",
    thema: "Mobilität",
    ratsmitglied: "Ratsmitglied Schmid",
    frage:
      "Welche dieser Aussagen zum Verkehr in der Schweiz stimmen? (Mehrfachauswahl)",
    optionen: [
      "Rund die Hälfte aller Pendlerwege ist kürzer als 5 km.",
      "Ein voll besetztes Auto ist klimafreundlicher als ein voller Zug.",
      "Velo und zu Fuss verursachen praktisch kein CO₂.",
      "Der Verkehr ist für unter 5 % der CH-Treibhausgase verantwortlich.",
    ],
    korrekt: [0, 2],
    erklaerung:
      "Rund 50 % der Pendlerwege sind unter 5 km, Velo/zu Fuss sind nahezu CO₂-frei. Der Verkehr macht aber rund ein Drittel der CH-Emissionen aus — nicht 5 %. Die Auto-Aussage ist eine Scheinrechnung.",
  },

  // Konsum
  {
    id: 3,
    type: "match",
    thema: "Konsum",
    ratsmitglied: "Ratsherr Brunner",
    frage:
      "Ordne jedes Label seinem Zweck zu. Ziehe das Label per Drag & Drop auf den passenden Zweck.",
    links: [
      { id: "biosuisse", label: "Bio Suisse", icon: bioLogo.url },
      { id: "ipsuisse", label: "IP-Suisse", icon: ipSuisseLogo.url },
      { id: "demeter", label: "Demeter", icon: demeterLogo.url },
    ],
    rechts: [
      { id: "ch-bio", label: "Schweizer Bio-Landwirtschaft" },
      { id: "ch-ip", label: "Integrierte CH-Produktion, weniger Pestizide" },
      { id: "biodyn", label: "Biologisch-dynamische Landwirtschaft" },
    ],
    paare: { biosuisse: "ch-bio", ipsuisse: "ch-ip", demeter: "biodyn" },
    erklaerung:
      "Bio Suisse = CH-Bio; IP-Suisse = integrierte Produktion; Demeter = biologisch-dynamisch (strengster Anbau).",
  },
  {
    id: 4,
    type: "short",
    thema: "Konsum",
    ratsmitglied: "Ratsherr Brunner",
    frage:
      "Nennt ein Schweizer Saison-Gemüse, das im April typischerweise geerntet wird.",
    akzeptiert: [
      "lauch",
      "feldsalat",
      "nuesslisalat",
      "nüsslisalat",
      "karotten",
      "rhabarber",
      "spinat",
      "spargel",
      "radieschen",
    ],
    hint: "Es ist Frühling — Erdbeeren und Tomaten kommen erst später.",
    erklaerung:
      "Im April sind in CH u. a. Lauch, Feldsalat, Spinat, Radieschen, Spargel und Rhabarber saisonal verfügbar.",
  },

  // Biodiversität
  {
    id: 5,
    type: "multi",
    thema: "Biodiversität",
    ratsmitglied: "Ratsfrau Lindenmann",
    frage: "Was sind Massnahmen zur Förderung der Biodiversität?",
    optionen: [
      "Vernetzung von Lebensräumen (Korridore, Hecken)",
      "Renaturierung von Bächen und Waldrändern",
      "Blühstreifen am Feldrand anlegen",
      "Aufforstung mit einer einzigen Baumart",
    ],
    korrekt: [0, 1, 2],
    erklaerung:
      "Vernetzung und Renaturierung schaffen ganze Lebensraum-Systeme, Blühstreifen sind punktuell hilfreich, Monokulturen schaden der Biodiversität sogar.",
  },
  {
    id: 6,
    type: "single",
    thema: "Biodiversität",
    ratsmitglied: "Ratsfrau Lindenmann",
    frage:
      "Wie viele der untersuchten Arten in der Schweiz stehen auf der Roten Liste?",
    optionen: ["Rund 1 von 20", "Rund 1 von 3", "Rund 1 von 100"],
    korrekt: 1,
    erklaerung: "Rund ein Drittel der untersuchten Arten ist gefährdet (BAFU).",
  },

  // Wohnen
  {
    id: 7,
    type: "short",
    thema: "Wohnen",
    ratsmitglied: "Ratsherr Frei",
    frage:
      "Wie viel Prozent Heizenergie spart eine Absenkung der Raumtemperatur um 1 °C ungefähr?",
    akzeptiert: ["6", "6%", "6 prozent", "ca 6", "rund 6", "etwa 6"],
    hint: "Faustregel im Energiebereich — eine einstellige Zahl.",
    erklaerung:
      "Faustregel: 1 °C kühler entspricht ca. 6 % weniger Heizenergie.",
  },
  {
    id: 8,
    type: "single",
    thema: "Wohnen",
    ratsmitglied: "Ratsherr Frei",
    frage:
      "In welchem Bereich entsteht der grösste Teil des Energieverbrauchs eines Schweizer Haushalts?",
    optionen: ["Beleuchtung", "Heizung und Warmwasser", "Kühlschrank"],
    korrekt: 1,
    erklaerung:
      "Heizung und Warmwasser machen oft 70–80 % des Haushaltsenergieverbrauchs aus.",
  },

  // Energie
  {
    id: 9,
    type: "bucket",
    thema: "Energie",
    ratsmitglied: "Gemeindepräsident",
    frage: "Ordne die Energiequellen in erneuerbare und nicht erneuerbare ein.",
    items: [
      { id: "pv", label: "Photovoltaik" },
      { id: "wasser", label: "Wasserkraft" },
      { id: "gas", label: "Erdgas" },
      { id: "kohle", label: "Steinkohle" },
      { id: "wind", label: "Windkraft" },
    ],
    buckets: [
      { id: "erneuerbar", label: "Erneuerbar" },
      { id: "nicht", label: "Nicht erneuerbar" },
    ],
    solution: {
      pv: "erneuerbar",
      wasser: "erneuerbar",
      wind: "erneuerbar",
      gas: "nicht",
      kohle: "nicht",
    },
    erklaerung:
      "Photovoltaik, Wasserkraft und Windkraft sind erneuerbar. Erdgas und Steinkohle sind fossile Brennstoffe und nicht erneuerbar.",
  },
  {
    id: 10,
    type: "single",
    thema: "Energie",
    ratsmitglied: "Gemeindepräsident",
    frage:
      "Im Gas-Gutachten stehen 95 g CO₂/kWh. Was stösst ein modernes Erdgaskraftwerk realistisch aus?",
    optionen: ["Rund 95 g", "Rund 400 g", "Rund 820 g"],
    korrekt: 1,
    erklaerung:
      "Erdgas liegt real bei rund 400 g CO₂/kWh — die 95-g-Angabe ist um den Faktor 4 zu tief.",
  },
];

const MAX_FEHLER = 3;

/* -------------------------------------------------- */
/*  Hauptkomponente                                     */
/* -------------------------------------------------- */

type Status = "running" | "won" | "lost";

function FinalePage() {
  const [started, setStarted] = useState(false);
  const [aktuell, setAktuell] = useState(0);
  const [ergebnisse, setErgebnisse] = useState<(boolean | null)[]>(() =>
    Array(FRAGEN.length).fill(null),
  );
  const [resetKey, setResetKey] = useState(0);
  const [pulse, setPulse] = useState<null | "up" | "down">(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const correctCount = useMemo(
    () => ergebnisse.filter((r) => r === true).length,
    [ergebnisse],
  );
  const fehler = useMemo(
    () => ergebnisse.filter((r) => r === false).length,
    [ergebnisse],
  );
  const beantwortet = correctCount + fehler;

  // Barometer: startet bei 50, +12 pro Treffer, -18 pro Fehler.
  const STEP_UP = 12;
  const STEP_DOWN = 18;
  const barometer = Math.max(
    0,
    Math.min(100, 50 + correctCount * STEP_UP - fehler * STEP_DOWN),
  );

  const status: Status =
    barometer <= 0
      ? "lost"
      : beantwortet === FRAGEN.length
        ? "won"
        : "running";

  useEffect(() => {
    if (status === "won") completeStage(6);
  }, [status]);

  const handleResult = (correct: boolean) => {
    setErgebnisse((prev) => {
      const next = [...prev];
      next[aktuell] = correct;
      return next;
    });
    setPulse(correct ? "up" : "down");
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setPulse(null), 1600);
  };

  const handleWeiter = () => {
    if (aktuell < FRAGEN.length - 1) setAktuell(aktuell + 1);
  };

  const reset = () => {
    setErgebnisse(Array(FRAGEN.length).fill(null));
    setAktuell(0);
    setStarted(true);
    setResetKey((k) => k + 1);
    setPulse(null);
  };

  const frage = FRAGEN[aktuell];
  const meinErgebnis = ergebnisse[aktuell];

  return (
    <main className="relative min-h-screen px-3 py-6 sm:px-4 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-ink) 0, var(--color-ink) 1px, transparent 1px, transparent 28px)",
        }}
      />

      <div className="relative mx-auto max-w-3xl">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4 sm:mb-8 sm:pb-5">
          <div className="min-w-0">
            <Link
              to="/"
              className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground sm:text-[11px]"
            >
              ← Zurück zum Start
            </Link>
            <h1 className="mt-1.5 font-serif text-2xl font-bold leading-tight sm:mt-2 sm:text-5xl">
              Finale · Hearing
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Gemeindesaal Speicher · {getHearingClock() ?? "19:00"} Uhr
            </p>
          </div>
          <Stamp rotate={-6}>Live</Stamp>
        </header>

        {status === "running" && !started && (
          <IntroConversation onStart={() => setStarted(true)} />
        )}

        {status === "running" && started && (
          <div className="space-y-4" key={`run-${resetKey}`}>
            {/* Barometer */}
            <Barometer
              value={barometer}
              pulse={pulse}
              aktuell={aktuell}
              total={FRAGEN.length}
              treffer={correctCount}
              fehler={fehler}
            />

            {/* Ratsperson mit Sprechblase */}
            <CouncilSpeaker
              key={`s-${frage.id}-${resetKey}`}
              name={frage.ratsmitglied}
              thema={frage.thema}
              text={frage.frage}
            />

            <PaperCard rotate={0.2}>
              <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                Antwortformat · {typeLabel(frage.type)}
              </p>

              <div className="mt-4">
                <FrageRenderer
                  key={`f-${frage.id}-${resetKey}`}
                  frage={frage}
                  answered={meinErgebnis !== null}
                  onResult={handleResult}
                />
              </div>

              {meinErgebnis !== null && (
                <div
                  className={cn(
                    "mt-5 rounded-sm border p-4 text-sm animate-scale-in",
                    meinErgebnis
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-destructive/40 bg-destructive/5",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {meinErgebnis ? (
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                      {meinErgebnis ? "Treffer · Barometer steigt" : "Fehler · Barometer fällt"}
                    </p>
                  </div>
                  <p className="mt-2 text-foreground/85">{frage.erklaerung}</p>
                </div>
              )}

              {meinErgebnis !== null && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={
                      aktuell < FRAGEN.length - 1
                        ? handleWeiter
                        : () => setErgebnisse((a) => [...a])
                    }
                    className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {aktuell < FRAGEN.length - 1
                      ? "Nächste Frage →"
                      : "Ergebnis ansehen →"}
                  </button>
                </div>
              )}
            </PaperCard>
          </div>
        )}

        {status === "won" && <OutroScreen />}

        {status === "lost" && (
          <PaperCard rotate={0.3} tape="top-right">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Der Rat ist nicht überzeugt
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              „Versucht es erneut."
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
              Das Barometer ist auf null gefallen. Geh die Etappen-Karten
              nochmals durch — besonders die fachlichen Inputs am Ende jeder
              Etappe.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 font-serif text-sm hover:bg-secondary"
              >
                ← Zurück zum Start
              </Link>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 hover:shadow-md"
              >
                <RefreshCw className="h-4 w-4" /> Neuer Versuch
              </button>
            </div>
          </PaperCard>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------- */
/*  Barometer mit Steige-/Fall-Pulse                    */
/* -------------------------------------------------- */

function Barometer({
  value,
  pulse,
  aktuell,
  total,
  treffer,
  fehler,
}: {
  value: number;
  pulse: null | "up" | "down";
  aktuell: number;
  total: number;
  treffer: number;
  fehler: number;
}) {
  const color =
    value > 70
      ? "bg-emerald-500"
      : value > 45
        ? "bg-emerald-500/80"
        : value > 25
          ? "bg-amber-500"
          : value > 10
            ? "bg-orange-500"
            : "bg-destructive";

  return (
    <div className="sticky top-2 z-20 rounded-sm border border-border bg-card/95 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono-typed text-[11px] uppercase tracking-wider text-stamp">
          <Gauge className="h-4 w-4" /> Überzeugungs-Barometer
        </div>
        <div className="flex items-center gap-2">
          {pulse && (
            <span
              key={`${aktuell}-${pulse}`}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono-typed text-[10px] font-bold animate-fade-in",
                pulse === "up"
                  ? "bg-emerald-500/15 text-emerald-700"
                  : "bg-destructive/15 text-destructive",
              )}
            >
              {pulse === "up" ? (
                <>
                  <ArrowUp className="h-3 w-3" /> +12
                </>
              ) : (
                <>
                  <ArrowDown className="h-3 w-3" /> −18
                </>
              )}
            </span>
          )}
          <div className="font-mono-typed text-xs text-muted-foreground">
            Frage {Math.min(aktuell + 1, total)} / {total}
          </div>
        </div>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full transition-all duration-500", color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>0</span>
        <span>{value}%</span>
        <span className="flex items-center gap-3">
          <span className="text-emerald-700">✓ {treffer}</span>
          <span className="text-destructive">✕ {fehler}</span>
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Ratsperson + Sprechblase                            */
/* -------------------------------------------------- */

const COUNCIL_COLORS: Record<string, { bg: string; ring: string }> = {
  "Ratsmitglied Schmid": { bg: "bg-sky-200", ring: "ring-sky-400" },
  "Ratsherr Brunner": { bg: "bg-amber-200", ring: "ring-amber-500" },
  "Ratsfrau Lindenmann": { bg: "bg-emerald-200", ring: "ring-emerald-500" },
  "Ratsherr Frei": { bg: "bg-rose-200", ring: "ring-rose-400" },
  "Gemeindepräsident": { bg: "bg-violet-200", ring: "ring-violet-500" },
};

function initialsOf(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  const last = words[words.length - 1] ?? "";
  return last.slice(0, 2).toUpperCase();
}

function CouncilSpeaker({
  name,
  thema,
  text,
}: {
  name: string;
  thema: string;
  text: string;
}) {
  const c = COUNCIL_COLORS[name] ?? { bg: "bg-secondary", ring: "ring-border" };
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-serif text-lg font-bold text-foreground ring-2 ring-offset-2 ring-offset-paper",
          c.bg,
          c.ring,
        )}
        aria-hidden
      >
        {initialsOf(name)}
      </div>
      <div className="relative flex-1 rounded-2xl rounded-tl-sm border border-border bg-paper px-4 py-3 shadow-sm">
        <span
          aria-hidden
          className="absolute -left-2 top-3 h-3 w-3 rotate-45 border-b border-l border-border bg-paper"
        />
        <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
          {name} · {thema}
        </p>
        <p className="mt-1 font-serif text-[15px] leading-snug sm:text-base">
          „{text}"
        </p>
      </div>
    </div>
  );
}

/* Kleine Konfetti-/Funken-Animation für die Auflösung */
function SuccessConfetti() {
  const dots = Array.from({ length: 14 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {dots.map((_, i) => {
        const left = (i * 53) % 100;
        const delay = (i % 7) * 80;
        const colors = ["bg-emerald-500", "bg-amber-400", "bg-sky-400", "bg-rose-400"];
        return (
          <span
            key={i}
            className={cn(
              "absolute top-0 h-2 w-2 rounded-sm opacity-80 animate-fade-in",
              colors[i % colors.length],
            )}
            style={{
              left: `${left}%`,
              animationDelay: `${delay}ms`,
              transform: `translateY(${(i % 5) * 6}px) rotate(${i * 18}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

function typeLabel(t: Frage["type"]) {
  switch (t) {
    case "single":
      return "Single Choice";
    case "multi":
      return "Multiple Choice";
    case "short":
      return "Kurzantwort";
    case "match":
      return "Zuordnen";
    case "order":
      return "Reihenfolge";
    case "bucket":
      return "Zuordnen";
  }
}

function shuffleIndices(n: number): number[] {
  const arr: number[] = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald";
}) {
  return (
    <div>
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-serif text-2xl font-bold",
          accent === "emerald" && "text-emerald-600",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Frage-Renderer                                      */
/* -------------------------------------------------- */

function FrageRenderer({
  frage,
  answered,
  onResult,
}: {
  frage: Frage;
  answered: boolean;
  onResult: (correct: boolean) => void;
}) {
  switch (frage.type) {
    case "single":
      return <SingleView frage={frage} answered={answered} onResult={onResult} />;
    case "multi":
      return <MultiView frage={frage} answered={answered} onResult={onResult} />;
    case "short":
      return <ShortView frage={frage} answered={answered} onResult={onResult} />;
    case "match":
      return <MatchView frage={frage} answered={answered} onResult={onResult} />;
    case "order":
      return <OrderView frage={frage} answered={answered} onResult={onResult} />;
    case "bucket":
      return <BucketView frage={frage} answered={answered} onResult={onResult} />;
  }
}

/* ---- Single Choice ---- */
function SingleView({
  frage,
  answered,
  onResult,
}: {
  frage: SingleFrage;
  answered: boolean;
  onResult: (c: boolean) => void;
}) {
  const order = useMemo(() => shuffleIndices(frage.optionen.length), [frage]);
  const [mine, setMine] = useState<number | null>(null);
  const choose = (i: number) => {
    if (mine !== null) return;
    setMine(i);
    onResult(i === frage.korrekt);
  };
  return (
    <div className="grid gap-2">
      {order.map((i) => {
        const opt = frage.optionen[i];
        const isMine = mine === i;
        const isCorrect = i === frage.korrekt;
        const reveal = mine !== null;
        return (
          <button
            key={i}
            onClick={() => choose(i)}
            disabled={answered}
            className={cn(
              "flex items-center justify-between gap-3 rounded-sm border px-4 py-3 text-left font-serif text-[15px] transition-colors",
              !reveal && "border-border bg-paper hover:bg-secondary",
              reveal && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
              reveal && isMine && !isCorrect && "border-destructive/60 bg-destructive/10",
              reveal && !isCorrect && !isMine && "border-border bg-paper opacity-60",
            )}
          >
            <span>{opt}</span>
            {reveal && isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
            {reveal && isMine && !isCorrect && (
              <XCircle className="h-5 w-5 shrink-0 text-destructive" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---- Multiple Choice ---- */
function MultiView({
  frage,
  answered,
  onResult,
}: {
  frage: MultiFrage;
  answered: boolean;
  onResult: (c: boolean) => void;
}) {
  const order = useMemo(() => shuffleIndices(frage.optionen.length), [frage]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggle = (i: number) => {
    if (submitted) return;
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  const submit = () => {
    if (submitted || answered) return;
    const korrektSet = new Set(frage.korrekt);
    const isEqual =
      selected.size === korrektSet.size &&
      [...selected].every((i) => korrektSet.has(i));
    setSubmitted(true);
    onResult(isEqual);
  };

  return (
    <div className="space-y-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        Mehrere Antworten möglich
      </p>
      <div className="grid gap-2">
        {order.map((i) => {
          const opt = frage.optionen[i];
          const isSel = selected.has(i);
          const isCorrect = frage.korrekt.includes(i);
          const reveal = submitted;
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              disabled={submitted || answered}
              className={cn(
                "flex items-center gap-3 rounded-sm border px-4 py-3 text-left font-serif text-[15px] transition-colors",
                !reveal && isSel && "border-stamp bg-stamp/10",
                !reveal && !isSel && "border-border bg-paper hover:bg-secondary",
                reveal && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                reveal && isSel && !isCorrect && "border-destructive/60 bg-destructive/10",
                reveal && !isCorrect && !isSel && "border-border bg-paper opacity-60",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border",
                  isSel ? "border-stamp bg-stamp text-paper" : "border-border bg-paper",
                )}
              >
                {isSel && "✓"}
              </span>
              <span className="flex-1">{opt}</span>
              {reveal && isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
              {reveal && isSel && !isCorrect && (
                <XCircle className="h-5 w-5 shrink-0 text-destructive" />
              )}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={submit}
          disabled={selected.size === 0}
          className="w-full rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary disabled:opacity-50"
        >
          Antwort prüfen
        </button>
      )}
    </div>
  );
}

/* ---- Short Answer ---- */
const normalize = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9% ]/g, "")
    .replace(/\s+/g, " ");

function ShortView({
  frage,
  answered,
  onResult,
}: {
  frage: ShortFrage;
  answered: boolean;
  onResult: (c: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted || answered) return;
    const n = normalize(text);
    const ok = frage.akzeptiert.some((a) => normalize(a) === n);
    setSubmitted(true);
    onResult(ok);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitted || answered}
        placeholder="Deine Antwort …"
        className="w-full rounded-sm border border-border bg-paper-deep/30 px-4 py-3 font-serif text-[15px] focus:border-stamp focus:outline-none"
      />
      {frage.hint && !submitted && (
        <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
          Hinweis: {frage.hint}
        </p>
      )}
      {!submitted && (
        <button
          type="submit"
          disabled={text.trim().length === 0}
          className="w-full rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary disabled:opacity-50"
        >
          Antwort prüfen
        </button>
      )}
    </form>
  );
}

/* ---- Match (Drag & Drop) ---- */
function MatchView({
  frage,
  answered,
  onResult,
}: {
  frage: MatchFrage;
  answered: boolean;
  onResult: (c: boolean) => void;
}) {
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [hoverRight, setHoverRight] = useState<string | null>(null);
  const rightRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const usedRight = new Set(Object.values(pairs));
  const leftById = Object.fromEntries(frage.links.map((l) => [l.id, l]));
  const rechtsById = Object.fromEntries(frage.rechts.map((r) => [r.id, r.label]));

  const findRightAt = (x: number, y: number): string | null => {
    for (const [rid, el] of Object.entries(rightRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return rid;
    }
    return null;
  };

  const startDrag = (lid: string) => (e: React.PointerEvent) => {
    if (submitted) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(lid);
    setGhost({ x: e.clientX, y: e.clientY });
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setGhost({ x: e.clientX, y: e.clientY });
    setHoverRight(findRightAt(e.clientX, e.clientY));
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    const rid = findRightAt(e.clientX, e.clientY);
    if (rid) {
      setPairs((prev) => {
        const next = { ...prev };
        for (const [l, r] of Object.entries(next)) if (r === rid) delete next[l];
        next[dragging] = rid;
        return next;
      });
    }
    setDragging(null);
    setGhost(null);
    setHoverRight(null);
  };

  const clear = (lid: string) => {
    if (submitted) return;
    setPairs((prev) => {
      const n = { ...prev };
      delete n[lid];
      return n;
    });
  };

  const allDone = Object.keys(pairs).length === frage.links.length;

  const submit = () => {
    if (submitted || answered) return;
    const ok = frage.links.every((l) => pairs[l.id] === frage.paare[l.id]);
    setSubmitted(true);
    onResult(ok);
  };

  const dragged = dragging ? leftById[dragging] : null;

  return (
    <div className="space-y-3" onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        Ziehe jedes Label auf den passenden Zweck.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Links (draggable) */}
        <div className="space-y-2">
          {frage.links.map((l) => {
            const paired = pairs[l.id];
            const isDragging = dragging === l.id;
            const correct = submitted && paired === frage.paare[l.id];
            const wrong = submitted && paired && paired !== frage.paare[l.id];
            return (
              <div
                key={l.id}
                onPointerDown={startDrag(l.id)}
                className={cn(
                  "select-none touch-none rounded-sm border px-3 py-2 text-left font-serif text-[14px] transition-colors",
                  submitted ? "cursor-default" : "cursor-grab active:cursor-grabbing",
                  isDragging && "opacity-40",
                  !submitted && !isDragging && "border-border bg-paper hover:bg-secondary",
                  correct && "border-emerald-500/60 bg-emerald-500/10",
                  wrong && "border-destructive/60 bg-destructive/10",
                )}
              >
                <div className="flex items-center gap-2">
                  {l.icon && (
                    <img
                      src={l.icon}
                      alt=""
                      className="h-8 w-8 shrink-0 object-contain"
                      draggable={false}
                    />
                  )}
                  <div className="font-bold">{l.label}</div>
                </div>
                {paired && (
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-foreground/70">
                    <span>→ {rechtsById[paired]}</span>
                    {!submitted && (
                      <span
                        role="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          clear(l.id);
                        }}
                        className="rounded-sm border border-border bg-card px-1.5 py-0.5 font-mono-typed text-[10px] uppercase hover:bg-secondary"
                      >
                        Lösen
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Rechts (drop targets) */}
        <div className="space-y-2">
          {frage.rechts.map((r) => {
            const used = usedRight.has(r.id);
            const isHover = hoverRight === r.id && dragging;
            return (
              <div
                key={r.id}
                ref={(el) => {
                  rightRefs.current[r.id] = el;
                }}
                className={cn(
                  "rounded-sm border-2 border-dashed px-3 py-2 text-left font-serif text-[14px] transition-colors",
                  isHover ? "border-stamp bg-stamp/15" : "border-border/70 bg-paper",
                  used && !isHover && "opacity-70",
                )}
              >
                {r.label}
              </div>
            );
          })}
        </div>
      </div>
      {!submitted && (
        <button
          onClick={submit}
          disabled={!allDone}
          className="w-full rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary disabled:opacity-50"
        >
          Zuordnung prüfen
        </button>
      )}

      {/* Drag ghost */}
      {dragging && ghost && dragged && (
        <div
          className="pointer-events-none fixed z-50 rounded-sm border border-stamp bg-paper px-3 py-2 shadow-lg"
          style={{ left: ghost.x + 12, top: ghost.y + 12 }}
        >
          <div className="flex items-center gap-2">
            {dragged.icon && (
              <img src={dragged.icon} alt="" className="h-8 w-8 shrink-0 object-contain" />
            )}
            <div className="font-serif text-[14px] font-bold">{dragged.label}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Order ---- */
function OrderView({
  frage,
  answered,
  onResult,
}: {
  frage: OrderFrage;
  answered: boolean;
  onResult: (c: boolean) => void;
}) {
  // Anfangsreihenfolge stabil deterministisch invertiert
  const [order, setOrder] = useState<string[]>(() =>
    [...frage.reihenfolge].reverse(),
  );
  const [submitted, setSubmitted] = useState(false);

  const move = (i: number, dir: -1 | 1) => {
    if (submitted) return;
    setOrder((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const submit = () => {
    if (submitted || answered) return;
    const ok = order.every((id, i) => id === frage.reihenfolge[i]);
    setSubmitted(true);
    onResult(ok);
  };

  const itemById = Object.fromEntries(frage.items.map((it) => [it.id, it.label]));

  return (
    <div className="space-y-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        Verschiebe per Pfeil — oben = wirksamste Massnahme.
      </p>
      <ol className="space-y-2">
        {order.map((id, i) => {
          const correctHere = submitted && frage.reihenfolge[i] === id;
          const wrongHere = submitted && !correctHere;
          return (
            <li
              key={id}
              className={cn(
                "flex items-center gap-2 rounded-sm border bg-paper px-3 py-2",
                !submitted && "border-border",
                correctHere && "border-emerald-500/60 bg-emerald-500/10",
                wrongHere && "border-destructive/60 bg-destructive/10",
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stamp font-mono-typed text-xs font-bold text-paper">
                {i + 1}
              </span>
              <span className="flex-1 font-serif text-[14px]">{itemById[id]}</span>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => move(i, -1)}
                  disabled={submitted || i === 0}
                  className="rounded-sm border border-border bg-card p-1 hover:bg-secondary disabled:opacity-30"
                  aria-label="Nach oben"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={submitted || i === order.length - 1}
                  className="rounded-sm border border-border bg-card p-1 hover:bg-secondary disabled:opacity-30"
                  aria-label="Nach unten"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      {!submitted && (
        <button
          onClick={submit}
          className="w-full rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
        >
          Reihenfolge prüfen
        </button>
      )}
    </div>
  );
}

/* ---- Bucket Sort (Drag & Drop) ---- */
function BucketView({
  frage,
  answered,
  onResult,
}: {
  frage: BucketFrage;
  answered: boolean;
  onResult: (c: boolean) => void;
}) {
  const [placements, setPlacements] = useState<Record<string, string | null>>(() => {
    const initial: Record<string, string | null> = {};
    frage.items.forEach((it) => {
      initial[it.id] = null;
    });
    return initial;
  });
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);
  const bucketRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const poolRef = useRef<HTMLDivElement | null>(null);

  const findTarget = (x: number, y: number): string | null => {
    for (const [bid, el] of Object.entries(bucketRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return bid;
    }
    if (poolRef.current) {
      const r = poolRef.current.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return "__pool__";
    }
    return null;
  };

  const startDrag = (itemId: string) => (e: React.PointerEvent) => {
    if (submitted) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(itemId);
    setGhost({ x: e.clientX, y: e.clientY });
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setGhost({ x: e.clientX, y: e.clientY });
    setHoverTarget(findTarget(e.clientX, e.clientY));
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    const target = findTarget(e.clientX, e.clientY);
    if (target) {
      setPlacements((prev) => ({
        ...prev,
        [dragging]: target === "__pool__" ? null : target,
      }));
    }
    setDragging(null);
    setGhost(null);
    setHoverTarget(null);
  };

  const allDone = frage.items.every((it) => placements[it.id] !== null);

  const submit = () => {
    if (submitted || answered) return;
    const ok = frage.items.every((it) => placements[it.id] === frage.solution[it.id]);
    setSubmitted(true);
    onResult(ok);
  };

  const draggedItem = dragging ? frage.items.find((it) => it.id === dragging) : null;

  const itemsInBucket = (bucketId: string) =>
    frage.items.filter((it) => placements[it.id] === bucketId);
  const itemsInPool = frage.items.filter((it) => placements[it.id] === null);

  return (
    <div className="space-y-3" onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        Ziehe jeden Begriff in die passende Spalte.
      </p>

      {/* Buckets */}
      <div className="grid grid-cols-2 gap-3">
        {frage.buckets.map((bucket) => {
          const isHover = hoverTarget === bucket.id && dragging;
          const assigned = itemsInBucket(bucket.id);
          return (
            <div
              key={bucket.id}
              ref={(el) => {
                bucketRefs.current[bucket.id] = el;
              }}
              className={cn(
                "flex flex-col rounded-sm border-2 border-dashed px-2 py-3 transition-colors min-h-[140px]",
                isHover ? "border-stamp bg-stamp/15" : "border-border/70 bg-paper",
              )}
            >
              <h3 className="mb-2 text-center font-serif text-[13px] font-bold">{bucket.label}</h3>
              <div className="flex-1 space-y-1.5">
                {assigned.map((it) => {
                  const correct = submitted && placements[it.id] === frage.solution[it.id];
                  const wrong = submitted && !correct;
                  return (
                    <div
                      key={it.id}
                      onPointerDown={startDrag(it.id)}
                      className={cn(
                        "select-none touch-none rounded-sm border px-2 py-1.5 text-center font-serif text-[13px] transition-colors",
                        submitted ? "cursor-default" : "cursor-grab active:cursor-grabbing",
                        dragging === it.id && "opacity-40",
                        !submitted && !correct && !wrong && "border-border bg-paper-deep/60",
                        correct && "border-emerald-500/60 bg-emerald-500/10",
                        wrong && "border-destructive/60 bg-destructive/10",
                      )}
                    >
                      {it.label}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pool */}
      <div
        ref={poolRef}
        className={cn(
          "rounded-sm border-2 border-dashed px-2 py-3 transition-colors",
          hoverTarget === "__pool__" && dragging
            ? "border-stamp bg-stamp/15"
            : "border-border/70 bg-paper/50",
        )}
      >
        <h3 className="mb-2 text-center font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
          Unzugeordnet
        </h3>
        <div className="flex flex-wrap gap-2">
          {itemsInPool.map((it) => (
            <div
              key={it.id}
              onPointerDown={startDrag(it.id)}
              className={cn(
                "select-none touch-none rounded-sm border px-3 py-2 font-serif text-[14px]",
                submitted ? "cursor-default" : "cursor-grab active:cursor-grabbing",
                dragging === it.id && "opacity-40",
                !submitted && "border-border bg-paper hover:bg-secondary",
              )}
            >
              {it.label}
            </div>
          ))}
        </div>
      </div>

      {!submitted && (
        <button
          onClick={submit}
          disabled={!allDone}
          className="w-full rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary disabled:opacity-50"
        >
          Zuordnung prüfen
        </button>
      )}

      {/* Ghost */}
      {dragging && ghost && draggedItem && (
        <div
          className="pointer-events-none fixed z-50 rounded-sm border border-stamp bg-paper px-3 py-2 shadow-lg"
          style={{ left: ghost.x + 12, top: ghost.y + 12 }}
        >
          <div className="font-serif text-[14px] font-bold">{draggedItem.label}</div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/*  Outro (Auflösung + Statistiken)                     */
/* -------------------------------------------------- */

function OutroScreen() {
  const [step, setStep] = useState(0);
  const [bubble, setBubble] = useState(0);
  const totalSteps = 3;

  // Benötigte Zeit einmalig beim Mount einfrieren.
  const elapsedLabel = useState(() => {
    const start = getStartTs();
    if (!start) return "–";
    const ms = Math.max(0, Date.now() - start);
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h} h ${String(m).padStart(2, "0")} min`;
    return `${m} min ${String(s).padStart(2, "0")} s`;
  })[0];


  const nowClock =
    typeof window !== "undefined"
      ? new Date().toLocaleTimeString("de-CH", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "19:04";

  const reaktionen: {
    name: string;
    rolle: string;
    text: string;
    side: "left" | "right";
    tone: "emerald" | "amber" | "stamp";
  }[] = [
    {
      name: "Ratsfrau Schmid",
      rolle: "Ressort Verkehr",
      side: "left",
      tone: "emerald",
      text:
        "„Ich beantrage, die Abstimmung zu vertagen und die neuen Unterlagen zu prüfen.“",
    },
    {
      name: "Ratsherr Brunner",
      rolle: "Ressort Landwirtschaft",
      side: "right",
      tone: "amber",
      text:
        "„Die Zahlen sind sauber. Damit können wir arbeiten — nicht mit dem alten Gutachten.“",
    },
    {
      name: "Ratsfrau Lindenmann",
      rolle: "Ressort Umwelt",
      side: "left",
      tone: "emerald",
      text:
        "„Ein Gaskraftwerk mitten im Waldreservat? Das hätte ich fast durchgewinkt. Danke.“",
    },
    {
      name: "Gemeindepräsident",
      rolle: "Vorsitz",
      side: "right",
      tone: "stamp",
      text:
        "„Antrag angenommen. Die Abstimmung wird auf nächsten Monat verschoben.“",
    },
  ];

  const canNextBubble = bubble < reaktionen.length - 1;

  return (
    <div className="animate-scale-in">
      {/* Fortschrittspunkte */}
      <div className="mb-3 flex items-center justify-end gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-6 rounded-full ${
              i <= step ? "bg-stamp" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* STEP 0 — Reaktionen im Saal als Sprechblasen */}
      {step === 0 && (
        <PaperCard rotate={-0.3} tape="top-left">
          <div className="absolute right-4 top-6 sm:right-8 sm:top-8">
            <Stamp rotate={8}>Im Saal</Stamp>
          </div>
          <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
            Reaktionen des Gemeinderats
          </p>
          <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
            Stille. Dann geht ein Raunen durch den Saal.
          </h2>

          <div className="mt-6 space-y-3">
            {reaktionen.slice(0, bubble + 1).map((r, i) => (
              <SpeechBubble
                key={i}
                name={r.name}
                rolle={r.rolle}
                side={r.side}
                tone={r.tone}
              >
                {r.text}
              </SpeechBubble>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            {canNextBubble ? (
              <button
                onClick={() => setBubble(bubble + 1)}
                className="rounded-sm border border-border bg-card px-4 py-2 font-serif text-sm hover:bg-secondary"
              >
                Weitere Reaktion →
              </button>
            ) : (
              <button
                onClick={() => setStep(1)}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Nach draussen →
              </button>
            )}
          </div>
        </PaperCard>
      )}

      {/* STEP 1 — Nach dem Saal, Maja & Elvira */}
      {step === 1 && (
        <PaperCard rotate={0.2} tape="top-right">
          <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
            Vor dem Gemeindesaal
          </p>
          <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
            Ausatmen.
          </h2>

          <div className="mt-5 space-y-4 font-serif text-[15px] leading-relaxed text-foreground/90">
            <p>
              Draussen atmen Maja und Elvira gleichzeitig aus. Elvira legt
              ihrer Grossnichte die Hand auf die Schulter und sagt nichts. Sie
              müssen nichts sagen.
            </p>
            <p>
              Maja schaut auf ihr Handy. <strong>{nowClock} Uhr.</strong> Dann
              schaut sie Elvira an.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <SpeechBubble name="Maja" side="left" tone="amber">
              „Gehen wir zur Hütte?“
            </SpeechBubble>
            <SpeechBubble name="Elvira" side="right" tone="emerald">
              „Klar. Das ist eine gute Idee.“
            </SpeechBubble>
          </div>

          <p className="mt-5 font-serif text-[15px] leading-relaxed text-foreground/90">
            Sie gehen zu zweit den Waldweg hinauf, die Sonne noch warm auf der
            Haut. Das rote Band hängt noch an den Bäumen. Aber heute stört es
            niemanden.
          </p>

          <div className="mt-6 flex justify-between gap-3">
            <button
              onClick={() => {
                setStep(0);
                setBubble(reaktionen.length - 1);
              }}
              className="font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              ← Zurück
            </button>
            <button
              onClick={() => setStep(2)}
              className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              Euer Ergebnis →
            </button>
          </div>
        </PaperCard>
      )}

      {/* STEP 2 — Abschluss der gesamten Ermittlung */}
      {step === 2 && (
        <PaperCard rotate={-0.3} tape="top-left" className="relative overflow-hidden">
          <SuccessConfetti />
          <div className="absolute right-4 top-6 sm:right-8 sm:top-8">
            <Stamp rotate={-6}>Fall gelöst</Stamp>
          </div>
          <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
            Abschluss der Ermittlung
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
            Ihr habt es geschafft.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
            Fünf Etappen, ein Hearing — und eine Gemeinde, die zum ersten Mal
            genau hingeschaut hat. Das war eure Arbeit.
          </p>

          <div className="mt-8 flex flex-col items-center gap-2 rounded-sm border border-emerald-500/40 bg-emerald-500/5 p-6 text-center animate-scale-in">
            <Clock className="h-8 w-8 text-emerald-600 animate-pulse" />
            <p className="font-mono-typed text-[10px] uppercase tracking-[0.3em] text-emerald-700">
              Benötigte Zeit
            </p>
            <p className="font-serif text-4xl font-bold text-emerald-700 tabular-nums sm:text-5xl">
              {elapsedLabel}
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3.5 font-serif text-base font-semibold text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl animate-fade-in sm:w-auto"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              Zurück zum Start
            </Link>
          </div>
        </PaperCard>

      )}
    </div>
  );
}

/* ---------- Sprechblase ---------- */

function SpeechBubble({
  name,
  rolle,
  side,
  tone,
  children,
}: {
  name: string;
  rolle?: string;
  side: "left" | "right";
  tone: "emerald" | "amber" | "stamp";
  children: React.ReactNode;
}) {
  const toneMap = {
    emerald: "border-emerald-500/40 bg-emerald-500/5",
    amber: "border-amber-500/40 bg-amber-500/5",
    stamp: "border-stamp/40 bg-stamp/5",
  } as const;

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isLeft = side === "left";

  const avatar = (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-paper font-serif text-xs font-bold text-foreground/70">
      {initials}
    </div>
  );

  const bubble = (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl border px-4 py-2.5 shadow-sm",
        toneMap[tone],
        isLeft ? "rounded-bl-sm" : "rounded-br-sm",
      )}
    >
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp/80">
        {name}
        {rolle ? <span className="text-muted-foreground"> · {rolle}</span> : null}
      </p>
      <p className="mt-0.5 font-serif text-[15px] leading-relaxed text-foreground/90">
        {children}
      </p>
    </div>
  );

  return (
    <div
      className={cn(
        "flex items-end gap-2 animate-fade-in",
        isLeft ? "justify-start" : "justify-end",
      )}
    >
      {isLeft ? (
        <>
          {avatar}
          {bubble}
        </>
      ) : (
        <>
          {bubble}
          {avatar}
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/*  Intro-Konversation vor dem Hearing                  */
/* -------------------------------------------------- */

type IntroStep =
  | { kind: "narration"; text: string }
  | {
      kind: "bubble";
      name: string;
      rolle?: string;
      side: "left" | "right";
      tone: "emerald" | "amber" | "stamp";
      text: string;
      lead?: string;
    };

const INTRO_SEQUENCE: IntroStep[] = [
  {
    kind: "narration",
    text: "Drinnen herrscht gedämpfte Stimmung. Der Gemeindepräsident steht am Rednerpult.",
  },
  {
    kind: "bubble",
    name: "Gemeindepräsident",
    rolle: "Vorsitz",
    side: "right",
    tone: "stamp",
    text: "„Dann kommen wir nun zur finalen Abstimmung über das Projekt Waldlichtung–“",
  },
  {
    kind: "narration",
    text: "Maja geht nach vorne.",
  },
  {
    kind: "bubble",
    name: "Maja",
    side: "left",
    tone: "amber",
    text: "„Entschuldigung – dürfen wir kurz das Wort ergreifen? Wir haben neue Daten, die für die Abstimmung relevant sind.“",
  },
  {
    kind: "bubble",
    name: "Ratsmitglied Schmid",
    rolle: "Ressort Verkehr",
    side: "right",
    tone: "emerald",
    lead: "Ein Ratsmitglied verschränkt die Arme.",
    text: "„Das Verfahren läuft seit Monaten. Was soll das jetzt noch ändern?“",
  },
  {
    kind: "narration",
    text: "Maja legt die Unterlagen auf den Tisch. Der Saal wird still. Reihum stellt jetzt jedes Ratsmitglied eine Frage — jede richtige Antwort bringt euch näher an eine Vertagung.",
  },
];

function IntroConversation({ onStart }: { onStart: () => void }) {
  const [visible, setVisible] = useState(1);
  const total = INTRO_SEQUENCE.length;
  const done = visible >= total;

  return (
    <PaperCard rotate={-0.3} tape="top-left">
      <div className="absolute right-4 top-6 sm:right-8 sm:top-8">
        <Stamp rotate={6}>Saal</Stamp>
      </div>
      <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
        Vor der Abstimmung
      </p>
      <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
        Im Gemeindesaal.
      </h2>

      <div className="mt-6 space-y-3">
        {(() => {
          let bubbleIdx = 0;
          return INTRO_SEQUENCE.slice(0, visible).map((s, i) =>
            s.kind === "narration" ? (
              <p
                key={i}
                className="font-serif text-[15px] italic leading-relaxed text-foreground/80 animate-fade-in"
              >
                {s.text}
              </p>
            ) : (
              <div key={i} className="space-y-1.5 animate-fade-in">
                {s.lead && (
                  <p className="font-serif text-[13px] italic text-muted-foreground">
                    {s.lead}
                  </p>
                )}
                <SpeechBubble
                  name={s.name}
                  rolle={s.rolle}
                  side={bubbleIdx++ % 2 === 0 ? "left" : "right"}
                  tone={s.tone}
                >
                  {s.text}
                </SpeechBubble>
              </div>
            ),
          );
        })()}
      </div>

      <div className="mt-6 flex justify-end">
        {!done ? (
          <button
            onClick={() => setVisible((v) => Math.min(total, v + 1))}
            className="rounded-sm border border-border bg-card px-4 py-2 font-serif text-sm hover:bg-secondary"
          >
            Weiter →
          </button>
        ) : (
          <button
            onClick={onStart}
            className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in"
          >
            Fragen beantworten →
          </button>
        )}
      </div>
    </PaperCard>
  );
}

