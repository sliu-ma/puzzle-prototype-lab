import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { CodeLock } from "@/components/case-file/CodeLock";
import { QRGate } from "@/components/case-file/QRGate";
import { HintSystem, type Hint } from "@/components/case-file/HintSystem";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/akte-002")({
  head: () => ({
    meta: [
      { title: "Akte 002 — Verschwundene Stimmen" },
      {
        name: "description",
        content:
          "Kapitel 2: Wer fehlt im Wald? Sortiere die Tiere, entdecke versteckte Zahlen im Gedicht und folge Mayas Spur weiter.",
      },
    ],
  }),
  component: AkteGated,
});

// QR-Token bewusst nicht im UI sichtbar
const AKTE_002_TOKEN = "Mn7YxQ2pVe9TbR4Ks0Lh";

// Lösung: gefährdete Tiere → 3, 5, 7, 9 → aufsteigend = 3579
const EXPECTED_CODE = "3579";

const HINTS_002: Hint[] = [
  {
    id: 0,
    unlockMin: 3,
    label: "Tipp 1",
    title: "Sortier zuerst die Tiere",
    body: "Lege die sieben Polaroids vor dich. Welche Tiere sind in der Schweiz akut gefährdet? Tipp: Es sind genau vier davon. Drei gelten als ungefährdet.",
  },
  {
    id: 1,
    unlockMin: 6,
    label: "Tipp 2",
    title: "Dreh die Karten um",
    body: "Auf der Rückseite jedes Polaroids siehst du eine Zahl. Lege nur die gefährdeten Tiere mit der Zahlenseite nach oben aufs Gedicht — die Zahlen erscheinen in den Lücken.",
  },
  {
    id: 2,
    unlockMin: 9,
    label: "Auflösung",
    title: "So geht's",
    body: "Gefährdet sind: Feldhase (3), Wiedehopf (5), Geburtshelferkröte (7) und Apollofalter (9). Aufsteigend ergibt das den Code 3 — 5 — 7 — 9.",
  },
];

function AkteGated() {
  return (
    <QRGate
      token={AKTE_002_TOKEN}
      storageKey="akte-002-unlocked"
      title={<>Akte 002 — QR-Code scannen</>}
      description="Akte 002 ist versiegelt. Scanne den beigelegten QR-Code aus deiner Mappe, um Mayas Spur weiterzuverfolgen."
    >
      <AktePage />
    </QRGate>
  );
}

type Step = "voicemail" | "raetselkarte" | "code" | "input" | "naechstes";

const STEPS: { id: Step; label: string }[] = [
  { id: "voicemail", label: "Sprachnachricht" },
  { id: "raetselkarte", label: "Rätselkarte" },
  { id: "code", label: "Code eintippen" },
  { id: "input", label: "Fachlicher Input" },
  { id: "naechstes", label: "Nächstes Rätsel" },
];

function AktePage() {
  const [step, setStep] = useState<Step>("voicemail");
  const [unlockedSteps, setUnlockedSteps] = useState<Set<Step>>(new Set(["voicemail"]));

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
              Akte 002 · Kapitel 2
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Verschwundene Stimmen
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
              Beweis 02 · Sprachnachricht
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Mayas zweite Nachricht
            </h2>
            <p className="mt-1 font-mono-typed text-xs text-muted-foreground">
              [Aufnahme · Donnerstag · 06:11 · 38 Sek.]
            </p>
            <blockquote className="mt-5 border-l-4 border-stamp pl-4 text-[15px] leading-relaxed">
              „Lin — ich war heute Morgen draussen, im Wäldchen hinter dem
              geplanten Kraftwerk. Es ist still. Zu still. Kein Wiedehopf, keine
              Kröte, nichts. Ich hab eine alte Naturschutz-Mappe der Gemeinde
              dabei — Polaroids, ein Gedicht hinten drauf. Schau dir das an."
              <br />
              <br />
              „Sortier die Tiere: Welche sind hier wirklich noch zuhause, welche
              sind verschwunden? Auf den Rückseiten stehen Zahlen. Wenn du nur
              die gefährdeten Tiere umdrehst und aufs Gedicht legst, siehst du
              den Code. Klein nach gross, dann tippst du ihn ein."
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
              🦋 Wer fehlt im Wald?
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  In deiner Mappe
                </p>
                <ul className="mt-2 space-y-1 text-[15px]">
                  <li>· 7 Polaroids von Tieren</li>
                  <li>· 1 Blatt Papier mit Gedicht (Rückseite)</li>
                  <li>· Schere</li>
                </ul>
              </div>
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  Dein Auftrag
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-[15px]">
                  <li>Polaroids ausschneiden.</li>
                  <li>Sortieren: gefährdet ↔ nicht gefährdet.</li>
                  <li>Gefährdete Tiere umdrehen und aufs Gedicht legen.</li>
                  <li>
                    Zahlen ablesen — von der <strong>kleinsten</strong> zur{" "}
                    <strong>grössten</strong>.
                  </li>
                  <li>Code unten eintippen.</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 rounded-sm border border-stamp/30 bg-stamp/5 p-4">
              <p className="font-serif italic leading-relaxed">
                „Vier von sieben Tieren stehen auf der Roten Liste der Schweiz.
                Wenn du sie richtig erkennst, gibt dir das Gedicht den Schlüssel."
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
                onClick={() => goto("code")}
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
              Schloss · 4-stelliger Code
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Was sagt das Gedicht?
            </h2>
            <p className="mt-3 text-[15px] text-foreground/80">
              Lege die gefährdeten Tiere mit der Zahlenseite aufs Gedicht. Tippe
              die vier Zahlen <strong>von der kleinsten zur grössten</strong>{" "}
              ein.
            </p>

            <div className="mt-6">
              <CodeLock expected={EXPECTED_CODE} onUnlock={() => goto("input")} />
            </div>

            <div className="mt-6 flex justify-start">
              <button
                onClick={() => setStep("raetselkarte")}
                className="rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                ← Rätselkarte erneut ansehen
              </button>
            </div>
          </PaperCard>
        )}

        {step === "input" && (
          <div className="space-y-6">
            <PaperCard rotate={-0.3}>
              <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                Mayas Recherche · Biodiversität
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Warum Vielfalt zählt
              </h2>
              <p className="mt-3 text-foreground/80">
                Die Schweiz gehört in Europa zu den Ländern mit dem grössten
                Anteil bedrohter Arten. Drei Begriffe, die Maya immer wieder
                unterstrichen hat:
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
                    body: "Versiegelte Böden, intensive Landwirtschaft und Verkehr zerschneiden Wiesen, Hecken und Feuchtgebiete. Ohne Lebensraum keine Tiere — auch nicht im Wald hinter dem Schulhaus.",
                    hint: "Hecken, Trockenmauern und Tümpel sind echte Biodiversitäts-Hotspots.",
                  },
                  {
                    title: "Vernetzung",
                    body: "Tiere brauchen Wanderkorridore: Grünbrücken, Gewässer, Hecken. Werden Räume durch Strassen oder Kraftwerke getrennt, sterben Populationen lokal aus, auch wenn jede einzelne noch zu retten wäre.",
                    hint: "Stichwort: Wildtierkorridore und Renaturierung.",
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
                onClick={() => setStep("code")}
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
              Kapitel 3 · folgt bald
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Unterwegs — aber wie?
            </h2>
            <div className="mt-4 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-5">
              <p className="font-serif italic leading-relaxed">
                „Wer Lebensräume zerschneidet, baut auch Strassen. Und wer
                Strassen baut, will Autos füllen. Aber wie bewegen wir uns
                eigentlich — und mit welchem Preis für Klima und Biodiversität?"
              </p>
              <p className="mt-3 font-serif italic">
                „Den nächsten Hinweis findest du in der Mappe — dort liegt eine
                gefaltete Karte. Schau, welche Wege sie zeigt."
              </p>
              <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                — M.
              </p>
            </div>
            <p className="mt-5 text-sm text-foreground/70">
              In Kapitel 3 geht es um <strong>Mobilität</strong>: Wege,
              Verkehrsmittel und ihre Folgen für Mensch und Natur.
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
          — Akte 002 · Verschwundene Stimmen —
        </p>
      </div>

      {/* Tipp-System: aktiv ab Rätselkarte bis Code geknackt */}
      {unlockedSteps.has("raetselkarte") && (step === "raetselkarte" || step === "code") && (
        <HintSystem hints={HINTS_002} storageKey="akte-002-hints-start" />
      )}
    </main>
  );
}
