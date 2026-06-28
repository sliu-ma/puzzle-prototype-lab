import { cn } from "@/lib/utils";
import type { Ratsperson } from "@/lib/story-beats";

interface Props {
  person: Ratsperson;
  size?: number;
  className?: string;
  shake?: boolean;
}

export function RatspersonAvatar({ person, size = 80, className, shake }: Props) {
  return (
    <div
      className={cn(
        "shrink-0 select-none",
        shake && "animate-[wiggle_0.5s_ease-in-out]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 88 88" width={size} height={size} aria-hidden>
        <ellipse cx="44" cy="84" rx="28" ry="3.5" fill="#1c1810" opacity="0.15" />
        {/* Kragen / Jackett */}
        <path
          d="M14 78 Q14 60 30 56 L58 56 Q74 60 74 78 Z"
          fill={person.farbe}
          stroke="#1c1810"
          strokeWidth="2"
        />
        {/* Hals */}
        <rect x="38" y="50" width="12" height="10" fill="#e8c2a0" stroke="#1c1810" strokeWidth="1.5" />
        {/* Kopf */}
        <circle cx="44" cy="38" r="22" fill="#e8c2a0" stroke="#1c1810" strokeWidth="2" />
        {/* Haare */}
        <path
          d="M22 32 Q22 14 44 14 Q66 14 66 32 Q60 24 50 25 Q44 26 38 25 Q28 24 22 32 Z"
          fill="#2a1a14"
        />
        {/* Augen */}
        <circle cx="36" cy="36" r="1.8" fill="#1c1810" />
        <circle cx="52" cy="36" r="1.8" fill="#1c1810" />
        {/* Mund */}
        <path d="M36 46 Q44 50 52 46" stroke="#1c1810" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Initiale-Pin */}
        <circle cx="68" cy="70" r="10" fill="#faf9f5" stroke="#1c1810" strokeWidth="2" />
        <text
          x="68"
          y="74"
          textAnchor="middle"
          fontFamily="serif"
          fontWeight="700"
          fontSize="12"
          fill={person.farbe}
        >
          {person.initiale}
        </text>
      </svg>
    </div>
  );
}
