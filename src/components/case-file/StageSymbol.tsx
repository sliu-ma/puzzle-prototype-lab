import { cn } from "@/lib/utils";
import { stageGlyph, stageLabelA11y } from "@/lib/stage-symbols";

/**
 * Runder Symbol-Badge einer Etappe. Wird für Pfad-Knoten, Umschlag-Hinweise
 * und Karten verwendet, damit das Symbol überall gleich aussieht.
 */
export function StageSymbol({
  nr,
  className,
  glyphClassName,
}: {
  nr: number;
  className?: string;
  glyphClassName?: string;
}) {
  return (
    <span
      role="img"
      aria-label={stageLabelA11y(nr)}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-stamp/60 bg-paper-deep/40 leading-none",
        className,
      )}
    >
      <span aria-hidden className={cn("text-sm", glyphClassName)}>
        {stageGlyph(nr)}
      </span>
    </span>
  );
}
