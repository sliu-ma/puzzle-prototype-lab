export interface EnergyOption {
  id: string;
  label: string;
  description: string;
  cost: number;
  energy: number; // kWh/Jahr Ersparnis
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
  options: EnergyOption[];
}

export const BUDGET = 1500;

const IMG_W = 941;
const IMG_H = 1672;
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
    ...fromPx(366.6, 558, 82, 62),
    options: [
      { id: "alt", label: "Alter LCD, Standby an", description: "Läuft immer im Standby.", cost: 0, energy: 0 },
      { id: "off", label: "Steckerleiste mit Schalter", description: "Komplett aus wenn nicht gebraucht.", cost: 15, energy: 320 },
      { id: "neu", label: "Neuer OLED, A-Klasse", description: "Effizient und ohne Standby.", cost: 900, energy: 480 },
    ],
  },
  {
    id: "shower",
    name: "Bad – Dusche",
    room: "Bad",
    icon: "🚿",
    ...fromPx(605, 455, 191, 287),
    options: [
      { id: "lang", label: "Lange heisse Dusche", description: "15 Minuten täglich.", cost: 0, energy: 0 },
      { id: "kurz", label: "Kurz duschen (5 Min)", description: "Schneller fertig, mehr Energie gespart.", cost: 0, energy: 1800 },
      { id: "sparbrause", label: "Sparbrause + kurz", description: "Halbiert den Wasserverbrauch.", cost: 60, energy: 2700 },
    ],
  },
  {
    id: "faucet",
    name: "Bad – Wasserhahn",
    room: "Bad",
    icon: "🚰",
    ...fromPx(495, 605, 100, 81),
    options: [
      { id: "alt", label: "Alter Hahn, läuft immer", description: "Wasser läuft beim Zähneputzen.", cost: 0, energy: 0 },
      { id: "zu", label: "Beim Putzen zudrehen", description: "Einfache Gewohnheit, viel Wirkung.", cost: 0, energy: 600 },
      { id: "perlator", label: "Spar-Perlator", description: "Halbierter Wasserdurchfluss.", cost: 20, energy: 900 },
    ],
  },
  {
    id: "fridge",
    name: "Küche – Kühlschrank",
    room: "Küche",
    icon: "🧊",
    ...fromPx(167, 830, 90, 246),
    options: [
      { id: "alt", label: "Kühlschrank von 2005", description: "Energiefresser.", cost: 0, energy: 0 },
      { id: "a-plus", label: "Modell A+", description: "Etwas sparsamer.", cost: 400, energy: 380 },
      { id: "a-plus3", label: "Neues Modell A+++", description: "Hocheffizient.", cost: 800, energy: 720 },
    ],
  },
  {
    id: "oven",
    name: "Küche – Ofen",
    room: "Küche",
    icon: "🍳",
    ...fromPx(370, 976, 84, 100),
    options: [
      { id: "alt", label: "Alter Backofen", description: "Lange Vorheizzeit.", cost: 0, energy: 0 },
      { id: "umluft", label: "Umluft nutzen", description: "Niedrigere Temperatur möglich.", cost: 0, energy: 220 },
      { id: "neu", label: "Neuer A+++ Ofen", description: "Top isoliert.", cost: 750, energy: 540 },
    ],
  },
  {
    id: "light-living",
    name: "Wohnzimmer – Lampe",
    room: "Wohnzimmer",
    icon: "💡",
    ...fromPx(495, 904.5, 56, 111),
    options: [
      { id: "glueh", label: "Glühbirnen", description: "Viel Strom.", cost: 0, energy: 0 },
      { id: "led", label: "LED warmweiss", description: "Selbe Stimmung, weniger Strom.", cost: 90, energy: 410 },
      { id: "dimm", label: "LED + Dimmer", description: "Helligkeit nach Bedarf.", cost: 160, energy: 520 },
    ],
  },
  {
    id: "window",
    name: "Wohnzimmer – Fenster",
    room: "Wohnzimmer",
    icon: "🪟",
    ...fromPx(578.5, 822.2, 152.6, 129.2),
    options: [
      { id: "kippen", label: "Fenster auf Kipp", description: "Dauerhaft gekippt – Wärme entweicht.", cost: 0, energy: 0 },
      { id: "stoss", label: "Stosslüften", description: "Kurz weit auf, dann zu.", cost: 0, energy: 1600 },
      { id: "3fach", label: "3-fach Verglasung", description: "Top isoliert.", cost: 1100, energy: 2200 },
    ],
  },
  {
    id: "car",
    name: "Garage – Auto",
    room: "Garage",
    icon: "🚗",
    ...fromPx(190, 1266, 248, 221),
    options: [
      { id: "benzin", label: "Benziner", description: "Klassischer Verbrenner.", cost: 0, energy: 0 },
      { id: "hybrid", label: "Hybrid-Auto", description: "Weniger Verbrauch in der Stadt.", cost: 800, energy: 1400 },
      { id: "elektro", label: "E-Auto + PV-Strom", description: "Mit Solar geladen.", cost: 1300, energy: 3200 },
    ],
  },
  {
    id: "heating",
    name: "Heizraum – Heizung",
    room: "Heizraum",
    icon: "🌡️",
    ...fromPx(585, 1260, 111, 221),
    options: [
      { id: "oel", label: "Alte Ölheizung", description: "Teuer und CO₂-stark.", cost: 0, energy: 0 },
      { id: "gas", label: "Gasheizung modern", description: "Etwas besser.", cost: 700, energy: 2400 },
      { id: "wp", label: "Wärmepumpe", description: "Strom + Umweltwärme.", cost: 1200, energy: 5200 },
    ],
  },
  {
    id: "hotwater",
    name: "Heizraum – Warmwasser",
    room: "Heizraum",
    icon: "♨️",
    ...fromPx(696, 1341, 81, 103),
    options: [
      { id: "elektro", label: "Elektroboiler", description: "Konstant am Heizen.", cost: 0, energy: 0 },
      { id: "wp", label: "Warmwasser-Wärmepumpe", description: "Viel sparsamer.", cost: 500, energy: 1900 },
    ],
  },
];

export function formatNumber(n: number) {
  return n.toLocaleString("de-CH").replace(/,/g, "'");
}
