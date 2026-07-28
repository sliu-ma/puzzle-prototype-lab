import type { LatLng, RouteSegment, RouteStop } from "@/components/case-file/RouteMap";

// Schlüssel-Orte (Koordinaten)
const GENF: LatLng = [46.2104, 6.1428]; // Genève Cornavin
const GENF_FLUGHAFEN: LatLng = [46.2381, 6.1090];
const RENENS: LatLng = [46.5375, 6.5786];
const LAUSANNE: LatLng = [46.5167, 6.6291];
const FRIBOURG: LatLng = [46.8031, 7.1511];
const BERN: LatLng = [46.9489, 7.4396];
const ZUERICH: LatLng = [47.3782, 8.5402];
const ZRH_OERLIKON: LatLng = [47.4117, 8.5440];
const ZRH_FLUGHAFEN: LatLng = [47.4503, 8.5618];
const WINTERTHUR: LatLng = [47.5004, 8.7236];
const WIL: LatLng = [47.4625, 9.0440];
const UZWIL: LatLng = [47.4374, 9.1342];
const FLAWIL: LatLng = [47.4145, 9.1928];
const GOSSAU: LatLng = [47.4178, 9.2540];
const ST_GALLEN: LatLng = [47.4234, 9.3699];

// S21 Strecke (St. Gallen → Speicher), exakt aus Vorgabe
const S21_STOPS: { name: string; pos: LatLng }[] = [
  { name: "St. Gallen", pos: ST_GALLEN },
  { name: "St. Gallen Marktplatz", pos: [47.426419, 9.376699] },
  { name: "St. Gallen Spisertor", pos: [47.424702, 9.379689] },
  { name: "St. Gallen Schülerhaus", pos: [47.424954, 9.387493] },
  { name: "St. Gallen Birnbäumen", pos: [47.425868, 9.393149] },
  { name: "St. Gallen Notkersegg", pos: [47.425151, 9.404042] },
  { name: "St. Gallen Schwarzer Bären", pos: [47.422426, 9.415386] },
  { name: "Vögelinsegg", pos: [47.416036, 9.436429] },
  { name: "Schützengarten (Speicher)", pos: [47.412758, 9.438378] },
  { name: "Speicher", pos: [47.410971, 9.442662] },
];

const SPEICHER: LatLng = S21_STOPS[S21_STOPS.length - 1].pos;

export type Stopover = { name: string; coord?: LatLng };

export type Leg = {
  kind: "transport" | "transfer";
  iconKey?: "train" | "plane" | "car" | "walk";
  from?: string;
  to?: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  direction?: string;
  depart?: string;
  arrive?: string;
  platform?: string;
  arrivePlatform?: string;
  stops?: Stopover[];
  // Transfer
  duration?: string;
  note?: string;
};

export type RouteOption = {
  id: string;
  titel: string;
  iconKeys: ("train" | "plane" | "car")[];
  dauer: string;
  preis: string;
  co2Kg: number;
  beschreibung: string;
  correct: boolean;
  legs: Leg[];
  segments: RouteSegment[];
  stops: RouteStop[];
  warum: string;
  // optional: route über OSRM nachladen (für Auto)
  osrm?: { points: LatLng[] };
};

export const VALID_START = ["genf", "geneve", "genève", "geneva", "gva"];
export const VALID_ZIEL = ["speicher", "speicher ar", "speicher appenzell"];

// IC 1 Halte Genève → St. Gallen
const IC1_STOPS: Stopover[] = [
  { name: "Renens VD", coord: RENENS },
  { name: "Lausanne", coord: LAUSANNE },
  { name: "Fribourg", coord: FRIBOURG },
  { name: "Bern", coord: BERN },
  { name: "Zürich HB", coord: ZUERICH },
  { name: "Zürich Oerlikon", coord: ZRH_OERLIKON },
  { name: "Zürich Flughafen", coord: ZRH_FLUGHAFEN },
  { name: "Winterthur", coord: WINTERTHUR },
  { name: "Wil SG", coord: WIL },
  { name: "Uzwil", coord: UZWIL },
  { name: "Flawil", coord: FLAWIL },
  { name: "Gossau SG", coord: GOSSAU },
];

const IC5_STOPS: Stopover[] = [
  { name: "Winterthur", coord: WINTERTHUR },
  { name: "Wil SG", coord: WIL },
  { name: "Uzwil", coord: UZWIL },
  { name: "Flawil", coord: FLAWIL },
  { name: "Gossau SG", coord: GOSSAU },
];

const S21_INTERMEDIATE: Stopover[] = S21_STOPS.slice(1, -1).map((s) => ({
  name: s.name,
  coord: s.pos,
}));

// Polyline IC 1 (Genève → St. Gallen): viele Stützpunkte für realistische Linie
const IC1_POLY: LatLng[] = [
  GENF,
  RENENS,
  LAUSANNE,
  FRIBOURG,
  BERN,
  ZUERICH,
  ZRH_OERLIKON,
  ZRH_FLUGHAFEN,
  WINTERTHUR,
  WIL,
  UZWIL,
  FLAWIL,
  GOSSAU,
  ST_GALLEN,
];

const S21_POLY: LatLng[] = S21_STOPS.map((s) => s.pos);

export const ROUTES: RouteOption[] = [
  {
    id: "zug",
    titel: "Zug",
    iconKeys: ["train"],
    dauer: "4h 41min",
    preis: "CHF 59.20",
    co2Kg: 3,
    beschreibung:
      "Direkt Genève → St. Gallen mit IC 1, Umstieg auf S21 nach Speicher. Eine Verbindung, ein Ticket.",
    correct: true,
    warum:
      "Der Zug verursacht in der Schweiz pro Person und km die geringsten Treibhausgase, etwa 1/30 eines Flugs auf gleicher Strecke. Schweizer Strommix ist grossteils erneuerbar.",
    legs: [
      {
        kind: "transport",
        iconKey: "train",
        from: "Genève",
        to: "St. Gallen",
        badge: "IC 1",
        badgeBg: "#dc2626",
        badgeColor: "#fff",
        direction: "Richtung St. Gallen",
        depart: "07:35",
        arrive: "11:52",
        platform: "Gl. 4",
        arrivePlatform: "Gl. 1",
        stops: IC1_STOPS,
      },
      { kind: "transfer", iconKey: "walk", duration: "4 Min.", note: "Umsteigen in St. Gallen" },
      {
        kind: "transport",
        iconKey: "train",
        from: "St. Gallen",
        to: "Speicher",
        badge: "S21",
        badgeBg: "#1d4ed8",
        badgeColor: "#fff",
        direction: "Richtung Trogen",
        depart: "11:56",
        arrive: "12:16",
        platform: "Gl. 12",
        arrivePlatform: "Gl. 1",
        stops: S21_INTERMEDIATE,
      },
    ],
    segments: [
      { coords: IC1_POLY, color: "#5eead4" },
      { coords: S21_POLY, color: "#5eead4" },
    ],
    stops: [
      { pos: GENF, label: "Genève", major: true },
      ...IC1_STOPS.filter((s) => s.coord).map((s) => ({
        pos: s.coord!,
        label: s.name,
        major: false,
      })),
      { pos: ST_GALLEN, label: "St. Gallen", major: true },
      ...S21_INTERMEDIATE.filter((s) => s.coord).map((s) => ({
        pos: s.coord!,
        label: s.name,
        major: false,
      })),
      { pos: SPEICHER, label: "Speicher", major: true },
    ],
  },
  {
    id: "auto",
    titel: "Auto · ca. 366 km",
    iconKeys: ["car"],
    dauer: "4h 13min",
    preis: "CHF 271",
    co2Kg: 92,
    beschreibung:
      "Mietwagen oder Privatauto via A1, Lausanne, Bern, Zürich, St. Gallen.",
    correct: false,
    warum:
      "Ein Benziner stösst rund 13-mal mehr CO₂ pro Person aus als der Zug. Dazu kommen Stau-Risiko, Parkplatzsuche und Flächenverbrauch.",
    legs: [
      {
        kind: "transport",
        iconKey: "car",
        from: "Genève",
        to: "Speicher AR",
        badge: "Auto",
        badgeBg: "#475569",
        badgeColor: "#fff",
        direction: "A1 → Lausanne → Bern → Zürich → St. Gallen → Speicher",
      },
    ],
    // Wird zur Laufzeit via OSRM verfeinert; Fallback: grobe Stützpunkte
    segments: [
      {
        coords: [GENF, LAUSANNE, FRIBOURG, BERN, ZUERICH, ST_GALLEN, SPEICHER],
        color: "#a78bfa",
      },
    ],
    stops: [
      { pos: GENF, label: "Genève", major: true },
      { pos: SPEICHER, label: "Speicher", major: true },
    ],
    osrm: {
      points: [GENF, LAUSANNE, BERN, ZUERICH, ST_GALLEN, SPEICHER],
    },
  },
  {
    id: "zug-flug-zug",
    titel: "Zug + Flug + Zug",
    iconKeys: ["train", "plane", "train"],
    dauer: "4h 11min",
    preis: "CHF 276",
    co2Kg: 140,
    beschreibung:
      "Genève → Flughafen, Inlandflug nach Zürich, dann mit IC 5 + S21 weiter. Klingt schnell, ist es kaum.",
    correct: false,
    warum:
      "Inlandflüge sind die klimaschädlichste Variante: Start/Landung verbrauchen die meiste Energie. Zeitersparnis liegt Tür-zu-Tür praktisch bei Null.",
    legs: [
      {
        kind: "transport",
        iconKey: "train",
        from: "Genève",
        to: "Genève-Aéroport",
        badge: "IC 1",
        badgeBg: "#dc2626",
        badgeColor: "#fff",
        direction: "Richtung Genève-Aéroport",
        depart: "08:34",
        arrive: "08:41",
        platform: "Gl. 3",
        arrivePlatform: "Gl. 4",
      },
      { kind: "transfer", iconKey: "walk", duration: "1h 19min", note: "Aufenthalt Flughafen, Check-in" },
      {
        kind: "transport",
        iconKey: "plane",
        from: "GVA",
        to: "ZRH",
        badge: "LX 2807",
        badgeBg: "#0ea5e9",
        badgeColor: "#fff",
        direction: "Swiss Air Lines → Zürich",
        depart: "10:00",
        arrive: "11:00",
      },
      { kind: "transfer", iconKey: "walk", duration: "23 Min.", note: "Umsteigen am Flughafen Zürich" },
      {
        kind: "transport",
        iconKey: "train",
        from: "Zürich Flughafen",
        to: "St. Gallen",
        badge: "IC 5",
        badgeBg: "#dc2626",
        badgeColor: "#fff",
        direction: "Richtung St. Gallen",
        depart: "11:23",
        arrive: "12:22",
        platform: "Gl. 1",
        arrivePlatform: "Gl. 1",
        stops: IC5_STOPS,
      },
      { kind: "transfer", iconKey: "walk", duration: "4 Min.", note: "Umsteigen in St. Gallen" },
      {
        kind: "transport",
        iconKey: "train",
        from: "St. Gallen",
        to: "Speicher",
        badge: "S21",
        badgeBg: "#1d4ed8",
        badgeColor: "#fff",
        direction: "Richtung Trogen",
        depart: "12:26",
        arrive: "12:46",
        platform: "Gl. 12",
        arrivePlatform: "Gl. 1",
        stops: S21_INTERMEDIATE,
      },
    ],
    segments: [
      { coords: [GENF, GENF_FLUGHAFEN], color: "#60a5fa" },
      { coords: [GENF_FLUGHAFEN, ZRH_FLUGHAFEN], color: "#60a5fa", dashed: true },
      {
        coords: [ZRH_FLUGHAFEN, WINTERTHUR, WIL, UZWIL, FLAWIL, GOSSAU, ST_GALLEN],
        color: "#60a5fa",
      },
      { coords: S21_POLY, color: "#60a5fa" },
    ],
    stops: [
      { pos: GENF, label: "Genève", major: true },
      { pos: GENF_FLUGHAFEN, label: "Genève-Aéroport", major: true },
      { pos: ZRH_FLUGHAFEN, label: "Zürich Flughafen", major: true },
      { pos: WINTERTHUR, label: "Winterthur", major: false },
      { pos: WIL, label: "Wil SG", major: false },
      { pos: GOSSAU, label: "Gossau", major: false },
      { pos: ST_GALLEN, label: "St. Gallen", major: true },
      ...S21_INTERMEDIATE.filter((s) => s.coord).map((s) => ({
        pos: s.coord!,
        label: s.name,
        major: false,
      })),
      { pos: SPEICHER, label: "Speicher", major: true },
    ],
  },
];

/**
 * Holt eine echte Auto-Route von OSRM (öffentlicher Demo-Server).
 * Gibt eine Polyline als LatLng[] zurück, oder null bei Fehler.
 */
export async function fetchOsrmRoute(points: LatLng[]): Promise<LatLng[] | null> {
  try {
    const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const data = await r.json();
    const geom = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
    if (!geom) return null;
    return geom.map(([lng, lat]) => [lat, lng] as LatLng);
  } catch {
    return null;
  }
}
