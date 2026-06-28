import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  tail?: "left" | "right" | "bottom";
  className?: string;
  /** Typewriter-Geschwindigkeit ms/Zeichen, 0 = sofort */
  speed?: number;
  /** Wenn true, wird Tap-to-Skip aktiviert */
  onDone?: () => void;
}

export function SpeechBubble({
  text,
  tail = "left",
  className,
  speed = 22,
  onDone,
}: Props) {
  const [shown, setShown] = useState(speed === 0 ? text : "");
  const [done, setDone] = useState(speed === 0);

  useEffect(() => {
    if (speed === 0) {
      setShown(text);
      setDone(true);
      return;
    }
    setShown("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, onDone]);

  const skip = () => {
    if (!done) {
      setShown(text);
      setDone(true);
      onDone?.();
    }
  };

  return (
    <div
      onClick={skip}
      className={cn(
        "relative inline-block max-w-full rounded-2xl border-2 border-ink bg-paper px-4 py-2.5 font-serif text-[15px] leading-snug shadow-[2px_2px_0_var(--color-ink)]",
        "animate-scale-in",
        className,
      )}
      style={{ cursor: done ? "default" : "pointer" }}
    >
      {/* Tail */}
      {tail === "left" && (
        <>
          <span
            aria-hidden
            className="absolute -left-3 top-5 h-0 w-0 border-y-[10px] border-r-[14px] border-y-transparent border-r-ink"
          />
          <span
            aria-hidden
            className="absolute -left-2 top-[22px] h-0 w-0 border-y-[8px] border-r-[12px] border-y-transparent border-r-paper"
          />
        </>
      )}
      {tail === "right" && (
        <>
          <span
            aria-hidden
            className="absolute -right-3 top-5 h-0 w-0 border-y-[10px] border-l-[14px] border-y-transparent border-l-ink"
          />
          <span
            aria-hidden
            className="absolute -right-2 top-[22px] h-0 w-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-paper"
          />
        </>
      )}
      {tail === "bottom" && (
        <>
          <span
            aria-hidden
            className="absolute -bottom-3 left-6 h-0 w-0 border-x-[10px] border-t-[14px] border-x-transparent border-t-ink"
          />
          <span
            aria-hidden
            className="absolute -bottom-2 left-7 h-0 w-0 border-x-[8px] border-t-[12px] border-x-transparent border-t-paper"
          />
        </>
      )}
      <span>{shown}</span>
      {!done && <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-ink">&nbsp;</span>}
    </div>
  );
}
