import { motion } from "motion/react";
import type { MajaEmotion } from "@/lib/story-content";

/** SVG-Platzhalter-Avatar von Maja (Comic-Stil, austauschbar). */
export function MajaAvatar({
  emotion = "neutral",
  size = 96,
}: {
  emotion?: MajaEmotion;
  size?: number;
}) {
  // Augen & Mund pro Emotion
  const eyes = {
    neutral: { ry: 4 },
    surprised: { ry: 6 },
    worried: { ry: 3 },
    happy: { ry: 2 },
    thinking: { ry: 4 },
  }[emotion];

  const mouthPath = {
    neutral: "M 38 70 Q 50 73 62 70",
    surprised: "M 44 70 Q 50 78 56 70 Q 50 66 44 70",
    worried: "M 38 74 Q 50 68 62 74",
    happy: "M 36 68 Q 50 82 64 68",
    thinking: "M 40 72 L 58 72",
  }[emotion];

  return (
    <motion.div
      key={emotion}
      initial={{ scale: 0.85, y: 6 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      style={{ width: size, height: size }}
      aria-label={`Maja – ${emotion}`}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Schatten */}
        <ellipse cx="50" cy="94" rx="26" ry="3" fill="#000" opacity="0.12" />
        {/* Hals/Schulter */}
        <path
          d="M 30 96 Q 30 80 50 80 Q 70 80 70 96 Z"
          fill="var(--color-forest)"
          stroke="var(--color-ink)"
          strokeWidth="2"
        />
        {/* Haare hinten */}
        <path
          d="M 20 50 Q 18 22 50 18 Q 82 22 80 50 Q 78 70 70 76 L 30 76 Q 22 70 20 50 Z"
          fill="var(--color-bark)"
          stroke="var(--color-ink)"
          strokeWidth="2"
        />
        {/* Gesicht */}
        <ellipse
          cx="50"
          cy="52"
          rx="22"
          ry="26"
          fill="#f3d3a8"
          stroke="var(--color-ink)"
          strokeWidth="2"
        />
        {/* Pony */}
        <path
          d="M 30 38 Q 38 28 50 30 Q 64 28 70 40 Q 60 36 50 38 Q 40 36 30 38 Z"
          fill="var(--color-bark)"
          stroke="var(--color-ink)"
          strokeWidth="2"
        />
        {/* Augen */}
        <ellipse cx="42" cy="54" rx="2.4" ry={eyes.ry} fill="var(--color-ink)" />
        <ellipse cx="58" cy="54" rx="2.4" ry={eyes.ry} fill="var(--color-ink)" />
        {/* Augenbrauen */}
        {emotion === "worried" && (
          <>
            <path d="M 38 47 L 46 49" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 62 47 L 54 49" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}
        {emotion === "surprised" && (
          <>
            <path d="M 38 46 Q 42 43 46 46" stroke="var(--color-ink)" strokeWidth="1.8" fill="none" />
            <path d="M 54 46 Q 58 43 62 46" stroke="var(--color-ink)" strokeWidth="1.8" fill="none" />
          </>
        )}
        {/* Mund */}
        <path d={mouthPath} stroke="var(--color-ink)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Wangen wenn happy */}
        {emotion === "happy" && (
          <>
            <circle cx="36" cy="64" r="2.4" fill="var(--color-stamp)" opacity="0.45" />
            <circle cx="64" cy="64" r="2.4" fill="var(--color-stamp)" opacity="0.45" />
          </>
        )}
      </svg>
    </motion.div>
  );
}
