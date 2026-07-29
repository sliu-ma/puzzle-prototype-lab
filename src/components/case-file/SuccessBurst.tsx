import { useEffect, useState, useCallback } from "react";

interface SuccessBurstProps {
  show: boolean;
  onDone?: () => void;
  label?: string;
  duration?: number;
  stageNr?: number;
}

/**
 * Ruhige, aktenhafte Erfolgs-Animation:
 * Ein grüner Stempel-Haken stempelt ein, sanfter Ring pulsiert, dann Fade-out.
 * Optional wird darunter der Etappen-Fortschritt (n/5) eingeblendet.
 */
export function SuccessBurst({
  show,
  onDone,
  label = "Gelöst!",
  duration,
  stageNr,
}: SuccessBurstProps) {
  const hasStage = typeof stageNr === "number" && stageNr >= 1 && stageNr <= 5;
  const effectiveDuration = duration ?? (hasStage ? 2800 : 2000);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onDone?.(), effectiveDuration);
    return () => clearTimeout(t);
  }, [show, onDone, effectiveDuration]);

  if (!show) return null;

  const n = hasStage ? (stageNr as number) : 0;
  const remaining = 5 - n;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-background/40 backdrop-blur-[2px]"
      style={{ animation: `sb-fade ${effectiveDuration}ms ease-out forwards` }}
      role="status"
      aria-live="polite"
    >
      <style>{`
        @keyframes sb-fade {
          0% { opacity: 0; }
          10% { opacity: 1; }
          85% { opacity: 1; }
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
        @keyframes sb-dot {
          0% { opacity: 0; transform: scale(0.6); }
          100% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sb-stamp, .sb-ring, .sb-check, .sb-text, .sb-dot {
            animation: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col items-center gap-3 px-4">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span
            className="sb-ring absolute inset-0 rounded-full border-2 border-emerald-700"
            style={{ animation: "sb-ring 900ms ease-out 200ms forwards" }}
          />
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

        {hasStage && (
          <div
            className="sb-text mt-2 flex flex-col items-center gap-2 rounded-sm border border-border bg-card/90 px-4 py-3 shadow-sm"
            style={{ animation: "sb-text 400ms ease-out 600ms both" }}
          >
            <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Etappe {n} von 5 gelöst
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => {
                const done = i <= n;
                const isCurrent = i === n;
                const delay = 700 + i * 90;
                return (
                  <span
                    key={i}
                    className="sb-dot flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{
                      animation: `sb-dot 260ms ease-out ${delay}ms both`,
                      backgroundColor: done ? "hsl(160 60% 30%)" : "transparent",
                      color: done ? "white" : "hsl(var(--muted-foreground))",
                      border: done
                        ? "2px solid hsl(160 60% 25%)"
                        : "2px dashed hsl(var(--border))",
                      boxShadow: isCurrent
                        ? "0 0 0 3px hsl(160 60% 30% / 0.25)"
                        : "none",
                    }}
                    aria-label={
                      done ? `Etappe ${i} gelöst` : `Etappe ${i} offen`
                    }
                  >
                    {done ? "✓" : i}
                  </span>
                );
              })}
            </div>
            <p className="font-serif text-xs italic text-foreground/70">
              {remaining > 0
                ? `Noch ${remaining} ${remaining === 1 ? "Etappe" : "Etappen"} bis zum Hearing.`
                : "Alle Etappen gelöst, Hearing bereit."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type UseSuccessBurstOptions = { stageNr?: number; duration?: number };

/**
 * Zeigt kurz die Erfolgs-Animation und ruft danach den Callback auf.
 * Rückwärtskompatibel: useSuccessBurst() oder useSuccessBurst(2000) funktionieren weiter.
 */
export function useSuccessBurst(
  opts?: UseSuccessBurstOptions | number,
) {
  const options: UseSuccessBurstOptions =
    typeof opts === "number" ? { duration: opts } : (opts ?? {});
  const { stageNr, duration } = options;

  const [show, setShow] = useState(false);
  const [cb, setCb] = useState<(() => void) | null>(null);

  const celebrate = useCallback((after?: () => void) => {
    setCb(() => after ?? null);
    setShow(true);
  }, []);

  const handleDone = useCallback(() => {
    setShow(false);
    const fn = cb;
    setCb(null);
    fn?.();
  }, [cb]);

  const burst = (
    <SuccessBurst
      show={show}
      onDone={handleDone}
      duration={duration}
      stageNr={stageNr}
    />
  );

  return { burst, celebrate };
}
