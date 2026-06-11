// Daten für den "Grünen Markt" — Kapitel 1
// Schweiz · CHF · Schweizer Siegel (Bio Suisse, IP-Suisse, Demeter, Migros Bio)

import erdbeerenChAsset from "@/assets/produkte/erdbeeren-ch.webp.asset.json";
import erdbeerenEsAsset from "@/assets/produkte/erdbeeren-es.jpg.asset.json";
import zitroneAsset from "@/assets/produkte/zitrone.webp.asset.json";
import mehlAsset from "@/assets/produkte/mehl.jpg.asset.json";
import vollrahmAsset from "@/assets/produkte/vollrahm.jpg.asset.json";

import migrosBioLogo from "@/assets/labels/migros-bio.jpg.asset.json";
import ipSuisseLogo from "@/assets/labels/ip-suisse.png.asset.json";
import demeterLogo from "@/assets/labels/demeter.png.asset.json";

export type Kategorie =
  | "milch-eier"
  | "fruechte-gemuese"
  | "getreide-backen"
  | "fette"
  | "andere";

export type SiegelKey =
  | "bio-suisse"
  | "migros-bio"
  | "ip-suisse"
  | "demeter"
  | "fairtrade"
  | "bio-import"
  | "bio";

export interface SiegelInfo {
  key: SiegelKey;
  label: string;
  logoUrl?: string;
}

export const SIEGEL: Record<SiegelKey, SiegelInfo> = {
  "migros-bio": { key: "migros-bio", label: "Migros Bio", logoUrl: migrosBioLogo.url },
  "ip-suisse": { key: "ip-suisse", label: "IP-Suisse", logoUrl: ipSuisseLogo.url },
  demeter: { key: "demeter", label: "Demeter", logoUrl: demeterLogo.url },
  "bio-suisse": { key: "bio-suisse", label: "Bio Suisse" },
  fairtrade: { key: "fairtrade", label: "Fairtrade" },
  "bio-import": { key: "bio-import", label: "Bio Import" },
  bio: { key: "bio", label: "Bio" },
};

export interface Nachhaltigkeit {
  regional: number; // 1–5
  saisonal: number; // 1–5
  verpackung: number; // 1–5
  label: number; // 1–5
  erklaerung: string;
}

export interface Produkt {
  id: string;
  name: string;
  kategorie: Kategorie;
  herkunft: string;
  preis: number; // CHF
  siegel: SiegelKey[];
  saison: "in" | "out" | "ganzjahr";
  emoji: string;
  bildUrl?: string;
  bewertung: "gut" | "schlecht" | "neutral";
  problemHinweis?: string;
  ersetzt?: string;
  zutat?:
    | "erdbeeren"
    | "eier"
    | "mehl"
    | "zucker"
    | "salz"
    | "butter"
    | "zitrone"
    | "vollrahm"
    | "vanillezucker";
  nachhaltigkeit: Nachhaltigkeit;
}

export const KATEGORIEN: { id: Kategorie; label: string; emoji: string }[] = [
  { id: "milch-eier", label: "Milch & Eier", emoji: "🥛" },
  { id: "fruechte-gemuese", label: "Früchte & Gemüse", emoji: "🍎" },
  { id: "getreide-backen", label: "Getreide & Backen", emoji: "🌾" },
  { id: "fette", label: "Öle & Fette", emoji: "🧈" },
  { id: "andere", label: "Weiteres", emoji: "🛒" },
];

export const PRODUKTE: Produkt[] = [
  // ── Früchte & Gemüse ────────────────────────────────────────────
  {
    id: "erdbeeren-es",
    name: "Erdbeeren 500g",
    kategorie: "fruechte-gemuese",
    herkunft: "Spanien",
    preis: 5.9,
    siegel: ["bio-import"],
    saison: "out",
    emoji: "🍓",
    bildUrl: erdbeerenEsAsset.url,
    bewertung: "schlecht",
    zutat: "erdbeeren",
    problemHinweis:
      "Erdbeeren wachsen in der Schweiz erst ab Mai/Juni. Importe aus Südeuropa im März bedeuten lange Transporte oder Plastiktunnel — viel Energie für wenig Geschmack.",
    nachhaltigkeit: {
      regional: 1,
      saisonal: 1,
      verpackung: 1,
      label: 2,
      erklaerung:
        "Importware aus Südeuropa, oft aus beheizten Folientunneln. Plastikverpackung, lange Transportwege und ausserhalb der Schweizer Saison.",
    },
  },
  {
    id: "erdbeeren-ch",
    name: "Erdbeeren 500g",
    kategorie: "fruechte-gemuese",
    herkunft: "Region Thurgau (CH)",
    preis: 7.5,
    siegel: ["ip-suisse"],
    saison: "in",
    emoji: "🍓",
    bildUrl: erdbeerenChAsset.url,
    bewertung: "gut",
    zutat: "erdbeeren",
    ersetzt: "erdbeeren-es",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 4,
      label: 4,
      erklaerung:
        "Schweizer Freilanderdbeeren in der Hauptsaison, kurze Transportwege, kompostierbare Kartonschale und IP-Suisse-Standard.",
    },
  },
  {
    id: "zitrone-it",
    name: "Bio-Zitrone",
    kategorie: "fruechte-gemuese",
    herkunft: "Italien",
    preis: 0.9,
    siegel: ["migros-bio", "demeter"],
    saison: "ganzjahr",
    emoji: "🍋",
    bildUrl: zitroneAsset.url,
    bewertung: "neutral",
    zutat: "zitrone",
    nachhaltigkeit: {
      regional: 2,
      saisonal: 4,
      verpackung: 5,
      label: 5,
      erklaerung:
        "Zitronen wachsen nicht in der Schweiz — Süditalien ist der nächste sinnvolle Anbauort. Demeter-Standard (biodynamisch), unverpackt.",
    },
  },
  {
    id: "aepfel-ch",
    name: "Äpfel 'Gala' 1kg",
    kategorie: "fruechte-gemuese",
    herkunft: "Schweiz",
    preis: 3.9,
    siegel: ["ip-suisse"],
    saison: "in",
    emoji: "🍎",
    bewertung: "neutral",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 4,
      label: 4,
      erklaerung:
        "Schweizer Äpfel sind ganzjährig regional verfügbar (Lagerware). Geringe Transportwege und IP-Suisse-Standard.",
    },
  },
  {
    id: "tomaten-ma",
    name: "Tomaten 500g",
    kategorie: "fruechte-gemuese",
    herkunft: "Marokko",
    preis: 3.2,
    siegel: [],
    saison: "out",
    emoji: "🍅",
    bewertung: "neutral",
    nachhaltigkeit: {
      regional: 1,
      saisonal: 1,
      verpackung: 2,
      label: 1,
      erklaerung:
        "Tomaten aus Marokko ausserhalb der Schweizer Saison: lange Transportwege, hoher Wasserverbrauch im Anbauland, keine Nachhaltigkeitslabel.",
    },
  },

  // ── Milch & Eier ────────────────────────────────────────────────
  {
    id: "eier-bh-import",
    name: "Eier 6er · Bodenhaltung",
    kategorie: "milch-eier",
    herkunft: "EU-Import",
    preis: 2.9,
    siegel: [],
    saison: "ganzjahr",
    emoji: "🥚",
    bewertung: "schlecht",
    zutat: "eier",
    problemHinweis:
      "Bodenhaltung bedeutet enge Ställe, importierte Eier kommen oft tausende Kilometer weit. Schweizer Bio-Freilandeier garantieren Auslauf und kurze Wege.",
    nachhaltigkeit: {
      regional: 1,
      saisonal: 5,
      verpackung: 3,
      label: 1,
      erklaerung:
        "Import-Eier aus Bodenhaltung — enge Ställe, lange Transportwege, keine Tierwohl-Label und keine Kontrolle über die Futtermittelherkunft.",
    },
  },
  {
    id: "eier-bio-ch",
    name: "Eier 6er · Bio-Freiland",
    kategorie: "milch-eier",
    herkunft: "Schweiz",
    preis: 5.4,
    siegel: ["bio-suisse"],
    saison: "ganzjahr",
    emoji: "🥚",
    bewertung: "gut",
    zutat: "eier",
    ersetzt: "eier-bh-import",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 4,
      label: 5,
      erklaerung:
        "Schweizer Bio-Freilandhaltung mit Auslauf, kontrolliertes Bio-Futter und kurze Wege. Knospen-Standard (Bio Suisse).",
    },
  },
  {
    id: "butter-ch",
    name: "Butter 250g",
    kategorie: "fette",
    herkunft: "Schweiz",
    preis: 3.6,
    siegel: ["ip-suisse"],
    saison: "ganzjahr",
    emoji: "🧈",
    bewertung: "neutral",
    zutat: "butter",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 3,
      label: 4,
      erklaerung:
        "Schweizer Milchprodukt mit IP-Suisse-Standard. Aluminiumverpackung ist recycelbar, aber nicht optimal.",
    },
  },
  {
    id: "vollrahm-ch",
    name: "Vollrahm 2.5dl",
    kategorie: "milch-eier",
    herkunft: "Schweiz",
    preis: 2.4,
    siegel: ["ip-suisse"],
    saison: "ganzjahr",
    emoji: "🥛",
    bildUrl: vollrahmAsset.url,
    bewertung: "neutral",
    zutat: "vollrahm",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 3,
      label: 4,
      erklaerung:
        "Schweizer Milch von IP-Suisse-Betrieben. Tetrapak-Verpackung ist recycelbar, aber mehrschichtig.",
    },
  },

  // ── Getreide & Backen ───────────────────────────────────────────
  {
    id: "mehl-ch",
    name: "Weissmehl 1kg",
    kategorie: "getreide-backen",
    herkunft: "Schweiz",
    preis: 1.9,
    siegel: ["ip-suisse"],
    saison: "ganzjahr",
    emoji: "🌾",
    bildUrl: mehlAsset.url,
    bewertung: "neutral",
    zutat: "mehl",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 4,
      label: 4,
      erklaerung:
        "Schweizer Weizen, IP-Suisse-Standard, einfache Papierverpackung.",
    },
  },
  {
    id: "zucker-ch",
    name: "Zucker 1kg",
    kategorie: "getreide-backen",
    herkunft: "Schweiz",
    preis: 1.6,
    siegel: [],
    saison: "ganzjahr",
    emoji: "🧂",
    bewertung: "neutral",
    zutat: "zucker",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 4,
      label: 2,
      erklaerung:
        "Schweizer Zuckerrüben — regional, aber ohne weiteres Nachhaltigkeitslabel. Papierverpackung.",
    },
  },
  {
    id: "vanillezucker",
    name: "Vanillezucker 5×8g",
    kategorie: "getreide-backen",
    herkunft: "Schweiz (verpackt)",
    preis: 1.4,
    siegel: [],
    saison: "ganzjahr",
    emoji: "🍦",
    bewertung: "neutral",
    zutat: "vanillezucker",
    nachhaltigkeit: {
      regional: 3,
      saisonal: 5,
      verpackung: 2,
      label: 1,
      erklaerung:
        "Vanille kommt meist aus Madagaskar. Einzeln verpackte Portionen verursachen viel Verpackungsmüll.",
    },
  },

  // ── Andere ──────────────────────────────────────────────────────
  {
    id: "salz",
    name: "Meersalz 500g",
    kategorie: "andere",
    herkunft: "Frankreich",
    preis: 2.2,
    siegel: [],
    saison: "ganzjahr",
    emoji: "🧂",
    bewertung: "neutral",
    zutat: "salz",
    nachhaltigkeit: {
      regional: 3,
      saisonal: 5,
      verpackung: 4,
      label: 2,
      erklaerung:
        "Meersalz aus Frankreich — kurze Wege innerhalb Europas, einfache Papierverpackung, aber kein spezifisches Nachhaltigkeitslabel.",
    },
  },
];

export const REZEPT = {
  titel: "Erdbeer-Törtchen (8 Stück)",
  emoji: "🥧",
  zutaten: [
    "200 g Mehl",
    "2 EL Zucker",
    "1 Prise Salz",
    "100 g Butter",
    "½ Zitrone",
    "1 Ei",
    "2 dl Vollrahm",
    "2 EL Vanillezucker",
    "500 g Erdbeeren",
  ],
};

export const START_WARENKORB: string[] = [
  "erdbeeren-es",
  "eier-bh-import",
  "mehl-ch",
  "zucker-ch",
  "salz",
  "butter-ch",
  "zitrone-it",
  "vollrahm-ch",
  "vanillezucker",
];

export const REZEPT_ZUTATEN_KEYS = [
  "mehl",
  "zucker",
  "salz",
  "butter",
  "zitrone",
  "eier",
  "vollrahm",
  "vanillezucker",
  "erdbeeren",
] as const;
