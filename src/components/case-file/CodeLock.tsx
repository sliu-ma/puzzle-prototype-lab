import { useState } from "react";
import { cn } from "@/lib/utils";
import { markWrongAttempt, hadWrongAttempt, unlock, type AchievementId } from "@/lib/achievements";

interface CodeLockProps {
  expected: string; // digit string, length defines field count
  onUnlock: () => void;
  /** Wenn gesetzt, wird bei jeder Falscheingabe markWrongAttempt(stage) aufgerufen. */
  achievementStage?: number;
  /** Wenn ohne Fehlversuch gelöst, wird dieses Achievement freigeschaltet. */
  firstTryAchievement?: AchievementId;
}

export function CodeLock({ expected, onUnlock, achievementStage, firstTryAchievement }: CodeLockProps) {
  const length = expected.length;
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");
  const [shake, setShake] = useState(false);

  const handleChange = (i: number, v: string) => {
    const cleaned = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = cleaned;
    setDigits(next);
    setStatus("idle");
    if (cleaned && i < length - 1) {
      const el = document.getElementById(`lock-d-${i + 1}`);
      el?.focus();
    }
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const el = document.getElementById(`lock-d-${i - 1}`);
      el?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < length) return;
    if (code === expected) {
      if (firstTryAchievement && achievementStage && !hadWrongAttempt(achievementStage)) {
        unlock(firstTryAchievement);
      }
      setStatus("correct");
      setTimeout(onUnlock, 600);
    } else {
      if (achievementStage) markWrongAttempt(achievementStage);
      setStatus("wrong");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className={cn(
          "flex items-center justify-center gap-2 sm:gap-3",
          shake && "animate-[shake_0.4s_ease-in-out]",
        )}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            id={`lock-d-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            className={cn(
              "h-16 w-12 rounded-sm border-2 bg-paper text-center font-mono-typed text-3xl font-bold text-ink shadow-inner transition-colors focus:outline-none sm:h-20 sm:w-16 sm:text-4xl",
              status === "wrong" && "border-stamp",
              status === "correct" && "border-emerald-700",
              status === "idle" && "border-border focus:border-ring",
            )}
            aria-label={`Ziffer ${i + 1}`}
          />
        ))}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>

      <div className="min-h-[1.5rem] text-center">
        {status === "wrong" && (
          <p className="font-mono-typed text-sm text-stamp">
            ✗ Falscher Code. Schau noch einmal genau hin…
          </p>
        )}
        {status === "correct" && (
          <p className="font-mono-typed text-sm text-emerald-800">
            ✓ Schloss geöffnet…
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={digits.some((d) => !d) || status === "correct"}
        className="w-full rounded-sm bg-primary py-3 font-serif text-base font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        Umschlag öffnen
      </button>
    </form>
  );
}
