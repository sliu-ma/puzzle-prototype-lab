import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function ComicPanel({
  children,
  className,
  tilt = 0,
}: {
  children: React.ReactNode;
  className?: string;
  tilt?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -8 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      style={{ transform: `rotate(${tilt}deg)` }}
      className={cn(
        "relative overflow-hidden rounded-md border-[3px] border-ink bg-paper shadow-paper-lift",
        className,
      )}
    >
      {/* Halbton-Punkt-Textur */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-ink) 1px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
      />
      {children}
    </motion.div>
  );
}
