import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function SpeechBubble({
  children,
  side = "left",
  className,
}: {
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={cn(
        "relative max-w-[78%] rounded-2xl border-2 border-ink bg-paper px-4 py-3 font-serif text-[15px] leading-snug text-ink shadow-paper",
        className,
      )}
      style={{ transform: "rotate(-0.4deg)" }}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-[10px] h-4 w-4 rotate-45 border-b-2 border-r-2 border-ink bg-paper",
          side === "left" ? "left-6" : "right-6",
        )}
      />
    </motion.div>
  );
}
