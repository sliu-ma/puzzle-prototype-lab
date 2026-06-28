import { cn } from "@/lib/utils";

export type MajaMood =
  | "neutral"
  | "denkend"
  | "staunend"
  | "daumen-hoch"
  | "besorgt"
  | "freude";

interface Props {
  mood?: MajaMood;
  size?: number;
  className?: string;
}

/**
 * Stilisierter Comic-Avatar von Maja — reine SVG, keine externen Assets.
 * Augen/Mund wechseln mit dem Mood.
 */
export function MajaAvatar({ mood = "neutral", size = 72, className }: Props) {
  const eye = mood === "staunend" ? 3.2 : 2.2;
  const eyeY = mood === "denkend" ? 33 : 32;
  const brow =
    mood === "besorgt"
      ? "M22 24 L31 27 M58 27 L67 24"
      : mood === "denkend"
        ? "M22 26 L31 24 M58 24 L67 26"
        : "M22 25 L31 25 M58 25 L67 25";

  // Mund-Pfade
  const mouth = (() => {
    switch (mood) {
      case "staunend":
        return <ellipse cx="44" cy="50" rx="3.5" ry="5" fill="#1c1810" />;
      case "daumen-hoch":
      case "freude":
        return (
          <path
            d="M32 47 Q44 60 56 47"
            stroke="#1c1810"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "besorgt":
        return (
          <path
            d="M34 53 Q44 47 54 53"
            stroke="#1c1810"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "denkend":
        return (
          <path
            d="M36 51 L52 49"
            stroke="#1c1810"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        );
      default:
        return (
          <path
            d="M34 49 Q44 54 54 49"
            stroke="#1c1810"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        );
    }
  })();

  return (
    <svg
      viewBox="0 0 88 88"
      width={size}
      height={size}
      className={cn("shrink-0 select-none", className)}
      aria-hidden
    >
      {/* Schatten-Kragen */}
      <ellipse cx="44" cy="84" rx="30" ry="4" fill="#1c1810" opacity="0.15" />
      {/* Haare hinten */}
      <path
        d="M14 44 Q14 12 44 12 Q74 12 74 44 L74 60 Q74 64 70 64 L18 64 Q14 64 14 60 Z"
        fill="#3a2a1a"
      />
      {/* Gesicht */}
      <circle cx="44" cy="42" r="24" fill="#f4d4b8" stroke="#1c1810" strokeWidth="2" />
      {/* Pony */}
      <path
        d="M22 32 Q30 18 44 18 Q58 18 66 32 Q60 26 50 28 Q44 30 38 28 Q28 26 22 32 Z"
        fill="#3a2a1a"
      />
      {/* Augenbrauen */}
      <path d={brow} stroke="#1c1810" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Augen */}
      <circle cx="36" cy={eyeY} r={eye} fill="#1c1810" />
      <circle cx="52" cy={eyeY} r={eye} fill="#1c1810" />
      {/* Wangen */}
      {(mood === "freude" || mood === "daumen-hoch") && (
        <>
          <circle cx="29" cy="46" r="3" fill="#e88a8a" opacity="0.6" />
          <circle cx="59" cy="46" r="3" fill="#e88a8a" opacity="0.6" />
        </>
      )}
      {/* Mund */}
      {mouth}
      {/* Daumen-hoch */}
      {mood === "daumen-hoch" && (
        <g transform="translate(60 56) rotate(-12)">
          <rect x="0" y="6" width="14" height="16" rx="3" fill="#f4d4b8" stroke="#1c1810" strokeWidth="1.5" />
          <path
            d="M3 6 Q3 -2 9 -2 Q13 -2 13 4 L13 6 Z"
            fill="#f4d4b8"
            stroke="#1c1810"
            strokeWidth="1.5"
          />
        </g>
      )}
      {/* Gedankenpunkt */}
      {mood === "denkend" && (
        <g>
          <circle cx="72" cy="22" r="3" fill="#1c1810" opacity="0.7" />
          <circle cx="78" cy="14" r="2" fill="#1c1810" opacity="0.5" />
        </g>
      )}
    </svg>
  );
}
