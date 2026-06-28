import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, Gauge, RefreshCw } from "lucide-react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/finale")({
  head: () => ({
    meta: [
      { title: "Finale — Hearing im Gemeindesaal" },
      {
        name: "description",
        content:
          "Das Hearing: Überzeuge den Gemeinderat mit Fakten aus allen fünf Etappen. Max. 3 Fehler — sonst kippt die Abstimmung.",
      },
    ],
  }),
  component: FinalePage,
});

type Frage = {
  id: number;
  thema: "Mobilität" | "Konsum" | "Biodiversität" | "Wohnen" | "Energie";
  ratsmitglied: string;
  frage: string;
  optionen: string[];
  korrekt: number;
  erklaerung: string;
};

const FRAGEN: Frage[] = [
  {
    id: 1,
    thema: "Mobilität",
    ratsmitglied: "Ratsmitglied Schmid",
    frage:
      "Sie behaupten, der Zug sei für Pendelstrecken klar überlegen. Wie viel mehr CO₂ verursacht ein Inlandflug gegenüber dem Zug auf gleicher Strecke ungefähr?",
    optionen: ["Etwa gleich viel", "Rund 3-mal mehr", "Rund 30-mal mehr"],
    korrekt: 2,
    erklaerung:
      "Ein Inlandflug stösst auf gleicher Strecke etwa 30-mal mehr CO₂ pro Person aus als der Zug (Quelle: mobitool.ch, BAFU).",
  },
  {
    id: 2,
    thema: "Mobilität",
    ratsmitglied: "Ratsmitglied Schmid",
    frage:
      "Und was sagen Sie zum Argument, das Auto sei unverzichtbar? Wie viele Pendlerwege in der Schweiz sind kürzer als 5 Kilometer?",
    optionen: ["Rund 20 %", "Rund 50 %", "Rund 80 %"],
    korrekt: 1,
    erklaerung:
      "Rund die Hälfte aller Pendlerwege in der Schweiz ist kürzer als 5 km — also klar in Velo-Distanz (BFS).",
  },
  {
    id: 3,
    thema: "Konsum",
    ratsmitglied: "Ratsherr Brunner",
    frage:
      "Frau Berger im Dorfladen hat Ihnen Erdbeeren aus Spanien aus dem Korb genommen. Was wäre im April in Grünwald wirklich saisonal?",
    optionen: ["Tomaten", "Lauch und Feldsalat", "Wassermelone"],
    korrekt: 1,
    erklaerung:
      "Im Frühling sind in der Schweiz u. a. Lauch, Feldsalat, Karotten, Rhabarber saisonal — Erdbeeren erst ab Mai/Juni.",
  },
  {
    id: 4,
    thema: "Konsum",
    ratsmitglied: "Ratsherr Brunner",
    frage:
      "Welches der folgenden Labels garantiert Schweizer Bio-Produktion mit klaren Standards?",
    optionen: ["MSC", "EU-Bio", "Bio Suisse"],
    korrekt: 2,
    erklaerung:
      "Bio Suisse (Knospe) steht für Schweizer Bio-Produktion. MSC ist ein Fisch-Siegel, EU-Bio lässt Import zu.",
  },
  {
    id: 5,
    thema: "Biodiversität",
    ratsmitglied: "Ratsfrau Lindenmann",
    frage:
      "Sie sagen, der Wald auf der Lichtung sei besonders schützenswert. Wie viele Tierarten gelten in der Schweiz heute als gefährdet?",
    optionen: ["Rund 1 von 20", "Rund 1 von 3", "Rund 1 von 100"],
    korrekt: 1,
    erklaerung:
      "Rund ein Drittel der untersuchten Arten in der Schweiz steht auf der Roten Liste (BAFU).",
  },
  {
    id: 6,
    thema: "Biodiversität",
    ratsmitglied: "Ratsfrau Lindenmann",
    frage:
      "Was schützt Biodiversität am wirksamsten — gerade auch bei einem Bauprojekt mitten im Wald?",
    optionen: [
      "Aufforstung mit einer einzigen Baumart",
      "Vernetzung von Lebensräumen (Hecken, Korridore)",
      "Mehr Düngung der angrenzenden Felder",
    ],
    korrekt: 1,
    erklaerung:
      "Vernetzte Lebensräume (Hecken, Korridore, Renaturierung) sind die wirksamste Massnahme — Monokulturen und Dünger schaden meist.",
  },
  {
    id: 7,
    thema: "Wohnen",
    ratsmitglied: "Ratsherr Frei",
    frage:
      "Sie behaupten, ein einzelner Haushalt könne stark einsparen. In welchem Bereich entsteht der grösste Teil des Energieverbrauchs eines Schweizer Haushalts?",
    optionen: ["Beleuchtung", "Heizung und Warmwasser", "Kühlschrank"],
    korrekt: 1,
    erklaerung:
      "Heizung und Warmwasser machen den Löwenanteil aus (oft 70–80 %). Beleuchtung und Kühlschrank sind klein im Vergleich.",
  },
  {
    id: 8,
    thema: "Wohnen",
    ratsmitglied: "Ratsherr Frei",
    frage:
      "Wie viel Heizenergie spart man ungefähr, wenn man die Raumtemperatur um 1 °C absenkt?",
    optionen: ["Etwa 1 %", "Etwa 6 %", "Etwa 20 %"],
    korrekt: 1,
    erklaerung:
      "Faustregel: 1 °C kühler = ca. 6 % weniger Heizenergie. Eine der einfachsten und wirksamsten Massnahmen.",
  },
  {
    id: 9,
    thema: "Energie",
    ratsmitglied: "Gemeindepräsident",
    frage:
      "Im Gas-Gutachten steht 95 g CO₂/kWh. Was stösst ein modernes Erdgaskraftwerk pro kWh Strom realistisch aus?",
    optionen: ["Rund 95 g", "Rund 400 g", "Rund 820 g"],
    korrekt: 1,
    erklaerung:
      "Erdgas liegt real bei rund 400 g CO₂/kWh. Die 95-g-Angabe ist um den Faktor 4 zu tief — eine der fünf Lügen.",
  },
  {
    id: 10,
    thema: "Energie",
    ratsmitglied: "Gemeindepräsident",
    frage:
      "Welche der drei vorgeschlagenen Energiequellen ist im Betrieb (ohne Brennstoff) CO₂-frei?",
    optionen: ["Erdgas", "Steinkohle", "Photovoltaik"],
    korrekt: 2,
    erklaerung:
      "Photovoltaik produziert im Betrieb 0 g CO₂/kWh. Erdgas und Kohle sind beide fossil.",
  },
];

const MAX_FEHLER = 3;

type Result = "running" | "won" | "lost";

function FinalePage() {
  const [fragenSet, setFragenSet] = useState(0); // bump to reset
  const [started, setStarted] = useState(false);
  const [aktuell, setAktuell] = useState(0);
  const [antworten, setAntworten] = useState<(number | null)[]>(() => Array(FRAGEN.length).fill(null));
  const [gezeigt, setGezeigt] = useState(false);

  const fehler = useMemo(
    () => antworten.reduce<number>((sum, a, i) => (a !== null && a !== FRAGEN[i].korrekt ? sum + 1 : sum), 0),
    [antworten],
  );
  const beantwortet = antworten.filter((a) => a !== null).length;
  const status: Result =
    fehler > MAX_FEHLER ? "lost" : beantwortet === FRAGEN.length ? "won" : "running";

  const frage = FRAGEN[aktuell];
  const meineAntwort = antworten[aktuell];

  const handleAntwort = (idx: number) => {
    if (meineAntwort !== null) return;
    const next = [...antworten];
    next[aktuell] = idx;
    setAntworten(next);
    setGezeigt(true);
  };

  const handleWeiter = () => {
    if (aktuell < FRAGEN.length - 1) {
      setAktuell(aktuell + 1);
      setGezeigt(false);
    }
  };

  const reset = () => {
    setAntworten(Array(FRAGEN.length).fill(null));
    setAktuell(0);
    setGezeigt(false);
    setFragenSet((n) => n + 1);
  };

  const ueberzeugung = Math.max(0, Math.round(100 - (fehler / MAX_FEHLER) * 60 - (fehler > 0 ? 5 : 0)));

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
              ← Zurück zur Übersicht
            </Link>
            <h1 className="mt-1.5 font-serif text-2xl font-bold leading-tight sm:mt-2 sm:text-5xl">
              Finale · Hearing
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Gemeindesaal Grünwald · 19:02 Uhr
            </p>
          </div>
          <Stamp rotate={-6}>Live</Stamp>
        </header>

        {status === "running" && !started && (
          <PaperCard rotate={-0.4}>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Einstieg · Die Saaltüren öffnen
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              „Geben Sie uns fünf Minuten."
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
              Mit den korrigierten Gutachten, den Rechnungen und Elviras Notizen
              stossen Maja, Elvira und Marlene Vogt die schwere Saaltür auf.
              Drinnen herrscht gedämpfte Stimmung. Der Gemeindepräsident steht
              am Rednerpult: „Dann kommen wir nun zur finalen Abstimmung über
              das Projekt Waldlichtung —"
            </p>
            <div className="mt-4 rounded-sm border border-stamp/30 bg-stamp/5 p-4">
              <p className="font-serif italic leading-relaxed">
                Der Rat stellt dir zehn Fragen aus allen fünf Themen. Antworte
                mit Wissen, nicht aus dem Bauch.
                <br />
                <strong>Mehr als {MAX_FEHLER} falsche Antworten — und die Abstimmung kippt.</strong>
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStarted(true)}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Hearing beginnen →
              </button>
            </div>
          </PaperCard>
        )}

        {status === "running" && started && (
          <div className="space-y-4" key={`run-${fragenSet}`}>
            {/* Barometer */}
            <div className="rounded-sm border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-mono-typed text-[11px] uppercase tracking-wider text-stamp">
                  <Gauge className="h-4 w-4" /> Überzeugungs-Barometer
                </div>
                <div className="font-mono-typed text-xs text-muted-foreground">
                  Frage {aktuell + 1} / {FRAGEN.length} · Fehler {fehler} / {MAX_FEHLER}
                </div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full transition-all",
                    fehler === 0 && "bg-emerald-500",
                    fehler === 1 && "bg-emerald-500/80",
                    fehler === 2 && "bg-amber-500",
                    fehler === 3 && "bg-orange-500",
                    fehler > 3 && "bg-destructive",
                  )}
                  style={{ width: `${ueberzeugung}%` }}
                />
              </div>
            </div>

            {/* Frage */}
            <PaperCard rotate={0.2}>
              <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                {frage.ratsmitglied} · Thema {frage.thema}
              </p>
              <h2 className="mt-2 font-serif text-xl font-bold sm:text-2xl">
                „{frage.frage}"
              </h2>

              <div className="mt-5 grid gap-2">
                {frage.optionen.map((opt, i) => {
                  const isMine = meineAntwort === i;
                  const isCorrect = i === frage.korrekt;
                  const reveal = meineAntwort !== null;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAntwort(i)}
                      disabled={meineAntwort !== null}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-sm border px-4 py-3 text-left font-serif text-[15px] transition-colors",
                        !reveal && "border-border bg-paper hover:bg-secondary",
                        reveal && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                        reveal && isMine && !isCorrect && "border-destructive/60 bg-destructive/10",
                        reveal && !isCorrect && !isMine && "border-border bg-paper opacity-60",
                      )}
                    >
                      <span>{opt}</span>
                      {reveal && isCorrect && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      )}
                      {reveal && isMine && !isCorrect && (
                        <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                      )}
                    </button>
                  );
                })}
              </div>

              {meineAntwort !== null && (
                <div
                  className={cn(
                    "mt-5 rounded-sm border p-4 text-sm",
                    meineAntwort === frage.korrekt
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-destructive/40 bg-destructive/5",
                  )}
                >
                  <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                    {meineAntwort === frage.korrekt ? "Treffer" : "Fehler"}
                  </p>
                  <p className="mt-1 text-foreground/85">{frage.erklaerung}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                {meineAntwort !== null && aktuell < FRAGEN.length - 1 && (
                  <button
                    onClick={handleWeiter}
                    className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Nächste Frage →
                  </button>
                )}
                {meineAntwort !== null && aktuell === FRAGEN.length - 1 && (
                  <button
                    onClick={() => setAntworten((a) => [...a]) /* triggers status recompute */}
                    className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Ergebnis ansehen →
                  </button>
                )}
              </div>
            </PaperCard>
          </div>
        )}

        {status === "won" && (
          <PaperCard rotate={-0.3} tape="top-left">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Happy End · Abstimmung vertagt
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
              Der Rat ist überzeugt.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
              Der Gemeindepräsident lehnt sich zurück. Stille im Saal. Dann
              nickt Ratsmitglied Frau Schmid langsam: „Ich beantrage, die
              Abstimmung zu vertagen und die neuen Unterlagen zu prüfen." Ein
              zweites Ratsmitglied hebt die Hand. Dann ein drittes.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              „Antrag angenommen", sagt der Gemeindepräsident. „Die Abstimmung
              wird auf nächsten Monat verschoben."
            </p>
            <p className="mt-3 text-[15px] leading-relaxed italic text-foreground/85">
              Draussen vor dem Saal atmen Maja, Elvira und Marlene gleichzeitig
              aus. Elvira legt ihrer Grossnichte die Hand auf die Schulter.
              „Du weisst, was das bedeutet? Wir haben noch Zeit. Die Hütte —
              der Wald — der steht nächste Woche noch."
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              Maja schaut auf ihr Handy. 19:47 Uhr. Sie lacht leise.
              „Dann fangen wir morgen früh nochmal an."
            </p>

            <div className="mt-6 grid gap-2 rounded-sm border border-border bg-paper p-4 sm:grid-cols-3">
              <div>
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Fragen</p>
                <p className="mt-1 font-serif text-2xl font-bold">{FRAGEN.length}</p>
              </div>
              <div>
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Korrekt</p>
                <p className="mt-1 font-serif text-2xl font-bold text-emerald-600">
                  {FRAGEN.length - fehler}
                </p>
              </div>
              <div>
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Fehler</p>
                <p className="mt-1 font-serif text-2xl font-bold">{fehler}</p>
              </div>
            </div>

            <p className="mt-6 text-center font-serif text-3xl tracking-[0.4em] text-stamp sm:text-5xl">
              GEWONNEN
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 font-serif text-sm hover:bg-secondary"
              >
                <RefreshCw className="h-4 w-4" /> Nochmal spielen
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                ← Übersicht
              </Link>
            </div>
          </PaperCard>
        )}

        {status === "lost" && (
          <PaperCard rotate={0.3} tape="top-right">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Der Rat ist nicht überzeugt
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              „Versucht es erneut."
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
              Drei Ratsmitglieder schütteln den Kopf. Der Gemeindepräsident
              greift erneut zum Hammer. Die Argumente waren nicht präzise genug.
            </p>
            <div className="mt-4 rounded-sm border border-stamp/30 bg-stamp/5 p-4 text-sm">
              <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                Tipp
              </p>
              <p className="mt-1 text-foreground/85">
                Geh die Etappen-Karten nochmals durch — besonders die fachlichen
                Inputs am Ende jeder Etappe. Dort stehen die Zahlen, die der Rat
                hören will.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 font-serif text-sm hover:bg-secondary"
              >
                ← Etappen ansehen
              </Link>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <RefreshCw className="h-4 w-4" /> Neuer Versuch
              </button>
            </div>
          </PaperCard>
        )}

        <p className="mt-12 text-center font-mono-typed text-xs uppercase tracking-[0.2em] text-muted-foreground">
          — Finale · Hearing im Gemeindesaal —
        </p>
      </div>
    </main>
  );
}
