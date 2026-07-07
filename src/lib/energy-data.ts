export type EnergyLabelGrade = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface EnergyOption {
  id: string;
  label: string;
  productName?: string;
  description: string;
  cost: number;
  energy: number; // Energiesparpunkte (ESP)
  energyLabel?: EnergyLabelGrade;
}

export interface EnergyOptionGroup {
  id: string;
  label: string;
  options: EnergyOption[];
}

export interface EnergyDevice {
  id: string;
  name: string;
  room: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
  options?: EnergyOption[];
  groups?: EnergyOptionGroup[];
}

export const BUDGET = 1000;
export const ENERGY_TARGET = 3500;

const IMG_W = 941;
const IMG_H = 1671;
const fromPx = (xPx: number, yPx: number, wPx: number, hPx: number) => ({
  x: (xPx / IMG_W) * 100,
  y: (yPx / IMG_H) * 100,
  w: (wPx / IMG_W) * 100,
  h: (hPx / IMG_H) * 100,
});

export const DEVICES: EnergyDevice[] = [
  {
    id: "tv",
    name: "Schlafzimmer – Fernseher",
    room: "Schlafzimmer",
    icon: "📺",
    ...fromPx(167, 802, 103, 107),
    options: [
      { id: "alt", label: "Alter LCD, Stand-by an", productName: "Röhrenknight 2003", description: "Läuft immer im Standby.", cost: 0, energy: 0, energyLabel: "F" },
      { id: "led-e", label: "Neuer LED, E-Klasse", productName: "Flimmerkiste Standard", description: "Etwas effizienter.", cost: 700, energy: 50, energyLabel: "E" },
      { id: "led-d", label: "Neuer D-Klasse", productName: "PixelPro Eco", description: "Deutlich effizienter.", cost: 1000, energy: 90, energyLabel: "D" },
    ],
  },
  {
    id: "heating",
    name: "Schlafzimmer – Raumtemperatur",
    room: "Schlafzimmer",
    icon: "🌡️",
    ...fromPx(368, 970, 94, 91),
    options: [
      { id: "22", label: "22 °C (aktuell)", description: "Angenehm warm, hoher Verbrauch.", cost: 0, energy: 0 },
      { id: "20", label: "20 °C heizen", description: "Ein Pullover mehr — spart viel.", cost: 0, energy: 740 },
      { id: "18", label: "18 °C heizen", description: "Sportlich frisch, maximaler Effekt.", cost: 0, energy: 1480 },
    ],
  },
  {
    id: "shower",
    name: "Bad – Dusche",
    room: "Bad",
    icon: "🚿",
    ...fromPx(625, 800, 175, 340),
    options: [
      { id: "lang", label: "10 Minuten duschen (aktuell)", description: "Lange heisse Dusche.", cost: 0, energy: 0 },
      { id: "kurz", label: "Kurz duschen (5 Min)", description: "Schneller fertig, gratis.", cost: 0, energy: 820 },
      { id: "sparbrause", label: "Sparbrause + kurz duschen", description: "Halbierter Wasserdurchfluss.", cost: 30, energy: 1150 },
    ],
  },
  {
    id: "tumbler",
    name: "Wäscheraum – Tumbler",
    room: "Wäscheraum",
    icon: "🌀",
    ...fromPx(354, 548, 137, 187),
    options: [
      { id: "alt", label: "Alter Tumbler", productName: "Heissluft-Otto", description: "Läuft nach jeder Wäsche.", cost: 0, energy: 0, energyLabel: "F" },
      { id: "neu", label: "Neues Gerät A", productName: "TrockenFix A", description: "Modernes A-Gerät, effizient aber teuer.", cost: 700, energy: 350, energyLabel: "A" },
      { id: "aufhaengen", label: "Wäsche aufhängen", description: "Braucht Zeit, spart viel — gratis.", cost: 0, energy: 550 },
    ],
  },
  {
    id: "washer",
    name: "Wäscheraum – Waschmaschine",
    room: "Wäscheraum",
    icon: "🧺",
    ...fromPx(196, 540, 142, 196),
    options: [
      { id: "40-60", label: "Wäsche 40–60 °C", description: "Standardprogramm.", cost: 0, energy: 0 },
      { id: "eco", label: "40–60 °C Eco-Programm", description: "Länger, aber viel sparsamer.", cost: 0, energy: 340 },
      { id: "neu", label: "Neue Waschmaschine A", productName: "SauberStar A", description: "Modernes A-Gerät.", cost: 1700, energy: 390, energyLabel: "A" },
    ],
  },
  {
    id: "vacuum",
    name: "Wäscheraum – Staubsauger",
    room: "Wäscheraum",
    icon: "🧹",
    ...fromPx(625, 456, 159, 279),
    options: [
      { id: "alt", label: "Alter Staubsauger", productName: "Turbo-Sauger 2000", description: "Ineffizient, viel Strom.", cost: 0, energy: 0, energyLabel: "F" },
      { id: "neu", label: "Neues Gerät", productName: "SaugMeister", description: "Etwas sparsamer.", cost: 100, energy: 45, energyLabel: "C" },
      { id: "top", label: "Sehr energieeffizient", productName: "SilentVac Pro", description: "Bestes Modell auf dem Markt.", cost: 200, energy: 70, energyLabel: "A" },
    ],
  },
  {
    id: "light-living",
    name: "Wohnzimmer – Lampe",
    room: "Wohnzimmer",
    icon: "💡",
    ...fromPx(510, 1267, 61, 134),
    options: [
      { id: "halogen", label: "Halogen", productName: "Glühbirne Retro", description: "Warm, aber viel Strom.", cost: 0, energy: 0, energyLabel: "E" },
      { id: "spar", label: "Energiesparlampe", productName: "Sparlicht Kompakt", description: "Deutlich effizienter.", cost: 30, energy: 300, energyLabel: "B" },
      { id: "led", label: "LED", productName: "LumiLED Bright", description: "Beste Wahl, kaum Verbrauch.", cost: 60, energy: 350, energyLabel: "A" },
    ],
  },
  {
    id: "dishwasher",
    name: "Küche – Geschirrspüler",
    room: "Küche",
    icon: "🍽️",
    ...fromPx(257, 1377, 94, 137),
    options: [
      { id: "normal", label: "Geschirrspüler normal", description: "Standardprogramm.", cost: 0, energy: 0 },
      { id: "eco", label: "Geschirrspüler Eco", description: "Länger, aber sparsamer.", cost: 0, energy: 150 },
      { id: "hand", label: "Von Hand abwaschen", description: "Braucht viel warmes Wasser — schlechter als der Geschirrspüler.", cost: 0, energy: -90 },
    ],
  },
  {
    id: "oven",
    name: "Küche – Ofen",
    room: "Küche",
    icon: "🍳",
    ...fromPx(362, 1376, 100, 136),
    options: [
      { id: "alt", label: "Alter Backofen", productName: "Backofen Grossmutter", description: "Lange Vorheizzeit.", cost: 0, energy: 0, energyLabel: "E" },
      { id: "umluft", label: "Umluft", productName: "Umluft ClassicPlus", description: "Niedrigere Temperatur möglich — gleicher Ofen, anderes Programm.", cost: 0, energy: 20 },
      { id: "a3", label: "Umluft A+++", productName: "EcoBake Pro", description: "Top isoliert, sehr effizient.", cost: 700, energy: 70, energyLabel: "A" },
    ],
  },
  {
    id: "stove",
    name: "Küche – Herd",
    room: "Küche",
    icon: "🔥",
    ...fromPx(363, 1311, 98, 50),
    groups: [
      {
        id: "topf",
        label: "Kochen im Topf",
        options: [
          { id: "ohne", label: "Ohne Deckel (aktuell)", description: "Wärme entweicht.", cost: 0, energy: 0 },
          { id: "deckel", label: "Mit Deckel kochen", description: "Wärme bleibt drin — gratis.", cost: 0, energy: 120 },
        ],
      },
      {
        id: "geschirr",
        label: "Kochgeschirr",
        options: [
          { id: "klein", label: "Zu kleine Pfanne (aktuell)", description: "Energie geht daneben.", cost: 0, energy: 0 },
          { id: "korrekt", label: "Passende Pfannengrösse", description: "Passend zur Herdplatte.", cost: 0, energy: 100 },
        ],
      },
      {
        id: "platte",
        label: "Herdplatte",
        options: [
          { id: "guss", label: "Gusseisenplatte (aktuell)", description: "Heizt langsam auf.", cost: 0, energy: 0 },
          { id: "glas", label: "Glaskeramik", description: "Reagiert schneller.", cost: 300, energy: 50 },
          { id: "induktion", label: "Induktionsherd", description: "Effizienteste Technik.", cost: 750, energy: 100 },
        ],
      },
    ],
  },
  {
    id: "fridge",
    name: "Küche – Kühlschrank",
    room: "Küche",
    icon: "🧊",
    ...fromPx(156, 1212, 91, 300),
    options: [
      { id: "alt", label: "Altes Gerät", productName: "Frostbeule 1998", description: "Läuft rund um die Uhr.", cost: 0, energy: 0, energyLabel: "F" },
      { id: "warm", label: "Temperatur 5 → 7 °C", description: "Zwei Grad wärmer — gratis.", cost: 0, energy: 90 },
      { id: "neu", label: "Neues Gerät A", productName: "ArcticFresh A", description: "Hocheffizient, modernes A-Gerät.", cost: 1000, energy: 320, energyLabel: "A" },
    ],
  },
];

export function formatNumber(n: number) {
  return n.toLocaleString("de-CH").replace(/,/g, "'");
}
