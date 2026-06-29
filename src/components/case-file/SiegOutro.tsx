import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { RefreshCw, ArrowRight, Newspaper, Gavel } from "lucide-react";
import { Polaroid } from "./Polaroid";
import { cn } from "@/lib/utils";

interface Props {
  teamName: string;
  barometer: number;
  total: number;
  correct: number;
  fehler: number;
  onRestart: () => void;
}

const BEATS = 5;
const AUTO_MS = [2200, 3800, 3800, 4200, 0];

export function SiegOutro({
  teamName,
  barometer,
  total,
  correct,
  fehler,
  onRestart,
}: Props) {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const ms = AUTO_MS[beat];
    if (!ms) return;
    const t = setTimeout(() => setBeat((b) => Math.min(b + 1, BEATS - 1)), ms);
    return () => clearTimeout(t);
  }, [beat]);

  return (
    <div className="relative overflow-hidden rounded-sm border border-border bg-ink/95 p-6 sm:p-10">
      {/* progress dots */}
      <div className="mb-6 flex justify-center gap-1.5">
        {Array.from({ length: BEATS }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 w-6 rounded-full transition-all",
              i <= beat ? "bg-paper" : "bg-paper/20",
            )}
          />
        ))}
      </div>

      <div className="relative min-h-[360px]">
        {beat === 0 && <OutroHammer />}
        {beat === 1 && <OutroSchlagzeile />}
        {beat === 2 && <OutroElvira />}
        {beat === 3 && (
          <OutroBilanz
            teamName={teamName}
            barometer={barometer}
            total={total}
            correct={correct}
            fehler={fehler}
          />
        )}
        {beat === 4 && <OutroAbspann onRestart={onRestart} />}
      </div>

      {beat < BEATS - 1 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setBeat((b) => Math.min(b + 1, BEATS - 1))}
            className="inline-flex items-center gap-2 rounded-sm bg-paper/10 px-4 py-2 font-mono-typed text-[10px] uppercase tracking-wider text-paper/80 hover:bg-paper/20"
          >
            Weiter <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Konfetti dezent über Beat 3-4 */}
      {(beat === 3 || beat === 4) && <OutroConfetti />}
    </div>
  );
}

function OutroHammer() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-10 text-center">
      <Gavel className="mb-4 h-10 w-10 text-stamp" />
      <div className="animate-stamp-slam">
        <div className="border-4 border-stamp px-8 py-5">
          <p className="font-serif text-5xl font-black uppercase tracking-wider text-stamp sm:text-6xl">
            Abgelehnt
          </p>
        </div>
      </div>
      <p className="mt-6 font-mono-typed text-[11px] uppercase tracking-[0.3em] text-paper/70">
        Gemeinderat Grünwald · 19:47 Uhr
      </p>
    </div>
  );
}

function OutroSchlagzeile() {
  return (
    <div className="flex justify-center py-6">
      <div
        className="paper-card paper-card-lift rounded-sm bg-card p-5 sm:p-7 animate-paper-drop"
        style={{ transform: "rotate(-1.5deg)", maxWidth: "32rem" }}
      >
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Newspaper className="h-4 w-4 text-stamp" />
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.25em] text-stamp">
            Grünwalder Bote · Sonntagsausgabe
          </p>
        </div>
        <h3 className="mt-3 font-serif text-2xl font-black leading-tight sm:text-3xl">
          <span className="typewriter" style={{ animationDuration: "1.8s" }}>
            Gaskraftwerk gestoppt.
          </span>
        </h3>
        <p
          className="mt-3 font-serif text-[15px] leading-relaxed text-foreground/85 typewriter"
          style={{ animationDuration: "2.6s", animationDelay: "1.6s", animationFillMode: "both" }}
        >
          Knappe Mehrheit nach Bürgerhearing.
        </p>
      </div>
    </div>
  );
}

function OutroElvira() {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <Polaroid
        initial="E"
        caption="Elvira"
        subline="Brief Nr. 6"
        color="emerald"
        rotate={2}
        className="animate-paper-drop"
      />
      <p className="max-w-sm font-serif text-base italic leading-relaxed text-paper/90">
        „Danke, Maja. Ihr habt meine Hinweise gelesen — und verstanden,
        worum es geht."
      </p>
    </div>
  );
}

function OutroBilanz({
  teamName,
  barometer,
  total,
  correct,
  fehler,
}: {
  teamName: string;
  barometer: number;
  total: number;
  correct: number;
  fehler: number;
}) {
  return (
    <div className="space-y-4 py-4 animate-paper-drop">
      <p className="text-center font-mono-typed text-[11px] uppercase tracking-[0.3em] text-paper/70">
        Eure Bilanz
      </p>
      <p className="text-center font-serif text-3xl font-bold text-paper">
        {teamName}
      </p>

      <div className="mx-auto max-w-sm rounded-sm border border-emerald-500/40 bg-emerald-500/10 p-5 text-center">
        <p className="font-mono-typed text-[10px] uppercase tracking-[0.3em] text-emerald-300">
          Überzeugungs-Barometer
        </p>
        <p className="mt-1 font-serif text-6xl font-black text-emerald-300">
          {barometer}%
        </p>
      </div>

      <div className="mx-auto grid max-w-sm grid-cols-3 gap-2 text-center">
        <StatTile label="Fragen" value={total} />
        <StatTile label="Korrekt" value={correct} accent="emerald" />
        <StatTile label="Fehler" value={fehler} />
      </div>
      <p className="text-center font-mono-typed text-[10px] uppercase tracking-[0.3em] text-paper/60">
        Etappen gelöst · 5 / 5
      </p>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald";
}) {
  return (
    <div className="rounded-sm border border-paper/15 bg-paper/5 p-3">
      <p className="font-mono-typed text-[9px] uppercase tracking-wider text-paper/60">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-serif text-2xl font-bold",
          accent === "emerald" ? "text-emerald-300" : "text-paper",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function OutroAbspann({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center animate-paper-drop">
      <p className="font-mono-typed text-[11px] uppercase tracking-[0.3em] text-stamp">
        Akte 001 – 005 · Geschlossen
      </p>
      <h2 className="font-serif text-3xl font-black leading-tight text-paper sm:text-4xl">
        Ökologie ist viele
        <br />
        kleine Entscheidungen.
      </h2>
      <p className="max-w-sm font-serif italic text-paper/80">
        Heute habt ihr eine getroffen.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-sm border border-paper/30 bg-paper/5 px-4 py-2 font-serif text-sm text-paper hover:bg-paper/10"
        >
          Zur Übersicht
        </Link>
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-sm bg-stamp px-5 py-2.5 font-serif text-sm font-semibold text-paper hover:-translate-y-0.5 hover:shadow-md"
        >
          <RefreshCw className="h-4 w-4" /> Neues Spiel
        </button>
      </div>
    </div>
  );
}

function OutroConfetti() {
  const dots = Array.from({ length: 18 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {dots.map((_, i) => {
        const left = (i * 47) % 100;
        const top = (i * 29) % 80;
        const colors = ["bg-emerald-400", "bg-amber-300", "bg-sky-300", "bg-rose-300"];
        return (
          <span
            key={i}
            className={cn(
              "absolute h-1.5 w-1.5 rounded-sm opacity-70 animate-fade-in",
              colors[i % colors.length],
            )}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${(i % 9) * 90}ms`,
              transform: `rotate(${i * 22}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
