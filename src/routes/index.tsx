import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Lock, CheckCircle2, RotateCcw, Clock, MoreVertical } from "lucide-react";
import { Stamp } from "@/components/case-file/Stamp";
import {
  START_CODE,
  STAGES,
  getTeam,
  getCurrentStage,
  registerTeam,
  resetAll,
  completeStage,
  getNowClock,
  getHearingClock,
  getRemainingMs,
  formatRemaining,
  getStageDurationMin,
} from "@/lib/progress";
import { getStageHintsUsed } from "@/lib/badges";
import { joinRoundSession, type JoinResult } from "@/lib/round";
import { NextStepCard } from "@/components/case-file/NextStepCard";
import { BadgeShelf } from "@/components/case-file/BadgeShelf";

const CHEAT_CODE = "KRXZMVBQ";



import { IntroScreen, hasSeenIntro } from "@/components/case-file/IntroScreen";
import { useScrollToTopOnChange } from "@/hooks/use-scroll-top";
import { useEnvelopePrompt } from "@/components/case-file/EnvelopeDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Speicher, Majas Ermittlung" },
      {
        name: "description",
        content:
          "Ein Bildungs-Escape-Room zur Ökologie. Fünf Etappen, ein Hearing, von Mobilität bis Energie.",
      },
    ],
  }),
  component: CoverPage,
});

function CoverPage() {
  const [ready, setReady] = useState(false);
  const [team, setTeam] = useState<{ name: string; code: string } | null>(null);
  const [stage, setStage] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [introSeen, setIntroSeen] = useState(false);

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
            Vertraulich · Speicher
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
              Samstag · {getNowClock()} Uhr · Speicher, Dorfstrasse 4
            </p>

            <h1 className="mt-5 font-serif text-4xl font-bold leading-[0.95] text-foreground sm:text-7xl">
              Tante Elvira
              <br />
              <span className="relative inline-block">
                ist weg.
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-0 h-[6px] w-full rounded-full"
                  style={{ backgroundColor: "var(--color-stamp)", opacity: 0.85 }}
                />
              </span>
            </h1>

            <p className="mt-6 max-w-xl font-serif text-base italic leading-relaxed text-foreground/80 sm:text-xl">
              Ein Bildungs-Escape-Room zur Ökologie.
              <br />
              Fünf Etappen, ein Hearing.
            </p>

            {team ? (
              <ProgressPanel
                teamName={team.name}
                currentStage={stage}
                onReset={() => {
                  if (
                    confirm(
                      "Wirklich neu starten? Alle Etappen werden zurückgesetzt.",
                    )
                  ) {
                    resetAll();
                  }
                }}
              />
            ) : (
              <StartForm
                onStart={async (name, code, roundCode, members) => {
                  resetAll();
                  registerTeam(name, code);
                  if (code.toUpperCase() === CHEAT_CODE) {
                    // Debug-Modus: alle Etappen freischalten
                    for (let i = 1; i <= 6; i++) completeStage(i);
                  }
                  let join: JoinResult | null = null;
                  if (roundCode) {
                    join = await joinRoundSession(roundCode, name, members);
                    if (!join.ok) return join;
                  }
                  setIntroSeen(false);
                  setTeam({ name, code });
                  setStage(getCurrentStage());
                  return null;
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
          Speicher · v3 · Linearer Ablauf
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/rangliste"
            search={{ code: "" }}
            className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 hover:underline"

          >
            Rangliste
          </Link>
          <Link
            to="/admin"
            className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 hover:underline"
          >
            Lehrpersonen
          </Link>
        </div>

      </div>
    </main>
  );
}

/* -------------------------------------------------------- */
/*  Startformular (Team & Code)                              */
/* -------------------------------------------------------- */

function StartForm({
  onStart,
}: {
  onStart: (
    name: string,
    code: string,
    roundCode: string,
    members: string[],
  ) => Promise<JoinResult | null>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [members, setMembers] = useState<string[]>(["", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cleanCode = code.trim().toUpperCase();
  const isFixedCode = cleanCode === START_CODE || cleanCode === CHEAT_CODE;

  const goStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (cleanCode.length < 4) {
      setError("Bitte gebt den Code eurer Lehrperson ein.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setError("Bitte gebt einen Teamnamen ein (mind. 2 Zeichen).");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const memberList = members.map((m) => m.trim()).filter((m) => m.length > 0);
      const res = await onStart(
        cleanName,
        isFixedCode ? cleanCode : START_CODE,
        isFixedCode ? "" : cleanCode,
        memberList,
      );
      if (res && !res.ok) {
        setError(
          res.reason === "not_found"
            ? "Diesen Code gibt es nicht. Frag deine Lehrperson."
            : res.reason === "closed"
              ? "Diese Runde ist bereits geschlossen."
              : res.reason === "name_taken"
                ? "Dieser Teamname ist in der Runde schon vergeben."
                : "Start nicht möglich. Versuche es nochmals.",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-[1.4fr_1fr]">
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
        <p>
          <strong className="font-serif">Maja, 17,</strong> findet das Haus
          ihrer Grosstante leer. Auf dem Tisch ein Brief: Heute stimmt der
          Gemeinderat über ein <span className="ink-underline">Gaskraftwerk</span> ab.
          Elvira hat fünf Hinweise im Dorf hinterlegt.
        </p>
        <p className="font-serif italic text-foreground/70">
          {step === 1
            ? "Gebt den Code eurer Lehrperson ein, um Etappe 1 zu öffnen."
            : "Tragt euren Teamnamen und die Mitspielenden ein."}
        </p>
      </div>

      {step === 1 ? (
        <form
          onSubmit={goStep2}
          className="space-y-3 rounded-sm border border-border bg-secondary/50 p-4"
          style={{ transform: "rotate(1.2deg)" }}
        >
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
            Schritt 1 von 2 · Code
          </p>
          <div>
            <label className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Start- oder Rundencode"
              autoCapitalize="characters"
              className="mt-1 w-full rounded-sm border border-border bg-paper px-3 py-3 font-mono-typed text-base uppercase tracking-wider focus:border-stamp focus:outline-none"
            />
          </div>
          {error && (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-sm bg-primary px-5 py-3 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            Weiter →
          </button>
        </form>
      ) : (
        <form
          onSubmit={submit}
          className="space-y-3 rounded-sm border border-border bg-secondary/50 p-4"
          style={{ transform: "rotate(1.2deg)" }}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
              Schritt 2 von 2 · Team
            </p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(1);
              }}
              className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground underline-offset-4 hover:underline"
            >
              Zurück
            </button>
          </div>
          <div>
            <label className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              Teamname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Spürnasen 3a"
              className="mt-1 w-full rounded-sm border border-border bg-paper px-3 py-2 font-serif text-[15px] focus:border-stamp focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              Mitspielende
            </label>
            {members.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={m}
                  onChange={(e) =>
                    setMembers((prev) =>
                      prev.map((v, idx) => (idx === i ? e.target.value : v)),
                    )
                  }
                  placeholder={`Name ${i + 1}`}
                  className="min-w-0 flex-1 rounded-sm border border-border bg-paper px-3 py-2 font-serif text-[15px] focus:border-stamp focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setMembers((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  disabled={members.length <= 1}
                  aria-label={`Mitspielende ${i + 1} entfernen`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-border font-mono-typed text-lg text-muted-foreground disabled:opacity-40"
                >
                  −
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setMembers((prev) => [...prev, ""])}
              className="w-full rounded-sm border border-dashed border-border px-3 py-2 font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground"
            >
              + Mitspielende hinzufügen
            </button>
          </div>
          {error && (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-sm bg-primary px-5 py-3 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
          >
            Ermittlung starten →
          </button>
        </form>
      )}
    </div>
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

  useEffect(() => {
    const tick = () => setRemaining(getRemainingMs());
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
    if (nr === 1 || nr === 6) {
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
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-card text-muted-foreground"
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
        {finished ? (
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
            currentStage > s.nr ? "done" : currentStage === s.nr ? "current" : "locked";
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
          {currentStage >= 6 ? (
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
      {showSticky && !finished && (
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
      {showSticky && !finished && <div aria-hidden className="h-16 sm:hidden" />}
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

