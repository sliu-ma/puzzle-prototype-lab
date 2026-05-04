import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { GruenerMarkt } from "@/components/case-file/GruenerMarkt";
import { QRGate } from "@/components/case-file/QRGate";
import { HintSystem } from "@/components/case-file/HintSystem";
import { REZEPT, START_WARENKORB } from "@/lib/maya-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/akte")({
  head: () => ({
    meta: [
      { title: "Akte 001 — Wo ist Maya?" },
      {
        name: "description",
        content:
          "Kapitel 1: Maya ist verschwunden. Folge ihren Spuren durch den Grünen Markt und lerne, was nachhaltiger Einkauf wirklich bedeutet.",
      },
    ],
  }),
  component: AkteGated,
});

function AkteGated() {
  return (
    <QRGate>
      <AktePage />
    </QRGate>
  );
}

type Step = "voicemail" | "raetselkarte" | "shop" | "input" | "naechstes";

const STEPS: { id: Step; label: string }[] = [
  { id: "voicemail", label: "Sprachnachricht" },
  { id: "raetselkarte", label: "Rätselkarte" },
  { id: "shop", label: "Grüner Markt" },
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
              Akte 001 · Kapitel 1
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Der Einkauf
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

        {/* Steps */}
        {step === "voicemail" && (
          <PaperCard rotate={-0.4}>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Beweis 01 · Sprachnachricht
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Mayas letzte Nachricht an Lin
            </h2>
            <p className="mt-1 font-mono-typed text-xs text-muted-foreground">
              [Aufnahme · Mittwoch · 14:32 · 47 Sek.]
            </p>
            <blockquote className="mt-5 border-l-4 border-stamp pl-4 text-[15px] leading-relaxed">
              „Lin, hör mal — ich glaub, ich hab's. Du weißt, was sie uns über dieses
              Gaskraftwerk erzählen, dass es ja so super grün und regional ist? Einer der
              Investoren betreibt eine ganze Supermarkt-Kette und schreibt sich
              ‚nachhaltig' auf die Werbung. Ich war eben auf seiner Online-Plattform.
              Der Einkaufswagen, den ich da gesehen hab, war alles andere als das."
              <br />
              <br />
              „Ich hab dir den Link geschickt. Auf dem Bildschirm liegt ein Rezept und ein
              halb-fertiger Warenkorb. Schau dir das mal genau an — und mach es richtig.
              Wenn du kapierst, wo der Haken ist, kommst du an die nächste Spur."
              <br />
              <br />
              „Bis gleich. Ich fahr noch zur Redaktion."
            </blockquote>
            <p className="mt-4 text-sm text-foreground/60">
              <strong>Maya kam nie in der Redaktion an.</strong>
            </p>
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
              {REZEPT.emoji} {REZEPT.titel}
            </h2>
            <p className="mt-3 text-sm font-mono-typed uppercase tracking-wider text-muted-foreground">
              Zutaten:
            </p>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {REZEPT.zutaten.map((z) => (
                <li key={z} className="text-[15px]">
                  • {z}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-sm border border-stamp/30 bg-stamp/5 p-4">
              <p className="font-serif italic leading-relaxed">
                „Du möchtest gerade bezahlen — aber irgendetwas stimmt mit dem Warenkorb
                nicht. Deine Aufgabe: Entferne die problematischen Produkte und ersetze
                sie durch nachhaltige Alternativen. Erst dann kommst du weiter."
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
                onClick={() => goto("shop")}
                className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Verstanden — zum Shop →
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
                Mayas Recherche · 3 Lernkarten
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Was heißt eigentlich „nachhaltig einkaufen"?
              </h2>
              <p className="mt-3 text-foreground/80">
                Drei Begriffe, die Maya immer wieder unterstrichen hat — und die du
                gerade im Shop angewendet hast:
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "Saisonal",
                    body: "Obst und Gemüse, das gerade in der Schweiz wächst und geerntet werden kann. Wer im März Erdbeeren kauft, kauft Ware aus dem Süden oder beheizten Tunneln — viel Energie für wenig Geschmack.",
                    hint: "Im März in CH in Saison: Äpfel, Lauch, Karotten, Feldsalat …",
                  },
                  {
                    title: "Regional",
                    body: "Lebensmittel aus deiner Umgebung — meist 50–100 km. Kurzer Transport, frischer, oft kleinere Höfe. Achtung: „Aus der Schweiz“ ist nicht automatisch regional. Region heißt: aus deiner Gegend.",
                    hint: "Bio Suisse & IP-Suisse stehen für Schweizer Herkunft mit klaren Standards.",
                  },
                  {
                    title: "Tiergerecht & Bio",
                    body: "Bio-Freilandhaltung garantiert Auslauf und Bio-Futter — Bodenhaltung nicht. Importeier reisen oft über tausende Kilometer. Hinter günstigen Preisen stehen meist enge Ställe und industrielle Logistik.",
                    hint: "Schweizer Bio-Eier sind teurer, halten aber, was die Werbung verspricht.",
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
                onClick={() => setStep("shop")}
                className="rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                ← Zurück zum Shop
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
              Kapitel 2 · folgt bald
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Die Geldspur
            </h2>
            <div className="mt-4 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-5">
              <p className="font-serif italic leading-relaxed">
                „Wer ‚regional und nachhaltig' auf seine Werbung schreibt, aber so
                einkaufen lässt — der hat ein Problem mit der Wahrheit. Genau wie bei
                dem Gaskraftwerk."
              </p>
              <p className="mt-3 font-serif italic">
                „Auf dem Foto, das ich gefunden hab, sieht man, wer wirklich
                dahintersteckt. Es liegt im zweiten Umschlag, in der Redaktion. Wenn
                du das hier liest, Lin — du weißt, wo."
              </p>
              <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                — M.
              </p>
            </div>
            <p className="mt-5 text-sm text-foreground/70">
              In Kapitel 2 folgst du Mayas Spur in die Redaktion und entwirrst, wer
              die Investoren des Gaskraftwerks wirklich sind.
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
          — Akte 001 · Wo ist Maya? —
        </p>
      </div>
    </main>
  );
}
