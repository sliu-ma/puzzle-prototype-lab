import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

type Props = {
  show: boolean;
  label?: string;
  sublabel?: string;
  onDone?: () => void;
  duration?: number;
};

export function SuccessStamp({
  show,
  label = "Hinweis gesichert",
  sublabel,
  onDone,
  duration = 1600,
}: Props) {
  useEffect(() => {
    if (!show || !onDone) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [show, onDone, duration]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="stamp-slam flex flex-col items-center gap-3">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-stamp bg-paper shadow-2xl sm:h-36 sm:w-36">
          <CheckCircle2 className="h-14 w-14 text-stamp sm:h-20 sm:w-20" strokeWidth={2.5} />
        </div>
        <p className="rounded-sm border-2 border-stamp bg-paper px-4 py-1.5 font-mono-typed text-sm uppercase tracking-[0.3em] text-stamp shadow-md sm:text-base">
          {label}
        </p>
        {sublabel && (
          <p className="font-serif italic text-paper drop-shadow">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
