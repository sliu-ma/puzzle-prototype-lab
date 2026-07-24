import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { QRGate } from "@/components/case-file/QRGate";
import { StageGate } from "@/components/case-file/StageGate";
import { GutachtenRaetsel } from "@/components/case-file/GutachtenRaetsel";
import { InputCarousel } from "@/components/case-file/InputCarousel";
import {
  CO2VergleichChart,
  AnteilErneuerbarChart,
  ImportabhaengigkeitChart,
} from "@/components/case-file/EnergietraegerCharts";
import { HintSystem, type Hint } from "@/components/case-file/HintSystem";
import { completeStage, getFrozenClock, getHearingClock } from "@/lib/progress";
import { usePersistentState, usePersistentSet } from "@/lib/persist";

import { cn } from "@/lib/utils";
import { useSuccessBurst } from "@/components/case-file/SuccessBurst";
import { useScrollToTopOnChange } from "@/hooks/use-scroll-top";

export const Route = createFileRoute("/etappe-5")({
  head: () => ({
    meta: [
      { title: "Etappe 5 — Altes Wasserkraftwerk" },
      {
        name: "description",
        content:
          "Etappe 5: Marlene Vogt vom Umweltamt zeigt dir drei Gutachten. Finde die fünf falschen Aussagen, bevor im Gemeindesaal abgestimmt wird.",
      },
    ],
  }),
  component: AkteGated,
});

const AKTE_005_TOKEN = "Eg9LkRq2VhYbP4Mn7TcW";

const HINTS_005: Hint[] = [
  {
    id: 0,
    unlockMin: 3,
    label: "Tipp 1",
    title: "Vergleich statt Bauch",
    body: "Lies jedes Gutachten Satz für Satz und halte die Aussagen gegen Marlenes Faktenkarte daneben. Insgesamt musst du genau 5 Aussagen markieren.",
  },
  {
    id: 1,
    unlockMin: 6,
    label: "Tipp 2",
    title: "Wo Marlene stutzig wurde",
    body: 'Die falschen Aussagen verteilen sich über alle drei Gutachten (Gas, Kohle, Solar). Achte besonders auf konkrete Zahlen (CO₂, Wirkungsgrad, Volllaststunden) und auf Grundsatzbegriffe wie „erneuerbar" oder „nicht schutzwürdig".',
  },
  {
    id: 2,
    unlockMin: 9,
    label: "Auflösung",
    title: "Die fünf Fehler",
    body: 'Gutachten A (Gas): „95 g CO₂/kWh — nahezu klimaneutral". Gutachten B (Kohle): „78 % Wirkungsgrad" und „Kohle ist eine erneuerbare Brückentechnologie". Gutachten C (Solar): „Volllaststunden im Schweizer Mittelland 250 h/Jahr" (real ≈ 900–1\'100 h/Jahr) und „Batteriespeicher halten etwa 8 Jahre" (real ≈ 15–25 Jahre).',
  },
];

function AkteGated() {
  return (
    <StageGate stage={5}>
      <QRGate
        token={AKTE_005_TOKEN}
        storageKey="akte-005-unlocked"
        title={<>Etappe 5 — QR-Code am Wasserkraftwerk scannen</>}
        description="Letzte Etappe vor dem Hearing. Scanne den QR-Code am Tor des alten Wasserkraftwerks."
        label="Etappe 5 · Versiegelt"
      >
        <AktePage />
      </QRGate>
    </StageGate>
  );
}

type Step = "brief" | "spiel" | "input" | "naechstes";

const STEPS: { id: Step; label: string }[] = [
  { id: "brief", label: "Treffen" },
  { id: "spiel", label: "Gutachten prüfen" },
  { id: "input", label: "Fachlicher Input" },
  { id: "naechstes", label: "Zum Hearing" },
];

function AktePage() {
  const { burst, celebrate } = useSuccessBurst();
  const [step, setStep] = usePersistentState<Step>("akte-5-step", "brief");
  const [unlockedSteps, setUnlockedSteps] = usePersistentSet<Step>(
    "akte-5-unlocked-steps",
    () => new Set(["brief"]),
  );
  useScrollToTopOnChange(step);



  useEffect(() => {
    if (step === "naechstes") completeStage(5);
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
              Etappe 5 · Wasserkraftwerk
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Treffen mit Marlene Vogt
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
              Notiz 05 · staubiger Abstellraum · zwischen Aktenregalen
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Marlene Vogt vom Umweltamt
            </h2>
            <p className="mt-1 font-mono-typed text-xs text-muted-foreground">
              [Altes Wasserkraftwerk · {getFrozenClock("maya-clock-akte-005")} Uhr]
            </p>
            <blockquote className="mt-5 border-l-4 border-stamp pl-4 text-[15px] leading-relaxed">
              Im staubigen Abstellraum des alten Wasserkraftwerks wartet Marlene
              Vogt vom Umweltamt. „Gut, dass du da bist. Der Gemeinderat
              entscheidet heute Abend über das Kraftwerk, doch die Grundlage
              sind fehlerhafte Gutachten.“
              <br />
              <br />
              <br />
              Sie legt einen Stapel Dokumente auf den Tisch. „Ich habe die
              wichtigsten Fakten geprüft. In den Gutachten zu Solarenergie, Gas
              und Kohle sind fünf Aussagen falsch. Findet sie, bevor die
              Entscheidung fällt.“&nbsp;&nbsp;
            </blockquote>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => goto("spiel")}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Gutachten öffnen →
              </button>
            </div>
          </PaperCard>
        )}

        {step === "spiel" && (
          <div className="space-y-4">
            <GutachtenRaetsel onErfolg={() => celebrate(() => goto("input"))} />
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

        {step === "input" && (
          <InputCarousel
            kicker="Fachlicher Input · Energieträger"
            title="Was wirklich nachhaltig ist"
            intro="Drei Blickwinkel auf unsere Energie — an ihnen entscheidet sich, was im Hearing zählt:"
            cards={[
              {
                title: "Vergleich Energieträger",
                body: "Verschiedene Energiequellen verursachen unterschiedlich viel Gramm CO₂ pro Kilowattstunde Strom. Im Betrieb verursachen erneuerbare Energien praktisch keine CO₂-Emissionen.",
                visual: <CO2VergleichChart />,
              },
              {
                title: "Anteil erneuerbare Energien",
                body: "Der Anteil erneuerbarer Energien in der Schweiz betrug 2023 rund 28 Prozent. Der grösste Teil der Energie stammt also weiterhin aus fossilen Quellen wie Öl oder Gas.",
                visual: <AnteilErneuerbarChart />,
              },
              {
                title: "Abhängigkeit von Importen",
                body: "Mehr als 70 Prozent des Schweizer Energiebedarfs werden importiert. Solar- und Windenergie machen die Schweiz unabhängiger von diesen Importen, die vor allem in Krisenzeiten stark schwanken können.",
                visual: <ImportabhaengigkeitChart />,
              },
            ]}
            onBack={() => setStep("spiel")}
            nextLabel="Zum Hearing →"
            onNext={() => goto("naechstes")}
          />
        )}

        {step === "naechstes" && (
          <PaperCard rotate={-0.5} tape="top-left">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Finale · Hearing im Gemeindesaal
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              „Wir haben alles, was wir brauchen."
            </h2>
            <div className="mt-4 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-5">
              <p className="font-serif italic leading-relaxed">
                Mit den korrigierten Gutachten, den Rechnungen und Elviras
                Notizen im Rucksack rennt ihr zum Gemeindesaal. Draussen stösst
                euch auf den letzten Metern jemand entgegen — Tante Elvira,
                atemlos, einen Stapel Papiere unterm Arm.
                <br /><br />
                „Maja! Ich dachte, du kommst vielleicht direkt hierher — ich
                habe noch die letzten Messdaten vom Bachamt. Wir haben alles,
                was wir brauchen!"
              </p>
              <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                — E.
              </p>
            </div>
            <p className="mt-5 text-sm text-foreground/70">
              Im Hearing stellt der Rat dir zehn Fragen aus allen fünf Themen.
              Max. 3 Fehler — sonst kippt die Abstimmung.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/finale"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Hearing starten →
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
          — Etappe 5 · Altes Wasserkraftwerk —
        </p>
      </div>

      {step === "spiel" && (
        <HintSystem hints={HINTS_005} storageKey="akte-005-hints-start" />
      )}
    </main>
  );
}
