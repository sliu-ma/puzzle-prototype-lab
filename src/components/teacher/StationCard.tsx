import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { MapPin } from "lucide-react";

export type StationCardData = {
  stageNr: number;
  placeName: string;
  address: string;
  lat: number | null;
  lng: number | null;
  note: string;
  photoPath?: string | null;
  photoUrl?: string | null;
  mapUrl?: string | null;
};

type Props = {
  station: StationCardData;
  className?: string;
};

function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;
}

function latLngToTileXY(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom);
  const x = n * ((lng + 180) / 360);
  const latRad = (lat * Math.PI) / 180;
  const y = n * (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2;
  return { x, y };
}

function tileUrl(z: number, x: number, y: number): string {
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

function TileMap({
  lat,
  lng,
  width,
  height,
}: {
  lat: number;
  lng: number;
  width: number;
  height: number;
}) {
  const zoom = 16;
  const tileSize = 256;
  const { x, y } = useMemo(() => latLngToTileXY(lat, lng, zoom), [lat, lng]);
  const baseX = Math.floor(x);
  const baseY = Math.floor(y);
  const offsetX = (x - baseX) * tileSize;
  const offsetY = (y - baseY) * tileSize;

  const gridLeft = width / 2 - offsetX;
  const gridTop = height / 2 - offsetY;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-[#c9b591]">
      <div
        className="absolute"
        style={{
          left: gridLeft,
          top: gridTop,
          width: tileSize * 2,
          height: tileSize * 2,
        }}
      >
        {[0, 1].map((dy) =>
          [0, 1].map((dx) => (
            <img
              key={`${dx}-${dy}`}
              src={tileUrl(zoom, baseX + dx, baseY + dy)}
              alt=""
              className="absolute h-[256px] w-[256px]"
              style={{
                left: dx * tileSize,
                top: dy * tileSize,
              }}
              loading="lazy"
            />
          )),
        )}
      </div>
      {/* Marker */}
      <div
        className="absolute z-10 -translate-x-1/2 -translate-y-full"
        style={{ left: width / 2, top: height / 2 }}
      >
        <MapPin className="h-8 w-8 text-[#9c2b2b] drop-shadow" fill="#f5ecd7" />
      </div>
      {/* Attribution */}
      <div className="absolute bottom-1 right-1 z-10 rounded-sm bg-[#f5ecd7]/90 px-1 py-0.5 text-[7px] text-[#6b4e2c]">
        © OSM
      </div>
    </div>
  );
}

export function StationCard({ station, className = "" }: Props) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    if (!station.lat || !station.lng) return;
    let cancelled = false;
    QRCode.toDataURL(osmDirectionsUrl(station.lat, station.lng), {
      width: 140,
      margin: 1,
      color: { dark: "#2d1f12", light: "#f5ecd7" },
    })
      .then((url) => {
        if (!cancelled) setQr(url);
      })
      .catch(() => setQr(null));
    return () => {
      cancelled = true;
    };
  }, [station.lat, station.lng]);

  const hasLocation = !!station.lat && !!station.lng;

  return (
    <article
      className={`station-card relative overflow-hidden rounded-sm bg-[#f5ecd7] text-[#2d1f12] shadow-md ${className}`}
    >
      {/* Papier-Textur */}
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_20%_30%,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:8px_8px]" />

      {/* Kopf */}
      <header className="relative flex items-center justify-between gap-2 border-b-2 border-[#c9b591] p-3">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 100 100" className="h-8 w-8" aria-hidden>
            <polygon points="50,5 95,50 50,95 5,50" fill="#9c2b2b" />
            <text x="50" y="58" textAnchor="middle" fontSize="34" fill="#f5ecd7" fontWeight="700">
              {station.stageNr}
            </text>
          </svg>
          <div>
            <p className="font-mono-typed text-[9px] uppercase tracking-[0.2em] text-[#6b4e2c]">
              Hinweis für euch!
            </p>
            <h2 className="font-serif text-lg font-bold leading-tight">Nächster Posten</h2>
          </div>
        </div>
        <div className="rounded-sm border-2 border-[#9c2b2b] px-2 py-1 text-center">
          <p className="font-mono-typed text-[8px] uppercase tracking-wider text-[#9c2b2b]">Etappe</p>
          <p className="font-mono-typed text-lg font-bold leading-none text-[#9c2b2b]">
            {station.stageNr.toString().padStart(2, "0")}
          </p>
        </div>
      </header>

      <div className="relative p-3 space-y-3">
        {/* Text */}
        <p className="font-serif text-sm leading-snug">
          Ihr habt das Rätsel gelöst! Begebt euch zum nächsten Ort, dort wartet eure nächste
          Herausforderung auf euch.
        </p>

        {/* Karte */}
        {hasLocation ? (
          <TileMap lat={station.lat!} lng={station.lng!} width={400} height={300} />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-sm border border-dashed border-[#c9b591] bg-[#f5ecd7]/50">
            <p className="text-center text-xs text-[#6b4e2c]">Noch keine Karte hinterlegt</p>
          </div>
        )}

        {/* Foto + Adresse */}
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9c2b2b]" />
              <div>
                <p className="font-serif text-base font-bold leading-tight">{station.placeName}</p>
                <p className="text-xs leading-tight text-[#4a3a2a]">{station.address || "Adresse fehlt"}</p>
              </div>
            </div>
            {station.note && (
              <p className="text-xs italic text-[#4a3a2a]">{station.note}</p>
            )}
          </div>
          {station.photoUrl && (
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-[#c9b591] bg-white">
              <img
                src={station.photoUrl}
                alt={station.placeName}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* QR-Code */}
        {qr && (
          <div className="flex items-center justify-end gap-2">
            <p className="text-right text-[10px] leading-tight text-[#6b4e2c]">
              QR-Code scannen
              <br />
              für die Route
            </p>
            <img src={qr} alt="QR-Code zur Route" className="h-16 w-16 rounded-sm bg-[#f5ecd7]" />
          </div>
        )}
      </div>

      {/* Stempel-Footer */}
      <footer className="relative border-t border-dashed border-[#c9b591] p-2 text-center">
        <p className="font-mono-typed text-[8px] uppercase tracking-[0.2em] text-[#6b4e2c]">
          Maja’s Mission · Speicher
        </p>
      </footer>
    </article>
  );
}
