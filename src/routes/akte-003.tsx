import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { QRGate } from "@/components/case-file/QRGate";
import { HintSystem, type Hint } from "@/components/case-file/HintSystem";
import { RouteCards } from "@/components/case-file/RouteCards";
import { VALID_START, VALID_ZIEL } from "@/lib/mobility-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/akte-003")({
  head: () => ({
    meta: [
      { title: "Akte 003 — Spur in den Osten" },
      {
        name: "description",
        content:
          "Kapitel 3: Mayas Spur führt quer durch die Schweiz. Rekonstruiere die nachhaltigste Route und lerne, was Mobilitätsentscheidungen wirklich kosten.",
      },
    ],
  }),
  component: AkteGated,
});

const AKTE_003_TOKEN = "Tz3PqW8nXmYr5JcLs6Vk";

const HINTS_003: Hint[] = [
  {
    id: 0,
    unlockMin: 3,
    label: "Tipp 1",
    title: "Lies Mayas Hinweise noch einmal",
    body: "Sie schreibt von einem 'See in der Westschweiz' und einem 'Dorf in den Appenzeller Hügeln, das nach einem Vorrat klingt'. Welche Stadt am Genfersee? Welches AR-Dorf?",
  },
  {
    id: 1,
    unlockMin: 6,
    label: "Tipp 2",
    title: "Vergleiche nicht nur die Zeit",
    body: "Schau bei jeder Route die CO₂-Werte UND den realen Aufwand an. Spart der Flug wirklich Zeit, wenn du Anfahrt, Check-in und Umsteigen mitrechnest?",
  },
  {
    id: 2,
    unlockMin: 9,
    label: "Auflösung",
    title: "So geht's",
    body: "Start: Genf — Ziel: Speicher (AR). Die nachhaltigste Route ist der direkte Zug (IC 1 → S21) mit ca. 4 kg CO₂ pro Person. Auto und Inlandflug stossen ein Vielfaches aus, ohne nennenswerte Zeitersparnis.",
  },
];

function AkteGated() {
  return (
    <QRGate
      token={AKTE_003_TOKEN}
      storageKey="akte-003-unlocked"
      title={<>Akte 003 — QR-Code scannen</>}
      description="Akte 003 ist versiegelt. Scanne den beigelegten QR-Code aus deiner Mappe, um Mayas Spur weiterzuverfolgen."
    >
      <AktePage />
    </QRGate>
  );
}

type Step = "voicemail" | "raetselkarte" | "eingabe" | "routen" | "input" | "naechstes";

const STEPS: { id: Step; label: string }[] = [
  { id: "voicemail", label: "Sprachnachricht" },
  { id: "raetselkarte", label: "Rätselkarte" },
  { id: "eingabe", label: "Start & Ziel" },
  { id: "routen", label: "Route wählen" },
  { id: "input", label: "Fachlicher Input" },
  { id: "naechstes", label: "Nächstes Rätsel" },
];

const norm = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "");

function AktePage() {
  const [step, setStep] = useState<Step>("voicemail");
  const [unlockedSteps, setUnlockedSteps] = useState<Set<Step>>(new Set(["voicemail"]));

  const [start, setStart] = useState("");
  const [ziel, setZiel] = useState("");
  const [eingabeError, setEingabeError] = useState<string | null>(null);

  const goto = (s: Step) => {
    setUnlockedSteps((prev) => new Set([...prev, s]));
    setStep(s);
  };

  const aktuellerIndex = STEPS.findIndex((s) => s.id === step);

  const handleEingabe = (e: React.FormEvent) => {
    e.preventDefault();
    const sOk = VALID_START.includes(norm(start));
    const zOk = VALID_ZIEL.includes(norm(ziel));
    if (sOk && zOk) {
      setEingabeError(null);
      goto("routen");
    } else {
      setEingabeError("Hm, das passt noch nicht. Lies Mayas Nachricht und ihre Notiz nochmal genau.");
    }
  };

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

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4 sm:mb-8 sm:pb-5">
          <div className="min-w-0">
            <Link
              to="/"
              className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground sm:text-[11px]"
            >
              ← Aktenmappe schließen
            </Link>
            <h1 className="mt-1.5 font-serif text-2xl font-bold leading-tight sm:mt-2 sm:text-5xl">
              Akte 003 · Kapitel 3
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Spur in den Osten
            </p>
          </div>
          <Stamp rotate={-6}>Vertraulich</Stamp>
        </header>

        {/* Stepper */}
        <nav aria-label="Ablauf" className="mb-5 sm:mb-8">
          <ol className="-mx-3 flex items-center gap-1.5 overflow-x-auto px-3 pb-2 sm:mx-0 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STEPS.map((s, i) => {
              const isUnlocked = unlockedSteps.has(s.id);
              const isActive = s.id === step;
              const isDone = unlockedSteps.has(s.id) && i < aktuellerIndex;
              return (
                <li key={s.id} className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => isUnlocked && setStep(s.id)}
                    disabled={!isUnlocked}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono-typed text-[10px] uppercase tracking-wider transition-colors sm:px-3 sm:py-1.5 sm:text-[11px]",
                      isActive && "border-ink bg-ink text-paper",
                      !isActive && isUnlocked && "border-border bg-paper hover:bg-secondary",
                      !isUnlocked && "cursor-not-allowed border-border bg-paper opacity-40",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full text-[9px] sm:h-5 sm:w-5 sm:text-[10px]",
                        isActive ? "bg-paper text-ink" : "bg-secondary text-foreground",
                      )}
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    <span className="whitespace-nowrap">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span className="text-muted-foreground" aria-hidden>
                      →
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {step === "voicemail" && (
          <PaperCard rotate={-0.4}>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Beweis 03 · Sprachnachricht
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Mayas dritte Nachricht
            </h2>
            <p className="mt-1 font-mono-typed text-xs text-muted-foreground">
              [Aufnahme · Freitag · 22:47 · 52 Sek.]
            </p>
            <blockquote className="mt-5 border-l-4 border-stamp pl-4 text-[15px] leading-relaxed">
              „Lin, hör mal — ich hab heute mit einer ehemaligen Mitarbeiterin
              des Investors gesprochen. Sie wohnt in einem kleinen Dorf in den
              Appenzeller Hügeln, das nach einem Vorrat klingt. Sie wollte mir
              Dokumente übergeben."
              <br />
              <br />
              „Ich bin morgens von hier — also vom See in der Westschweiz, du
              weisst schon — losgefahren. Die Frage ist: <em>wie</em> bin ich
              gereist? Sie sagt, sie hat exakt geschaut, welche Route ich
              genommen hab. Daran wird sie erkennen, ob du wirklich von mir
              kommst."
              <br />
              <br />
              „Drei Optionen lagen auf dem Tisch. Ich hab die genommen, bei der
              ich nachts noch schlafen kann. Du wirst es sehen."
            </blockquote>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => goto("raetselkarte")}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Weiter zur Rätselkarte →
              </button>
            </div>
          </PaperCard>
        )}

        {step === "raetselkarte" && (
          <PaperCard rotate={0.3} tape="top">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Rätselkarte · Auftrag von Maya
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              🗺️ Welche Route hat Maya genommen?
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  Schritt 1
                </p>
                <p className="mt-2 text-[15px]">
                  Finde heraus, von wo Maya losgereist ist und wohin sie wollte.
                  Beide Orte stehen versteckt in ihrer Sprachnachricht.
                </p>
              </div>
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  Schritt 2
                </p>
                <p className="mt-2 text-[15px]">
                  Vergleiche die drei möglichen Routen. Wähle die, die Maya
                  selbst gewählt hätte — sie reist <strong>nachhaltig</strong>.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-sm border border-stamp/30 bg-stamp/5 p-4">
              <p className="font-serif italic leading-relaxed">
                „Schnell und teuer sind nicht das Gleiche wie schnell und sauber.
                Schau auf CO₂, nicht nur auf die Uhr."
              </p>
              <p className="mt-2 font-mono-typed text-[11px] uppercase tracking-wider text-stamp">
                — M.
              </p>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep("voicemail")}
                className="rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                ← Zurück
              </button>
              <button
                onClick={() => goto("eingabe")}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Start & Ziel eintippen →
              </button>
            </div>
          </PaperCard>
        )}

        {step === "eingabe" && (
          <PaperCard rotate={-0.2} tape="top-right">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Beweismittel analysieren
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              📍 Rekonstruiere Mayas Reiseroute
            </h2>
            <p className="mt-3 text-[15px] text-foreground/80">
              Hör dir die Sprachnachricht erneut an — beide Orte stecken in
              ihren Beschreibungen.
            </p>

            <form onSubmit={handleEingabe} className="mt-6 space-y-4">
              <div>
                <label className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  🟢 Startort
                </label>
                <input
                  type="text"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  placeholder="z. B. eine Stadt am See …"
                  className="mt-1 w-full rounded-sm border border-border bg-paper-deep/30 px-4 py-3 font-mono-typed text-sm focus:border-stamp focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  📍 Zielort
                </label>
                <input
                  type="text"
                  value={ziel}
                  onChange={(e) => setZiel(e.target.value)}
                  placeholder="z. B. ein Dorf in AR …"
                  className="mt-1 w-full rounded-sm border border-border bg-paper-deep/30 px-4 py-3 font-mono-typed text-sm focus:border-stamp focus:outline-none"
                />
              </div>

              {eingabeError && (
                <div className="rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {eingabeError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-sm bg-primary px-5 py-3 font-serif text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Route suchen →
              </button>
            </form>

            <div className="mt-6 flex justify-start">
              <button
                onClick={() => setStep("raetselkarte")}
                className="rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                ← Zurück
              </button>
            </div>
          </PaperCard>
        )}

        {step === "routen" && (
          <div className="space-y-4">
            <PaperCard rotate={-0.3}>
              <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                Verbindung identifiziert
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Genf <span className="text-muted-foreground">›</span> Speicher
              </h2>
              <p className="mt-1 text-sm text-foreground/70">
                Welche Route hat Maya genutzt? Vergleiche Aufwand, Preis und CO₂.
              </p>
              <div className="mt-5">
                <RouteCards onSolved={() => goto("input")} />
              </div>
            </PaperCard>

            <div className="flex justify-start">
              <button
                onClick={() => setStep("eingabe")}
                className="rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                ← Zurück zur Eingabe
              </button>
            </div>
          </div>
        )}

        {step === "input" && (
          <div className="space-y-6">
            <PaperCard rotate={-0.3}>
              <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                Mayas Recherche · Nachhaltige Mobilität
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Wie wir reisen, formt das Klima
              </h2>
              <p className="mt-3 text-foreground/80">
                Der Verkehr verursacht in der Schweiz rund ein Drittel aller
                Treibhausgase. Drei Begriffe, die Maya unterstrichen hat:
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "CO₂ pro Person",
                    body: "Auf der gleichen Strecke produziert ein Inlandflug etwa 30-mal mehr CO₂ als der Zug, ein Auto mit einer Person rund 13-mal mehr. Voll besetzte Autos sind besser — aber Zug bleibt führend.",
                    hint: "Quelle: BAFU, mobitool.ch",
                  },
                  {
                    title: "Modal Shift",
                    body: "„Modal Shift“ heisst: Verkehr von Auto/Flug auf Zug, Velo und ÖV verlagern. Die Schweiz hat dafür eines der dichtesten Bahnnetze weltweit — fast jeder Ort ist erreichbar.",
                    hint: "Stichwort: Halbtax, GA, Mobilitätsabos.",
                  },
                  {
                    title: "Aktive Mobilität",
                    body: "Velo und zu Fuss verursachen praktisch kein CO₂, fördern die Gesundheit und brauchen wenig Fläche. Jeder zweite Autoweg in der Schweiz ist kürzer als 5 km — perfekte Velo-Distanz.",
                    hint: "BFS: 50 % aller Pendlerwege < 5 km.",
                  },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="rounded-sm border border-border bg-paper p-4 shadow-sm"
                  >
                    <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                      Karte
                    </p>
                    <h4 className="mt-1 font-serif text-xl font-bold">{c.title}</h4>
                    <p className="mt-2 text-sm text-foreground/85">{c.body}</p>
                    <p className="mt-3 border-t border-dashed border-border pt-2 text-xs italic text-foreground/60">
                      {c.hint}
                    </p>
                  </div>
                ))}
              </div>
            </PaperCard>

            <div className="flex justify-between">
              <button
                onClick={() => setStep("routen")}
                className="rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                ← Zurück
              </button>
              <button
                onClick={() => goto("naechstes")}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Zum nächsten Rätsel →
              </button>
            </div>
          </div>
        )}

        {step === "naechstes" && (
          <PaperCard rotate={-0.5} tape="top-left">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Kapitel 4 · folgt bald
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Vier Wände, ein Fussabdruck
            </h2>
            <div className="mt-4 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-5">
              <p className="font-serif italic leading-relaxed">
                „Die Frau in Speicher hat mir gezeigt, was der Investor wirklich
                baut. Es geht nicht nur um ein Kraftwerk — es geht um ganze
                Quartiere. Heizung, Dämmung, Baustoffe. Sie nennen es
                ‚modern' — aber wer rechnet eigentlich nach?"
              </p>
              <p className="mt-3 font-serif italic">
                „Schau dir den Plan in der nächsten Akte an. Es geht um's
                <strong> Wohnen</strong>."
              </p>
              <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                — M.
              </p>
            </div>
            <p className="mt-5 text-sm text-foreground/70">
              In Kapitel 4 untersuchst du, wie Gebäude unseren ökologischen
              Fussabdruck prägen — und welche Entscheidungen wirklich zählen.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <span className="stamp-mark inline-block px-3 py-1 text-xs">
                In Vorbereitung
              </span>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-5 py-2.5 font-serif text-sm font-semibold transition-colors hover:bg-secondary"
              >
                ← Akte schließen
              </Link>
            </div>
          </PaperCard>
        )}

        <p className="mt-12 text-center font-mono-typed text-xs uppercase tracking-[0.2em] text-muted-foreground">
          — Akte 003 · Spur in den Osten —
        </p>
      </div>

      {/* Tipp-System: aktiv ab Rätselkarte bis Route gewählt */}
      {unlockedSteps.has("raetselkarte") &&
        (step === "raetselkarte" || step === "eingabe" || step === "routen") && (
          <HintSystem hints={HINTS_003} storageKey="akte-003-hints-start" />
        )}
    </main>
  );
}
