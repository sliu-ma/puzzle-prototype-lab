import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { QRGate } from "@/components/case-file/QRGate";
import { GutachtenRaetsel } from "@/components/case-file/GutachtenRaetsel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/akte-005")({
  head: () => ({
    meta: [
      { title: "Akte 005 — Die gefälschten Gutachten" },
      {
        name: "description",
        content:
          "Kapitel 5: Drei Gutachten zur Energieversorgung. Finde die fünf Lügen, bevor die Bagger anrollen.",
      },
    ],
  }),
  component: AkteGated,
});

const AKTE_005_TOKEN = "Eg9LkRq2VhYbP4Mn7TcW";

function AkteGated() {
  return (
    <QRGate
      token={AKTE_005_TOKEN}
      storageKey="akte-005-unlocked"
      title={<>Akte 005 — QR-Code scannen</>}
      description="Akte 005 ist versiegelt. Scanne den letzten QR-Code aus deiner Mappe."
    >
      <AktePage />
    </QRGate>
  );
}

type Step = "voicemail" | "raetselkarte" | "spiel" | "input" | "naechstes";

const STEPS: { id: Step; label: string }[] = [
  { id: "voicemail", label: "Sprachnachricht" },
  { id: "raetselkarte", label: "Rätselkarte" },
  { id: "spiel", label: "Gutachten prüfen" },
  { id: "input", label: "Fachlicher Input" },
  { id: "naechstes", label: "Auflösung" },
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
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4 sm:mb-8 sm:pb-5">
          <div className="min-w-0">
            <Link
              to="/"
              className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground sm:text-[11px]"
            >
              ← Aktenmappe schließen
            </Link>
            <h1 className="mt-1.5 font-serif text-2xl font-bold leading-tight sm:mt-2 sm:text-5xl">
              Akte 005 · Kapitel 5
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Die gefälschten Gutachten
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

        {step === "voicemail" && (
          <PaperCard rotate={-0.4}>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Beweis 05 · Sprachnachricht
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Mayas letzte Nachricht
            </h2>
            <p className="mt-1 font-mono-typed text-xs text-muted-foreground">
              [Aufnahme · Sonntag · 23:58 · 56 Sek.]
            </p>
            <blockquote className="mt-5 border-l-4 border-stamp pl-4 text-[15px] leading-relaxed">
              „Lin — wenn du das hörst, hab ich es entweder geschafft, oder
              sie haben mich. Marlene Vogt, die fünfte im Bunde, war
              Praktikantin im Umweltamt. Sie hat mir <strong>drei
              Gutachten</strong> zugespielt — alle zur Energieversorgung
              Lindentals: Erdgas, Kohle, Bürger-Solarpark."
              <br />
              <br />
              „In den Texten stecken genau <strong>fünf falsche Aussagen</strong>.
              Vergleiche jeden Satz mit dem Diagramm und der grünen
              Faktenkarte. Markier nur die, die echt nicht stimmen können.
              Erst wenn alle fünf richtig sind, hast du die Wahrheit."
              <br />
              <br />
              „Das Konsortium heisst nicht zufällig ‚Helvetia Energie AG'.
              Vetterli, Brönnimann, Tissot, Schweri — und der Fünfte,
              der ganz oben sitzt: <strong>Dr. Helmut Lindner</strong>,
              Verwaltungsrats-Präsident. Hol ihn dir."
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
              📑 Finde die 5 Lügen
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">In deiner Mappe</p>
                <ul className="mt-2 space-y-1 text-[15px]">
                  <li>· 3 Gutachten (A, B, C)</li>
                  <li>· je 1 Diagramm pro Gutachten</li>
                  <li>· grüne Faktenkarte mit Vergleichswerten</li>
                </ul>
              </div>
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Dein Auftrag</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-[15px]">
                  <li>Wechsle zwischen den drei Akten.</li>
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
              <p className="mt-2 font-mono-typed text-[11px] uppercase tracking-wider text-stamp">— M.</p>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep("voicemail")}
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
                Mayas Recherche · Energieträger
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Was wirklich nachhaltig ist
              </h2>
              <p className="mt-3 text-foreground/80">
                Drei Begriffe, an denen man jede Energiestudie messen kann:
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
                Auflösung →
              </button>
            </div>
          </div>
        )}

        {step === "naechstes" && (
          <PaperCard rotate={-0.5} tape="top-left">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Auflösung · Akte geschlossen
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Die Wahrheit ist ein Schlüssel.
            </h2>
            <div className="mt-4 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-5">
              <p className="font-serif italic leading-relaxed">
                „Du hast alle fünf Lügen gefunden. Erdgas ist nicht klimaneutral.
                Kohle ist nicht erneuerbar und nicht 78 % effizient. PV erreicht
                in Lindental nicht 250, sondern 1'000 Volllaststunden — und ein
                Bürger-Solarpark mit Speicher ist sehr wohl umsetzbar."
              </p>
              <p className="mt-3 font-serif italic">
                „Lin: jetzt sind die Akten vollständig. Bring sie zur Redaktion.
                Wenn ich nicht zurückkomme, weisst du, was zu tun ist."
              </p>
              <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">— M.</p>
            </div>
            <p className="mt-5 text-center font-serif text-3xl tracking-[0.4em] text-stamp sm:text-5xl">
              WAHRHEIT
            </p>
            <p className="mt-4 text-center text-sm text-foreground/70">
              Du hast Mayas fünf Akten gelöst. Das Konsortium ist enttarnt.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <span className="stamp-mark inline-block px-3 py-1 text-xs">Fall abgeschlossen</span>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-5 py-2.5 font-serif text-sm font-semibold transition-colors hover:bg-secondary"
              >
                ← Aktenmappe schließen
              </Link>
            </div>
          </PaperCard>
        )}

        <p className="mt-12 text-center font-mono-typed text-xs uppercase tracking-[0.2em] text-muted-foreground">
          — Akte 005 · Die gefälschten Gutachten —
        </p>
      </div>
    </main>
  );
}
