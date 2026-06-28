import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import { StoryIntro } from "./StoryIntro";
import { SuccessStamp } from "./SuccessStamp";
import type { StoryArc } from "@/lib/story-beats";

type Props = {
  arc: StoryArc;
  /** flips to true wenn das Rätsel gelöst wurde — triggert die Erfolgs-Animation einmalig */
  successOn?: boolean;
  successLabel?: string;
  /** eindeutiger Key pro Etappe, um die Story nur beim ersten Besuch automatisch zu zeigen */
  sessionKey: string;
};

export function EtappenStory({
  arc,
  successOn = false,
  successLabel = "Hinweis gesichert",
  sessionKey,
}: Props) {
  const [storyOpen, setStoryOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const triggered = useRef(false);

  // Story beim ersten Besuch der Etappe automatisch öffnen
  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(sessionKey);
      if (!seen) {
        setStoryOpen(true);
        sessionStorage.setItem(sessionKey, "1");
      }
    } catch {
      /* ignore */
    }
  }, [sessionKey]);

  // Erfolgs-Animation einmalig, wenn successOn true wird
  useEffect(() => {
    if (successOn && !triggered.current) {
      triggered.current = true;
      setShowSuccess(true);
    }
  }, [successOn]);

  return (
    <>
      <StoryIntro arc={arc} open={storyOpen} onClose={() => setStoryOpen(false)} />
      <SuccessStamp
        show={showSuccess}
        label={successLabel}
        sublabel={arc.thema}
        onDone={() => setShowSuccess(false)}
      />

      {/* Floating Re-Play Button */}
      <button
        onClick={() => setStoryOpen(true)}
        aria-label="Story nochmal lesen"
        className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-2 font-mono-typed text-[10px] uppercase tracking-wider text-foreground/70 shadow-md backdrop-blur hover:bg-secondary"
      >
        <BookOpen className="h-3.5 w-3.5" /> Story
      </button>
    </>
  );
}
