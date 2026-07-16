import { useEffect, useState, useCallback } from "react";

interface SuccessBurstProps {
  show: boolean;
  onDone?: () => void;
  label?: string;
  duration?: number;
}

/**
 * Ruhige, aktenhafte Erfolgs-Animation:
 * Ein grüner Stempel-Haken stempelt ein, sanfter Ring pulsiert, dann Fade-out.
 * Kein Konfetti. Respektiert prefers-reduced-motion.
 */
export function SuccessBurst({
  show,
  onDone,
  label = "Gelöst!",
  duration = 1200,
}: SuccessBurstProps) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onDone?.(), duration);
    return () => clearTimeout(t);
  }, [show, onDone, duration]);

  if (!show) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-background/40 backdrop-blur-[2px]"
      style={{ animation: "sb-fade 1200ms ease-out forwards" }}
      role="status"
      aria-live="polite"
    >
      <style>{`
        @keyframes sb-fade {
          0% { opacity: 0; }
          15% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes sb-stamp {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          55% { transform: scale(1.08) rotate(2deg); opacity: 1; }
          75% { transform: scale(0.98) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes sb-ring {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes sb-check {
          0% { stroke-dashoffset: 60; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes sb-text {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sb-stamp, .sb-ring, .sb-check, .sb-text {
            animation: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-28 w-28 items-center justify-center">
          {/* Pulsierender Ring */}
          <span
            className="sb-ring absolute inset-0 rounded-full border-2 border-emerald-700"
            style={{ animation: "sb-ring 900ms ease-out 200ms forwards" }}
          />
          {/* Stempel-Scheibe */}
          <div
            className="sb-stamp flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-emerald-700 bg-paper shadow-lg"
            style={{ animation: "sb-stamp 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
          >
            <svg
              viewBox="0 0 48 48"
              className="h-14 w-14"
              fill="none"
              stroke="currentColor"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "hsl(160 60% 25%)" }}
            >
              <path
                className="sb-check"
                d="M12 25 L21 34 L37 16"
                strokeDasharray={60}
                strokeDashoffset={60}
                style={{ animation: "sb-check 400ms ease-out 300ms forwards" }}
              />
            </svg>
          </div>
        </div>
        <p
          className="sb-text font-serif text-2xl font-bold text-emerald-800"
          style={{ animation: "sb-text 300ms ease-out 400ms both" }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

/**
 * Kleine Hilfe: zeigt kurz die Erfolgs-Animation und ruft danach den Callback auf.
 * Verwendung:
 *   const { burst, celebrate } = useSuccessBurst();
 *   ...
 *   {burst}
 *   <Kind onErfolg={() => celebrate(() => goto("input"))} />
 */
export function useSuccessBurst(duration = 1200) {
  const [show, setShow] = useState(false);
  const [cb, setCb] = useState<(() => void) | null>(null);

  const celebrate = useCallback(
    (after?: () => void) => {
      setCb(() => after ?? null);
      setShow(true);
    },
    [],
  );

  const handleDone = useCallback(() => {
    setShow(false);
    const fn = cb;
    setCb(null);
    fn?.();
  }, [cb]);

  const burst = (
    <SuccessBurst show={show} onDone={handleDone} duration={duration} />
  );

  return { burst, celebrate };
}
