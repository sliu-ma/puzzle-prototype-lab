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
 * `allowSkip=false`: kein Überspringen, bis das Video durchgelaufen ist.
 * `holdOnOutro`: Overlay bleibt auf der Schlusstafel stehen (Lehrperson schliesst selbst).
 */
export function PrologueOverlay({
  onFinished,
  allowSkip = true,
  holdOnOutro = false,
  onClose,
}: {
  onFinished: () => void;
  allowSkip?: boolean;
  holdOnOutro?: boolean;
  onClose?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const done = useRef(false);
  const dateLabel = useMemo(() => prologueIntroDate(), []);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    if (!holdOnOutro) setPhase("done");
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

  const showSkip = allowSkip || phase === "outro" || phase === "done";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[oklch(0.14_0.01_60)] prologue-grain">
      {showSkip && (
        <button
          type="button"
          onClick={() => {
            if (phase === "outro" || phase === "done") {
              finish();
              onClose?.();
            } else {
              setPhase("outro");
            }
          }}
          className="absolute right-4 top-4 z-10 rounded-sm border border-paper/30 px-4 py-2.5 font-mono-typed text-xs uppercase tracking-[0.2em] text-paper/70"
        >
          {phase === "outro" || phase === "done" ? "Weiter" : "Überspringen"}
        </button>
      )}

      {phase === "video" ? (
        <video
          ref={videoRef}
          src={PROLOGUE_VIDEO_URL}
          controls
          playsInline
          preload="auto"
          onEnded={() => setPhase("outro")}
          className="max-h-full w-full animate-fade-in"
        />
      ) : (
        <div className="w-full max-w-6xl px-6 text-center">
          {phase === "intro" && (
            <div className="animate-prologue-fade">
              <span className="mx-auto block h-px w-24 bg-paper/30" />
              <p className="mt-6 font-mono-typed uppercase tracking-[0.35em] text-kraft text-[clamp(1.1rem,3.4vw,2.6rem)]">
                {dateLabel}
              </p>
              <p className="mt-6 font-serif leading-[1.1] text-paper text-[clamp(2.4rem,8vw,7rem)]">
                {PROLOGUE_INTRO_PLACE}
              </p>
              <span className="mx-auto mt-8 block h-px w-24 bg-paper/30" />
            </div>
          )}
          {(phase === "outro" || phase === "done") && (
            <div className="animate-prologue-fade-slow">
              <span className="mx-auto block h-px w-16 bg-paper/25" />
              <p className="mt-8 font-serif leading-[1.15] text-paper/95 text-[clamp(2rem,6.5vw,5.5rem)]">
                {PROLOGUE_OUTRO_TEXT}
              </p>
              <span className="mx-auto mt-8 block h-px w-16 bg-paper/25" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
