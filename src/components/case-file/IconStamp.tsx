import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "urgent" | "success";

interface IconStampProps {
  icon: LucideIcon;
  tone?: Tone;
  rotate?: number;
  className?: string;
}

const TONE_CLASSES: Record<Tone, { border: string; text: string }> = {
  neutral: { border: "border-stamp", text: "text-stamp" },
  urgent: { border: "border-destructive", text: "text-destructive" },
  success: { border: "border-emerald-700", text: "text-emerald-700" },
};

/**
 * Kleiner Icon-Stempel für Info-Dialoge: runder Papier-Kreis mit farbigem
 * Rahmen und leichter Rotation, wie ein Aktenstempel.
 */
export function IconStamp({
  icon: Icon,
  tone = "neutral",
  rotate = -4,
  className,
}: IconStampProps) {
  const t = TONE_CLASSES[tone];
  return (
    <div
      className={cn(
        "mx-auto flex h-14 w-14 items-center justify-center rounded-full border-[2.5px] bg-paper shadow-sm motion-safe:transition-transform",
        t.border,
        className,
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <Icon className={cn("h-7 w-7", t.text)} strokeWidth={2.25} />
    </div>
  );
}
