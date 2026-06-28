// Alle Story-Inhalte zentral. Leicht austauschbar.

export type MajaEmotion = "neutral" | "surprised" | "worried" | "happy" | "thinking";

export type Panel = {
  /** Kurztext im Panel (max ~12 Wörter) */
  text?: string;
  /** Sprechblase Maja */
  maja?: { says: string; emotion: MajaEmotion };
  /** Hintergrund-Hinweis für das Panel (Platzhalter-Icon) */
  scene: "letter" | "station" | "discovery" | "puzzle" | "success" | "map";
};

export type StationId = "bahnhof" | "dorfladen" | "wald" | "haus" | "kraftwerk";

export type StationContent = {
  id: StationId;
  nr: number;
  ort: string;
  thema: string;
  /** Position auf der Dorfkarte in % (0–100) */
  mapPos: { x: number; y: number };
  intro: Panel[];
  fact: string;
};

export const STATIONS: StationContent[] = [
  {
    id: "bahnhof",
    nr: 1,
    ort: "Bahnhof",
    thema: "Mobilität",
    mapPos: { x: 18, y: 72 },
    intro: [
      {
        scene: "station",
        text: "Bahnhof Grünwald · 14:30",
        maja: { says: "Elvira war heute Morgen hier …", emotion: "thinking" },
      },
      {
        scene: "discovery",
        maja: {
          says: "Eine Notiz! Drei Reiserouten — aber welche hat sie genommen?",
          emotion: "surprised",
        },
      },
      {
        scene: "puzzle",
        maja: { says: "Ich muss sie nach CO₂ sortieren — vom Besten zum Schlechtesten.", emotion: "neutral" },
      },
    ],
    fact: "Die Bahn verursacht pro Person ca. 6 kg CO₂ — ein Auto rund 80 kg, ein Flug innereuropäisch über 140 kg.",
  },
  {
    id: "dorfladen",
    nr: 2,
    ort: "Dorfladen",
    thema: "Konsum",
    mapPos: { x: 42, y: 55 },
    intro: [
      { scene: "station", text: "Dorfladen", maja: { says: "Hier kaufte Elvira oft ein.", emotion: "neutral" } },
    ],
    fact: "Regionale & saisonale Produkte sparen Transportwege und CO₂.",
  },
  {
    id: "wald",
    nr: 3,
    ort: "Wald-Lichtung",
    thema: "Biodiversität",
    mapPos: { x: 68, y: 28 },
    intro: [
      { scene: "station", text: "Wald", maja: { says: "So still hier …", emotion: "worried" } },
    ],
    fact: "In der Schweiz sind über 35 % der Tierarten gefährdet.",
  },
  {
    id: "haus",
    nr: 4,
    ort: "Elviras Haus",
    thema: "Wohnen",
    mapPos: { x: 55, y: 78 },
    intro: [
      { scene: "station", text: "Elviras Haus", maja: { says: "Endlich zu Hause angekommen.", emotion: "thinking" } },
    ],
    fact: "Heizen macht über 60 % des Energieverbrauchs im Haushalt aus.",
  },
  {
    id: "kraftwerk",
    nr: 5,
    ort: "Wasserkraftwerk",
    thema: "Energie",
    mapPos: { x: 82, y: 60 },
    intro: [
      { scene: "station", text: "Wasserkraftwerk", maja: { says: "Hier wird Strom gemacht.", emotion: "neutral" } },
    ],
    fact: "Wasserkraft deckt rund 57 % der Schweizer Stromproduktion.",
  },
];

// Rätsel-Daten Station 1: Sortieren nach CO₂ (kg pro Person, Strecke Genf → Speicher)
export const MOBILITY_OPTIONS = [
  { id: "zug", label: "Zug", co2: 6, icon: "train", color: "var(--color-forest)" },
  { id: "auto", label: "Auto", co2: 80, icon: "car", color: "var(--color-clay)" },
  { id: "flug", label: "Flugzeug", co2: 140, icon: "plane", color: "var(--color-stamp)" },
] as const;
