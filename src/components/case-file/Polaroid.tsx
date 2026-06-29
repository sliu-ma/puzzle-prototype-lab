import { cn } from "@/lib/utils";

interface PolaroidProps {
  initial: string;
  caption: string;
  subline?: string;
  color?: "sky" | "amber" | "emerald" | "rose" | "violet";
  rotate?: number;
  className?: string;
  tape?: boolean;
}

const PALETTE: Record<NonNullable<PolaroidProps["color"]>, string> = {
  sky: "bg-sky-200",
  amber: "bg-amber-200",
  emerald: "bg-emerald-200",
  rose: "bg-rose-200",
  violet: "bg-violet-200",
};

export function Polaroid({
  initial,
  caption,
  subline,
  color = "amber",
  rotate = -3,
  className,
  tape = true,
}: PolaroidProps) {
  return (
    <div
      className={cn(
        "relative inline-block rounded-sm bg-paper p-3 pb-4 shadow-paper-lift",
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {tape && (
        <span
          aria-hidden
          className="tape absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-[2px]"
        />
      )}
      <div
        className={cn(
          "flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44",
          PALETTE[color],
        )}
      >
        <span className="font-serif text-6xl font-bold text-foreground/85 sm:text-7xl">
          {initial}
        </span>
      </div>
      <p className="mt-3 text-center font-serif text-sm font-semibold leading-tight">
        {caption}
      </p>
      {subline && (
        <p className="mt-1 text-center font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
          {subline}
        </p>
      )}
    </div>
  );
}
