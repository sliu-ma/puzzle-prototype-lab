import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { GruenerMarkt } from "@/components/case-file/GruenerMarkt";
import { InputCarousel } from "@/components/case-file/InputCarousel";
import {
  SaisonProdukte,
  FoodWasteChart,
  LabelUebersicht,
  getSaisonInfo,
} from "@/components/case-file/ConsumptionCharts";
import { QRGate } from "@/components/case-file/QRGate";
import { StageGate } from "@/components/case-file/StageGate";
import { HintSystem, type Hint } from "@/components/case-file/HintSystem";
import { START_WARENKORB } from "@/lib/maya-data";
import { completeStage, getFrozenClock, getHearingClock } from "@/lib/progress";
import { awardBadge, tryAwardNoHintStage } from "@/lib/badges";
import { usePersistentState, usePersistentSet } from "@/lib/persist";
import { useScrollToTopOnChange } from "@/hooks/use-scroll-top";

import { cn } from "@/lib/utils";
import { useEnvelopePrompt } from "@/components/case-file/EnvelopeDialog";
import { useSuccessBurst } from "@/components/case-file/SuccessBurst";
import { StageScoreRecap } from "@/components/case-file/StageScoreRecap";


export const Route = createFileRoute("/etappe-2")({
  head: () => ({
    meta: [
      { title: "Etappe 2, Dorfladen Berger" },
      {
        name: "description",
        content:
          "Etappe 2: Im alten Dorfladen wartet ein gepackter Einkaufskorb. Zwei Produkte stimmen nicht, finde sie und tausche sie aus.",
      },
    ],
  }),
  component: AkteGated,
});

function AkteGated() {
  return (
    <StageGate stage={2}>
      <QRGate
        stage={2}
        token="CpZk0z9RaQkL22gtiWoR"
        storageKey="akte-001-unlocked"
        title={<>Etappe 2, QR-Code im Dorfladen scannen</>}
        description="Diese Etappe ist versiegelt. Scanne den QR-Code, den Frau Berger für dich bereitgelegt hat."
        label="Etappe 2 · Versiegelt"
      >
        <AktePage />
      </QRGate>
    </StageGate>
  );
}

type Step = "brief" | "shop" | "input" | "naechstes";

const STEPS: { id: Step; label: string }[] = [
  { id: "brief", label: "Brief" },
  { id: "shop", label: "Einkaufskorb" },
  { id: "input", label: "Fachlicher Input" },
  { id: "naechstes", label: "Nächste Etappe" },
];

const DORFLADEN_HINTS: Hint[] = [
  {
    id: 0,
    unlockMin: 3,
    label: "Tipp 1",
    title: "Starte mit Elviras Rezept",
    body: "Der Korb ist leer, das ist Absicht. Öffne oben das Rezept-Akkordeon und geh die Zutaten Schritt für Schritt durch. Für jede Zutat gibt es im Laden mindestens eine Option.",
  },
  {
    id: 1,
    unlockMin: 6,
    label: "Tipp 2",
    title: "Bio-Import oder regional & saisonal?",
    body: "Beide Erdbeeren haben ihre Stärken: Die spanischen sind bio, die Schweizer sind regional und mitten in der Saison. Bio sagt etwas über den Anbau, aber nicht über Transport und Saison. Kurze Wege und Saisonware schlagen den Import meist deutlich.",
  },
  {
    id: 2,
    unlockMin: 9,
    label: "Auflösung",
    title: "So geht's",
    body: "Wähle Schweizer Erdbeeren (IP-Suisse), Schweizer Bio-Freiland-Eier und die Bio/Demeter-Zitrone aus Italien. Ergänze Mehl, Zucker, Salz, Butter, Vollrahm und Vanillezucker, für die gibt es je nur eine Option. Dann springt die Kasse an.",
  },
];


function AktePage() {
  const navigate = useNavigate();
  const envelope = useEnvelopePrompt();
  const { burst, celebrate } = useSuccessBurst({ stageNr: 2 });
  const [step, setStep] = usePersistentState<Step>("akte-2-step", "brief");
  useScrollToTopOnChange(step);
  const [unlockedSteps, setUnlockedSteps] = usePersistentSet<Step>(
    "akte-2-unlocked-steps",
    () => new Set(["brief"]),
  );


  useEffect(() => {
    if (step === "naechstes") {
      completeStage(2);
      tryAwardNoHintStage(2);
      try {
        if (localStorage.getItem("akte-2-perfect-eligible") === "1") {
          awardBadge("erstversuch-konsum");
        }
      } catch {}
    }
  }, [step]);

  const goto = (s: Step) => {
    setUnlockedSteps((prev) => new Set([...prev, s]));
    setStep(s);
  };

  const aktuellerIndex = STEPS.findIndex((s) => s.id === step);

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
              Etappe 2 · Dorfladen
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Frau Bergers Regale
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
              Notiz 02 · Dorfladen Berger · auf dem Holztresen
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Frau Berger wartet schon.
            </h2>
            <p className="mt-1 font-mono-typed text-xs text-muted-foreground">
              [Holztresen · leerer Korb · {getFrozenClock("maya-clock-akte-002")} Uhr]
            </p>
            <blockquote className="mt-5 border-l-4 border-stamp pl-4 text-[15px] leading-relaxed">
              Der Dorfladen ist eigentlich geschlossen, doch Elviras Freundin Frau Berger lässt dich hinein. „Deine Tante war jede Woche hier. Sie sagte: Wenn ich sehe, was die Leute kaufen, weiss ich, was schiefläuft.“&nbsp;&nbsp;
              <br /><br />
              Frau Berger betrachtet Elviras Einkaufsliste und stellt einen leeren Korb auf den Tresen. „Alles ist da. Aber welche Zutaten du wählst, musst du selbst entscheiden. Elvira hätte es gewusst.“&nbsp;&nbsp;
            </blockquote>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => goto("shop")}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                In den Laden →
              </button>
            </div>
          </PaperCard>
        )}

        {step === "shop" && (
          <div className="space-y-4">
            <GruenerMarkt
              startWarenkorb={START_WARENKORB}
              onErfolg={() => celebrate(() => goto("input"))}
            />
            <div className="flex justify-start">
              <button
                onClick={() => setStep("brief")}
                className="rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                ← Zurück
              </button>
            </div>
          </div>
        )}

        {step === "input" && (() => {
          const saison = getSaisonInfo();
          return (
          <InputCarousel
            kicker="Fachlicher Input · 3 Lernkarten"
            title="Nachhaltig einkaufen, worauf es ankommt"
            intro="Drei Grundregeln, die du gerade angewendet hast, und die der Rat heute Abend hören will:"
            cards={[
              {
                title: "Regional & saisonal einkaufen",
                body: `Regionale und saisonale Lebensmittel haben kürzere Transportwege und kürzere Lagerzeiten als importierte Ware. Im ${saison.label} sind zum Beispiel folgende Lebensmittel saisonal und regional:\u00a0`,
                visual: <SaisonProdukte />,
              },
              {
                title: "Food-Waste vermeiden",
                body: "Pro Person werden in der Schweiz jährlich viele Lebensmittel weggeworfen. Ein Grund dafür: Es wird zu viel eingekauft. Ein anderer Grund: Das Haltbarkeitsdatum läuft ab. Diese Grafik zeigt, wie viel das ausmacht.",
                visual: <FoodWasteChart />,
              },
              {
                title: "Auf die Verpackung achten",
                body: "Labels auf Verpackungen zeigen besondere Eigenschaften eines Produkts. Zum Beispiel gute Qualität, faire Herstellung oder Umweltschutz. Drei Beispiele aus Frau Bergers Laden:\u00a0",
                visual: <LabelUebersicht />,
              },
            ]}
            backLabel="← Zurück in den Laden"
            onBack={() => setStep("shop")}
            nextLabel="Weiter zu Etappe 3 →"
            onNext={() => goto("naechstes")}
          />
          );
        })()}

        {step === "naechstes" && <StageScoreRecap stage={2} />}
        {step === "naechstes" && (
          <PaperCard rotate={-0.5} tape="top-left">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Etappe 3 · Wald-Lichtung
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              „Geh zur Lichtung im Wald."
            </h2>
            <div className="mt-4 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-5">
              <p className="font-serif italic leading-relaxed">
                Die Kasse piept und druckt einen Kassenzettel aus. Frau Berger reicht ihn dir. Auf der Rückseite steht:
                <br /><br />
                „Gut gemacht! Geh zur Lichtung im Wald, wo wir früher Vögel
                beobachtet haben. Dort findest du meinen Beobachtungsposten."
              </p>
              <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
               , E.
              </p>
            </div>
            <p className="mt-5 text-sm text-foreground/70">
              Du denkst kurz an die Uhr. Bis {getHearingClock() ?? "19:00"} Uhr bleibt noch Zeit.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() =>
                  envelope.ask({
                    nr: 3,
                    ort: "Wald-Lichtung · Etappe 3",
                    etappeLabel: "Etappe 3 · Wald-Lichtung",
                    onConfirm: () => navigate({ to: "/etappe-3" }),
                  })
                }
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Etappe 3 öffnen →
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
         , Etappe 2 · Dorfladen Berger
        </p>
      </div>

      {unlockedSteps.has("shop") && (step === "shop" || step === "input") && (
        <HintSystem stage={2} hints={DORFLADEN_HINTS} storageKey="akte-002-hints-start" />
      )}

    </main>
  );
}
