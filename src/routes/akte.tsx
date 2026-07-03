import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { GruenerMarkt } from "@/components/case-file/GruenerMarkt";
import { QRGate } from "@/components/case-file/QRGate";
import { StageGate } from "@/components/case-file/StageGate";
import { HintSystem } from "@/components/case-file/HintSystem";
import { START_WARENKORB } from "@/lib/maya-data";
import { completeStage, getFrozenClock, getHearingClock } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useEnvelopePrompt } from "@/components/case-file/EnvelopeDialog";


export const Route = createFileRoute("/akte")({
  head: () => ({
    meta: [
      { title: "Etappe 2 — Dorfladen Berger" },
      {
        name: "description",
        content:
          "Etappe 2: Im alten Dorfladen wartet ein gepackter Einkaufskorb. Zwei Produkte stimmen nicht — finde sie und tausche sie aus.",
      },
    ],
  }),
  component: AkteGated,
});

function AkteGated() {
  return (
    <StageGate stage={2}>
      <QRGate
        token="CpZk0z9RaQkL22gtiWoR"
        storageKey="akte-001-unlocked"
        title={<>Etappe 2 — QR-Code im Dorfladen scannen</>}
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

function AktePage() {
  const navigate = useNavigate();
  const envelope = useEnvelopePrompt();
  const [step, setStep] = useState<Step>("brief");
  const [unlockedSteps, setUnlockedSteps] = useState<Set<Step>>(new Set(["brief"]));

  useEffect(() => {
    if (step === "naechstes") completeStage(2);
  }, [step]);

  const goto = (s: Step) => {
    setUnlockedSteps((prev) => new Set([...prev, s]));
    setStep(s);
  };

  const aktuellerIndex = STEPS.findIndex((s) => s.id === step);

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
              Etappe 2 · Dorfladen
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Frau Bergers Einkaufskorb
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
              [Holztresen · gepackter Korb · {getFrozenClock("maya-clock-akte-002")} Uhr]
            </p>
            <blockquote className="mt-5 border-l-4 border-stamp pl-4 text-[15px] leading-relaxed">
              Der alte Dorfladen ist eigentlich schon geschlossen, aber Frau
              Berger, eine langjährige Freundin Elviras, lässt dich noch hinein.
              <br /><br />
              „Deine Tante war hier jede Woche", sagt sie nachdenklich. „Sie hat
              mal gesagt: Wenn ich sehe, was die Leute kaufen, weiss ich genau,
              was schiefläuft."
              <br /><br />
              Du ziehst Elviras Einkaufsliste hervor und zeigst sie Frau Berger.
              Daraufhin holt sie einen Einkaufskorb hinter der Kasse hervor.
              „Diesen hat Elvira gepackt." Du schaust rein, dann auf die Liste.
              Alles stimmt überein, jedes einzelne Produkt. Und genau das ist
              komisch.
              <br /><br />
              „Sie meinte, du seist ziemlich gut im Kombinieren." Frau Berger
              lächelt. „Was fällt dir auf?"
            </blockquote>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => goto("shop")}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Zum Einkaufskorb →
              </button>
            </div>
          </PaperCard>
        )}

        {step === "shop" && (
          <div className="space-y-4">
            <GruenerMarkt
              startWarenkorb={START_WARENKORB}
              onErfolg={() => goto("input")}
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

        {step === "input" && (
          <div className="space-y-6">
            <PaperCard rotate={-0.3}>
              <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                Fachlicher Input · 3 Lernkarten
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Was heißt eigentlich „nachhaltig einkaufen"?
              </h2>
              <p className="mt-3 text-foreground/80">
                Drei Begriffe, die du gerade angewendet hast — und die der Rat
                heute Abend hören will:
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "Saisonal",
                    body: "Obst und Gemüse, das gerade in der Schweiz wächst und geerntet werden kann. Wer im März Erdbeeren kauft, kauft Ware aus dem Süden oder beheizten Tunneln — viel Energie für wenig Geschmack.",
                    hint: "Im Frühling in CH saisonal: Lauch, Karotten, Feldsalat …",
                  },
                  {
                    title: "Regional",
                    body: "Lebensmittel aus deiner Umgebung — meist 50–100 km. Kurzer Transport, frischer, oft kleinere Höfe. Achtung: «Aus der Schweiz» ist nicht automatisch regional. Region heißt: aus deiner Gegend.",
                    hint: "Bio Suisse & IP-Suisse stehen für Schweizer Herkunft mit klaren Standards.",
                  },
                  {
                    title: "Tiergerecht & Bio",
                    body: "Bio-Freilandhaltung garantiert Auslauf und Bio-Futter — Bodenhaltung nicht. Importeier reisen oft über tausende Kilometer. Hinter günstigen Preisen stehen meist enge Ställe und industrielle Logistik.",
                    hint: "Schweizer Bio-Eier sind teurer, halten aber, was die Werbung verspricht.",
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
                onClick={() => setStep("shop")}
                className="rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                ← Zurück zum Korb
              </button>
              <button
                onClick={() => goto("naechstes")}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Weiter →
              </button>
            </div>
          </div>
        )}

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
                Die alte Registrierkasse springt mit einem lauten Ping an und
                druckt einen Bon. Frau Berger reicht ihn dir mit einem wissenden
                Lächeln. Auf der Rückseite steht in Elviras Handschrift:
                <br /><br />
                „Gut gemacht! Geh zur Lichtung im Wald, wo wir früher Vögel
                beobachtet haben. Dort findest du meinen Beobachtungsposten."
              </p>
              <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                — E.
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
                    onConfirm: () => navigate({ to: "/akte-002" }),
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
          — Etappe 2 · Dorfladen Berger —
        </p>
      </div>

      {unlockedSteps.has("shop") && (step === "shop" || step === "input") && (
        <HintSystem />
      )}
    </main>
  );
}
