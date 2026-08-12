import { Train, Plane, Car, ChevronRight } from "lucide-react";
import { ROUTES, type RouteOption } from "@/lib/mobility-data";
import { cn } from "@/lib/utils";

type Props = {
  onSelect: (id: string) => void;
};

function RouteIcon({ k, className }: { k: "train" | "plane" | "car"; className?: string }) {
  if (k === "train") return <Train className={className} />;
  if (k === "plane") return <Plane className={className} />;
  return <Car className={className} />;
}

export function RouteCards({ onSelect }: Props) {
  return (
    <div className="space-y-3">
      {ROUTES.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r.id)}
          className={cn(
            "group flex w-full items-center justify-between gap-4 rounded-sm border border-border bg-paper px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-stamp/60 hover:shadow-md",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 items-center gap-1 text-foreground">
              {r.iconKeys.map((k, i) => (
                <RouteIcon key={i} k={k} className="h-5 w-5" />
              ))}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-serif text-lg font-bold">{r.titel}</h4>
              </div>
              <p className="mt-0.5 font-mono-typed text-xs text-muted-foreground">
                {r.dauer} · {r.preis}
              </p>
            </div>
          </div>
          <ChevronRight
            className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}

export type { RouteOption };
