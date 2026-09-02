import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Lightbulb, RotateCcw, Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PaperCard } from "./PaperCard";
import { Stamp } from "./Stamp";
import { Leaderboard } from "./Leaderboard";
import { BadgeShowcase } from "./BadgeShowcase";
import { getTotalRevealedHints } from "./HintSystem";
import { getScore } from "@/lib/score-events";
import { getStartTs, getEndTs, getTeam, resetAll } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Props = {
  /**
   * "won" = Hearing bestanden, "timeout" = Zeit abgelaufen,
   * "closed" = Runde von der Lehrperson abgeschlossen.
   */
  reason?: "won" | "timeout" | "closed";
};

/**
 * Abschluss-Karte der Ermittlung: Punktzahl, Rangliste, Zeit/Hinweise und
 * Abzeichen. Wird nach gewonnenem Hearing und nach Zeitablauf verwendet.
 */
export function FinalSummary({ reason = "won" }: Props) {
  const isClosed = reason === "closed";
  const isTimeout = reason === "timeout" || isClosed;

  // Werte einmalig beim Mount einfrieren, damit der Abschluss stabil bleibt.
  const elapsedLabel = useState(() => {
    const start = getStartTs();
    if (!start) return "...";
    const ms = Math.max(0, (getEndTs() ?? Date.now()) - start);
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h} h ${String(m).padStart(2, "0")} min`;
    return `${m} min ${String(s).padStart(2, "0")} s`;
  })[0];

  const hintsUsed = useState(() => getTotalRevealedHints())[0];
  const score = useState(() => getScore())[0];
  const teamName = useState(() => getTeam()?.name?.trim() || "Mein Team")[0];
  const shownPoints = useCountUp(score.total);

  return (
    <PaperCard rotate={-0.3} tape="top-left" className="relative overflow-hidden">
      {!isTimeout && <SummaryConfetti />}
      <div className="absolute right-4 top-6 sm:right-8 sm:top-8">
        <Stamp rotate={-6}>{isClosed ? "Runde beendet" : isTimeout ? "Zeit abgelaufen" : "Fall gelöst"}</Stamp>
      </div>
      <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">Abschluss der Ermittlung</p>
      <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
        {isClosed ? "Die Runde ist beendet." : isTimeout ? "Die Zeit ist um." : "Ihr habt es geschafft."}
      </h2>
      {isTimeout && (
        <p className="mt-3 max-w-md font-serif text-[15px] italic leading-relaxed text-foreground/80">
          {isClosed
            ? "„Die Lehrperson hat die Runde abgeschlossen. Weiter ermitteln können wir jetzt nicht mehr – aber hier ist, was ihr zusammengetragen habt.\u201c"
            : "„Die Gemeindeversammlung hat begonnen. Weiter ermitteln können wir jetzt nicht mehr – aber hier ist, was ihr zusammengetragen habt.\u201c"}
        </p>
      )}

      {/* Punkte im Zentrum */}
      <div className="mt-7 text-center">
        <p className="font-mono-typed text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Schlusspunktzahl</p>
        <p className="pt-3 font-mono-typed text-6xl font-bold leading-tight tabular-nums text-foreground sm:text-7xl">
          {shownPoints}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-sm border border-border bg-secondary/60 px-2.5 py-1 font-serif text-sm font-semibold text-foreground">
            {teamName}
          </span>
        </div>
      </div>

      {/* Rangliste */}
      <div className="mt-6">
        <Leaderboard score={score} variant="outro" />
      </div>

      {/* Kleine Fakten */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        <SummaryChip icon={<Clock className="h-3.5 w-3.5" />} label="Zeit" value={elapsedLabel} />
        <SummaryChip icon={<Lightbulb className="h-3.5 w-3.5" />} label="Hinweise" value={`${hintsUsed} / 15`} />
      </div>

      <BadgeShowcase />

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          to="/"
          className="group inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3.5 font-serif text-base font-semibold text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl animate-fade-in sm:w-auto"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
          Zurück zum Start
        </Link>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-card/70 px-4 py-2.5 font-mono-typed text-[11px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Neue Ermittlung starten
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Wirklich alles löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Punkte, Abzeichen und der gesamte Fortschritt gehen verloren. Danach beginnt eine neue Ermittlung von
                vorne.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  resetAll();
                  window.location.href = "/";
                }}
              >
                Zurücksetzen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PaperCard>
  );
}

function useCountUp(target: number) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (target <= 0) {
      setShown(0);
      return;
    }
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}

function SummaryChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-sm border border-border bg-card/70 px-2 py-2.5 text-center">
      <span className="flex items-center gap-1 font-mono-typed text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-mono-typed text-sm font-bold tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function SummaryConfetti() {
  const dots = Array.from({ length: 14 });
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {dots.map((_, i) => {
        const left = (i * 53) % 100;
        const delay = (i % 7) * 80;
        const colors = ["bg-emerald-500", "bg-amber-400", "bg-sky-400", "bg-rose-400"];
        return (
          <span
            key={i}
            className={cn("absolute top-0 h-2 w-2 rounded-sm opacity-80 animate-fade-in", colors[i % colors.length])}
            style={{
              left: `${left}%`,
              animationDelay: `${delay}ms`,
              transform: `translateY(${(i % 5) * 6}px) rotate(${i * 18}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
