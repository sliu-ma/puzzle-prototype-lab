import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { CodeLock } from "@/components/case-file/CodeLock";
import { QRGate } from "@/components/case-file/QRGate";
import { StageGate } from "@/components/case-file/StageGate";
import { HintSystem, type Hint } from "@/components/case-file/HintSystem";
import { completeStage, getFrozenClock } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useEnvelopePrompt } from "@/components/case-file/EnvelopeDialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/akte-002")({
  head: () => ({
    meta: [
      { title: "Etappe 3 — Wald-Lichtung" },
      {
        name: "description",
        content:
          "Etappe 3: Auf der Lichtung steht Elviras Beobachtungsposten. Sortiere die Tiere und entschlüssele den Code des Zahlenschlosses.",
      },
    ],
  }),
  component: AkteGated,
});

const AKTE_002_TOKEN = "Mn7YxQ2pVe9TbR4Ks0Lh";
const EXPECTED_CODE = "123";

const HINTS_002: Hint[] = [
  {
    id: 0,
    unlockMin: 3,
    label: "Tipp 1",
    title: "Sortier zuerst die Tiere",
    body: "Lege die acht Polaroids vor dich. Welche dieser Tiere sind in der Schweiz bedroht? Tipp: Fünf davon sind in der Schweiz in irgendeiner Form gefährdet, drei sind nicht gefährdet.",
  },
  {
    id: 1,
    unlockMin: 6,
    label: "Tipp 2",
    title: "Dreh die Karten um",
    body: "Hinter einer einzigen Karte verbergen sich gleich alle drei Zahlen des Codes. Such bei den bedrohten Arten weiter.",
  },
  {
    id: 2,
    unlockMin: 9,
    label: "Auflösung",
    title: "So geht's",
    body: "Hinter der Kreuzotter (in der Schweiz stark gefährdet) stehen die Zahlen 1, 2 und 3. Aufsteigend ergibt das den Code 1 — 2 — 3.",
  },
];

function AkteGated() {
  return (
    <StageGate stage={3}>
      <QRGate
        token={AKTE_002_TOKEN}
        storageKey="akte-002-unlocked"
        title={<>Etappe 3 — QR-Code an der Hütte scannen</>}
        description="Diese Etappe ist versiegelt. Scanne den QR-Code an Elviras Beobachtungsposten auf der Lichtung."
        label="Etappe 3 · Versiegelt"
      >
        <AktePage />
      </QRGate>
    </StageGate>
  );
}

type Step = "brief" | "code" | "input" | "naechstes";

const STEPS: { id: Step; label: string }[] = [
  { id: "brief", label: "Beobachtungsbuch" },
  { id: "code", label: "Code eintippen" },
  { id: "input", label: "Fachlicher Input" },
  { id: "naechstes", label: "Nächste Etappe" },
];

function AktePage() {
  const navigate = useNavigate();
  const envelope = useEnvelopePrompt();
  const [step, setStep] = useState<Step>("brief");
  const [unlockedSteps, setUnlockedSteps] = useState<Set<Step>>(new Set(["brief"]));
  const [showCodeHint, setShowCodeHint] = useState(false);

  useEffect(() => {
    if (step === "naechstes") completeStage(3);
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
              Etappe 3 · Wald-Lichtung
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Elviras Beobachtungsposten
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
              Notiz 03 · Beobachtungsposten · Lichtung
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              „Rodung ab Montag."
            </h2>
            <p className="mt-1 font-mono-typed text-xs text-muted-foreground">
              [Aufgeschlagenes Beobachtungsbuch · {getFrozenClock("maya-clock-akte-003")} Uhr]
            </p>
            <blockquote className="mt-5 border-l-4 border-stamp pl-4 text-[15px] leading-relaxed">
              Der Waldweg ist ihr vertraut aber heute sieht er anders aus. Schon
              von Weitem sieht Maja es: rotes Band um die Bäume, ein Schild mit
              der Aufschrift „Baubeginn – Zutritt verboten. Rodung ab Montag."
              Sie bleibt kurz stehen. Montag. Das ist übermorgen.
              <br />
              &nbsp;&nbsp;&nbsp;
              <br />
              Die Hütte steht noch, windschief wie immer. Am alten
              Beobachtungsposten mit dem Fernglas liegen Fotokarten von Tieren,
              die Elvira über Jahrzehnte hier gesichtet hat – daneben ihr
              vollgeschriebenes Beobachtungsbuch. Die letzten Einträge sind
              kürzer geworden. Manche Arten kommen seit Jahren nicht mehr vor.
              <br />
              &nbsp;&nbsp;&nbsp;
              <br />
              Auf der aufgeschlagenen Seite steht in eiliger Handschrift:
              „Manche dieser Tiere sind hier noch sicher andere stehen kurz vor
              dem Verschwinden. Trenne die gefährdeten von den nicht gefährdeten
              Arten, um meinen Code zu entschlüsseln."
            </blockquote>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCodeHint(true)}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Code eintippen →
              </button>
            </div>
          </PaperCard>
        )}


        {step === "code" && (
          <PaperCard rotate={-0.2} tape="top-right">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Zahlenschloss · Ausrüstungskiste
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Findest du den Code?
            </h2>
            <p className="mt-3 text-[15px] text-foreground/80">
              Tippe die drei Zahlen <strong>von der kleinsten zur grössten</strong>{" "}
              ein.
            </p>

            <div className="mt-6">
              <CodeLock expected={EXPECTED_CODE} onUnlock={() => goto("input")} />
            </div>

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

        {step === "input" && (
          <div className="space-y-6">
            <PaperCard rotate={-0.3}>
              <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                Fachlicher Input · Biodiversität
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Warum Vielfalt zählt
              </h2>
              <p className="mt-3 text-foreground/80">
                Die Schweiz gehört in Europa zu den Ländern mit dem grössten
                Anteil bedrohter Arten. Drei Begriffe, die du für den Rat brauchst:
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "Rote Liste",
                    body: "Eine offizielle Übersicht der gefährdeten Tier- und Pflanzenarten der Schweiz. Rund ein Drittel aller untersuchten Arten gilt heute als bedroht — vom Feldhasen bis zum Apollofalter.",
                    hint: "Quelle: BAFU – Bundesamt für Umwelt.",
                  },
                  {
                    title: "Lebensraum",
                    body: "Versiegelte Böden, intensive Landwirtschaft und Verkehr zerschneiden Wiesen, Hecken und Feuchtgebiete. Ohne Lebensraum keine Tiere — auch nicht auf der Lichtung hinter dem Dorf.",
                    hint: "Hecken, Trockenmauern und Tümpel sind echte Biodiversitäts-Hotspots.",
                  },
                  {
                    title: "Vernetzung",
                    body: "Tiere brauchen Wanderkorridore: Grünbrücken, Gewässer, Hecken. Werden Räume durch Strassen oder Kraftwerke getrennt, sterben Populationen lokal aus, auch wenn jede einzelne noch zu retten wäre.",
                    hint: "Stichwort: Wildtierkorridore und Renaturierung.",
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
                onClick={() => setStep("code")}
                className="rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                ← Zurück
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

              Etappe 4 · Elviras Haus
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              „Geh zurück ins Haus."
            </h2>
            <div className="mt-4 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-5">
              <p className="font-serif italic leading-relaxed">
                In der Ausrüstungskiste findest du keine Forschungsausrüstung,
                sondern eine Mappe mit alten Strom- und Heizrechnungen. Ein
                Zettel obenauf:
                <br /><br />
                „Um diesen Ort zu bewahren, müssen wir das Problem an der Wurzel
                packen — und das beginnt bei uns zuhause. Ich habe im Haus
                Vorbereitungen getroffen. Nimm die Rechnungen mit und schau dir
                die Räume ganz genau an."
              </p>
              <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                — E.
              </p>
            </div>
            <p className="mt-5 text-sm text-foreground/70">
              Du wirfst einen letzten Blick auf das Bauschild, greifst die
              Mappe — und rennst los.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() =>
                  envelope.ask({
                    nr: 4,
                    ort: "Elviras Haus · Etappe 4",
                    etappeLabel: "Etappe 4 · Elviras Haus",
                    onConfirm: () => navigate({ to: "/akte-004" }),
                  })
                }
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Etappe 4 öffnen →
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
          — Etappe 3 · Wald-Lichtung —
        </p>
      </div>

      {step === "code" && (
        <HintSystem hints={HINTS_002} storageKey="akte-002-hints-start" />
      )}

      <Dialog open={showCodeHint} onOpenChange={setShowCodeHint}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recherche-Tipp</DialogTitle>
            <DialogDescription>
              Falls du dir nicht sicher bist, ob ein Tier in der Schweiz
              gefährdet ist: Recherchiere im Internet. Das hilft dir, die
              Polaroids richtig zuzuordnen.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex justify-center">
            <button
              onClick={() => {
                setShowCodeHint(false);
                goto("code");
              }}
              className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              Zum Zahlenschloss →
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {envelope.dialog}
    </main>
  );
}
