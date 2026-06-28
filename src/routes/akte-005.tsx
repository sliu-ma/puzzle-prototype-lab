import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { QRGate } from "@/components/case-file/QRGate";
import { StageGate } from "@/components/case-file/StageGate";
import { GutachtenRaetsel } from "@/components/case-file/GutachtenRaetsel";
import { completeStage } from "@/lib/progress";
import { STORY } from "@/lib/story-beats";
import { EtappenStory } from "@/components/story/EtappenStory";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/akte-005")({
  head: () => ({
    meta: [
      { title: "Etappe 5 — Altes Wasserkraftwerk" },
      {
        name: "description",
        content:
          "Etappe 5: Marlene Vogt vom Umweltamt zeigt dir drei Gutachten. Finde die fünf falschen Aussagen, bevor um 19:00 Uhr abgestimmt wird.",
      },
    ],
  }),
  component: AkteGated,
});

const AKTE_005_TOKEN = "Eg9LkRq2VhYbP4Mn7TcW";

function AkteGated() {
  return (
    <StageGate stage={5}>
      <QRGate
        token={AKTE_005_TOKEN}
        storageKey="akte-005-unlocked"
        title={<>Etappe 5 — QR-Code am Wasserkraftwerk scannen</>}
        description="Letzte Etappe vor dem Hearing. Scanne den QR-Code am Tor des alten Wasserkraftwerks."
      >
        <AktePage />
      </QRGate>
    </StageGate>
  );
}

type Step = "brief" | "raetselkarte" | "spiel" | "input" | "naechstes";

const STEPS: { id: Step; label: string }[] = [
  { id: "brief", label: "Treffen" },
  { id: "raetselkarte", label: "Rätselkarte" },
  { id: "spiel", label: "Gutachten prüfen" },
  { id: "input", label: "Fachlicher Input" },
  { id: "naechstes", label: "Zum Hearing" },
];

function AktePage() {
  const [step, setStep] = useState<Step>("brief");
  const [unlockedSteps, setUnlockedSteps] = useState<Set<Step>>(new Set(["brief"]));

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
              [Altes Wasserkraftwerk · 18:24 Uhr]
            </p>
            <blockquote className="mt-5 border-l-4 border-stamp pl-4 text-[15px] leading-relaxed">
              Du schleichst in den staubigen Abstellraum des alten
              Wasserkraftwerks. Zwischen hohen Aktenregalen tritt eine Frau
              hervor: <strong>Marlene Vogt</strong>, Mitarbeiterin im kantonalen
              Umweltamt — ruhig, aber bestimmt.
              <br />
              <br />
              „Schön, dass du da bist. Der Gemeinderat steht unter enormem
              Zeitdruck und muss heute Abend entscheiden. Leider haben sie sich
              dabei auf fehlerhafte Gutachten gestützt." Sie hält ein Dokument
              hoch. „Drei Gutachten liegen vor — zu Solarenergie, Gaskraft und
              Kohle. <strong>Fünf Aussagen darin sind nachweislich falsch.</strong>{" "}
              Erst wenn alle fünf richtig markiert sind, können wir die Fehler
              rechtzeitig aufdecken — und das Gaskraftwerk auf der Waldlichtung
              verhindern."
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
              Rätselkarte · Auftrag von Marlene
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Finde die 5 Lügen
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Was du hast</p>
                <ul className="mt-2 space-y-1 text-[15px]">
                  <li>· 3 Gutachten (A, B, C)</li>
                  <li>· je 1 Diagramm pro Gutachten</li>
                  <li>· grüne Faktenkarte mit Vergleichswerten</li>
                </ul>
              </div>
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Dein Auftrag</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-[15px]">
                  <li>Wechsle zwischen den drei Gutachten.</li>
                  <li>Tippe verdächtige Sätze an.</li>
                  <li>Vergleiche mit Diagramm + Faktenkarte.</li>
                  <li>Markiere genau 5 falsche Aussagen.</li>
                  <li>Tippe auf „Prüfen".</li>
                </ol>
              </div>
            </div>
            <div className="mt-6 rounded-sm border border-stamp/30 bg-stamp/5 p-4">
              <p className="font-serif italic leading-relaxed">
                „Schau auf Zahlen, nicht auf Adjektive. ‚Nahezu klimaneutral'
                ist kein Wert — 95 g CO₂/kWh schon."
              </p>
              <p className="mt-2 font-mono-typed text-[11px] uppercase tracking-wider text-stamp">— M. Vogt</p>
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
                Gutachten öffnen →
              </button>
            </div>
          </PaperCard>
        )}

        {step === "spiel" && (
          <div className="space-y-4">
            <GutachtenRaetsel onErfolg={() => goto("input")} />
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
                Fachlicher Input · Energieträger
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Was wirklich nachhaltig ist
              </h2>
              <p className="mt-3 text-foreground/80">
                Drei Begriffe, an denen du jede Energiestudie messen kannst —
                und an denen das Hearing entschieden wird:
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "CO₂ pro kWh",
                    body: "Erdgas liegt real bei ca. 400 g/kWh, Steinkohle bei 820 g, Photovoltaik im Betrieb bei 0 g. Wer mit 95 g/kWh für Gas wirbt, schummelt um den Faktor 4.",
                    hint: "Quelle: BAFU, BFE 2024.",
                  },
                  {
                    title: "Wirkungsgrad",
                    body: "Moderne Kohlekraftwerke kommen real auf 43–46 %, GuD-Erdgas auf rund 60 %, Wind und PV liegen darunter — produzieren aber ohne Brennstoff. Mehr als 70 % bei Kohle gibt es nicht.",
                    hint: "Wirkungsgrad ≠ Nachhaltigkeit. Auch ein effizienter Kohleblock bleibt fossil.",
                  },
                  {
                    title: "Versorgungssicherheit",
                    body: "PV + Wind brauchen Speicher und Netz, sind aber kombinierbar. Fossile Anlagen wirken stabil, hängen aber an Importen und Weltmarktpreisen. Die Mischung entscheidet — nicht ein einzelner Träger.",
                    hint: "Stichworte: Speicher, Sektorenkopplung, Stromnetz.",
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
                ← Zurück
              </button>
              <button
                onClick={() => goto("naechstes")}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Zum Hearing →
              </button>
            </div>
          </div>
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

      <EtappenStory
        arc={STORY.energie}
        sessionKey="story-seen-akte-005"
        successOn={unlockedSteps.has("input")}
      />
    </main>
  );
}
