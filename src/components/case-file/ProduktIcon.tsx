import {
  Apple, Bean, Cake, CakeSlice, Carrot, Cherry, Citrus, Egg, IceCreamCone, Leaf, Milk,
  Nut, Salad, ShoppingBasket, Sprout, Wheat, Candy, CookingPot, Grape, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAP: Record<string, LucideIcon> = {
  "🌰": Nut, "🌱": Sprout, "🌾": Wheat, "🌿": Leaf, "🍅": Cherry, "🍋": Citrus,
  "🍎": Apple, "🍑": Grape, "🍓": Cherry, "🍦": IceCreamCone, "🍫": Candy,
  "🎃": Carrot, "🛒": ShoppingBasket, "🥒": Bean, "🥚": Egg, "🥛": Milk,
  "🥧": CakeSlice, "🥬": Salad, "🧁": Cake, "🧂": CookingPot, "🧈": Milk,
};

export function ProduktIcon({ emoji, className, circle = false }: { emoji: string; className?: string; circle?: boolean }) {
  const Icon = MAP[emoji] ?? Leaf;
  if (!circle) return <Icon aria-hidden className={cn("h-4 w-4", className)} strokeWidth={1.75} />;
  return (
    <span aria-hidden className="inline-flex h-full w-full aspect-square items-center justify-center rounded-full border border-border bg-secondary text-primary p-[18%]">
      <Icon className={cn("h-full w-full", className)} strokeWidth={1.5} />
    </span>
  );
}
