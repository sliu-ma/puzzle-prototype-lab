import type { MajaMood } from "@/components/narrative/MajaAvatar";

export type Panel = {
  /** Hintergrund-Token: bestimmt Farbverlauf des Panels */
  setting:
    | "bahnhof"
    | "dorfladen"
    | "wald"
    | "haus"
    | "kraftwerk"
    | "saal"
    | "brief"
    | "portrait";
  mood: MajaMood;
  text: string;
};

export type StationBeats = {
  intro: Panel[];
  success: { mood: MajaMood; text: string };
};

export const STATION: Record<
  "bahnhof" | "dorfladen" | "wald" | "haus" | "kraftwerk",
  StationBeats
> = {
  bahnhof: {
    intro: [
      { setting: "bahnhof", mood: "denkend", text: "Bahnhof Grünwald. Gleis 1, leerer Bahnsteig." },
      { setting: "brief", mood: "staunend", text: "Elviras Brief — und drei alte Tickets." },
      { setting: "portrait", mood: "neutral", text: "Welche Route hat sie damals genommen? Nur eine passt zu ihr." },
    ],
    success: { mood: "daumen-hoch", text: "Treffer! Genau ihr Stil." },
  },
  dorfladen: {
    intro: [
      { setting: "dorfladen", mood: "neutral", text: "Der alte Dorfladen riecht nach Holz und Kaffee." },
      { setting: "portrait", mood: "denkend", text: "Frau Berger zeigt mir einen gepackten Korb." },
      { setting: "brief", mood: "staunend", text: "Frau Berger: „Den hätte Elvira nie so gekauft." Zwei Sachen stimmen nicht." },
    ],
    success: { mood: "freude", text: "Saisonal, regional, fair — Elvira hätte gestrahlt." },
  },
  wald: {
    intro: [
      { setting: "wald", mood: "neutral", text: "Die Lichtung. Hier hat sie früher Vögel beobachtet." },
      { setting: "brief", mood: "denkend", text: "Auf einem Blatt: Polaroids von Tieren — und ein Gedicht." },
      { setting: "portrait", mood: "staunend", text: "Welche Arten verschwinden? Die Antwort steckt im Text." },
    ],
    success: { mood: "daumen-hoch", text: "Zahlen geknackt. Die Stimmen sind nicht verloren." },
  },
  haus: {
    intro: [
      { setting: "haus", mood: "denkend", text: "Elviras Haus. Heizungsrechnungen liegen offen auf dem Tisch." },
      { setting: "portrait", mood: "besorgt", text: "Zu viel Energie für zu wenig Wärme." },
      { setting: "brief", mood: "neutral", text: "Elviras Notiz: Mach mein Haus fit — bevor du zum Kraftwerk gehst." },
    ],
    success: { mood: "freude", text: "Gedämmt, gelüftet, gespart. Das schaffen wir." },
  },
  kraftwerk: {
    intro: [
      { setting: "kraftwerk", mood: "besorgt", text: "Das alte Wasserkraftwerk. Daneben das Gas-Gutachten." },
      { setting: "brief", mood: "denkend", text: "Marlene Vogt hat die Zahlen geprüft. Es stimmt etwas nicht." },
      { setting: "portrait", mood: "staunend", text: "Vier Behauptungen — drei sind glatt gelogen." },
    ],
    success: { mood: "daumen-hoch", text: "Aufgedeckt. Jetzt zum Hearing." },
  },
};

/* -------- Finale -------- */

export type Ratsperson = {
  name: string;
  rolle: string;
  /** Akzentfarbe als Tailwind/CSS-Hex */
  farbe: string;
  /** SVG-Initiale */
  initiale: string;
};

export const RATSPERSONEN: Record<string, Ratsperson> = {
  schmid: { name: "Ratsmitglied Schmid", rolle: "Mobilität", farbe: "#3b6ea5", initiale: "S" },
  brunner: { name: "Ratsherr Brunner", rolle: "Landwirtschaft", farbe: "#6b8e23", initiale: "B" },
  lindenmann: { name: "Ratsfrau Lindenmann", rolle: "Umwelt", farbe: "#8a4b8a", initiale: "L" },
  frei: { name: "Ratsherr Frei", rolle: "Bau & Wohnen", farbe: "#c78b3c", initiale: "F" },
  praesident: { name: "Gemeindepräsident", rolle: "Vorsitz", farbe: "#8a1f1f", initiale: "P" },
};

/** Mapping: Ratsmitglied-String aus FRAGEN → Key in RATSPERSONEN */
export function ratspersonKey(s: string): keyof typeof RATSPERSONEN {
  if (s.includes("Schmid")) return "schmid";
  if (s.includes("Brunner")) return "brunner";
  if (s.includes("Lindenmann")) return "lindenmann";
  if (s.includes("Frei")) return "frei";
  return "praesident";
}
