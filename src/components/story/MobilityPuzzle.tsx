import { useState } from "react";
import { motion, Reorder } from "motion/react";
import { Train, Car, Plane, ArrowDown } from "lucide-react";
import { MOBILITY_OPTIONS } from "@/lib/story-content";

const ICONS = { train: Train, car: Car, plane: Plane } as const;

type Opt = (typeof MOBILITY_OPTIONS)[number];

export function MobilityPuzzle({ onSolved }: { onSolved: () => void }) {
  // Start in zufälliger (falscher) Reihenfolge
  const [items, setItems] = useState<Opt[]>(() => {
    const shuffled = [...MOBILITY_OPTIONS].sort(() => Math.random() - 0.5);
    // sicherstellen, dass nicht zufällig schon korrekt
    if (shuffled[0].id === "zug" && shuffled[2].id === "flug") {
      return [shuffled[2], shuffled[1], shuffled[0]];
    }
    return shuffled;
  });
  const [checked, setChecked] = useState<null | "ok" | "no">(null);

  const handleCheck = () => {
    const correct =
      items[0].id === "zug" && items[1].id === "auto" && items[2].id === "flug";
    if (correct) {
      setChecked("ok");
      setTimeout(onSolved, 900);
    } else {
      setChecked("no");
      setTimeout(() => setChecked(null), 1100);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 font-mono-typed text-[11px] uppercase tracking-wider text-ink/70">
        <span>Wenig CO₂</span>
        <ArrowDown className="h-3 w-3" />
      </div>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={setItems}
        className="flex w-full max-w-sm flex-col gap-3"
      >
        {items.map((opt, i) => {
          const Icon = ICONS[opt.icon as keyof typeof ICONS];
          return (
            <Reorder.Item
              key={opt.id}
              value={opt}
              className="cursor-grab touch-none active:cursor-grabbing"
              whileDrag={{ scale: 1.05, zIndex: 10 }}
            >
              <div
                className="flex items-center gap-4 rounded-xl border-[3px] border-ink bg-paper px-4 py-3 shadow-paper"
                style={{ transform: `rotate(${i === 1 ? 0.4 : -0.3}deg)` }}
              >
                <span className="font-mono-typed text-xs font-bold text-ink/40">
                  #{i + 1}
                </span>
                <div
                  className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink"
                  style={{ backgroundColor: opt.color, color: "var(--color-paper)" }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className="flex-1 font-serif text-lg font-bold">{opt.label}</span>
                <span aria-hidden className="text-ink/30">⋮⋮</span>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      <div className="font-mono-typed text-[11px] uppercase tracking-wider text-ink/70">
        Viel CO₂
      </div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleCheck}
        disabled={checked === "ok"}
        className="mt-2 w-full max-w-sm rounded-full border-[3px] border-ink bg-[color:var(--color-sun)] px-6 py-3 font-serif text-base font-bold text-ink shadow-paper transition-all disabled:opacity-60"
      >
        {checked === "ok" ? "Richtig! ✓" : checked === "no" ? "Nochmal probieren …" : "Reihenfolge prüfen"}
      </motion.button>
    </div>
  );
}
