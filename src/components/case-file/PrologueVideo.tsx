import { useRef } from "react";
import { Film } from "lucide-react";
import { PROLOGUE_SUBTITLE, PROLOGUE_TITLE, PROLOGUE_VIDEO_URL } from "@/lib/story";
import { cn } from "@/lib/utils";

/**
 * Vorgeschichte als Video. `onEnded` feuert genau einmal pro Wiedergabe-Ende,
 * damit die Lehreransicht danach automatisch die Runde starten kann.
 */
export function PrologueVideo({
  onEnded,
  className,
  autoPlay = false,
}: {
  onEnded?: () => void;
  className?: string;
  autoPlay?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <div className={cn("rounded-sm border border-border bg-card p-3", className)}>
      <p className="flex items-center gap-2 font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
        <Film className="h-3.5 w-3.5" />
        {PROLOGUE_TITLE}
      </p>
      <video
        ref={ref}
        src={PROLOGUE_VIDEO_URL}
        controls
        playsInline
        autoPlay={autoPlay}
        preload="metadata"
        onEnded={onEnded}
        className="mt-2 w-full rounded-sm bg-black"
      />
      <p className="mt-2 text-xs text-muted-foreground">{PROLOGUE_SUBTITLE}</p>
    </div>
  );
}
