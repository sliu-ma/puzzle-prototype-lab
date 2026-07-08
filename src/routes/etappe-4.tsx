import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { QRGate } from "@/components/case-file/QRGate";
import { StageGate } from "@/components/case-file/StageGate";
import { EnergyGame } from "@/components/case-file/EnergyGame";
import { HintSystem, type Hint } from "@/components/case-file/HintSystem";
import { completeStage, getFrozenClock } from "@/lib/progress";
import { usePersistentState, usePersistentSet } from "@/lib/persist";

import { cn } from "@/lib/utils";
import { useEnvelopePrompt } from "@/components/case-file/EnvelopeDialog";


const HINTS_004: Hint[] = [
  {
    id: 0,
    unlockMin: 3,
    label: "Tipp 1",
    title: "Grosse Posten zuerst",
    body: "Klick als Erstes auf Heizung/Raumtemperatur, Dusche und die Wäsche. Kleine Geräte wie Staubsauger oder Fernseher bringen nur wenige Punkte.",
  },
  {
    id: 1,
    unlockMin: 6,
    label: "Tipp 2",
    title: "Gewohnheiten sind gratis — und stark",
    body: "18 °C heizen, kurz duschen, Wäsche aufhängen, Eco-Programme, Deckel auf den Topf, Kühlschrank auf 7 °C: alles kostet 0 CHF und bringt zusammen schon fast die 3'500 ESP.",
  },
  {
    id: 2,
    unlockMin: 9,
    label: "Auflösung",
    title: "So erreichst du die 3'500 ESP",
    body: "Nur mit Verhalten: 18 °C (1480) + 5-Min-Dusche (820) + Aufhängen (550) + Eco-Waschen (340) + Eco-Spülen (150) + Umluft (20) + Deckel + Pfannengrösse (220) + Kühlschrank 7 °C (90) = ~3'670 ESP. Ergänze eine LED-Lampe (60 CHF) oder Sparbrause (30 CHF) — Budget bleibt fast unangetastet.",
  },
];

export const Route = createFileRoute("/etappe-4")({
  head: () => ({
    meta: [
      { title: "Etappe 4 — Elviras Haus" },
      {
        name: "description",
        content:
          "Etappe 4: Zurück bei Elvira. Eine Querschnittszeichnung des Hauses, alte Rechnungen — und das Ziel: 3'500 Energiesparpunkte sammeln.",
      },
    ],
  }),
  component: AkteGated,
});

const AKTE_004_TOKEN = "Wb6Vc4Hn1ZqYpMr8Js3F";

function AkteGated() {
  return (
    <StageGate stage={4}>
      <QRGate
        token={AKTE_004_TOKEN}
        storageKey="akte-004-unlocked"
        title={<>Etappe 4 — QR-Code in Elviras Haus scannen</>}
        description="Diese Etappe ist versiegelt. Scanne den QR-Code, der bei Elvira auf dem Küchentisch liegt."
        label="Etappe 4 · Versiegelt"
      >
        <AktePage />
      </QRGate>
    </StageGate>
  );
}

type Step = "brief" | "raetselkarte" | "spiel" | "input" | "naechstes";

const STEPS: { id: Step; label: string }[] = [
  { id: "brief", label: "Zettel" },
  { id: "raetselkarte", label: "Rätselkarte" },
  { id: "spiel", label: "Haus planen" },
  { id: "input", label: "Fachlicher Input" },
  { id: "naechstes", label: "Nächste Etappe" },
];

function AktePage() {
  const navigate = useNavigate();
  const envelope = useEnvelopePrompt();
  const [step, setStep] = usePersistentState<Step>("akte-4-step", "brief");
  const [unlockedSteps, setUnlockedSteps] = usePersistentSet<Step>(
    "akte-4-unlocked-steps",
    () => new Set(["brief"]),
  );


  useEffect(() => {
    if (step === "naechstes") completeStage(4);
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
              Etappe 4 · Zuhause
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Elviras Haus, Querschnitt auf dem Küchentisch
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
              Notiz 04 · Küchentisch · neben der Zeichnung
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Eine Zeichnung und ein knapper Zettel
            </h2>
            <p className="mt-1 font-mono-typed text-xs text-muted-foreground">
              [Hauszeichnung + Rechnungen aus der Kiste · {getFrozenClock("maya-clock-akte-004")} Uhr]
            </p>
            <blockquote className="mt-5 border-l-4 border-stamp pl-4 text-[15px] leading-relaxed">
              Du kommst ausser Atem zurück zu Elviras Haus. Auf dem Küchentisch
              — genau dort, wo der erste Brief lag — liegt jetzt eine grosse
              Zeichnung: eine Querschnittsansicht des Hauses mit Schlafzimmer,
              Bad, Wäscheraum, Wohnzimmer und Küche. Daneben ein Zettel:
              <br />
              <br />
              „Ein neues Kraftwerk wird oft nur deshalb gebaut, weil wir im
              Alltag unbemerkt zu viel Energie verbrauchen. Wenn wir zeigen
              können, wie viele Energiesparpunkte ein einziger Haushalt sammeln
              kann, bricht das Hauptargument für den Neubau zusammen. Nimm die
              Rechnungen aus der Kiste und finde heraus, welche Massnahmen am
              meisten bringen — oft sind es nicht die teuersten!"
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
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Plane Elviras Haus um
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  Was du hast
                </p>
                <ul className="mt-2 space-y-1 text-[15px]">
                  <li>· Querschnitt mit 5 Räumen</li>
                  <li>· 1'000.– CHF Budget</li>
                  <li>· Pro Gerät 2–3 Optionen</li>
                </ul>
              </div>
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  Dein Auftrag
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-[15px]">
                  <li>Tippe Geräte im Haus an.</li>
                  <li>Wähle eine Option pro Gerät.</li>
                  <li>Achte aufs Budget.</li>
                  <li>Sammle mind. 3'500 Energiesparpunkte.</li>
                </ol>
              </div>
            </div>
            <div className="mt-6 rounded-sm border border-stamp/30 bg-stamp/5 p-4">
              <p className="font-serif italic leading-relaxed">
                „Nicht jedes Upgrade lohnt sich. Manchmal ist die billigste
                Gewohnheit die wirksamste."
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
                onClick={() => goto("spiel")}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Haus planen →
              </button>
            </div>
          </PaperCard>
        )}

        {step === "spiel" && (
          <div className="space-y-4">
            <EnergyGame onErfolg={() => goto("input")} />
            <div className="flex justify-start">
              <button
                onClick={() => setStep("raetselkarte")}
                className="rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                ← Rätselkarte erneut ansehen
              </button>
            </div>
          </div>
        )}

        {step === "input" && (
          <div className="space-y-6">
            <PaperCard rotate={-0.3}>
              <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                Fachlicher Input · Wohnen &amp; Energie
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Wo zuhause Energie versickert
              </h2>
              <p className="mt-3 text-foreground/80">
                Rund 40 % des Schweizer Energieverbrauchs entstehen in Gebäuden.
                Drei Begriffe, die du fürs Hearing brauchst:
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "Effizienzklasse",
                    body: "A+++ Geräte verbrauchen oft nur ein Drittel der Energie alter Modelle. Bei Kühlschrank, Ofen und Boiler lohnt sich der Austausch über die Lebensdauer fast immer.",
                    hint: "Energieetikette: A (sparsam) bis G (Stromfresser).",
                  },
                  {
                    title: "Wärme-Hülle",
                    body: "Heizen ist Posten Nr. 1 im Haushalt. Ein Grad kühler zu heizen bringt sofort viele Energiesparpunkte — ohne einen Franken Investition.",
                    hint: "Faustregel: 1 °C kühler heizen spart ca. 6 % Heizenergie.",
                  },
                  {
                    title: "Verhalten",
                    body: "Kurz duschen, Wäsche aufhängen, Deckel auf den Topf, Eco-Programme wählen — diese Schritte kosten nichts und wirken sofort. Technik allein bringt wenig, wenn die Gewohnheiten nicht passen.",
                    hint: "Verhalten schlägt teure Geräte im Preis-Leistungs-Vergleich.",
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
                onClick={() => setStep("spiel")}
                className="rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                ← Zurück zum Spiel
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

              Etappe 5 · altes Wasserkraftwerk
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              „Komm zum alten Wasserkraftwerk."
            </h2>
            <div className="mt-4 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-5">
              <p className="font-serif italic leading-relaxed">
                Es klickt leise im Flur. Die Abdeckung des alten
                Sicherungskastens springt auf. Darin: eine Schlüsselkarte und
                ein Zettel.
                <br /><br />
                „3'500 Energiesparpunkte — genau der Beweis, den wir brauchen!
                Ich bin jetzt beim alten Wasserkraftwerk am Dorfrand. Marlene
                Vogt, Mitarbeiterin im kantonalen Umweltamt, wartet dort auf
                uns — sie hat Zugang zu den offiziellen Gemeindegutachten und
                hilft mir, die Fehler darin zu belegen. Komm schnell! Die Zeit läuft."
              </p>
              <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                — E.
              </p>
            </div>
            <p className="mt-5 text-sm text-foreground/70">
              In Etappe 5 prüfst du drei Gemeindegutachten und entlarvst die
              fünf falschen Aussagen.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() =>
                  envelope.ask({
                    nr: 5,
                    ort: "Altes Wasserkraftwerk · Etappe 5",
                    etappeLabel: "Etappe 5 · Wasserkraftwerk",
                    onConfirm: () => navigate({ to: "/etappe-5" }),
                  })
                }
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Etappe 5 öffnen →
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

        <p className="mt-12 text-center font-mono-typed text-xs uppercase tracking-[0.2em] text-muted-foreground">
          — Etappe 4 · Elviras Haus —
        </p>
      </div>

      {step === "spiel" && (
        <HintSystem hints={HINTS_004} storageKey="akte-004-hints-start" />
      )}
      {envelope.dialog}
    </main>
  );
}
