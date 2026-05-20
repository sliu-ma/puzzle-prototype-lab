import type { LatLng, RouteSegment, RouteStop } from "@/components/case-file/RouteMap";

// Schlüssel-Orte (Koordinaten ungefähr)
const GENF: LatLng = [46.2044, 6.1432];
const GENF_FLUGHAFEN: LatLng = [46.2381, 6.109];
const LAUSANNE: LatLng = [46.5197, 6.6323];
const BERN: LatLng = [46.948, 7.4474];
const ZUERICH: LatLng = [47.3769, 8.5417];
const ZRH_FLUGHAFEN: LatLng = [47.4647, 8.5492];
const ST_GALLEN: LatLng = [47.4245, 9.3767];
const SPEICHER: LatLng = [47.404, 9.4456];

export type Leg = {
  kind: "transport" | "transfer";
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
  // Transfer
  duration?: string;
  note?: string;
};

export type RouteOption = {
  id: string;
  titel: string;
  icons: string[]; // emoji
  dauer: string;
  preis: string;
  co2Kg: number; // kg CO₂ pro Person, Schätzung
  beschreibung: string;
  correct: boolean;
  legs: Leg[];
  segments: RouteSegment[];
  stops: RouteStop[];
  warum: string;
};

export const VALID_START = ["genf", "geneve", "genève", "geneva", "gva"];
export const VALID_ZIEL = ["speicher", "speicher ar", "speicher appenzell"];

export const ROUTES: RouteOption[] = [
  {
    id: "zug",
    titel: "Zug",
    icons: ["🚆"],
    dauer: "4h 41min",
    preis: "CHF 79–149",
    co2Kg: 4,
    beschreibung:
      "Direkt Genève → St. Gallen mit IC 1, umsteigen auf S21 nach Speicher. Eine Verbindung, ein Ticket.",
    correct: true,
    warum:
      "Der Zug verursacht in der Schweiz pro Person und km die geringsten Treibhausgase — etwa 1/30 eines Flugs auf gleicher Strecke. Schweizer Strommix ist grossteils erneuerbar.",
    legs: [
      {
        kind: "transport",
        from: "Genève",
        to: "St. Gallen",
        badge: "IC 1",
        badgeBg: "#dc2626",
        badgeColor: "#fff",
        direction: "Richtung St. Gallen",
        depart: "07:35",
        arrive: "11:52",
        platform: "Gl. 7",
        arrivePlatform: "Gl. 4",
      },
      { kind: "transfer", duration: "4 Min.", note: "Umsteigen" },
      {
        kind: "transport",
        from: "St. Gallen",
        to: "Speicher",
        badge: "S21",
        badgeBg: "#1d4ed8",
        badgeColor: "#fff",
        direction: "Richtung Trogen",
        depart: "11:56",
        arrive: "12:16",
        platform: "Gl. 3",
        arrivePlatform: "Gl. 1",
      },
    ],
    segments: [
      {
        coords: [GENF, LAUSANNE, BERN, ZUERICH, ST_GALLEN, SPEICHER],
        color: "#5eead4",
      },
    ],
    stops: [
      { pos: GENF, label: "Genève" },
      { pos: BERN, label: "Bern" },
      { pos: ZUERICH, label: "Zürich" },
      { pos: ST_GALLEN, label: "St. Gallen" },
      { pos: SPEICHER, label: "Speicher" },
    ],
  },
  {
    id: "auto",
    titel: "Auto · 366 km",
    icons: ["🚗"],
    dauer: "4h 13min",
    preis: "CHF 58–84",
    co2Kg: 55,
    beschreibung:
      "Mietwagen oder Privatauto via A1 — Lausanne, Bern, Zürich, St. Gallen.",
    correct: false,
    warum:
      "Ein Benziner stösst rund 13-mal mehr CO₂ pro Person aus als der Zug auf dieser Strecke. Dazu kommt Stau-Risiko, Parkplatzsuche und versiegelte Fläche.",
    legs: [
      {
        kind: "transport",
        from: "Genève",
        to: "Speicher AR",
        badge: "Auto",
        badgeBg: "#475569",
        badgeColor: "#fff",
        direction: "A1 → Lausanne → Bern → Zürich → St. Gallen",
      },
    ],
    segments: [
      {
        coords: [GENF, LAUSANNE, BERN, ZUERICH, ST_GALLEN, SPEICHER],
        color: "#a78bfa",
      },
    ],
    stops: [
      { pos: GENF, label: "Genève" },
      { pos: LAUSANNE, label: "Lausanne" },
      { pos: BERN, label: "Bern" },
      { pos: ZUERICH, label: "Zürich" },
      { pos: SPEICHER, label: "Speicher" },
    ],
  },
  {
    id: "zug-flug-zug",
    titel: "Zug + Flug + Zug",
    icons: ["🚆", "✈️", "🚆"],
    dauer: "4h 11min",
    preis: "CHF 109–359",
    co2Kg: 120,
    beschreibung:
      "Genève → Flughafen, dann Inlandflug nach Zürich, weiter mit Zug. Klingt schnell — ist es kaum.",
    correct: false,
    warum:
      "Inlandflüge sind die klimaschädlichste Variante: Start/Landung verbrauchen die meiste Energie. Zeitersparnis liegt bei Tür-zu-Tür praktisch bei Null.",
    legs: [
      {
        kind: "transport",
        from: "Genève",
        to: "Genève-Aéroport",
        badge: "IC 1",
        badgeBg: "#dc2626",
        badgeColor: "#fff",
        direction: "Richtung Genève-Aéroport",
        depart: "08:34",
        arrive: "08:41",
      },
      { kind: "transfer", duration: "1h 19min", note: "Aufenthalt Flughafen" },
      {
        kind: "transport",
        from: "GVA",
        to: "Zürich Flughafen",
        badge: "LX 2807",
        badgeBg: "#0ea5e9",
        badgeColor: "#fff",
        direction: "Swiss Air Lines → ZRH",
        depart: "10:00",
        arrive: "11:00",
      },
      { kind: "transfer", duration: "23 Min.", note: "Umsteigen" },
      {
        kind: "transport",
        from: "Zürich Flughafen",
        to: "Speicher",
        badge: "S2 / S21",
        badgeBg: "#1d4ed8",
        badgeColor: "#fff",
        direction: "via St. Gallen",
        depart: "11:23",
        arrive: "12:45",
        platform: "Gl. 1",
      },
    ],
    segments: [
      { coords: [GENF, GENF_FLUGHAFEN], color: "#60a5fa" },
      { coords: [GENF_FLUGHAFEN, ZRH_FLUGHAFEN], color: "#60a5fa", dashed: true },
      { coords: [ZRH_FLUGHAFEN, ST_GALLEN, SPEICHER], color: "#60a5fa" },
    ],
    stops: [
      { pos: GENF, label: "Genève" },
      { pos: GENF_FLUGHAFEN, label: "GVA" },
      { pos: ZRH_FLUGHAFEN, label: "ZRH" },
      { pos: ST_GALLEN, label: "St. Gallen" },
      { pos: SPEICHER, label: "Speicher" },
    ],
  },
];
