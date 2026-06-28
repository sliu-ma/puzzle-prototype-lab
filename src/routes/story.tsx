import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, QrCode, Lightbulb, RotateCcw, Home } from "lucide-react";
import { MajaAvatar } from "@/components/story/MajaAvatar";
import { SpeechBubble } from "@/components/story/SpeechBubble";
import { ComicPanel } from "@/components/story/ComicPanel";
import { VillageMap } from "@/components/story/VillageMap";
import { MobilityPuzzle } from "@/components/story/MobilityPuzzle";
import { STATIONS, type Panel, type StationId } from "@/lib/story-content";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Grünwald – Majas Abenteuer" },
      { name: "description", content: "Story-driven Escape Room über Ökologie." },
    ],
  }),
  component: StoryApp,
});

type Phase =
  | { kind: "intro" }
  | { kind: "map" }
  | { kind: "travel"; to: StationId }
  | { kind: "station-intro"; id: StationId; step: number }
  | { kind: "station-puzzle"; id: StationId }
  | { kind: "station-resolve"; id: StationId }
  | { kind: "finale" };

const KEY = "story-stage";

function StoryApp() {
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [stage, setStage] = useState(1);

  useEffect(() => {
    try {
      const s = parseInt(localStorage.getItem(KEY) ?? "1", 10);
      if (Number.isFinite(s) && s > 0) setStage(s);
    } catch {}
  }, []);

  const persistStage = (n: number) => {
    setStage(n);
    try {
      localStorage.setItem(KEY, String(n));
    } catch {}
  };

  return (
    <main
      className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col overflow-hidden px-4 pb-6 pt-4"
      style={{ background: "var(--color-paper)" }}
    >
      {/* Top-Bar */}
      <header className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setPhase({ kind: "map" })}
          className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-paper shadow-paper"
          aria-label="Karte"
        >
          <Home className="h-4 w-4" />
        </button>
        <span className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-ink/60">
          Grünwald · {Math.min(stage - 1, 5)} / 5
        </span>
        <button
          onClick={() => {
            if (confirm("Story zurücksetzen?")) {
              persistStage(1);
              setPhase({ kind: "intro" });
            }
          }}
          className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-paper shadow-paper"
          aria-label="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </header>

      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          {phase.kind === "intro" && (
            <IntroScene key="intro" onStart={() => setPhase({ kind: "map" })} />
          )}
          {phase.kind === "map" && (
            <MapScene
              key="map"
              stage={stage}
              onPick={(id) => setPhase({ kind: "travel", to: id })}
            />
          )}
          {phase.kind === "travel" && (
            <TravelScene
              key={`travel-${phase.to}`}
              stage={stage}
              to={phase.to}
              onDone={() => setPhase({ kind: "station-intro", id: phase.to, step: 0 })}
            />
          )}
          {phase.kind === "station-intro" && (
            <StationIntroScene
              key={`intro-${phase.id}-${phase.step}`}
              id={phase.id}
              step={phase.step}
              onNext={(nextStep) => {
                const st = STATIONS.find((s) => s.id === phase.id)!;
                if (nextStep >= st.intro.length) {
                  setPhase({ kind: "station-puzzle", id: phase.id });
                } else {
                  setPhase({ kind: "station-intro", id: phase.id, step: nextStep });
                }
              }}
            />
          )}
          {phase.kind === "station-puzzle" && (
            <PuzzleScene
              key={`puzzle-${phase.id}`}
              id={phase.id}
              onSolved={() => setPhase({ kind: "station-resolve", id: phase.id })}
            />
          )}
          {phase.kind === "station-resolve" && (
            <ResolveScene
              key={`resolve-${phase.id}`}
              id={phase.id}
              onContinue={() => {
                const st = STATIONS.find((s) => s.id === phase.id)!;
                persistStage(Math.max(stage, st.nr + 1));
                setPhase({ kind: "map" });
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

/* ---------------- Szenen ---------------- */

function IntroScene({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col items-center justify-between gap-4 py-4"
    >
      <ComicPanel className="w-full p-5" tilt={-0.8}>
        <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
          Samstag · 14:12 · Dorfstrasse 4
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight font-bold">
          Tante Elvira
          <br />
          ist weg.
        </h1>
        <div className="mt-4 rounded-md border-2 border-dashed border-ink/40 bg-paper-deep/40 p-3 font-serif text-sm italic leading-relaxed text-ink/80">
          „Maja — wenn du das liest, bin ich unterwegs. Heute Abend stimmt der
          Gemeinderat über das Gaskraftwerk ab. Ich habe fünf Hinweise im Dorf
          versteckt. Folge ihnen. — E."
        </div>
      </ComicPanel>

      <div className="flex w-full items-end justify-end gap-2">
        <SpeechBubble>
          Fünf Hinweise … bis 19 Uhr. Das schaffe ich!
        </SpeechBubble>
      </div>
      <div className="flex w-full items-end justify-end">
        <MajaAvatar emotion="surprised" size={110} />
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onStart}
        className="flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-[color:var(--color-sun)] py-4 font-serif text-lg font-bold text-ink shadow-paper-lift"
      >
        Abenteuer starten <ArrowRight className="h-5 w-5" />
      </motion.button>
    </motion.div>
  );
}

function MapScene({
  stage,
  onPick,
}: {
  stage: number;
  onPick: (id: StationId) => void;
}) {
  const current = STATIONS[stage - 1];
  const allDone = stage > 5;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex h-full flex-col gap-4"
    >
      <h2 className="text-center font-serif text-2xl font-bold">Grünwald</h2>
      <VillageMap currentStage={stage} onPick={onPick} />

      {allDone ? (
        <div className="space-y-3">
          <SpeechBubble>Alle fünf Hinweise! Jetzt zum Gemeindesaal!</SpeechBubble>
          <button className="w-full rounded-full border-[3px] border-ink bg-stamp py-4 font-serif text-lg font-bold text-paper shadow-paper-lift">
            Zum Hearing →
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-3">
          <MajaAvatar emotion="thinking" size={72} />
          <SpeechBubble>
            Nächste Station: <strong>{current.ort}</strong>. Tippe drauf!
          </SpeechBubble>
        </div>
      )}
    </motion.div>
  );
}

function TravelScene({
  stage,
  to,
  onDone,
}: {
  stage: number;
  to: StationId;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 1900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col gap-4"
    >
      <h2 className="text-center font-mono-typed text-xs uppercase tracking-widest text-ink/60">
        Unterwegs …
      </h2>
      <VillageMap currentStage={stage} onPick={() => {}} travelingTo={to} />
      <SpeechBubble>Auf zum {STATIONS.find((s) => s.id === to)?.ort}!</SpeechBubble>
    </motion.div>
  );
}

function StationIntroScene({
  id,
  step,
  onNext,
}: {
  id: StationId;
  step: number;
  onNext: (n: number) => void;
}) {
  const station = STATIONS.find((s) => s.id === id)!;
  const panel: Panel = station.intro[step];
  const isLast = step === station.intro.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="flex h-full flex-col gap-4"
    >
      <ComicPanel className="flex aspect-square w-full items-center justify-center p-6" tilt={step % 2 === 0 ? -0.6 : 0.6}>
        <SceneIllustration scene={panel.scene} />
        {panel.text && (
          <div className="absolute left-3 top-3 rounded-sm bg-ink px-2 py-0.5 font-mono-typed text-[10px] uppercase tracking-wider text-paper">
            {panel.text}
          </div>
        )}
      </ComicPanel>

      {panel.maja && (
        <div className="flex items-end gap-3">
          <MajaAvatar emotion={panel.maja.emotion} size={84} />
          <SpeechBubble>{panel.maja.says}</SpeechBubble>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <div className="flex justify-center gap-1.5">
          {station.intro.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i <= step ? "bg-ink" : "bg-ink/20"
              }`}
            />
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onNext(step + 1)}
          className="flex w-full items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-[color:var(--color-sun)] py-4 font-serif text-lg font-bold text-ink shadow-paper"
        >
          {isLast ? "Rätsel starten" : "Weiter"} <ArrowRight className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function PuzzleScene({
  id,
  onSolved,
}: {
  id: StationId;
  onSolved: () => void;
}) {
  const station = STATIONS.find((s) => s.id === id)!;
  const [showHint, setShowHint] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
            Rätsel {station.nr}
          </p>
          <h2 className="font-serif text-xl font-bold">{station.thema}</h2>
        </div>
        <button
          onClick={() => setShowHint((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-paper shadow-paper"
          aria-label="Tipp"
        >
          <Lightbulb className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <SpeechBubble>
              Denk an die Strecke und das Transportmittel — was verbraucht am wenigsten Energie?
            </SpeechBubble>
          </motion.div>
        )}
      </AnimatePresence>

      {id === "bahnhof" ? (
        <MobilityPuzzle onSolved={onSolved} />
      ) : (
        <PlaceholderPuzzle id={id} onSolved={onSolved} />
      )}

      <button className="mt-auto inline-flex items-center justify-center gap-2 self-center rounded-full border-2 border-ink/30 bg-paper px-4 py-2 font-mono-typed text-[11px] uppercase tracking-wider text-ink/60">
        <QrCode className="h-3.5 w-3.5" /> Code vor Ort scannen
      </button>
    </motion.div>
  );
}

function ResolveScene({
  id,
  onContinue,
}: {
  id: StationId;
  onContinue: () => void;
}) {
  const station = STATIONS.find((s) => s.id === id)!;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col items-center justify-center gap-5 py-8"
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
        transition={{ duration: 0.8 }}
      >
        <MajaAvatar emotion="happy" size={140} />
      </motion.div>
      <SpeechBubble>Gelöst! 🎉</SpeechBubble>
      <ComicPanel className="w-full p-4">
        <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
          Wusstest du …?
        </p>
        <p className="mt-2 font-serif text-[15px] leading-snug">{station.fact}</p>
      </ComicPanel>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onContinue}
        className="w-full rounded-full border-[3px] border-ink bg-[color:var(--color-forest)] py-4 font-serif text-lg font-bold text-paper shadow-paper-lift"
      >
        Weiter zur Karte →
      </motion.button>
    </motion.div>
  );
}

/* ---------------- Bausteine ---------------- */

function PlaceholderPuzzle({
  id,
  onSolved,
}: {
  id: StationId;
  onSolved: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-ink/30 bg-paper-deep/30 p-6 text-center">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-ink/60">
        Rätsel folgt
      </p>
      <p className="font-serif text-sm text-ink/80">
        Das Rätsel zu {id} ist in Arbeit. Mit Tippen einmal überspringen.
      </p>
      <button
        onClick={onSolved}
        className="rounded-full border-2 border-ink bg-paper px-4 py-2 font-mono-typed text-xs uppercase tracking-wider"
      >
        Überspringen (Demo)
      </button>
    </div>
  );
}

function SceneIllustration({ scene }: { scene: Panel["scene"] }) {
  // Einfache SVG-Stilisierungen als Platzhalter
  const common = "h-3/4 w-3/4";
  if (scene === "letter")
    return (
      <svg viewBox="0 0 100 100" className={common}>
        <rect x="15" y="25" width="70" height="50" fill="var(--color-paper-deep)" stroke="var(--color-ink)" strokeWidth="2" />
        <path d="M 15 25 L 50 55 L 85 25" stroke="var(--color-ink)" strokeWidth="2" fill="none" />
      </svg>
    );
  if (scene === "station")
    return (
      <svg viewBox="0 0 100 100" className={common}>
        <rect x="20" y="45" width="60" height="30" fill="var(--color-clay)" stroke="var(--color-ink)" strokeWidth="2" />
        <polygon points="15,45 50,25 85,45" fill="var(--color-bark)" stroke="var(--color-ink)" strokeWidth="2" />
        <rect x="35" y="58" width="10" height="17" fill="var(--color-ink)" />
        <rect x="55" y="55" width="14" height="10" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1.5" />
      </svg>
    );
  if (scene === "discovery")
    return (
      <svg viewBox="0 0 100 100" className={common}>
        <circle cx="50" cy="55" r="28" fill="var(--color-sun)" stroke="var(--color-ink)" strokeWidth="2" />
        <text x="50" y="65" textAnchor="middle" fontSize="34" fontFamily="serif" fontWeight="700">!</text>
      </svg>
    );
  if (scene === "puzzle")
    return (
      <svg viewBox="0 0 100 100" className={common}>
        <rect x="20" y="20" width="25" height="25" fill="var(--color-forest)" stroke="var(--color-ink)" strokeWidth="2" />
        <rect x="55" y="20" width="25" height="25" fill="var(--color-clay)" stroke="var(--color-ink)" strokeWidth="2" />
        <rect x="20" y="55" width="25" height="25" fill="var(--color-sun)" stroke="var(--color-ink)" strokeWidth="2" />
        <rect x="55" y="55" width="25" height="25" fill="var(--color-stamp)" stroke="var(--color-ink)" strokeWidth="2" />
      </svg>
    );
  if (scene === "success")
    return (
      <svg viewBox="0 0 100 100" className={common}>
        <path d="M 25 50 L 45 70 L 80 30" stroke="var(--color-forest)" strokeWidth="8" fill="none" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 100 100" className={common}>
      <circle cx="50" cy="50" r="30" fill="var(--color-meadow)" stroke="var(--color-ink)" strokeWidth="2" />
    </svg>
  );
}
