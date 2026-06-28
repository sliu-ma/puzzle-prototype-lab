import { MajaAvatar } from "./MajaAvatar";
import { SpeechBubble } from "./SpeechBubble";
import type { Panel } from "@/lib/story-beats";
import { cn } from "@/lib/utils";

const BG: Record<Panel["setting"], string> = {
  bahnhof:
    "linear-gradient(160deg, oklch(0.86 0.04 240) 0%, oklch(0.78 0.03 260) 100%)",
  dorfladen:
    "linear-gradient(160deg, oklch(0.9 0.05 80) 0%, oklch(0.78 0.07 60) 100%)",
  wald:
    "linear-gradient(160deg, oklch(0.85 0.08 145) 0%, oklch(0.65 0.1 150) 100%)",
  haus:
    "linear-gradient(160deg, oklch(0.92 0.03 60) 0%, oklch(0.78 0.05 50) 100%)",
  kraftwerk:
    "linear-gradient(160deg, oklch(0.75 0.04 230) 0%, oklch(0.55 0.06 240) 100%)",
  saal:
    "linear-gradient(160deg, oklch(0.86 0.03 60) 0%, oklch(0.7 0.05 40) 100%)",
  brief:
    "linear-gradient(160deg, oklch(0.95 0.02 85) 0%, oklch(0.85 0.04 75) 100%)",
  portrait:
    "linear-gradient(160deg, oklch(0.9 0.04 30) 0%, oklch(0.75 0.07 25) 100%)",
};

interface Props {
  panel: Panel;
  speed?: number;
  className?: string;
}

export function ComicPanel({ panel, speed = 22, className }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border-[3px] border-ink shadow-[4px_4px_0_var(--color-ink)] animate-fade-in",
        className,
      )}
      style={{ background: BG[panel.setting] }}
    >
      {/* Setting-Andeutung */}
      <SettingHint setting={panel.setting} />

      <div className="relative z-10 flex items-end gap-3 p-4 sm:p-5">
        <MajaAvatar mood={panel.mood} size={84} />
        <div className="flex-1 pb-1">
          <SpeechBubble text={panel.text} tail="left" speed={speed} />
        </div>
      </div>
    </div>
  );
}

function SettingHint({ setting }: { setting: Panel["setting"] }) {
  // Dezente SVG-Skizze als Hintergrund (passend zum Setting)
  switch (setting) {
    case "bahnhof":
      return (
        <svg aria-hidden viewBox="0 0 400 200" className="absolute inset-0 h-full w-full opacity-25">
          <rect x="40" y="120" width="320" height="6" fill="#1c1810" />
          <rect x="60" y="80" width="80" height="40" fill="#1c1810" opacity="0.6" />
          <rect x="160" y="60" width="200" height="60" fill="#1c1810" opacity="0.4" />
          <circle cx="320" cy="100" r="6" fill="#1c1810" />
        </svg>
      );
    case "dorfladen":
      return (
        <svg aria-hidden viewBox="0 0 400 200" className="absolute inset-0 h-full w-full opacity-25">
          <rect x="40" y="40" width="320" height="120" fill="none" stroke="#1c1810" strokeWidth="3" />
          <line x1="40" y1="80" x2="360" y2="80" stroke="#1c1810" strokeWidth="2" />
          <rect x="60" y="90" width="40" height="60" fill="#1c1810" opacity="0.4" />
          <rect x="120" y="90" width="40" height="60" fill="#1c1810" opacity="0.4" />
        </svg>
      );
    case "wald":
      return (
        <svg aria-hidden viewBox="0 0 400 200" className="absolute inset-0 h-full w-full opacity-30">
          {[40, 110, 200, 290, 360].map((x) => (
            <g key={x}>
              <rect x={x - 4} y={120} width="8" height="40" fill="#1c1810" />
              <polygon points={`${x - 25},120 ${x + 25},120 ${x},60`} fill="#1c1810" />
            </g>
          ))}
        </svg>
      );
    case "haus":
      return (
        <svg aria-hidden viewBox="0 0 400 200" className="absolute inset-0 h-full w-full opacity-25">
          <polygon points="120,70 280,70 200,30" fill="#1c1810" />
          <rect x="120" y="70" width="160" height="90" fill="none" stroke="#1c1810" strokeWidth="3" />
          <rect x="180" y="110" width="40" height="50" fill="#1c1810" opacity="0.6" />
        </svg>
      );
    case "kraftwerk":
      return (
        <svg aria-hidden viewBox="0 0 400 200" className="absolute inset-0 h-full w-full opacity-25">
          <rect x="60" y="100" width="280" height="60" fill="#1c1810" opacity="0.5" />
          <path d="M60 100 Q150 60 200 100 T340 100" stroke="#1c1810" strokeWidth="3" fill="none" />
          <circle cx="120" cy="130" r="14" fill="#1c1810" opacity="0.6" />
        </svg>
      );
    case "brief":
      return (
        <svg aria-hidden viewBox="0 0 400 200" className="absolute inset-0 h-full w-full opacity-30">
          <rect x="80" y="40" width="240" height="140" fill="#fff" stroke="#1c1810" strokeWidth="2" transform="rotate(-3 200 110)" />
          {[70, 90, 110, 130].map((y) => (
            <line key={y} x1="100" y1={y} x2="300" y2={y} stroke="#1c1810" strokeWidth="1.5" transform="rotate(-3 200 110)" />
          ))}
        </svg>
      );
    case "saal":
      return (
        <svg aria-hidden viewBox="0 0 400 200" className="absolute inset-0 h-full w-full opacity-25">
          <rect x="60" y="120" width="280" height="40" fill="#1c1810" opacity="0.5" />
          {[100, 160, 220, 280].map((x) => (
            <circle key={x} cx={x} cy="100" r="14" fill="#1c1810" opacity="0.6" />
          ))}
        </svg>
      );
    case "portrait":
    default:
      return null;
  }
}
