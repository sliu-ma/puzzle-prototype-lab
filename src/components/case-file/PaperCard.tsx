import { cn } from "@/lib/utils";

interface PaperCardProps {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
  tape?: "top" | "top-left" | "top-right" | "none";
  onClick?: () => void;
  as?: "div" | "button";
  ariaLabel?: string;
}

export function PaperCard({
  children,
  className,
  rotate = 0,
  tape = "none",
  onClick,
  as = "div",
  ariaLabel,
}: PaperCardProps) {
  const Component = as;
  const interactive = !!onClick;

  return (
    <Component
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "paper-card relative rounded-sm p-6 transition-transform duration-200",
        interactive &&
          "cursor-pointer text-left hover:-translate-y-1 hover:paper-card-lift focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {tape !== "none" && (
        <span
          aria-hidden
          className={cn(
            "tape absolute h-5 w-20 rounded-[2px]",
            tape === "top" && "left-1/2 -top-2 -translate-x-1/2",
            tape === "top-left" && "-left-2 -top-2 -rotate-12",
            tape === "top-right" && "-right-2 -top-2 rotate-12",
          )}
        />
      )}
      {children}
    </Component>
  );
}
