import { useEffect, useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";

/** Koordinaten des Gemeindehauses Widnau, Neugasse 4. */
const GEMEINDEHAUS: [number, number] = [47.40560708592863, 9.635730145049182];
const ADDRESS = "Gemeindehaus Widnau, Neugasse 4, 9443 Widnau";
const ROUTE_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(ADDRESS);

/**
 * Klarer Hinweis, dass die Gruppe physisch zum Gemeindehaus Widnau muss,
 * um dort den QR-Code für das Hearing zu scannen. Adresse + Mini-Karte
 * (OpenStreetMap, kein API-Key) + Route-Button für Google Maps.
 *
 * Leaflet wird nur clientseitig dynamisch geladen (wie RouteMap), damit
 * SSR nicht bricht.
 */
export function HearingLocationHint() {
  const [Lib, setLib] = useState<null | {
    MapContainer: React.ComponentType<any>;
    TileLayer: React.ComponentType<any>;
    CircleMarker: React.ComponentType<any>;
    Popup: React.ComponentType<any>;
  }>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const mod = await import("react-leaflet");
      if (mounted)
        setLib({
          MapContainer: mod.MapContainer,
          TileLayer: mod.TileLayer,
          CircleMarker: mod.CircleMarker,
          Popup: mod.Popup,
        });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mt-5 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 shrink-0 text-stamp" aria-hidden />
        <p className="font-mono-typed text-[10px] uppercase tracking-[0.18em] text-stamp">
          Wo geht es hin?
        </p>
      </div>
      <p className="mt-1.5 font-serif text-base font-bold leading-snug">
        Gemeindehaus Widnau
      </p>
      <p className="font-serif text-[15px] leading-relaxed text-foreground/80">
        Neugasse 4 · 9443 Widnau
      </p>

      <div
        className="mt-3 overflow-hidden rounded-sm border border-border"
        style={{
          height: 168,
          isolation: "isolate",
          position: "relative",
          zIndex: 0,
        }}
      >
        {Lib ? (
          <Lib.MapContainer
            center={GEMEINDEHAUS}
            zoom={16}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%", background: "#f5f1e8" }}
          >
            <Lib.TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Lib.CircleMarker
              center={GEMEINDEHAUS}
              radius={7}
              pathOptions={{
                color: "#1f2937",
                weight: 2,
                fillColor: "#b5471f",
                fillOpacity: 1,
              }}
            >
              <Lib.Popup>
                <span className="font-serif text-sm">
                  Gemeindehaus Widnau
                  <br />
                  Neugasse 4, 9443 Widnau
                </span>
              </Lib.Popup>
            </Lib.CircleMarker>
          </Lib.MapContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Karte lädt …
          </div>
        )}
      </div>

      <a
        href={ROUTE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-sm border-2 border-stamp bg-stamp/5 px-4 py-2.5 font-serif text-sm font-semibold text-stamp transition-all active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md"
      >
        <ExternalLink className="h-4 w-4" aria-hidden />
        Route in Google Maps öffnen
      </a>
    </div>
  );
}
