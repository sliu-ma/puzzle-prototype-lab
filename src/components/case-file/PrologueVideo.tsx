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

  // Ohne Skip-Erlaubnis (Einzelspieler) gibt es keinen Knopf; nur die Lehrperson
  // braucht auf der Schlusstafel ein «Weiter».
  const showSkip =
    allowSkip || (holdOnOutro && (phase === "outro" || phase === "done"));

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-[oklch(0.14_0.01_60)] prologue-grain">
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
          className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-sm border border-paper/30 bg-black/30 px-4 py-2.5 font-mono-typed text-xs uppercase tracking-[0.2em] text-paper/70"
        >
          {phase === "outro" || phase === "done" ? "Weiter" : "Überspringen"}
        </button>
      )}

      {phase === "video" ? (
        <div className="flex h-full w-full items-center justify-center p-2 sm:p-4">
          <video
            ref={videoRef}
            src={PROLOGUE_VIDEO_URL}
            controls
            playsInline
            preload="auto"
            onEnded={() => setPhase("outro")}
            className="h-full w-full animate-fade-in object-contain"
          />
        </div>
      ) : (
        <div className="flex max-h-full w-full max-w-5xl flex-col justify-center overflow-y-auto px-6 py-10 text-center sm:px-10">
          {phase === "intro" && (
            <div className="animate-prologue-fade">
              <p className="font-mono-typed uppercase tracking-[0.25em] text-kraft text-[clamp(0.75rem,2.6vmin,1.6rem)] sm:tracking-[0.35em]">
                {dateLabel}
              </p>
              <p className="mt-4 break-words text-balance font-serif leading-[1.15] text-paper text-[clamp(1.75rem,8vmin,5rem)] sm:mt-6">
                {PROLOGUE_INTRO_PLACE}
              </p>
            </div>
          )}
          {(phase === "outro" || phase === "done") && (
            <div className="animate-prologue-fade-slow">
              <p className="break-words text-balance font-serif leading-[1.25] text-paper/95 text-[clamp(1.5rem,6.5vmin,4rem)]">
                {PROLOGUE_OUTRO_TEXT}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
