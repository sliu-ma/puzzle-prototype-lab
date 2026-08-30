import { useEffect, useState } from "react";
import {
  Train,
  Plane,
  Car,
  Footprints,
  ArrowLeft,
  MapPin,
  Leaf,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { ROUTES, fetchOsrmRoute, type Leg, type RouteOption } from "@/lib/mobility-data";
import { RouteMap } from "./RouteMap";
import { cn } from "@/lib/utils";

type Props = {
  routeId: string;
  onBack: () => void;
  onChoose: (r: RouteOption) => void;
  errorText: string | null;
};

function LegIcon({ k, className }: { k?: Leg["iconKey"]; className?: string }) {
  if (k === "train") return <Train className={className} />;
  if (k === "plane") return <Plane className={className} />;
  if (k === "car") return <Car className={className} />;
  if (k === "walk") return <Footprints className={className} />;
  return null;
}

export function RouteDetail({ routeId, onBack, onChoose, errorText }: Props) {
  const route = ROUTES.find((r) => r.id === routeId);
  const [segments, setSegments] = useState(route?.segments ?? []);

  // Auto-Route via OSRM nachladen
  useEffect(() => {
    if (!route?.osrm) {
      setSegments(route?.segments ?? []);
      return;
    }
    let mounted = true;
    setSegments(route.segments);
    fetchOsrmRoute(route.osrm.points).then((coords) => {
      if (mounted && coords) {
        setSegments([{ coords, color: route.segments[0]?.color ?? "#a78bfa" }]);
      }
    });
    return () => {
      mounted = false;
    };
  }, [route]);

  if (!route) return null;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 font-mono-typed text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Zurück zur Routen-Auswahl
      </button>

      {/* Header */}
      <div className="rounded-sm border border-border bg-paper p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-1 rounded-sm border border-border bg-paper-deep/40 p-2">
              {route.iconKeys.map((k, i) => (
                <LegIcon key={i} k={k} className="h-5 w-5" />
              ))}
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold leading-tight">{route.titel}</h3>
              <p className="mt-0.5 font-mono-typed text-xs text-muted-foreground">
                Genève <span className="px-1">›</span> Heerbrugg
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Stat label="Dauer" value={route.dauer} />
            <Stat label="Preis" value={route.preis} />
            <Stat label="CO₂ / Person" value={`${route.co2Kg} kg`} accent={route.co2Kg <= 10} />
          </div>
        </div>
      </div>

      {/* Karte gross & präsent */}
      <div>
        <RouteMap segments={segments} stops={route.stops} minHeight={420} />
      </div>

      {/* Verbindung im SBB-Stil */}
      <div className="rounded-sm border border-border bg-paper p-4 sm:p-5">
        <p className="font-mono-typed text-[10px] uppercase tracking-[0.15em] text-stamp">
          Verbindung im Detail
        </p>
        <h4 className="mt-1 font-serif text-lg font-bold">Reiseplan</h4>
        <ol className="mt-4 space-y-2">
          {route.legs.map((leg, i) => (
            <LegBlock key={i} leg={leg} />
          ))}
        </ol>
      </div>

      {errorText && (
        <div className="flex items-start gap-2 rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2.5 font-serif text-sm hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Andere Route
        </button>
        <button
          onClick={() => onChoose(route)}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-serif text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <MapPin className="h-4 w-4" /> Diese Route wählen
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-sm border px-3 py-1.5",
        accent ? "border-emerald-700/40 bg-emerald-700/10" : "border-border bg-paper-deep/30",
      )}
    >
      <div className="font-mono-typed text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "font-mono-typed text-sm font-bold",
          accent && "text-emerald-700",
        )}
      >
        {accent && <Leaf className="mr-1 inline h-3 w-3" />}
        {value}
      </div>
    </div>
  );
}

function LegBlock({ leg }: { leg: Leg }) {
  const [open, setOpen] = useState(false);

  if (leg.kind === "transfer") {
    return (
      <li className="flex items-center justify-between gap-2 rounded-sm bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <Footprints className="h-3.5 w-3.5" />
          {leg.note}
        </span>
        <span className="font-mono-typed">{leg.duration}</span>
      </li>
    );
  }

  const hasStops = !!leg.stops?.length;

  return (
    <li className="rounded-sm border border-border bg-paper-deep/20 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-serif font-bold">{leg.from}</span>
        {leg.depart && (
          <span className="font-mono-typed text-sm">
            {leg.depart}{" "}
            {leg.platform && (
              <span className="text-muted-foreground">· {leg.platform}</span>
            )}
          </span>
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <LegIcon k={leg.iconKey} className="h-4 w-4 text-foreground/70" />
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

      {hasStops && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
          />
          {open ? "Halte ausblenden" : `${leg.stops!.length} Zwischenhalte`}
        </button>
      )}

      {open && hasStops && (
        <ul className="mt-2 space-y-0.5 border-l border-dashed border-border pl-3 font-mono-typed text-[11px] text-foreground/75">
          {leg.stops!.map((s, i) => (
            <li key={i}>· {s.name}</li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex items-baseline justify-between gap-2 border-t border-dashed border-border pt-2">
        <span className="font-serif font-bold">↳ {leg.to}</span>
        {leg.arrive && (
          <span className="font-mono-typed text-sm">
            {leg.arrive}{" "}
            {leg.arrivePlatform && (
              <span className="text-muted-foreground">· {leg.arrivePlatform}</span>
            )}
          </span>
        )}
      </div>
    </li>
  );
}
