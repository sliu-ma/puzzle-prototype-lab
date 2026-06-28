import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Map as MapIcon, MapPin } from "lucide-react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { QRGate } from "@/components/case-file/QRGate";
import { StageGate } from "@/components/case-file/StageGate";
import { HintSystem, type Hint } from "@/components/case-file/HintSystem";
import { RouteCards } from "@/components/case-file/RouteCards";
import { RouteDetail } from "@/components/case-file/RouteDetail";
import { VALID_START, VALID_ZIEL, type RouteOption } from "@/lib/mobility-data";
import { completeStage } from "@/lib/progress";
import { STORY } from "@/lib/story-beats";
import { EtappenStory } from "@/components/story/EtappenStory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/akte-003")({
  head: () => ({
    meta: [
      { title: "Etappe 1 — Bahnhof Grünwald" },
      {
        name: "description",
        content:
          "Etappe 1: Auf dem Bahnhof liegen Elviras alte Reisetickets. Welche Verbindung hat sie wirklich gewählt?",
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
    title: "Lies Elviras Notiz noch einmal",
    body: "Sie schreibt vom 'See in der Westschweiz' und einem 'Dorf in den Appenzeller Hügeln, das nach einem Vorrat klingt'. Welche Stadt am Genfersee? Welches AR-Dorf?",
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
    <StageGate stage={1}>
      <QRGate
        token={AKTE_003_TOKEN}
        storageKey="akte-003-unlocked"
        title={<>Etappe 1 — QR-Code am Bahnhof scannen</>}
        description="Diese Etappe ist versiegelt. Scanne den QR-Code, der am Bahnhof Grünwald für dich hinterlegt ist."
      >
        <AktePage />
      </QRGate>
    </StageGate>
  );
}

type Step = "brief" | "raetselkarte" | "eingabe" | "routen" | "input" | "naechstes";

const STEPS: { id: Step; label: string }[] = [
  { id: "brief", label: "Brief" },
  { id: "raetselkarte", label: "Rätselkarte" },
  { id: "eingabe", label: "Start & Ziel" },
  { id: "routen", label: "Route wählen" },
  { id: "input", label: "Fachlicher Input" },
  { id: "naechstes", label: "Nächste Etappe" },
];

const norm = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "");

function AktePage() {
  const [step, setStep] = useState<Step>("brief");
  const [unlockedSteps, setUnlockedSteps] = useState<Set<Step>>(new Set(["brief"]));

  useEffect(() => {
    if (step === "naechstes") completeStage(1);
  }, [step]);

  const [start, setStart] = useState("");
  const [ziel, setZiel] = useState("");
  const [eingabeError, setEingabeError] = useState<string | null>(null);

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

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
      setEingabeError("Hm, das passt noch nicht. Lies Elviras Brief und die Tickets nochmal genau.");
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
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4 sm:mb-8 sm:pb-5">
          <div className="min-w-0">
            <Link
              to="/"
              className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground sm:text-[11px]"
            >
              ← Zurück zur Übersicht
            </Link>
            <h1 className="mt-1.5 font-serif text-2xl font-bold leading-tight sm:mt-2 sm:text-5xl">
              Etappe 1 · Bahnhof
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Auf den Spuren einer alten Reise
            </p>
          </div>
          <Stamp rotate={-6}>Vertraulich</Stamp>
        </header>

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
                    <span className="text-muted-foreground" aria-hidden>→</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {step === "brief" && (
          <PaperCard rotate={-0.4}>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Notiz 01 · Bahnhof Grünwald · Bank am Gleis 1
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Elviras alte Reisetickets
            </h2>
            <p className="mt-1 font-mono-typed text-xs text-muted-foreground">
              [Zettel und drei Fahrkarten · gefunden 14:48 Uhr]
            </p>
            <blockquote className="mt-5 border-l-4 border-stamp pl-4 text-[15px] leading-relaxed">
              „Maja — wenn du das liest, hast du den ersten Hinweis am
              richtigen Ort gefunden. Vor ein paar Jahren bin ich zu einer
              ehemaligen Mitarbeiterin einer Logistikfirma quer durch die
              Schweiz gereist: vom <em>See in der Westschweiz</em> zu einem
              Dorf hier oben in den Appenzeller Hügeln, das nach einem
              Vorrat klingt. Drei Optionen lagen damals auf dem Tisch — Zug,
              Auto, Inlandflug + Zug."
              <br />
              <br />
              „Ich habe genau eine davon genommen. Finde heraus welche — und
              vor allem warum. Diese Frage ist genau die, die heute Abend im
              Gemeinderat fehlt."
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
              Rätselkarte · Auftrag von Elvira
            </p>
            <h2 className="mt-2 flex items-center gap-2 font-serif text-2xl font-bold sm:text-3xl">
              <MapIcon className="h-6 w-6 text-stamp" /> Welche Route hat Elvira genommen?
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  Schritt 1
                </p>
                <p className="mt-2 text-[15px]">
                  Finde heraus, von wo Elvira losgereist ist und wohin sie wollte.
                  Beide Orte stecken versteckt in ihrem Brief.
                </p>
              </div>
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  Schritt 2
                </p>
                <p className="mt-2 text-[15px]">
                  Vergleiche die drei möglichen Routen. Wähle die, die Elvira
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
                — E.
              </p>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep("brief")}
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
              Tickets analysieren
            </p>
            <h2 className="mt-2 flex items-center gap-2 font-serif text-2xl font-bold sm:text-3xl">
              <MapPin className="h-6 w-6 text-stamp" /> Rekonstruiere Elviras Reiseroute
            </h2>
            <p className="mt-3 text-[15px] text-foreground/80">
              Lies den Brief erneut — beide Orte stecken in ihren Beschreibungen.
            </p>

            <form onSubmit={handleEingabe} className="mt-6 space-y-4">
              <div>
                <label className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  Startort
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
                  Zielort
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

        {step === "routen" && !selectedRouteId && (
          <div className="space-y-4">
            <PaperCard rotate={-0.3}>
              <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                Verbindung identifiziert
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Genève <span className="text-muted-foreground">›</span> Speicher
              </h2>
              <p className="mt-1 text-sm text-foreground/70">
                Drei Routen stehen zur Auswahl. Tippe eine an, um Karte, Verbindung
                und CO₂-Werte im Detail zu sehen.
              </p>
              <div className="mt-5">
                <RouteCards onSelect={(id) => setSelectedRouteId(id)} />
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

        {step === "routen" && selectedRouteId && (
          <RouteDetail
            routeId={selectedRouteId}
            errorText={routeError}
            onBack={() => {
              setSelectedRouteId(null);
              setRouteError(null);
            }}
            onChoose={(r: RouteOption) => {
              if (r.correct) {
                setRouteError(null);
                goto("input");
              } else {
                setRouteError(
                  "Diese Route ist nicht die nachhaltigste. Vergleiche CO₂-Werte und realen Aufwand und wähle erneut.",
                );
              }
            }}
          />
        )}

        {step === "input" && (
          <div className="space-y-6">
            <PaperCard rotate={-0.3}>
              <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                Fachlicher Input · Nachhaltige Mobilität
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Wie wir reisen, formt das Klima
              </h2>
              <p className="mt-3 text-foreground/80">
                Der Verkehr verursacht in der Schweiz rund ein Drittel aller
                Treibhausgase. Drei Begriffe, die du für das Hearing brauchst:
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
                  <div key={c.title} className="rounded-sm border border-border bg-paper p-4 shadow-sm">
                    <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Karte</p>
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
                Zur nächsten Etappe →
              </button>
            </div>
          </div>
        )}

        {step === "naechstes" && (
          <PaperCard rotate={-0.5} tape="top-left">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Etappe 2 · Dorfladen
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              „Geh zum alten Dorfladen."
            </h2>
            <div className="mt-4 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-5">
              <p className="font-serif italic leading-relaxed">
                Auf der Rückseite des Bahntickets steht in Elviras Handschrift:
                „Frau Berger im Dorfladen wartet schon. Sie hat etwas für dich
                vorbereitet — sie meinte, du seist ziemlich gut im Kombinieren."
              </p>
              <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                — E.
              </p>
            </div>
            <p className="mt-5 text-sm text-foreground/70">
              In Etappe 2 wartet ein gepackter Einkaufskorb auf dich. Zwei
              Produkte stimmen nicht.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/akte"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Etappe 2 öffnen →
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-5 py-2.5 font-serif text-sm font-semibold transition-colors hover:bg-secondary"
              >
                ← Übersicht
              </Link>
            </div>
          </PaperCard>
        )}

        <p className="mt-12 text-center font-mono-typed text-xs uppercase tracking-[0.2em] text-muted-foreground">
          — Etappe 1 · Bahnhof Grünwald —
        </p>
      </div>

      {unlockedSteps.has("raetselkarte") &&
        (step === "raetselkarte" || step === "eingabe" || step === "routen") && (
          <HintSystem hints={HINTS_003} storageKey="akte-003-hints-start" />
        )}
    </main>
  );
}
