import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

export type LatLng = [number, number];

export type RouteSegment = {
  coords: LatLng[];
  dashed?: boolean;
  color?: string;
};

export type RouteStop = {
  pos: LatLng;
  label: string;
  major?: boolean;
};

type Props = {
  segments: RouteSegment[];
  stops: RouteStop[];
  color?: string;
  minHeight?: number;
};

/**
 * Leaflet karte — wird nur clientseitig dynamisch geladen,
 * damit kein SSR-Fehler entsteht (Leaflet greift auf window zu).
 */
export function RouteMap({ segments, stops, color = "#5eead4", minHeight = 420 }: Props) {
  const [Lib, setLib] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import("react-leaflet");
      if (mounted) setLib(mod);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!Lib) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-sm border border-border bg-black/80 text-xs text-muted-foreground"
        style={{ minHeight }}
      >
        Karte lädt …
      </div>
    );
  }

  const { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } = Lib;

  const lats = stops.map((s) => s.pos[0]);
  const lngs = stops.map((s) => s.pos[1]);
  const bounds: [LatLng, LatLng] = [
    [Math.min(...lats) - 0.15, Math.min(...lngs) - 0.15],
    [Math.max(...lats) + 0.15, Math.max(...lngs) + 0.15],
  ];

  return (
    <div className="overflow-hidden rounded-sm border border-border" style={{ minHeight }}>
      <MapContainer
        bounds={bounds}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", minHeight, background: "#0a0f14" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {segments.map((seg, i) => (
          <Polyline
            key={i}
            positions={seg.coords}
            pathOptions={{
              color: seg.color ?? color,
              weight: 4,
              dashArray: seg.dashed ? "6 8" : undefined,
              opacity: 0.95,
            }}
          />
        ))}
        {stops.map((s, i) => (
          <CircleMarker
            key={i}
            center={s.pos}
            radius={s.major ? 6 : 3}
            pathOptions={{
              color: "#fff",
              weight: s.major ? 2 : 1,
              fillColor: s.major ? color : "#fff",
              fillOpacity: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent={false}>
              {s.label}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
