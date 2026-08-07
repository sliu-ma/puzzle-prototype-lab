import { useRef, useState } from "react";
import { Film, Play } from "lucide-react";
import {
  PROLOGUE_INTRO_TEXT,
  PROLOGUE_OUTRO_TEXT,
  PROLOGUE_SUBTITLE,
  PROLOGUE_TITLE,
  PROLOGUE_VIDEO_URL,
} from "@/lib/story";
import { cn } from "@/lib/utils";

type Phase = "idle" | "intro" | "video" | "outro";

const INTRO_MS = 3200;
const OUTRO_MS = 4200;

/**
 * Vorgeschichte als kleiner Film: Titeltafel, Video im Vollbild, Schlusstafel.
 * `onEnded` feuert genau einmal, nachdem die Schlusstafel gezeigt wurde.
 */
export function PrologueVideo({
  onEnded,
  className,
}: {
  onEnded?: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const done = useRef(false);

  const enterFullscreen = async () => {
    const el = ref.current as
      | (HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
          webkitRequestFullscreen?: () => Promise<void> | void;
        })
      | null;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else el.webkitEnterFullscreen?.();
    } catch {
      // Vollbild abgelehnt: normal weiterspielen.
    }
  };

  // Nutzeraktion: Vollbild vorbereiten, Titeltafel zeigen, dann Video starten.
  const start = () => {
    if (phase !== "idle") return;
    setPhase("intro");
    void enterFullscreen();
    window.setTimeout(() => {
      setPhase("video");
      const el = ref.current;
      if (el) {
        void enterFullscreen();
        el.play().catch(() => undefined);
      }
    }, INTRO_MS);
  };

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setPhase("outro");
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    window.setTimeout(() => onEnded?.(), OUTRO_MS);
  };

  return (
    <div className={cn("rounded-sm border border-border bg-card p-3", className)}>
      <p className="flex items-center gap-2 font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
        <Film className="h-3.5 w-3.5" />
        {PROLOGUE_TITLE}
      </p>

      <div className="relative mt-2 overflow-hidden rounded-sm bg-black">
        <video
          ref={ref}
          src={PROLOGUE_VIDEO_URL}
          controls={phase === "video"}
          playsInline={false}
          preload="metadata"
          onEnded={finish}
          className="w-full bg-black"
        />

        {phase !== "video" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 p-5 text-center">
            {phase === "idle" && (
              <button
                type="button"
                onClick={start}
                className="flex min-h-[48px] items-center gap-2 rounded-sm bg-primary px-5 font-serif text-base font-semibold text-primary-foreground"
              >
                <Play className="h-4 w-4" />
                Vorgeschichte abspielen
              </button>
            )}
            {phase === "intro" && (
              <p className="animate-fade-in font-serif text-lg leading-relaxed text-white/90 sm:text-2xl">
                «{PROLOGUE_INTRO_TEXT}»
              </p>
            )}
            {phase === "outro" && (
              <p className="animate-fade-in font-serif text-lg leading-relaxed text-white/90 sm:text-2xl">
                {PROLOGUE_OUTRO_TEXT}
              </p>
            )}
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">{PROLOGUE_SUBTITLE}</p>
    </div>
  );
}
