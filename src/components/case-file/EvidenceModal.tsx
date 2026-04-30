import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface EvidenceModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  children: React.ReactNode;
  className?: string;
}

export function EvidenceModal({
  open,
  onClose,
  title,
  kicker,
  children,
  className,
}: EvidenceModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 px-4 py-8 backdrop-blur-sm sm:py-16"
      onClick={onClose}
    >
      <div
        className={cn(
          "paper-card paper-card-lift relative w-full max-w-2xl rounded-sm bg-card p-6 sm:p-10",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Schließen"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          ✕
        </button>

        {kicker && (
          <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
            {kicker}
          </p>
        )}
        <h2
          id="evidence-modal-title"
          className="mt-2 font-serif text-3xl font-bold text-foreground"
        >
          {title}
        </h2>
        <div className="mt-6 text-[15px] leading-relaxed text-foreground/90">{children}</div>
      </div>
    </div>
  );
}
