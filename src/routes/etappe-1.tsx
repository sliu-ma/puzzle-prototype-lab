import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { QRGate } from "@/components/case-file/QRGate";
import { StageGate } from "@/components/case-file/StageGate";
import { HintSystem, type Hint } from "@/components/case-file/HintSystem";
import { RouteCards } from "@/components/case-file/RouteCards";
import { RouteDetail } from "@/components/case-file/RouteDetail";
import { InputCarousel } from "@/components/case-file/InputCarousel";
import { CostPerKm, TrainVsCars, ShortTripsShare } from "@/components/case-file/MobilityCharts";
import { VALID_START, VALID_ZIEL, type RouteOption } from "@/lib/mobility-data";
import { completeStage } from "@/lib/progress";
import { tryAwardNoHintStage, awardBadge } from "@/lib/badges";
import { usePersistentState, usePersistentSet } from "@/lib/persist";
import { useScrollToTopOnChange } from "@/hooks/use-scroll-top";

import { cn } from "@/lib/utils";
import { useEnvelopePrompt } from "@/components/case-file/EnvelopeDialog";
import { useSuccessBurst } from "@/components/case-file/SuccessBurst";
import { StageScoreRecap } from "@/components/case-file/StageScoreRecap";


export const Route = createFileRoute("/etappe-1")({
  head: () => ({
    meta: [
      { title: "Etappe 1, Bahnhof Speicher" },
      {
        name: "description",
        content:
          "Etappe 1: Auf dem Bahnhof liegt Jakobs altes Reiseticket. Welchen Weg hat er wirklich gewählt?",
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
    label: "Hinweis 1",
    title: "Schau dir die Unterlagen genau an",
    body: "Wo hat Jakob geschlafen, und von wo aus ist er am nächsten Morgen aufgebrochen?",
  },
  {
    id: 1,
    unlockMin: 6,
    label: "Hinweis 2",
    title: "Vergleiche nicht nur die Zeit",
    body: "Schau bei jeder Route die CO₂-Werte UND den realen Aufwand an. Spart der Flug wirklich Zeit, wenn du Anfahrt, Check-in und Umsteigen mitrechnest?",
  },
  {
    id: 2,
    unlockMin: 9,
    label: "Auflösung",
    title: "So geht's",
    body: "Start: Genf, Ziel: Speicher (AR). Die nachhaltigste Route ist der direkte Zug (IC 1 → S21) mit ca. 4 kg CO₂ pro Person. Auto und Inlandflug stossen ein Vielfaches aus, ohne nennenswerte Zeitersparnis.",
  },
];

function AkteGated() {
  return (
    <StageGate stage={1}>
      <QRGate
        stage={1}
        token={AKTE_003_TOKEN}
        storageKey="akte-003-unlocked"
        title={<>Etappe 1, QR-Code am Bahnhof scannen</>}
        description="Diese Etappe ist versiegelt. Scanne den QR-Code, der am Bahnhof Speicher für dich hinterlegt ist."
        label="Etappe 1 · Versiegelt"
      >
        <AktePage />
      </QRGate>
    </StageGate>
  );
}

type Step = "brief" | "eingabe" | "routen" | "input" | "naechstes";

const STEPS: { id: Step; label: string }[] = [
  { id: "brief", label: "Brief" },
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
  const navigate = useNavigate();
  const envelope = useEnvelopePrompt();
  const { burst, celebrate } = useSuccessBurst({ stageNr: 1 });
  const [step, setStep] = usePersistentState<Step>("akte-1-step", "brief");
  useScrollToTopOnChange(step);
  const [unlockedSteps, setUnlockedSteps] = usePersistentSet<Step>(
    "akte-1-unlocked-steps",
    () => new Set(["brief"]),
  );

  const [start, setStart] = usePersistentState<string>("akte-1-start", "");
  const [ziel, setZiel] = usePersistentState<string>("akte-1-ziel", "");
  const [eingabeError, setEingabeError] = useState<string | null>(null);
  const [hadFail, setHadFail] = usePersistentState<boolean>("akte-1-had-fail", false);

  useEffect(() => {
    if (step === "naechstes") {
      completeStage(1);
      tryAwardNoHintStage(1);
      if (!hadFail) awardBadge("route-anhieb");
    }
  }, [step, hadFail]);

  const [selectedRouteId, setSelectedRouteId] = usePersistentState<string | null>(
    "akte-1-route",
    null,
  );
  const [routeError, setRouteError] = useState<string | null>(null);


  const jetzt = useMemo(
    () =>
      new Date().toLocaleTimeString("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " Uhr",
    [],
  );

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
      setHadFail(true);
      setEingabeError("Hm, das passt noch nicht. Lies Jakobs Zettel und die Tickets nochmal genau.");
    }
  };

  return (
    <main className="relative min-h-screen px-3 py-6 sm:px-4 sm:py-14">
      {burst}
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
                    <span className="text-muted-foreground" aria-hidden>
                      →
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {step === "brief" && (
          <PaperCard rotate={-0.4}>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Notiz 01, Bahnhof Speicher, Bank am Gleis 1
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">Grossvaters altes Reiseticket</h2>
            <p className="mt-1 font-mono-typed text-xs text-muted-foreground">[Hinweis gefunden um {jetzt}]</p>
            <p className="mt-5 text-[15px] leading-relaxed">
              Im alten Bahnhofsgebäude findet Maja am Fahrkartenschalter ein Couvert mit Jakobs alten Reiseunterlagen und ein Zettel. Darauf steht:
            </p>
            <blockquote className="mt-4 border-l-4 border-stamp pl-4 font-serif italic text-[15px] leading-relaxed">
              „Ich habe immer das gewählt, was am wenigsten Spuren hinterlässt. Findest du heraus, welchen Weg ich nach
              Hause genommen habe?"
            </blockquote>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => goto("eingabe")}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Weiter zum Rätsel →
              </button>
            </div>
          </PaperCard>
        )}

        {step === "eingabe" && (
          <PaperCard rotate={-0.2} tape="top-right">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">Tickets analysieren</p>
            <h2 className="mt-2 flex items-center gap-2 font-serif text-2xl font-bold sm:text-3xl">
              <MapPin className="h-6 w-6 text-stamp" /> Rekonstruiere Jakobs Reiseroute
            </h2>
            <p className="mt-3 text-[15px] text-foreground/80">
              Jakob hat seine Hinweise gut versteckt. Vielleicht lohnt sich ein zweiter Blick auf seine Unterlagen.
            </p>

            <form onSubmit={handleEingabe} className="mt-6 space-y-4">
              <div>
                <label className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Startort</label>
                <input
                  type="text"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  placeholder="Startort eintippen …"
                  className="mt-1 w-full rounded-sm border border-border bg-paper-deep/30 px-4 py-3 font-mono-typed text-sm focus:border-stamp focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Zielort</label>
                <input
                  type="text"
                  value={ziel}
                  onChange={(e) => setZiel(e.target.value)}
                  placeholder="Zielort eintippen …"
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
                onClick={() => setStep("brief")}
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
                Genf <span className="text-muted-foreground">›</span> Speicher
              </h2>
              <p className="mt-1 text-sm text-foreground/70">
                Drei Routen stehen zur Auswahl. Tippe eine an, um Karte und Verbindung im Detail zu sehen.
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
                celebrate(() => goto("input"));
              } else {
                setHadFail(true);
                setRouteError(
                  "Diese Route ist nicht die nachhaltigste. Vergleiche CO₂-Werte und realen Aufwand und wähle erneut.",
                );
              }
            }}
          />
        )}

        {step === "input" && (
          <InputCarousel
            kicker="Fachlicher Input · Nachhaltige Mobilität"
            title="Wie wir reisen, formt das Klima"
            intro="Der Verkehr verursacht in der Schweiz rund ein Drittel aller Treibhausgase. Drei Karten, die du für das Hearing brauchst:"
            cards={[
              {
                title: "Was kostet ein Kilometer wirklich?",
                body: "Zu den Autokosten gehören nicht nur Benzin. Auch Versicherung, Parken und Reparaturen gehören dazu. Das ergibt zusammen die Vollkosten.",
                visual: <CostPerKm />,
              },
              {
                title: "Ein Zug ersetzt viele Autos",
                body: "Ein Zug transportiert im Schnitt so viele Personen wie 90 Autos. Bei voller Kapazität wären es sogar bis zu 310. Der Grund: Züge sind oft nicht voll besetzt.",
                visual: <TrainVsCars />,
              },
              {
                title: "Aktive Mobilität",
                body: "Viele Autofahrten in der Schweiz sind sehr kurz. Fast die Hälfte ist kürzer als 5 Kilometer. Solche kurzen Strecken kann man gut mit dem Velo oder zu Fuss zurücklegen.",
                visual: <ShortTripsShare />,
              },
            ]}
            onBack={() => setStep("routen")}
            nextLabel="Weiter zu Etappe 2 →"
            onNext={() => goto("naechstes")}
          />
        )}

        {step === "naechstes" && <StageScoreRecap stage={1} />}
        {step === "naechstes" && (
          <PaperCard rotate={-0.5} tape="top-left">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">Etappe 2 · Dorfladen</p>

            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">„Geh zum alten Dorfladen."</h2>
            <div className="mt-4 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-5">
              <p className="font-serif italic leading-relaxed">
                Auf der Rückseite des Bahntickets steht in Jakobs Handschrift: „Frau Berger im Dorfladen wartet schon.
                Sie hat etwas für dich vorbereitet."
              </p>
              <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">J.</p>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() =>
                  envelope.ask({
                    nr: 2,
                    ort: "Dorfladen · Etappe 2",
                    etappeLabel: "Etappe 2 · Dorfladen",
                    onConfirm: () => navigate({ to: "/etappe-2" }),
                  })
                }
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Etappe 2 öffnen →
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-5 py-2.5 font-serif text-sm font-semibold transition-colors hover:bg-secondary"
              >
                ← Übersicht
              </Link>
            </div>
          </PaperCard>
        )}
        {envelope.dialog}

        <p className="mt-12 text-center font-mono-typed text-xs uppercase tracking-[0.2em] text-muted-foreground">
          ETAPPE 1 · BAHNHOF SPEICHER
        </p>
      </div>

      {unlockedSteps.has("eingabe") && (step === "eingabe" || step === "routen") && (
        <HintSystem stage={1} hints={HINTS_003} storageKey="akte-001-hints-start" />
      )}
    </main>
  );
}
