import { cn } from "@/lib/utils";

interface StampProps {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
}

export function Stamp({ children, className, rotate = -8 }: StampProps) {
  return (
    <span
      className={cn(
        "stamp-mark inline-block rounded-sm px-3 py-1 text-xs",
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
