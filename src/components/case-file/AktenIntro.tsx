import { useEffect, useState } from "react";
import { ArrowRight, SkipForward, QrCode, Puzzle, Footprints, Lightbulb } from "lucide-react";
import { Stamp } from "./Stamp";
import { Polaroid } from "./Polaroid";
import { cn } from "@/lib/utils";

interface Props {
  onComplete: () => void;
}

const BEAT_COUNT = 5;
const AUTO_MS = [3800, 6500, 4500, 4500, 0]; // letzter Beat wartet auf Klick

export function AktenIntro({ onComplete }: Props) {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const ms = AUTO_MS[beat];
    if (!ms) return;
    const t = setTimeout(() => setBeat((b) => Math.min(b + 1, BEAT_COUNT - 1)), ms);
    return () => clearTimeout(t);
  }, [beat]);

  const next = () => {
    if (beat < BEAT_COUNT - 1) setBeat(beat + 1);
    else onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden animate-vignette-in"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, oklch(0.16 0.02 60) 0%, oklch(0.08 0.01 60) 100%)",
      }}
    >
      {/* Paper grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-paper) 0, var(--color-paper) 1px, transparent 1px, transparent 28px)",
        }}
      />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-4 py-3">
        <div className="flex gap-1.5">
          {Array.from({ length: BEAT_COUNT }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 w-6 rounded-full transition-all duration-300",
                i <= beat ? "bg-paper" : "bg-paper/25",
              )}
            />
          ))}
        </div>
        <button
          onClick={onComplete}
          className="inline-flex items-center gap-1.5 rounded-sm border border-paper/30 bg-paper/5 px-3 py-1.5 font-mono-typed text-[10px] uppercase tracking-wider text-paper/80 hover:bg-paper/10"
        >
          <SkipForward className="h-3 w-3" /> Überspringen
        </button>
      </div>

      {/* Beat content */}
      <div className="relative flex flex-1 items-center justify-center px-4 pb-24">
        <div key={beat} className="w-full max-w-xl">
          {beat === 0 && <BeatStempel />}
          {beat === 1 && <BeatBrief />}
          {beat === 2 && <BeatMaja />}
          {beat === 3 && <BeatElvira />}
          {beat === 4 && <BeatErklaerung />}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-paper/15 bg-ink/40 px-4 py-3 backdrop-blur">
        <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-paper/60">
          Briefing · {beat + 1} / {BEAT_COUNT}
        </p>
        <button
          onClick={next}
          className="inline-flex items-center gap-2 rounded-sm bg-stamp px-5 py-2.5 font-serif text-sm font-semibold text-paper transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          {beat < BEAT_COUNT - 1 ? "Weiter" : "Etappe 1 öffnen"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* -------------------- Beats -------------------- */

function BeatStempel() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="animate-stamp-slam">
        <div className="border-4 border-stamp px-6 py-4">
          <p className="font-mono-typed text-xs font-bold uppercase tracking-[0.4em] text-stamp">
            Vertraulich
          </p>
          <p className="font-serif text-4xl font-black uppercase tracking-wider text-stamp sm:text-5xl">
            Grünwald
          </p>
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.3em] text-stamp/80">
            Akte 001 – 005
          </p>
        </div>
      </div>
      <p className="mt-8 font-mono-typed text-xs uppercase tracking-[0.3em] text-paper/80">
        <span className="typewriter">Samstag · 14:12 Uhr</span>
      </p>
    </div>
  );
}

function BeatBrief() {
  return (
    <div className="animate-paper-drop">
      <div
        className="paper-card paper-card-lift rounded-sm bg-card p-6 sm:p-8"
        style={{ transform: "rotate(-1.2deg)" }}
      >
        <span
          aria-hidden
          className="tape absolute -top-2 left-1/2 h-5 w-24 -translate-x-1/2 rounded-[2px]"
        />
        <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
          Brief auf dem Küchentisch
        </p>
        <h2 className="mt-2 font-serif text-2xl font-bold leading-tight sm:text-3xl">
          Tante Elvira ist weg.
        </h2>
        <div className="mt-4 space-y-2 font-serif text-[15px] leading-relaxed text-foreground/85">
          <p className="typewriter" style={{ animationDuration: "1.2s" }}>
            Das Haus ist leer. Der Tee noch warm.
          </p>
          <p
            className="typewriter"
            style={{ animationDuration: "1.6s", animationDelay: "1.3s", animationFillMode: "both" }}
          >
            Auf dem Tisch: ein Brief.
          </p>
          <p
            className="typewriter"
            style={{ animationDuration: "2.4s", animationDelay: "3.0s", animationFillMode: "both" }}
          >
            Heute Abend, 19:00 Uhr —{" "}
            <span className="ink-underline font-bold text-stamp">Gaskraftwerk</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

function BeatMaja() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <Polaroid
        initial="M"
        caption="Maja, 17"
        subline="Eure Spielfigur"
        color="sky"
        rotate={-4}
        className="animate-paper-drop"
      />
      <p className="max-w-sm font-serif text-base leading-relaxed text-paper/90">
        Ihr seht, was Maja sieht. Ihr entscheidet, was sie tut.
        Sie ist neu in Grünwald — und sie hat nur euch.
      </p>
    </div>
  );
}

function BeatElvira() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <Polaroid
        initial="E"
        caption="Elvira, 71"
        subline="Verschwunden · Grosstante"
        color="emerald"
        rotate={3}
        className="animate-paper-drop"
      />
      <p className="max-w-sm font-serif text-base leading-relaxed text-paper/90">
        Sie hat <strong className="text-paper">fünf Hinweise</strong> im Dorf hinterlegt —
        an jedem Ort eine andere Frage zur Ökologie.
        Findet sie, bevor um 19:00 abgestimmt wird.
      </p>
    </div>
  );
}

function BeatErklaerung() {
  const steps = [
    { icon: QrCode, title: "QR scannen", text: "Auf jeder Posten-Karte versteckt." },
    { icon: Puzzle, title: "Rätsel lösen", text: "Im Team. Tipps nach 3 / 6 / 9 Minuten." },
    { icon: Footprints, title: "Weiter zum nächsten Ort", text: "Linear: Etappe 1 bis 5, dann das Hearing." },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-center font-serif text-2xl font-bold text-paper sm:text-3xl">
        So spielt ihr.
      </h2>
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="paper-card flex items-start gap-3 rounded-sm bg-card p-4 animate-paper-drop"
            style={{ animationDelay: `${i * 180}ms`, animationFillMode: "both" }}
          >
            <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-stamp" />
            <div>
              <p className="font-serif text-base font-bold">{s.title}</p>
              <p className="text-sm text-foreground/75">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div
        className="flex items-start gap-2 rounded-sm border border-paper/20 bg-paper/5 p-3 animate-paper-drop"
        style={{ animationDelay: "600ms", animationFillMode: "both" }}
      >
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <p className="font-serif text-sm text-paper/90">
          Bereit? Die Uhr läuft, sobald ihr die erste Akte öffnet.
        </p>
      </div>
    </div>
  );
}
