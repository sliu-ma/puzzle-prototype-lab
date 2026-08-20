import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { PaperCard } from "./PaperCard";
import { Stamp } from "./Stamp";
import { getCurrentStage, getTeam, STAGES } from "@/lib/progress";

type Props = {
  stage: number; // 1..6
  children: React.ReactNode;
};

/**
 * Erzwingt linearen Ablauf: zeigt einen "Versiegelt"-Screen, solange die
 * geforderte Etappe noch nicht an der Reihe ist. Hat die Klasse noch nicht
 * gestartet (kein Team), wird auf die Startseite verwiesen.
 */
export function StageGate({ stage, children }: Props) {
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [hasTeam, setHasTeam] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    const sync = () => {
      setCurrent(getCurrentStage());
      setHasTeam(!!getTeam());
      setTimeUp(isTimeUp());
    };
    sync();
    setReady(true);
    const id = window.setInterval(sync, 5000);
    window.addEventListener("maya-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("maya-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="font-mono-typed text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Lade …
        </p>
      </main>
    );
  }

  if (!hasTeam) {
    return (
      <main className="relative min-h-screen px-3 py-8 sm:px-4 sm:py-14">
        <div className="relative mx-auto max-w-xl">
          <PaperCard rotate={-0.4} tape="top">
            <Stamp rotate={8}>Start fehlt</Stamp>
            <h1 className="mt-2 font-serif text-3xl font-bold leading-tight">
              Zuerst registrieren
            </h1>
            <p className="mt-4 text-[15px] text-foreground/80">
              Bevor ihr eine Etappe öffnen könnt, müsst ihr euer Team auf der
              Startseite eintragen.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 hover:shadow-md"
              >
                Zur Startseite →
              </Link>
            </div>
          </PaperCard>
        </div>
      </main>
    );
  }

  // Nach Zeitablauf lassen sich keine offenen Etappen mehr bearbeiten;
  // bereits gelöste Etappen bleiben als Rückblick zugänglich.
  if (timeUp && current <= stage) {
    return (
      <main className="relative min-h-screen px-3 py-8 sm:px-4 sm:py-14">
        <div className="relative mx-auto max-w-xl">
          <PaperCard rotate={-0.4} tape="top">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                  Ermittlung beendet
                </p>
                <h1 className="mt-2 flex items-center gap-2 font-serif text-3xl font-bold leading-tight">
                  <Lock className="h-7 w-7 text-stamp" /> Die Zeit ist um
                </h1>
              </div>
              <Stamp rotate={8}>Zeit abgelaufen</Stamp>
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-foreground/80">
              Die Gemeindeversammlung hat begonnen. Neue Etappen und das Hearing
              lassen sich nicht mehr starten.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/abschluss"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 hover:shadow-md"
              >
                Zum Abschluss →
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                Übersicht
              </Link>
            </div>
          </PaperCard>
        </div>
      </main>
    );
  }

  if (current < stage) {
    const next = STAGES.find((s) => s.nr === current);
    return (
      <main className="relative min-h-screen px-3 py-8 sm:px-4 sm:py-14">
        <div className="relative mx-auto max-w-xl">
          <PaperCard rotate={-0.4} tape="top">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                  Etappe {stage} · Versiegelt
                </p>
                <h1 className="mt-2 flex items-center gap-2 font-serif text-3xl font-bold leading-tight">
                  <Lock className="h-7 w-7 text-stamp" /> Noch nicht an der Reihe
                </h1>
              </div>
              <Stamp rotate={8}>Gesperrt</Stamp>
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-foreground/80">
              Die Etappen müssen der Reihe nach gelöst werden. Ihr seid aktuell
              bei <strong>Etappe {current}</strong>
              {next ? ` · ${next.ort}` : ""}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {next && (
                <Link
                  to={next.to}
                  className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 hover:shadow-md"
                >
                  Zur aktuellen Etappe →
                </Link>
              )}
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
              >
                Übersicht
              </Link>
            </div>
          </PaperCard>
        </div>
      </main>
    );
  }

  const isReview = current > stage;
  return (
    <>
      {isReview && (
        <div className="sticky top-0 z-40 border-b border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-center font-mono-typed text-[11px] uppercase tracking-[0.18em] text-emerald-800">
          Rückblick · Etappe {stage} abgeschlossen · eure Antworten bleiben sichtbar
        </div>
      )}
      {children}
    </>
  );
}

