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

// Neue Orte Richtung Rheintal
const SARGANS: LatLng = [47.04524631272308, 9.445527009414803];
const BUCHS: LatLng = [47.168421301597654, 9.478523208358082];
const ALTSTAETTEN: LatLng = [47.37427185536352, 9.556397267651725];
const HEERBRUGG: LatLng = [47.41038937492892, 9.627252064665763];
const RORSCHACH: LatLng = [47.47799643057857, 9.505129743825464];
const ST_MARGRETHEN: LatLng = [47.45317004331197, 9.638198293404653];
const WIDNAU: LatLng = [47.4053, 9.6386]; // Gässelistrasse 2, 9443 Widnau

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
export const VALID_ZIEL = [
  "widnau",
  "widnau sg",
  "9443 widnau",
  "heerbrugg",
  "heerbrugg sg",
  "bahnhof heerbrugg",
];

// IC 1 Halte Genève → Zürich HB
const IC1_STOPS: Stopover[] = [
  { name: "Renens VD", coord: RENENS },
  { name: "Lausanne", coord: LAUSANNE },
  { name: "Fribourg", coord: FRIBOURG },
  { name: "Bern", coord: BERN },
];

// IR 13 Halte Sargans → Heerbrugg
const IR13_STOPS: Stopover[] = [
  { name: "Buchs SG", coord: BUCHS },
  { name: "Altstätten SG", coord: ALTSTAETTEN },
];

// IR 13 Halte Zürich Flughafen → Heerbrugg (Flug-Variante)
const IR13_FLUG_STOPS: Stopover[] = [
  { name: "Winterthur", coord: WINTERTHUR },
  { name: "Wil SG", coord: WIL },
  { name: "Uzwil", coord: UZWIL },
  { name: "Flawil", coord: FLAWIL },
  { name: "Gossau SG", coord: GOSSAU },
  { name: "St. Gallen", coord: ST_GALLEN },
  { name: "Rorschach", coord: RORSCHACH },
  { name: "St. Margrethen SG", coord: ST_MARGRETHEN },
];

// Polyline IC 1 (Genève → Zürich HB)
const IC1_POLY: LatLng[] = [GENF, RENENS, LAUSANNE, FRIBOURG, BERN, ZUERICH];

// Polyline IC 3 + IR 13 (Zürich HB → Sargans → Heerbrugg)
const IC3_POLY: LatLng[] = [ZUERICH, SARGANS];
const IR13_POLY: LatLng[] = [SARGANS, BUCHS, ALTSTAETTEN, HEERBRUGG];

// Polyline IR 13 via St. Gallen (Flug-Variante)
const IR13_FLUG_POLY: LatLng[] = [
  ZRH_FLUGHAFEN,
  WINTERTHUR,
  WIL,
  UZWIL,
  FLAWIL,
  GOSSAU,
  ST_GALLEN,
  RORSCHACH,
  ST_MARGRETHEN,
  HEERBRUGG,
];

export const ROUTES: RouteOption[] = [
  {
    id: "zug",
    titel: "Zug",
    iconKeys: ["train"],
    dauer: "4h 31min",
    preis: "CHF 60.40",
    co2Kg: 3,
    beschreibung:
      "Genève → Zürich HB mit IC 1, weiter mit IC 3 nach Sargans und mit IR 13 nach Heerbrugg. Eine Verbindung, ein Ticket.",
    correct: true,
    warum:
      "Der Zug verursacht in der Schweiz pro Person und km die geringsten Treibhausgase, etwa 1/30 eines Flugs auf gleicher Strecke. Schweizer Strommix ist grossteils erneuerbar.",
    legs: [
      {
        kind: "transport",
        iconKey: "train",
        from: "Genève",
        to: "Zürich HB",
        badge: "IC 1",
        badgeBg: "#dc2626",
        badgeColor: "#fff",
        direction: "Richtung St. Gallen",
        depart: "07:35",
        arrive: "10:28",
        platform: "Gl. 4",
        arrivePlatform: "Gl. 33",
        stops: IC1_STOPS,
      },
      { kind: "transfer", iconKey: "walk", duration: "10 Min.", note: "Umsteigen in Zürich HB" },
      {
        kind: "transport",
        iconKey: "train",
        from: "Zürich HB",
        to: "Sargans",
        badge: "IC 3",
        badgeBg: "#dc2626",
        badgeColor: "#fff",
        direction: "Richtung Chur",
        depart: "10:38",
        arrive: "11:32",
        platform: "Gl. 13",
        arrivePlatform: "Gl. 13",
      },
      { kind: "transfer", iconKey: "walk", duration: "3 Min.", note: "Umsteigen in Sargans" },
      {
        kind: "transport",
        iconKey: "train",
        from: "Sargans",
        to: "Heerbrugg",
        badge: "IR 13",
        badgeBg: "#dc2626",
        badgeColor: "#fff",
        direction: "Richtung St. Gallen",
        depart: "11:35",
        arrive: "12:06",
        platform: "Gl. 6",
        arrivePlatform: "Gl. 1",
        stops: IR13_STOPS,
      },
    ],
    segments: [
      { coords: IC1_POLY, color: "#5eead4" },
      { coords: IC3_POLY, color: "#5eead4" },
      { coords: IR13_POLY, color: "#5eead4" },
    ],
    stops: [
      { pos: GENF, label: "Genève", major: true },
      ...IC1_STOPS.filter((s) => s.coord).map((s) => ({
        pos: s.coord!,
        label: s.name,
        major: false,
      })),
      { pos: ZUERICH, label: "Zürich HB", major: true },
      { pos: SARGANS, label: "Sargans", major: true },
      ...IR13_STOPS.filter((s) => s.coord).map((s) => ({
        pos: s.coord!,
        label: s.name,
        major: false,
      })),
      { pos: HEERBRUGG, label: "Heerbrugg", major: true },
    ],
  },
  {
    id: "auto",
    titel: "Auto · ca. 392 km",
    iconKeys: ["car"],
    dauer: "4h 08min",
    preis: "CHF 290",
    co2Kg: 137,
    beschreibung:
      "Mietwagen oder Privatauto via A1, Lausanne, Bern, Zürich, St. Gallen bis nach Widnau.",
    correct: false,
    warum:
      "Ein Benziner stösst rund 13-mal mehr CO₂ pro Person aus als der Zug. Dazu kommen Stau-Risiko, Parkplatzsuche und Flächenverbrauch.",
    legs: [
      {
        kind: "transport",
        iconKey: "car",
        from: "Genève",
        to: "Gässelistrasse 2, 9443 Widnau",
        badge: "Auto",
        badgeBg: "#475569",
        badgeColor: "#fff",
        direction: "A1 → Lausanne → Bern → Zürich → St. Gallen → Widnau",
      },
    ],
    // Wird zur Laufzeit via OSRM verfeinert; Fallback: grobe Stützpunkte
    segments: [
      {
        coords: [GENF, LAUSANNE, FRIBOURG, BERN, ZUERICH, ST_GALLEN, WIDNAU],
        color: "#a78bfa",
      },
    ],
    stops: [
      { pos: GENF, label: "Genève", major: true },
      { pos: WIDNAU, label: "Widnau", major: true },
    ],
    osrm: {
      points: [GENF, LAUSANNE, BERN, ZUERICH, ST_GALLEN, WIDNAU],
    },
  },
  {
    id: "zug-flug-zug",
    titel: "Zug + Flug + Zug",
    iconKeys: ["train", "plane", "train"],
    dauer: "4h 19min",
    preis: "CHF 318",
    co2Kg: 140,
    beschreibung:
      "Genève → Flughafen, Inlandflug nach Zürich, dann mit IR 13 weiter nach Heerbrugg. Klingt schnell, ist es kaum.",
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
        to: "Heerbrugg",
        badge: "IR 13",
        badgeBg: "#dc2626",
        badgeColor: "#fff",
        direction: "Richtung Chur",
        depart: "11:23",
        arrive: "12:53",
        platform: "Gl. 1",
        arrivePlatform: "Gl. 1",
        stops: IR13_FLUG_STOPS,
      },
    ],
    segments: [
      { coords: [GENF, GENF_FLUGHAFEN], color: "#60a5fa" },
      { coords: [GENF_FLUGHAFEN, ZRH_FLUGHAFEN], color: "#60a5fa", dashed: true },
      { coords: IR13_FLUG_POLY, color: "#60a5fa" },
    ],
    stops: [
      { pos: GENF, label: "Genève", major: true },
      { pos: GENF_FLUGHAFEN, label: "Genève-Aéroport", major: true },
      { pos: ZRH_FLUGHAFEN, label: "Zürich Flughafen", major: true },
      ...IR13_FLUG_STOPS.filter((s) => s.coord).map((s) => ({
        pos: s.coord!,
        label: s.name,
        major: false,
      })),
      { pos: HEERBRUGG, label: "Heerbrugg", major: true },
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
