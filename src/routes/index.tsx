import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, CheckCircle2, RotateCcw } from "lucide-react";
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
} from "@/lib/progress";

const CHEAT_CODE = "KRXZMVBQ";



import { IntroScreen, hasSeenIntro } from "@/components/case-file/IntroScreen";
import { useEnvelopePrompt } from "@/components/case-file/EnvelopeDialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Speicher — Majas Ermittlung" },
      {
        name: "description",
        content:
          "Ein Bildungs-Escape-Room zur Ökologie. Fünf Etappen, ein Hearing — von Mobilität bis Energie.",
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
                onStart={(name, code) => {
                  resetAll();
                  registerTeam(name, code);
                  if (code.toUpperCase() === CHEAT_CODE) {
                    // Debug-Modus: alle Etappen freischalten
                    for (let i = 1; i <= 6; i++) completeStage(i);
                  }
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
          Speicher · v3 · Linearer Ablauf
        </p>

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
  onStart: (name: string, code: string) => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();
    if (cleanName.length < 2) {
      setError("Bitte gebt einen Teamnamen ein (mind. 2 Zeichen).");
      return;
    }
    if (cleanCode !== START_CODE) {
      setError("Der Startcode stimmt nicht. Frag deine Lehrperson.");
      return;
    }
    setError(null);
    onStart(cleanName, cleanCode);
  };

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-[1.4fr_1fr]">
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
        <p>
          <strong className="font-serif">Maja, 17,</strong> findet das Haus
          ihrer Grosstante leer. Auf dem Tisch ein Brief: Heute Abend stimmt der
          Gemeinderat über ein <span className="ink-underline">Gaskraftwerk</span> ab.
          Elvira hat fünf Hinweise im Dorf hinterlegt.
        </p>
        <p className="font-serif italic text-foreground/70">
          Tragt euren Teamnamen und den Startcode eurer Lehrperson ein, um
          Etappe 1 zu öffnen.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-3 rounded-sm border border-border bg-secondary/50 p-4"
        style={{ transform: "rotate(1.2deg)" }}
      >
        <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
          Team registrieren
        </p>
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
        <div>
          <label className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            Startcode
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="vom Lehrer / der Lehrerin"
            autoCapitalize="characters"
            className="mt-1 w-full rounded-sm border border-border bg-paper px-3 py-2 font-mono-typed text-sm uppercase tracking-wider focus:border-stamp focus:outline-none"
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
          Ermittlung starten →
        </button>
      </form>
    </div>
  );
}

/* -------------------------------------------------------- */
/*  Fortschritt – linearer Etappenpfad                       */
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

  return (
    <div className="mt-8 space-y-6">
      {envelope.dialog}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-secondary/40 p-4">
        <div>
          <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
            Team
          </p>
          <p className="mt-0.5 font-serif text-lg font-bold">{teamName}</p>
        </div>
        <div className="text-right">
          <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
            Fortschritt
          </p>
          <p className="mt-0.5 font-serif text-lg font-bold">
            {Math.min(currentStage - 1, 5)} / 5 Etappen
          </p>
        </div>
      </div>

      <ol className="space-y-2">
        {stageStations.map((s) => {
          const status =
            currentStage > s.nr
              ? "done"
              : currentStage === s.nr
                ? "current"
                : "locked";
          return (
            <li key={s.nr}>
              {status === "current" ? (
                <button
                  type="button"
                  onClick={() => {
                    const go = () => navigate({ to: s.to as string });
                    if (s.nr === 1) {
                      // Umschlag 1 wurde bereits im Intro gezeigt
                      go();
                      return;
                    }
                    envelope.ask({
                      nr: s.nr,
                      ort: `${s.ort} · Etappe ${s.nr}`,
                      etappeLabel: `Etappe ${s.nr} · ${s.ort}`,
                      onConfirm: go,
                    });
                  }}
                  className="group flex w-full items-center gap-3 rounded-sm border-2 border-stamp bg-stamp/5 px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Badge n={s.nr} variant="current" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                      Aktuelle Etappe
                    </p>
                    <p className="font-serif text-base font-bold">
                      {s.ort} <span className="text-foreground/60">· {s.thema}</span>
                    </p>
                  </div>
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              ) : status === "done" ? (
                <Link
                  to={s.to as string}
                  className="group flex items-center gap-3 rounded-sm border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Badge n={s.nr} variant="done" />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono-typed text-[10px] uppercase tracking-wider text-emerald-700">
                      Abgeschlossen · nochmals ansehen
                    </p>
                    <p className="font-serif text-base font-bold">
                      {s.ort} <span className="text-foreground/60">· {s.thema}</span>
                    </p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-sm border border-border bg-card px-4 py-3 opacity-60">
                  <Badge n={s.nr} variant={status} />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                      Etappe {s.nr}
                    </p>
                    <p className="font-serif text-base font-bold">
                      {s.ort} <span className="text-foreground/60">· {s.thema}</span>
                    </p>
                  </div>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

            </li>
          );
        })}

        {/* Finale */}
        <li>
          {currentStage >= 6 && !finished ? (
            <Link
              to="/finale"
              className="group flex items-center gap-3 rounded-sm border-2 border-stamp bg-stamp/10 px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <Badge n={6} variant="current" />
              <div className="min-w-0 flex-1">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  Hearing · Gemeindesaal
                </p>
                <p className="font-serif text-base font-bold">
                  {finale.ort} <span className="text-foreground/60">· {finale.thema}</span>
                </p>
              </div>
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          ) : finished ? (
            <Link
              to="/finale"
              className="flex items-center gap-3 rounded-sm border border-emerald-500/40 bg-emerald-500/5 px-4 py-3"
            >
              <Badge n={6} variant="done" />
              <div className="min-w-0 flex-1">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-emerald-700">
                  Abgeschlossen
                </p>
                <p className="font-serif text-base font-bold">{finale.ort}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </Link>
          ) : (
            <div className="flex items-center gap-3 rounded-sm border border-border bg-card px-4 py-3 opacity-60">
              <Badge n={6} variant="locked" />
              <div className="min-w-0 flex-1">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                  Finale · gesperrt
                </p>
                <p className="font-serif text-base font-bold">
                  {finale.ort}{" "}
                  <span className="text-foreground/60">
                    · nach Etappe 5
                  </span>
                </p>
              </div>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </li>
      </ol>

      <div className="flex justify-end">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground hover:bg-secondary"
        >
          <RotateCcw className="h-3 w-3" /> Spiel zurücksetzen
        </button>
      </div>
    </div>
  );
}

function Badge({
  n,
  variant,
}: {
  n: number;
  variant: "done" | "current" | "locked";
}) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono-typed text-sm font-bold",
        variant === "done" && "bg-emerald-600 text-white",
        variant === "current" && "bg-stamp text-paper",
        variant === "locked" && "bg-secondary text-muted-foreground",
      )}
    >
      {n}
    </span>
  );
}
