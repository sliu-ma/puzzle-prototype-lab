// Daten für den "Grünen Markt" — Kapitel 1
// Schweiz · CHF · Schweizer Siegel (Bio, IP-Suisse, Demeter)

import erdbeerenChAsset from "@/assets/produkte/erdbeeren-ch.webp.asset.json";
import erdbeerenEsAsset from "@/assets/produkte/erdbeeren-es.jpg.asset.json";
import zitroneAsset from "@/assets/produkte/zitrone.webp.asset.json";
import mehlAsset from "@/assets/produkte/mehl.jpg.asset.json";
import vollrahmAsset from "@/assets/produkte/vollrahm.jpg.asset.json";
import aepfelAsset from "@/assets/produkte/aepfel.jpg.asset.json";
import tomatenAsset from "@/assets/produkte/tomaten.webp.asset.json";
import eierImportAsset from "@/assets/produkte/eier-import.jpg.asset.json";
import eierBioAsset from "@/assets/produkte/eier-bio.jpg.asset.json";
import butterAsset from "@/assets/produkte/butter.webp.asset.json";
import zuckerAsset from "@/assets/produkte/zucker.webp.asset.json";
import vanillezuckerAsset from "@/assets/produkte/vanillezucker.webp.asset.json";
import salzAsset from "@/assets/produkte/salz.webp.asset.json";

import bioLogo from "@/assets/labels/bio.png.asset.json";
import ipSuisseLogo from "@/assets/labels/ip-suisse.png.asset.json";
import demeterLogo from "@/assets/labels/demeter.png.asset.json";

export type Kategorie =
  | "milch-eier"
  | "fruechte-gemuese"
  | "getreide-backen"
  | "fette"
  | "andere";

export type SiegelKey = "bio" | "ip-suisse" | "demeter";

export interface SiegelInfo {
  key: SiegelKey;
  label: string;
  logoUrl?: string;
}

export const SIEGEL: Record<SiegelKey, SiegelInfo> = {
  bio: { key: "bio", label: "Bio", logoUrl: bioLogo.url },
  "ip-suisse": { key: "ip-suisse", label: "IP-Suisse", logoUrl: ipSuisseLogo.url },
  demeter: { key: "demeter", label: "Demeter", logoUrl: demeterLogo.url },
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
    siegel: [],
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
      label: 1,
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
    siegel: ["bio", "demeter"],
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
    bildUrl: aepfelAsset.url,
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
    bildUrl: tomatenAsset.url,
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
    name: "Eier 10er · Bodenhaltung",
    kategorie: "milch-eier",
    herkunft: "EU-Import",
    preis: 2.9,
    siegel: [],
    saison: "ganzjahr",
    emoji: "🥚",
    bildUrl: eierImportAsset.url,
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
    siegel: ["bio"],
    saison: "ganzjahr",
    emoji: "🥚",
    bildUrl: eierBioAsset.url,
    bewertung: "gut",
    zutat: "eier",
    ersetzt: "eier-bh-import",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 4,
      label: 5,
      erklaerung:
        "Schweizer Bio-Freilandhaltung mit Auslauf, kontrolliertes Bio-Futter und kurze Wege.",
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
    bildUrl: butterAsset.url,
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
    name: "Cristal Feinkristall-Zucker 1kg",
    kategorie: "getreide-backen",
    herkunft: "Schweiz",
    preis: 1.6,
    siegel: [],
    saison: "ganzjahr",
    emoji: "🧂",
    bildUrl: zuckerAsset.url,
    bewertung: "neutral",
    zutat: "zucker",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 3,
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
    bildUrl: vanillezuckerAsset.url,
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
    name: "Sel des Alpes · Speisesalz 500g",
    kategorie: "andere",
    herkunft: "Schweizer Berggebiete",
    preis: 2.2,
    siegel: [],
    saison: "ganzjahr",
    emoji: "🧂",
    bildUrl: salzAsset.url,
    bewertung: "neutral",
    zutat: "salz",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 3,
      label: 2,
      erklaerung:
        "Speisesalz aus Schweizer Berggebieten — sehr kurze Wege, jodiert und fluoridiert. Kartonverpackung, kein zusätzliches Nachhaltigkeitslabel.",
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
