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
import milchAsset from "@/assets/produkte/milch.webp.asset.json";
import joghurtSchokoAsset from "@/assets/produkte/joghurt-schoko.webp.asset.json";
import oatlyAsset from "@/assets/produkte/oatly-hafer.webp.asset.json";
import gurkeChAsset from "@/assets/produkte/gurke-ch.webp.asset.json";
import zitroneZaAsset from "@/assets/produkte/zitrone-za.jpg.asset.json";
import backpulverAsset from "@/assets/produkte/backpulver.webp.asset.json";
import mandelnAsset from "@/assets/produkte/mandeln.jpg.asset.json";

import bioLogo from "@/assets/labels/bio.png.asset.json";
import ipSuisseLogo from "@/assets/labels/ip-suisse.png.asset.json";
import demeterLogo from "@/assets/labels/demeter.png.asset.json";
import suisseGarantieLogo from "@/assets/labels/suisse-garantie.webp.asset.json";

export type Kategorie = "milch-eier" | "fruechte-gemuese" | "backzutaten" | "andere";

export type SiegelKey = "bio" | "ip-suisse" | "demeter" | "suisse-garantie";

export interface SiegelInfo {
  key: SiegelKey;
  label: string;
  logoUrl?: string;
}

export const SIEGEL: Record<SiegelKey, SiegelInfo> = {
  bio: { key: "bio", label: "Bio", logoUrl: bioLogo.url },
  "ip-suisse": { key: "ip-suisse", label: "IP-Suisse", logoUrl: ipSuisseLogo.url },
  demeter: { key: "demeter", label: "Demeter", logoUrl: demeterLogo.url },
  "suisse-garantie": { key: "suisse-garantie", label: "Suisse Garantie", logoUrl: suisseGarantieLogo.url },
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
  zutat?: "erdbeeren" | "eier" | "mehl" | "zucker" | "salz" | "butter" | "zitrone" | "vollrahm" | "vanillezucker";
  nachhaltigkeit: Nachhaltigkeit;
}

export const KATEGORIEN: { id: Kategorie; label: string; emoji: string }[] = [
  { id: "milch-eier", label: "Milchprodukte & Eier", emoji: "🥛" },
  { id: "fruechte-gemuese", label: "Früchte & Gemüse", emoji: "🍎" },
  { id: "backzutaten", label: "Backzutaten", emoji: "🌾" },
  { id: "andere", label: "Weiteres", emoji: "🛒" },
];

export const PRODUKTE: Produkt[] = [
  // ── Früchte & Gemüse ────────────────────────────────────────────
  {
    id: "erdbeeren-es",
    name: "Erdbeeren 500g",
    kategorie: "fruechte-gemuese",
    herkunft: "Spanien",
    preis: 6.8,
    siegel: ["bio"],
    saison: "out",
    emoji: "🍓",
    bildUrl: erdbeerenEsAsset.url,
    bewertung: "schlecht",
    zutat: "erdbeeren",
    problemHinweis:
      "Auch Bio-Erdbeeren aus Spanien reisen im März tausende Kilometer. Bio sagt etwas über den Anbau — nichts über Transport und Saison.",
    nachhaltigkeit: {
      regional: 1,
      saisonal: 1,
      verpackung: 2,
      label: 4,
      erklaerung:
        "Bio-Anbau ohne synthetische Pestizide — aber Importware aus Südeuropa ausserhalb der Schweizer Saison. Lange Transportwege und meist Plastikverpackung.",
    },
  },
  {
    id: "erdbeeren-ch",
    name: "Erdbeeren 500g",
    kategorie: "fruechte-gemuese",
    herkunft: "Region Thurgau (CH)",
    preis: 6.0,
    siegel: ["suisse-garantie"],
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
        "Schweizer Freilanderdbeeren in der Hauptsaison, kurze Transportwege, kompostierbare Kartonschale und Suisse-Garantie-Standard.",
    },
  },
  {
    id: "zitrone-it",
    name: "Bio-Zitrone",
    kategorie: "fruechte-gemuese",
    herkunft: "Italien",
    preis: 0.45,
    siegel: ["bio", "demeter"],
    saison: "ganzjahr",
    emoji: "🍋",
    bildUrl: zitroneAsset.url,
    bewertung: "gut",
    zutat: "zitrone",
    ersetzt: "zitrone-za",
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
    preis: 2.8,
    siegel: ["suisse-garantie"],
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
        "Schweizer Äpfel sind ganzjährig regional verfügbar (Lagerware). Geringe Transportwege und Suisse-Garantie-Standard.",
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
    preis: 3.2,
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
    name: "Eier 4er · Bio-Freiland",
    kategorie: "milch-eier",
    herkunft: "Schweiz",
    preis: 3.5,
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
      erklaerung: "Schweizer Bio-Freilandhaltung mit Auslauf, kontrolliertes Bio-Futter und kurze Wege.",
    },
  },
  {
    id: "milch-valflora",
    name: "Valflora Vollmilch 1L · PAST",
    kategorie: "milch-eier",
    herkunft: "Schweiz",
    preis: 1.85,
    siegel: ["ip-suisse"],
    saison: "ganzjahr",
    emoji: "🥛",
    bildUrl: milchAsset.url,
    bewertung: "neutral",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 3,
      label: 4,
      erklaerung:
        "Schweizer Milch (3.5% Fett, pasteurisiert) von IP-Suisse-Betrieben. Tetrapak-Verpackung ist recycelbar, aber mehrschichtig.",
    },
  },
  {
    id: "joghurt-schoko",
    name: "M-Classic Joghurt Schokolade",
    kategorie: "milch-eier",
    herkunft: "Schweiz",
    preis: 1.1,
    siegel: [],
    saison: "ganzjahr",
    emoji: "🍫",
    bildUrl: joghurtSchokoAsset.url,
    bewertung: "neutral",
    nachhaltigkeit: {
      regional: 3,
      saisonal: 5,
      verpackung: 2,
      label: 1,
      erklaerung:
        "Schweizer Milchbasis, aber Kakao stammt aus Übersee (oft ohne Fairtrade-Label). Einweg-Plastikbecher, kein Bio- oder Tierwohl-Label.",
    },
  },
  {
    id: "butter-ch",
    name: "Butter 250g",
    kategorie: "milch-eier",
    herkunft: "Schweiz",
    preis: 3.85,
    siegel: ["suisse-garantie"],
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
        "Schweizer Milchprodukt mit Suisse-Garantie-Standard. Aluminiumverpackung ist recycelbar, aber nicht optimal.",
    },
  },
  {
    id: "vollrahm-ch",
    name: "Vollrahm 2.5dl",
    kategorie: "milch-eier",
    herkunft: "Schweiz",
    preis: 2.1,
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
      erklaerung: "Schweizer Milch von IP-Suisse-Betrieben. Tetrapak-Verpackung ist recycelbar, aber mehrschichtig.",
    },
  },

  // ── Getreide & Backen ───────────────────────────────────────────
  {
    id: "mehl-ch",
    name: "Weissmehl 1kg",
    kategorie: "backzutaten",
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
      erklaerung: "Schweizer Weizen, IP-Suisse-Standard, einfache Papierverpackung.",
    },
  },
  {
    id: "zucker-ch",
    name: "Cristal Feinkristall-Zucker 1kg",
    kategorie: "backzutaten",
    herkunft: "Schweiz",
    preis: 1.8,
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
      erklaerung: "Schweizer Zuckerrüben — regional, aber ohne weiteres Nachhaltigkeitslabel. Papierverpackung.",
    },
  },
  {
    id: "vanillezucker",
    name: "Vanillezucker 10×8g",
    kategorie: "backzutaten",
    herkunft: "Schweiz (verpackt)",
    preis: 0.45,
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
      erklaerung: "Vanille kommt meist aus Madagaskar. Einzeln verpackte Portionen verursachen viel Verpackungsmüll.",
    },
  },

  // ── Andere ──────────────────────────────────────────────────────
  {
    id: "salz",
    name: "Sel des Alpes · Speisesalz 500g",
    kategorie: "andere",
    herkunft: "Schweizer Berggebiete",
    preis: 1.6,
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

  // ── Neue Ergänzungen ────────────────────────────────────────────
  {
    id: "oatly-hafer",
    name: "Oatly Haferdrink Barista 1L",
    kategorie: "milch-eier",
    herkunft: "Schweden",
    preis: 3.4,
    siegel: [],
    saison: "ganzjahr",
    emoji: "🥛",
    bildUrl: oatlyAsset.url,
    bewertung: "neutral",
    nachhaltigkeit: {
      regional: 1,
      saisonal: 5,
      verpackung: 3,
      label: 2,
      erklaerung:
        "Pflanzenbasierter Haferdrink mit tiefem CO₂-Fussabdruck, aber importiert aus Schweden. Tetrapak-Verpackung, kein Bio-Label.",
    },
  },
  {
    id: "zitrone-za",
    name: "Zitrone",
    kategorie: "fruechte-gemuese",
    herkunft: "Südafrika",
    preis: 0.4,
    siegel: [],
    saison: "ganzjahr",
    emoji: "🍋",
    bildUrl: zitroneZaAsset.url,
    bewertung: "schlecht",
    zutat: "zitrone",
    problemHinweis:
      "Zitronen aus Südafrika legen per Schiff oder Flugzeug tausende Kilometer zurück — ohne Bio-Standard. Italienische Bio-/Demeter-Zitronen sind die deutlich nachhaltigere Wahl.",
    nachhaltigkeit: {
      regional: 1,
      saisonal: 3,
      verpackung: 5,
      label: 1,
      erklaerung:
        "Zitronen aus Südafrika werden per Schiff oder Flugzeug importiert — sehr lange Transportwege, kein Bio-Standard.",
    },
  },
  {
    id: "gurke-ch",
    name: "Bio-Gurke",
    kategorie: "fruechte-gemuese",
    herkunft: "Schweiz",
    preis: 2.3,
    siegel: ["bio", "suisse-garantie"],
    saison: "in",
    emoji: "🥒",
    bildUrl: gurkeChAsset.url,
    bewertung: "neutral",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 4,
      verpackung: 3,
      label: 5,
      erklaerung:
        "Schweizer Bio-Gurke aus regionalem Anbau, kurze Transportwege, Bio-Standard ohne synthetische Pestizide.",
    },
  },
  {
    id: "backpulver",
    name: "Pâtissier Backpulver",
    kategorie: "backzutaten",
    herkunft: "Deutschland",
    preis: 0.5,
    siegel: [],
    saison: "ganzjahr",
    emoji: "🧁",
    bildUrl: backpulverAsset.url,
    bewertung: "neutral",
    nachhaltigkeit: {
      regional: 2,
      saisonal: 5,
      verpackung: 2,
      label: 1,
      erklaerung:
        "Importiert aus Deutschland. Einzeln verpackte Portionsbeutel verursachen vergleichsweise viel Verpackungsmüll.",
    },
  },
  {
    id: "mandeln-ch",
    name: "Bio-Mandeln gemahlen",
    kategorie: "backzutaten",
    herkunft: "Schweiz (verpackt)",
    preis: 2.8,
    siegel: ["bio"],
    saison: "ganzjahr",
    emoji: "🌰",
    bildUrl: mandelnAsset.url,
    bewertung: "neutral",
    nachhaltigkeit: {
      regional: 3,
      saisonal: 5,
      verpackung: 3,
      label: 5,
      erklaerung:
        "Bio-Qualität nach EU-/Schweizer-Standard, in der Schweiz abgepackt. Mandeln selbst stammen meist aus Südeuropa.",
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

export const START_WARENKORB: string[] = [];

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
