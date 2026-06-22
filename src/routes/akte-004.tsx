import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { QRGate } from "@/components/case-file/QRGate";
import { EnergyGame } from "@/components/case-file/EnergyGame";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/akte-004")({
  head: () => ({
    meta: [
      { title: "Akte 004 — Das gläserne Haus" },
      {
        name: "description",
        content:
          "Kapitel 4: Maya zeigt dir Vetterlis Show-Villa. Plane das Haus mit knappem Budget so um, dass es wirklich Energie spart.",
      },
    ],
  }),
  component: AkteGated,
});

const AKTE_004_TOKEN = "Wb6Vc4Hn1ZqYpMr8Js3F";

function AkteGated() {
  return (
    <QRGate
      token={AKTE_004_TOKEN}
      storageKey="akte-004-unlocked"
      title={<>Akte 004 — QR-Code scannen</>}
      description="Akte 004 ist versiegelt. Scanne den beigelegten QR-Code aus deiner Mappe, um Mayas Spur weiterzuverfolgen."
    >
      <AktePage />
    </QRGate>
  );
}

type Step = "voicemail" | "raetselkarte" | "spiel" | "input" | "naechstes";

const STEPS: { id: Step; label: string }[] = [
  { id: "voicemail", label: "Sprachnachricht" },
  { id: "raetselkarte", label: "Rätselkarte" },
  { id: "spiel", label: "Haus planen" },
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
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4 sm:mb-8 sm:pb-5">
          <div className="min-w-0">
            <Link
              to="/"
              className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground sm:text-[11px]"
            >
              ← Aktenmappe schließen
            </Link>
            <h1 className="mt-1.5 font-serif text-2xl font-bold leading-tight sm:mt-2 sm:text-5xl">
              Akte 004 · Kapitel 4
            </h1>
            <p className="mt-0.5 font-serif italic text-sm text-foreground/70 sm:text-base">
              Das gläserne Haus
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
              Beweis 04 · Sprachnachricht
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Mayas vierte Nachricht
            </h2>
            <p className="mt-1 font-mono-typed text-xs text-muted-foreground">
              [Aufnahme · Samstag · 18:09 · 41 Sek.]
            </p>
            <blockquote className="mt-5 border-l-4 border-stamp pl-4 text-[15px] leading-relaxed">
              „Lin — Investor Nr. 4 heisst <strong>Beat Schweri</strong>, CEO der
              ‚NeuBau Helvetia AG'. Er baut Show-Villen im Mittelland und
              wirbt mit Schweizer Minergie-Standard. Vorhin war ich in einem
              davon, in Lindental: viel Glas, smart, ‚vollständig vernetzt'.
              Schau dir die Räume an."
              <br />
              <br />
              „In jedem Raum stecken Geräte oder Gewohnheiten, die viel mehr
              Strom fressen, als die Hochglanzbroschüre zugibt. Du hast{" "}
              <strong>1'500.– CHF</strong> Investitions-Budget. Dein Auftrag:
              hol mindestens <strong>8'000 kWh</strong> pro Jahr Ersparnis
              raus — sonst hat Schweri recht und wir nicht."
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
              🏠 Plane die Show-Villa um
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-sm border border-border bg-paper p-4">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  Was du hast
                </p>
                <ul className="mt-2 space-y-1 text-[15px]">
                  <li>· 10 Räume und Geräte</li>
                  <li>· 1'500.– CHF Budget</li>
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
                  <li>Erreiche mind. 8'000 kWh Ersparnis.</li>
                </ol>
              </div>
            </div>
            <div className="mt-6 rounded-sm border border-stamp/30 bg-stamp/5 p-4">
              <p className="font-serif italic leading-relaxed">
                „Nicht jedes Upgrade lohnt sich. Manchmal ist die billigste
                Gewohnheit die wirksamste."
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
                Mayas Recherche · Wohnen &amp; Energie
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                Wo zuhause Energie versickert
              </h2>
              <p className="mt-3 text-foreground/80">
                Rund 40 % des Schweizer Energieverbrauchs entstehen in Gebäuden.
                Drei Begriffe, die Maya unterstrichen hat:
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
                    body: "Heizen ist Posten Nr. 1 im Haushalt. 3-fach-Verglasung, Stosslüften statt Kippen und eine Wärmepumpe statt Öl sparen mehr als jedes neue Gerät.",
                    hint: "Faustregel: zuerst dämmen, dann Heizung tauschen.",
                  },
                  {
                    title: "Verhalten",
                    body: "Kurz duschen, Standby abschalten, Wasser zudrehen — diese Schritte kosten nichts und wirken sofort. Technik allein bringt wenig, wenn die Gewohnheiten nicht passen.",
                    hint: "1 °C kühler heizen spart ca. 6 % Heizenergie.",
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
                Zum nächsten Rätsel →
              </button>
            </div>
          </div>
        )}

        {step === "naechstes" && (
          <PaperCard rotate={-0.5} tape="top-left">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Kapitel 5 · der letzte Umschlag
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Die gefälschten Gutachten
            </h2>
            <div className="mt-4 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-5">
              <p className="font-serif italic leading-relaxed">
                „Lin, jetzt der fünfte und letzte Investor:{" "}
                <strong>Marlene Vogt war einmal Praktikantin im Umweltamt</strong> —
                heute ist sie die anonyme Quelle, die mir drei Gutachten zur
                Energieversorgung zugespielt hat. Eines empfiehlt Gas, eines
                Kohle, eines Solar."
              </p>
              <p className="mt-3 font-serif italic">
                „In den Texten stecken genau <em>fünf Lügen</em>. Wenn du sie
                findest, hast du den Beweis, dass das Konsortium die Gemeinde
                belügt. Öffne den letzten Umschlag."
              </p>
              <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                — M.
              </p>
            </div>
            <p className="mt-5 text-sm text-foreground/70">
              In Kapitel 5 entlarvst du fünf falsche Aussagen in drei Energie-Gutachten.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Link
                to="/akte-005"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Akte 005 öffnen →
              </Link>
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
          — Akte 004 · Das gläserne Haus —
        </p>
      </div>
    </main>
  );
}
