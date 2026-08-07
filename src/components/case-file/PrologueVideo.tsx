import { useEffect, useMemo, useRef, useState } from "react";
import {
  PROLOGUE_INTRO_PLACE,
  PROLOGUE_OUTRO_TEXT,
  PROLOGUE_VIDEO_URL,
  prologueIntroDate,
} from "@/lib/story";

type Phase = "intro" | "video" | "outro" | "done";

const INTRO_MS = 4200;
const OUTRO_MS = 4600;

/**
 * Vorgeschichte als Vollbild-Overlay: Titeltafel, Video, Schlusstafel.
 * `onFinished` feuert genau einmal, nachdem die Schlusstafel gezeigt wurde.
 */
export function PrologueOverlay({
  onFinished,
  allowSkip = true,
}: {
  onFinished: () => void;
  allowSkip?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const done = useRef(false);
  const dateLabel = useMemo(() => prologueIntroDate(), []);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setPhase("done");
    onFinished();
  };

  // Titeltafel -> Video
  useEffect(() => {
    if (phase !== "intro") return;
    const t = window.setTimeout(() => setPhase("video"), INTRO_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  // Video starten, sobald es sichtbar ist (Klick auf den Startknopf zählt als Nutzeraktion).
  useEffect(() => {
    if (phase !== "video") return;
    videoRef.current?.play().catch(() => undefined);
  }, [phase]);

  // Schlusstafel -> fertig
  useEffect(() => {
    if (phase !== "outro") return;
    const t = window.setTimeout(finish, OUTRO_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[oklch(0.14_0.01_60)] prologue-grain">
      {allowSkip && (
        <button
          type="button"
          onClick={() => (phase === "outro" ? finish() : setPhase("outro"))}
          className="absolute right-4 top-4 z-10 rounded-sm border border-paper/30 px-3 py-2 font-mono-typed text-[10px] uppercase tracking-[0.2em] text-paper/70"
        >
          Überspringen
        </button>
      )}

      {/* Gleiche Bühne für Tafeln und Video: 16:9, damit nichts springt. */}
      <div className="relative flex aspect-video max-h-full w-full max-w-5xl items-center justify-center overflow-hidden">
        {phase === "video" ? (
          <video
            ref={videoRef}
            src={PROLOGUE_VIDEO_URL}
            controls
            playsInline
            preload="auto"
            onEnded={() => setPhase("outro")}
            className="h-full w-full animate-fade-in object-contain"
          />
        ) : (
          <div className="w-full px-6 text-center sm:px-10">
            {phase === "intro" && (
              <div className="animate-prologue-fade">
                <span className="mx-auto block h-px w-24 bg-paper/40" />
                <p className="mt-5 font-mono-typed text-[11px] uppercase tracking-[0.36em] text-kraft sm:text-sm">
                  {dateLabel}
                </p>
                <p className="mt-4 font-serif text-[22px] font-semibold leading-snug text-paper [text-shadow:0_1px_10px_oklch(0_0_0/0.6)] sm:text-4xl">
                  {PROLOGUE_INTRO_PLACE}
                </p>
                <span className="mx-auto mt-6 block h-px w-24 bg-paper/40" />
              </div>
            )}
            {(phase === "outro" || phase === "done") && (
              <div className="animate-prologue-fade-slow">
                <span className="mx-auto block h-px w-16 bg-paper/35" />
                <p className="mt-6 font-serif text-[20px] font-semibold leading-relaxed text-paper [text-shadow:0_1px_10px_oklch(0_0_0/0.6)] sm:text-3xl">
                  {PROLOGUE_OUTRO_TEXT}
                </p>
                <span className="mx-auto mt-6 block h-px w-16 bg-paper/35" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
