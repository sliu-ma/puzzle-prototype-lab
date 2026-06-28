import { useEffect, useState } from "react";
import { MajaAvatar, type MajaMood } from "./MajaAvatar";
import { SpeechBubble } from "./SpeechBubble";

interface Props {
  open: boolean;
  mood?: MajaMood;
  text: string;
  onClose: () => void;
  /** Auto-Close in ms; 0 = aus */
  autoMs?: number;
}

export function SuccessReaction({ open, mood = "daumen-hoch", text, onClose, autoMs = 2200 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) return;
    setVisible(true);
    if (!autoMs) return;
    const id = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200);
    }, autoMs);
    return () => clearTimeout(id);
  }, [open, autoMs, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={() => {
        setVisible(false);
        setTimeout(onClose, 200);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm animate-fade-in"
    >
      {/* Konfetti-Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, oklch(0.92 0.18 90 / 0.45), transparent 55%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-3 px-4 animate-scale-in">
        <div className="rounded-full border-[3px] border-ink bg-paper p-3 shadow-[4px_4px_0_var(--color-ink)]">
          <MajaAvatar mood={mood} size={120} />
        </div>
        <SpeechBubble text={text} tail="bottom" speed={14} />
        {visible && (
          <p className="mt-1 font-mono-typed text-[10px] uppercase tracking-[0.2em] text-paper/80">
            Tippen zum Fortfahren
          </p>
        )}
      </div>
    </div>
  );
}
