import { useState } from "react";
import { ROUTES, type Leg, type RouteOption } from "@/lib/mobility-data";
import { RouteMap } from "./RouteMap";
import { cn } from "@/lib/utils";

type Props = {
  onSolved: () => void;
};

export function RouteCards({ onSolved }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChoose = (r: RouteOption) => {
    if (r.correct) {
      onSolved();
    } else {
      setError(
        "Diese Route ist nicht die nachhaltigste. Schau dir CO₂-Werte und Umsteige-Aufwand nochmal an.",
      );
      setTimeout(() => setError(null), 4000);
    }
  };

  return (
    <div className="space-y-3">
      {ROUTES.map((r) => {
        const isOpen = expanded === r.id;
        return (
          <div
            key={r.id}
            className={cn(
              "rounded-sm border bg-paper transition-colors",
              isOpen ? "border-stamp/60 shadow-md" : "border-border hover:border-foreground/40",
            )}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : r.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{r.icons.join(" ")}</span>
                  <h4 className="font-serif text-lg font-bold">{r.titel}</h4>
                </div>
                <p className="mt-0.5 font-mono-typed text-xs text-muted-foreground">
                  {r.dauer} · {r.preis} · ca. {r.co2Kg} kg CO₂
                </p>
              </div>
              <span aria-hidden className="text-muted-foreground">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-border px-4 py-4">
                <p className="text-sm text-foreground/85">{r.beschreibung}</p>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_240px]">
                  <SbbTimetable legs={r.legs} />
                  <div className="h-[260px] md:h-auto">
                    <RouteMap segments={r.segments} stops={r.stops} />
                  </div>
                </div>

                <button
                  onClick={() => handleChoose(r)}
                  className="mt-4 w-full rounded-sm bg-primary px-5 py-3 font-serif text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  📍 Diese Route wählen
                </button>
              </div>
            )}
          </div>
        );
      })}

      {error && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}

function SbbTimetable({ legs }: { legs: Leg[] }) {
  return (
    <ol className="space-y-2">
      {legs.map((leg, i) => {
        if (leg.kind === "transfer") {
          return (
            <li
              key={i}
              className="flex items-center justify-between rounded-sm bg-secondary/60 px-3 py-2 text-xs text-muted-foreground"
            >
              <span>↳ {leg.note}</span>
              <span className="font-mono-typed">{leg.duration}</span>
            </li>
          );
        }
        return (
          <li key={i} className="rounded-sm border border-border bg-paper-deep/30 px-3 py-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-serif font-bold">{leg.from}</span>
              {leg.depart && (
                <span className="font-mono-typed text-sm">
                  {leg.depart} {leg.platform && <span className="text-muted-foreground">{leg.platform}</span>}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              {leg.badge && (
                <span
                  className="rounded px-1.5 py-0.5 font-mono-typed text-[10px] font-bold"
                  style={{
                    backgroundColor: leg.badgeBg ?? "#1d4ed8",
                    color: leg.badgeColor ?? "#fff",
                  }}
                >
                  {leg.badge}
                </span>
              )}
              <span className="text-xs text-foreground/70">{leg.direction}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="font-serif font-bold">↳ {leg.to}</span>
              {leg.arrive && (
                <span className="font-mono-typed text-sm">
                  {leg.arrive}{" "}
                  {leg.arrivePlatform && (
                    <span className="text-muted-foreground">{leg.arrivePlatform}</span>
                  )}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
