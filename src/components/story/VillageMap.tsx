import { motion } from "motion/react";
import { Check, Lock } from "lucide-react";
import { STATIONS, type StationId } from "@/lib/story-content";

export function VillageMap({
  currentStage,
  onPick,
  travelingTo,
}: {
  /** 1..5 = aktuelle Station; 6 = Finale */
  currentStage: number;
  onPick: (id: StationId) => void;
  travelingTo?: StationId | null;
}) {
  const prevStation = currentStage > 1 ? STATIONS[currentStage - 2] : null;
  const nextStation = travelingTo ? STATIONS.find((s) => s.id === travelingTo) : null;

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl border-2 border-ink bg-[color:var(--color-meadow)] shadow-paper-lift">
      {/* Hügel-Hintergrund */}
      <svg
        viewBox="0 0 300 400"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="grass" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="6" r="0.8" fill="var(--color-forest)" opacity="0.25" />
            <circle cx="10" cy="11" r="0.8" fill="var(--color-forest)" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="300" height="400" fill="url(#grass)" />
        {/* Hügel */}
        <path d="M -10 280 Q 80 220 160 260 T 320 240 L 320 410 L -10 410 Z" fill="var(--color-forest)" opacity="0.35" />
        <path d="M -10 320 Q 100 270 200 300 T 320 290 L 320 410 L -10 410 Z" fill="var(--color-forest)" opacity="0.5" />
        {/* Fluss */}
        <path
          d="M 240 60 Q 220 140 250 220 T 240 380"
          stroke="#7fb8d4"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Wald oben rechts */}
        {[...Array(8)].map((_, i) => (
          <g key={i} transform={`translate(${170 + (i % 4) * 18}, ${60 + Math.floor(i / 4) * 26})`}>
            <path d="M 0 12 L 8 -8 L 16 12 Z" fill="var(--color-forest)" stroke="var(--color-ink)" strokeWidth="1.2" />
          </g>
        ))}
        {/* Wege zwischen Stationen */}
        <path
          d="M 54 288 Q 130 240 126 220 Q 130 180 204 112 Q 240 200 165 312 Q 230 270 246 240"
          stroke="var(--color-ink)"
          strokeWidth="2"
          strokeDasharray="4 6"
          fill="none"
          opacity="0.4"
        />
      </svg>

      {/* Stationen */}
      {STATIONS.map((s) => {
        const status =
          currentStage > s.nr ? "done" : currentStage === s.nr ? "current" : "locked";
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => status === "current" && onPick(s.id)}
            disabled={status !== "current"}
            className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
            style={{ left: `${s.mapPos.x}%`, top: `${s.mapPos.y}%` }}
            aria-label={`${s.ort} – ${status}`}
          >
            <StationPin status={status} label={s.ort} nr={s.nr} />
          </button>
        );
      })}

      {/* Maja-Reiseanimation */}
      {prevStation && nextStation && (
        <motion.div
          initial={{ left: `${prevStation.mapPos.x}%`, top: `${prevStation.mapPos.y}%` }}
          animate={{ left: `${nextStation.mapPos.x}%`, top: `${nextStation.mapPos.y}%` }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl"
        >
          🚶‍♀️
        </motion.div>
      )}
    </div>
  );
}

function StationPin({
  status,
  label,
  nr,
}: {
  status: "done" | "current" | "locked";
  label: string;
  nr: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        animate={
          status === "current"
            ? { scale: [1, 1.12, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className={`relative grid h-11 w-11 place-items-center rounded-full border-[3px] border-ink shadow-paper ${
          status === "done"
            ? "bg-[color:var(--color-forest)] text-paper"
            : status === "current"
              ? "bg-[color:var(--color-sun)] text-ink"
              : "bg-paper-deep text-ink/40"
        }`}
      >
        {status === "done" ? (
          <Check className="h-5 w-5" strokeWidth={3} />
        ) : status === "locked" ? (
          <Lock className="h-4 w-4" />
        ) : (
          <span className="font-mono-typed text-base font-bold">{nr}</span>
        )}
      </motion.div>
      <span className="whitespace-nowrap rounded-sm bg-paper/90 px-1.5 py-0.5 font-mono-typed text-[10px] uppercase tracking-wider text-ink">
        {label}
      </span>
    </div>
  );
}
