import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Lock, CheckCircle2, RotateCcw, Clock, MoreVertical } from "lucide-react";
import { Stamp } from "@/components/case-file/Stamp";
import {
  STAGES,
  getTeam,
  getCurrentStage,
  registerTeam,
  resetAll,
  
  getNowClock,
  getHearingClock,
  getRemainingMs,
  formatRemaining,
  getStageDurationMin,
  isRoundOver,
} from "@/lib/progress";
import { getStageHintsUsed } from "@/lib/badges";
import { NextStepCard } from "@/components/case-file/NextStepCard";
import { BadgeShelf } from "@/components/case-file/BadgeShelf";
import { StartForm } from "@/components/case-file/StartForm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";





import { IntroScreen, hasSeenIntro } from "@/components/case-file/IntroScreen";
import { useScrollToTopOnChange } from "@/hooks/use-scroll-top";
import { useEnvelopePrompt } from "@/components/case-file/EnvelopeDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  // Beitritts-Link der Lehrperson: /?r=RUNDENCODE
  validateSearch: (search: Record<string, unknown>): { r?: string } => {
    const raw = search["r"];
    const code = typeof raw === "string" ? raw.trim().slice(0, 12).toUpperCase() : "";
    return code ? { r: code } : {};
  },

  head: () => ({
    meta: [
      { title: "Majas Mission - Escape Game zu Nachhaltigkeit" },
      {
        name: "description",
        content:
          "Majas Mission ist ein mobiler Bildungs Escape Game zum Thema Nachhaltigkeit: Schulklassen lösen reale Rätsel zu Mobilität, Konsum, Energie & mehr",
      },
    ],
  }),
  component: CoverPage,
});


function CoverPage() {
  const { r: joinCode } = Route.useSearch();
  const [ready, setReady] = useState(false);
  const [team, setTeam] = useState<{ name: string; code: string } | null>(null);
  const [stage, setStage] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [introSeen, setIntroSeen] = useState(false);
  const [resetAsk, setResetAsk] = useState(false);


  useEffect(() => {
    const sync = () => {
      setTeam(getTeam());
      setStage(getCurrentStage());
    };
    sync();
    setIntroSeen(hasSeenIntro());
    setReady(true);
    window.addEventListener("maya-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("maya-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const screen = !ready
    ? "loading"
    : team && showIntro
      ? "briefing"
      : team && !introSeen
        ? "briefing"
        : team
          ? "overview"
          : "landing";
  useScrollToTopOnChange(screen);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="font-mono-typed text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Lade …
        </p>
      </main>
    );
  }

  if (team && showIntro) {
    return <IntroScreen teamName={team.name} onDone={() => setShowIntro(false)} />;
  }

  if (team && !introSeen) {
    return (
      <IntroScreen
        teamName={team.name}
        onDone={() => {
          setIntroSeen(true);
          setStage(getCurrentStage());
        }}
      />
    );
  }


  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-ink) 0, var(--color-ink) 1px, transparent 1px, transparent 28px)",
        }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center">
        <div className="relative w-full">
          <div className="absolute -top-4 left-8 z-10 rounded-t-md bg-secondary px-5 py-2 font-mono-typed text-[11px] uppercase tracking-[0.2em] text-foreground/70 shadow-sm">
            Vertraulich · Widnau
          </div>

          <article
            className="paper-card paper-card-lift relative rounded-sm bg-card px-5 py-10 sm:px-14 sm:py-16"
            style={{ transform: "rotate(-0.4deg)" }}
          >
            <div className="absolute right-4 top-6 sm:right-10 sm:top-10">
              <Stamp rotate={12} className="text-sm">
                Eilig
              </Stamp>
            </div>

            <p className="font-mono-typed text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Samstag · {getNowClock()} Uhr · Widnau, Gässelistrasse 2
            </p>

            <h1 className="mt-5 font-serif text-4xl font-bold leading-[0.95] text-foreground sm:text-7xl">
              Grossvaters
              <br />
              <span className="relative inline-block">
                letzte Spur.
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-0 h-[6px] w-full rounded-full"
                  style={{ backgroundColor: "var(--color-stamp)", opacity: 0.85 }}
                />
              </span>
            </h1>

            <p className="mt-6 max-w-xl font-serif text-base italic leading-relaxed text-foreground/80 sm:text-xl">
              Ein Bildungs-Escape-Room.
              <br />
              Fünf Etappen, ein Hearing.
            </p>

            {team ? (
              <ProgressPanel
                teamName={team.name}
                currentStage={stage}
                onReset={() => setResetAsk(true)}
              />
            ) : (

              <StartForm
                initialCode={joinCode}
                onStart={(name, code, members) => {
                  resetAll();
                  registerTeam(name, code, members);
                  setIntroSeen(false);
                  setTeam({ name, code });
                  setStage(getCurrentStage());
                }}
              />

            )}

          </article>

          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-sm bg-paper-deep"
            style={{ transform: "rotate(1.6deg) translate(8px, 6px)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-20 rounded-sm bg-secondary"
            style={{ transform: "rotate(-2deg) translate(-6px, 10px)" }}
          />
        </div>

        <p className="mt-12 font-mono-typed text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Widnau · v3 · Linearer Ablauf
        </p>

      </div>

      <ConfirmDialog
        open={resetAsk}
        onOpenChange={setResetAsk}
        title="Wirklich neu starten?"
        description="Alle Etappen, Punkte und Hinweise dieses Teams werden zurückgesetzt."
        confirmLabel="Zurücksetzen"
        destructive
        onConfirm={() => {
          setResetAsk(false);
          resetAll();
        }}
      />
    </main>
  );
}


/* -------------------------------------------------------- */
/*  Fortschritt, linearer Etappenpfad                       */
/* -------------------------------------------------------- */

function ProgressPanel({
  teamName,
  currentStage,
  onReset,
}: {
  teamName: string;
  currentStage: number;
  onReset: () => void;
}) {
  const navigate = useNavigate();
  const envelope = useEnvelopePrompt();
  const finished = currentStage >= 7;
  const stageStations = STAGES.slice(0, 5); // ohne Finale
  const finale = STAGES[5];
  const solved = Math.max(0, Math.min(currentStage - 1, 5));

  const [remaining, setRemaining] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    const tick = () => {
      setRemaining(getRemainingMs());
      setTimeUp(isRoundOver());
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [finished, currentStage]);

  const urgent = remaining !== null && remaining <= 15 * 60_000;

  const openStage = (nr: number) => {
    const target = STAGES.find((s) => s.nr === nr);
    if (!target) return;
    const go = () => navigate({ to: target.to as string });
    if (nr === 6) {
      go();
      return;
    }
    envelope.ask({
      nr,
      ort: `${target.ort} · Etappe ${nr}`,
      etappeLabel: `Etappe ${nr} · ${target.ort}`,
      onConfirm: go,
    });
  };

  const nextStage = STAGES.find((s) => s.nr === currentStage);

  return (
    <div className="mt-8 space-y-5">
      {envelope.dialog}

      {/* Statuskopf */}
      <div className="rounded-sm border border-border bg-secondary/40 p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
              Team
            </p>
            <p className="mt-0.5 truncate font-serif text-lg font-bold">{teamName}</p>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <div className="text-right">
              <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                Restzeit
              </p>
              <p
                className={cn(
                  "mt-0.5 flex items-center justify-end gap-1 font-mono-typed text-lg font-bold tabular-nums",
                  urgent ? "text-destructive" : "text-foreground",
                )}
              >
                <Clock className="h-4 w-4" />
                {remaining === null ? "–" : formatRemaining(remaining)}
              </p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Weitere Optionen"
                className="flex h-11 w-11 items-center justify-center rounded-sm border border-border bg-card text-muted-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 z-20 w-52 rounded-sm border border-border bg-card p-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onReset();
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground hover:bg-secondary"
                  >
                    <RotateCcw className="h-3 w-3" /> Spiel zurücksetzen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              Fortschritt
            </p>
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              {solved} / 5 Etappen
            </p>
          </div>
          <div
            className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={5}
            aria-valuenow={solved}
          >
            <div
              className="h-full rounded-full bg-stamp transition-all duration-500"
              style={{ width: `${(solved / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Nächster Schritt */}
      <div ref={ctaRef}>
        {timeUp && !finished ? (
          <div className="rounded-sm border border-stamp/60 bg-secondary/40 p-4">
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
              Zeit abgelaufen
            </p>
            <p className="mt-1 font-serif text-lg font-bold leading-tight">
              Die Ermittlung ist beendet
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-foreground/80">
              Neue Etappen und das Hearing lassen sich nicht mehr starten.
            </p>
            <Link
              to="/abschluss"
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3 font-serif text-base font-semibold text-primary-foreground"
            >
              Zum Abschluss <span aria-hidden>→</span>
            </Link>
          </div>
        ) : finished ? (
          <NextStepCard
            nr={6}
            ort={finale.ort}
            thema={finale.thema}
            finished
            onOpen={() => navigate({ to: "/finale" })}
          />
        ) : currentStage >= 6 ? (
          <NextStepCard
            nr={6}
            ort={finale.ort}
            thema={finale.thema}
            isFinale
            onOpen={() => openStage(6)}
          />
        ) : nextStage ? (
          <NextStepCard
            nr={nextStage.nr}
            ort={nextStage.ort}
            thema={nextStage.thema}
            onOpen={() => openStage(nextStage.nr)}
          />
        ) : null}
      </div>

      {/* Etappenpfad */}
      <ol className="relative space-y-1.5">
        {stageStations.map((s, i) => {
          const status =
            currentStage > s.nr
              ? "done"
              : currentStage === s.nr && !timeUp
                ? "current"
                : "locked";
          const isLast = i === stageStations.length - 1;
          const dauer = status === "done" ? getStageDurationMin(s.nr) : null;
          const hints = status === "done" ? getStageHintsUsed(s.nr) : null;

          const inner = (
            <div className="flex min-h-12 w-full items-center gap-3">
              <PathNode nr={s.nr} status={status} connector={!isLast} />
              <div className="min-w-0 flex-1 py-2">
                <p className="font-serif text-base font-bold leading-tight sm:text-lg">
                  {s.ort}
                </p>
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.thema}
                  {status === "done" && (dauer !== null || hints !== null) && (
                    <>
                      {" · "}
                      {dauer !== null ? `${dauer} Min` : null}
                      {dauer !== null && hints !== null ? " · " : null}
                      {hints !== null
                        ? `${hints} ${hints === 1 ? "Hinweis" : "Hinweise"}`
                        : null}
                    </>
                  )}
                </p>
              </div>
              {status === "done" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : status === "current" ? (
                <span
                  aria-hidden
                  className="shrink-0 font-mono-typed text-[10px] uppercase tracking-wider text-stamp"
                >
                  hier
                </span>
              ) : (
                <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </div>
          );

          return (
            <li key={s.nr}>
              {status === "done" ? (
                <Link
                  to={s.to as string}
                  className="block rounded-sm px-2 transition-colors hover:bg-secondary/50"
                >
                  {inner}
                </Link>
              ) : status === "current" ? (
                <button
                  type="button"
                  onClick={() => openStage(s.nr)}
                  className="block w-full rounded-sm px-2 text-left transition-colors hover:bg-secondary/50"
                >
                  {inner}
                </button>
              ) : (
                <div className="block px-2 opacity-55">{inner}</div>
              )}
            </li>
          );
        })}

        {/* Finale */}
        <li>
          {currentStage >= 6 && (!timeUp || finished) ? (
            <Link
              to="/finale"
              className="block rounded-sm px-2 transition-colors hover:bg-secondary/50"
            >
              <div className="flex min-h-12 items-center gap-3">
                <PathNode nr={6} status={finished ? "done" : "current"} connector={false} />
                <div className="min-w-0 flex-1 py-2">
                  <p className="font-serif text-base font-bold leading-tight sm:text-lg">
                    {finale.ort}
                  </p>
                  <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                    Hearing
                  </p>
                </div>
                {finished ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <span
                    aria-hidden
                    className="shrink-0 font-mono-typed text-[10px] uppercase tracking-wider text-stamp"
                  >
                    hier
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div className="block px-2 opacity-55">
              <div className="flex min-h-12 items-center gap-3">
                <PathNode nr={6} status="locked" connector={false} />
                <div className="min-w-0 flex-1 py-2">
                  <p className="font-serif text-base font-bold leading-tight sm:text-lg">
                    {finale.ort}
                  </p>
                  <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                    Hearing · nach Etappe 5
                  </p>
                </div>
                <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </div>
          )}
        </li>
      </ol>

      <BadgeShelf />

      {/* Sticky-CTA auf dem Handy */}
      {showSticky && !finished && !timeUp && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-paper/95 p-3 backdrop-blur-sm sm:hidden">
          <button
            type="button"
            onClick={() => openStage(Math.min(currentStage, 6))}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3 font-serif text-base font-semibold text-primary-foreground"
          >
            {currentStage >= 6
              ? "Weiter zum Hearing"
              : `Weiter zu Etappe ${currentStage}`}
            <span aria-hidden>→</span>
          </button>
        </div>
      )}
      {showSticky && !finished && !timeUp && <div aria-hidden className="h-16 sm:hidden" />}
    </div>
  );
}

/** Nummernkreis mit Verbindungslinie zum nächsten Punkt. */
function PathNode({
  nr,
  status,
  connector,
}: {
  nr: number;
  status: "done" | "current" | "locked";
  connector: boolean;
}) {
  return (
    <span className="relative flex w-9 shrink-0 justify-center self-stretch">
      {connector && (
        <span
          aria-hidden
          className={cn(
            "absolute left-1/2 top-1/2 h-[calc(100%+0.5rem)] w-0.5 -translate-x-1/2",
            status === "done"
              ? "bg-emerald-500/50"
              : "border-l-2 border-dashed border-border bg-transparent",
          )}
        />
      )}
      <span
        className={cn(
          "relative z-10 my-1 flex h-9 w-9 items-center justify-center rounded-full font-mono-typed text-sm font-bold",
          status === "done" && "bg-emerald-600 text-white",
          status === "current" && "bg-stamp text-paper ring-2 ring-stamp/30",
          status === "locked" && "bg-secondary text-muted-foreground",
        )}
      >
        {nr}
      </span>
    </span>
  );
}

