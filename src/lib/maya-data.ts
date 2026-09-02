// Daten für den "Grünen Markt", Kapitel 1
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
import rosenkohlAsset from "@/assets/produkte/rosenkohl.png.asset.json";
import spargelAsset from "@/assets/produkte/spargel.webp.asset.json";
import rhabarberAsset from "@/assets/produkte/rhabarber.webp.asset.json";
import kuerbisAsset from "@/assets/produkte/kuerbis.webp.asset.json";
import zwetschgeAsset from "@/assets/produkte/zwetschge.jpg.asset.json";
import zwetschgenBioChAsset from "@/assets/produkte/zwetschgen-bio-ch.webp.asset.json";
import zimtBioAsset from "@/assets/produkte/zimt-bio.webp.asset.json";
import zimtClassicAsset from "@/assets/produkte/zimt-classic.webp.asset.json";
import aepfelPinkladyAsset from "@/assets/produkte/aepfel-pinklady.jpg.asset.json";

import bioLogo from "@/assets/labels/bio.png.asset.json";
import ipSuisseLogo from "@/assets/labels/ip-suisse.png.asset.json";
import demeterLogo from "@/assets/labels/demeter.png.asset.json";
import suisseGarantieLogo from "@/assets/labels/suisse-garantie.webp.asset.json";
import fairtradeLogo from "@/assets/labels/fairtrade.jpg.asset.json";

export type Kategorie = "milch-eier" | "fruechte-gemuese" | "backzutaten" | "andere";

export type SiegelKey = "bio" | "ip-suisse" | "demeter" | "suisse-garantie" | "fairtrade";

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
  fairtrade: { key: "fairtrade", label: "Fairtrade", logoUrl: fairtradeLogo.url },
};


export interface Nachhaltigkeit {
  regional: number; // 1–5
  saisonal: number; // 1–5
  verpackung: number; // 1–5
  label: number; // 1–5
  erklaerung: string;
}

export type ZutatKey =
  | "erdbeeren"
  | "zwetschgen"
  | "aepfel"
  | "eier"
  | "mehl"
  | "zucker"
  | "salz"
  | "butter"
  | "zitrone"
  | "vollrahm"
  | "vanillezucker"
  | "zimt"
  | "nuesse";


export interface Produkt {
  id: string;
  name: string;
  kategorie: Kategorie;
  herkunft: string;
  preis: number; // CHF
  siegel: SiegelKey[];
  saison: "in" | "out" | "ganzjahr";
  /** 1-basierte Monate der Saison im Herkunftsland; leer/undefiniert = ganzjährig. */
  saisonMonate?: number[];
  emoji: string;
  bildUrl?: string;
  bewertung: "gut" | "schlecht" | "neutral";
  problemHinweis?: string;
  ersetzt?: string;
  zutat?: ZutatKey;
  nachhaltigkeit: Nachhaltigkeit;
}

/** Aktueller Saison-Status basierend auf saisonMonate + heutigem Datum. */
export function getSaisonStatus(
  p: Pick<Produkt, "saisonMonate" | "saison">,
  date: Date = new Date(),
): "in" | "out" | "ganzjahr" {
  if (!p.saisonMonate || p.saisonMonate.length === 0) return "ganzjahr";
  const m = date.getMonth() + 1;
  return p.saisonMonate.includes(m) ? "in" : "out";
}

/**
 * Nachhaltigkeit dynamisch: wenn Produkt ausserhalb Saison gekauft wird,
 * sinkt die Saisonalitäts-Wertung auf 1 (statt statischem Wert).
 */
export function getEffektiveNachhaltigkeit(
  p: Pick<Produkt, "saisonMonate" | "saison" | "nachhaltigkeit" | "kategorie">,
  date: Date = new Date(),
): Nachhaltigkeit {
  if (p.kategorie !== "fruechte-gemuese") return p.nachhaltigkeit;
  const status = getSaisonStatus(p, date);
  if (status === "out") {
    return { ...p.nachhaltigkeit, saisonal: 1 };
  }
  return p.nachhaltigkeit;
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
    saisonMonate: [12, 1, 2, 3, 4, 5, 6],
    emoji: "🍓",
    bildUrl: erdbeerenEsAsset.url,
    bewertung: "schlecht",
    zutat: "erdbeeren",
    problemHinweis:
      "Auch Bio-Erdbeeren aus Spanien reisen im März tausende Kilometer. Bio sagt etwas über den Anbau, nichts über Transport und Saison.",
    nachhaltigkeit: {
      regional: 1,
      saisonal: 1,
      verpackung: 2,
      label: 4,
      erklaerung:
        "Bio-Anbau ohne synthetische Pestizide, aber Importware aus Südeuropa ausserhalb der Schweizer Saison. Lange Transportwege und meist Plastikverpackung.",
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
    saisonMonate: [5, 6, 7, 8, 9],
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
    name: "Zitrone",
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
        "Zitronen wachsen nicht in der Schweiz, Süditalien ist der nächste sinnvolle Anbauort. Demeter-Standard (biodynamisch), unverpackt.",
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
    bewertung: "gut",
    zutat: "aepfel",
    ersetzt: "aepfel-pinklady-fr",

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
    saisonMonate: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6],
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
  {
    id: "rosenkohl-ch",
    name: "Rosenkohl 500g",
    kategorie: "fruechte-gemuese",
    herkunft: "Schweiz",
    preis: 3.6,
    siegel: ["ip-suisse"],
    saison: "in",
    saisonMonate: [10, 11, 12, 1, 2],
    emoji: "🥬",
    bildUrl: rosenkohlAsset.url,
    bewertung: "neutral",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 4,
      label: 4,
      erklaerung:
        "Typisches Wintergemüse aus Schweizer Freilandanbau, IP-Suisse-Standard mit erhöhten Umwelt- und Tierwohlanforderungen.",
    },
  },
  {
    id: "spargel-ch",
    name: "Grüner Spargel 500g",
    kategorie: "fruechte-gemuese",
    herkunft: "Schweiz",
    preis: 6.9,
    siegel: ["suisse-garantie"],
    saison: "in",
    saisonMonate: [4, 5, 6],
    emoji: "🌱",
    bildUrl: spargelAsset.url,
    bewertung: "gut",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 3,
      label: 4,
      erklaerung:
        "Frischer Schweizer Spargel in der Hauptsaison (April–Juni). Kurze Transportwege, Suisse-Garantie-Standard.",
    },
  },
  {
    id: "rhabarber-ch",
    name: "Rhabarber 1kg",
    kategorie: "fruechte-gemuese",
    herkunft: "Schweiz",
    preis: 4.2,
    siegel: ["bio"],
    saison: "in",
    saisonMonate: [4, 5, 6],
    emoji: "🌿",
    bildUrl: rhabarberAsset.url,
    bewertung: "gut",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 5,
      label: 5,
      erklaerung:
        "Schweizer Bio-Rhabarber aus dem Freiland, kurze Saison (April–Juni), unverpackt und ohne synthetische Pestizide.",
    },
  },
  {
    id: "kuerbis-ch",
    name: "Butternut-Kürbis",
    kategorie: "fruechte-gemuese",
    herkunft: "Schweiz",
    preis: 3.9,
    siegel: ["suisse-garantie"],
    saison: "in",
    saisonMonate: [8, 9, 10, 11],
    emoji: "🎃",
    bildUrl: kuerbisAsset.url,
    bewertung: "neutral",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 5,
      label: 4,
      erklaerung:
        "Schweizer Herbstgemüse mit langer Lagerfähigkeit. Unverpackt, kurze Wege, Suisse-Garantie-Standard.",
    },
  },
  {
    id: "zwetschge-import",
    name: "Zwetschgen 1kg",
    kategorie: "fruechte-gemuese",
    herkunft: "Chile",
    preis: 4.5,
    siegel: [],
    saison: "out",
    saisonMonate: [1, 2, 3],
    emoji: "🍑",
    bildUrl: zwetschgeAsset.url,
    bewertung: "schlecht",
    zutat: "zwetschgen",
    problemHinweis:
      "Zwetschgen aus Chile reisen um die halbe Welt, obwohl es in der Schweiz gerade Zwetschgen-Saison gibt. Die Schweizer Bio-Zwetschgen sind die klar bessere Wahl.",
    nachhaltigkeit: {
      regional: 1,
      saisonal: 1,
      verpackung: 2,
      label: 1,
      erklaerung:
        "Importzwetschgen aus Übersee: sehr lange Transportwege, Ernte in der südlichen Halbkugel-Saison, keine Nachhaltigkeitslabel.",
    },
  },
  {
    id: "zwetschge-bio-ch",
    name: "Zwetschgen 1kg",
    kategorie: "fruechte-gemuese",
    herkunft: "Schweiz",
    preis: 4.95,
    siegel: ["bio"],
    saison: "in",
    saisonMonate: [8, 9],
    emoji: "🍑",
    bildUrl: zwetschgenBioChAsset.url,
    bewertung: "gut",
    zutat: "zwetschgen",
    ersetzt: "zwetschge-import",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 3,
      label: 5,
      erklaerung:
        "Schweizer Bio-Zwetschgen aus der Hauptsaison (August–September), kurze Transportwege, Anbau ohne synthetische Pestizide.",
    },
  },
  {
    id: "aepfel-pinklady-fr",
    name: "Äpfel 'Pink Lady' 1kg",
    kategorie: "fruechte-gemuese",
    herkunft: "Frankreich",
    preis: 4.8,
    siegel: [],
    saison: "out",
    saisonMonate: [11, 12, 1, 2, 3, 4],
    emoji: "🍎",
    bildUrl: aepfelPinkladyAsset.url,
    bewertung: "schlecht",
    zutat: "aepfel",
    problemHinweis:
      "Pink Lady wächst in Südfrankreich und wird importiert, obwohl Schweizer Äpfel das ganze Jahr aus regionaler Lagerung verfügbar sind. Kein Nachhaltigkeitslabel.",
    nachhaltigkeit: {
      regional: 2,
      saisonal: 3,
      verpackung: 2,
      label: 1,
      erklaerung:
        "Importäpfel aus Frankreich: längere Transportwege als Schweizer Lagerware, meist in Plastikschale, ohne Bio- oder Nachhaltigkeitslabel.",
    },
  },
  {
    id: "zimt-bio-fairtrade",
    name: "Ceylon-Zimt gemahlen 35g",
    kategorie: "backzutaten",
    herkunft: "Sri Lanka",
    preis: 1.6,
    siegel: ["bio", "fairtrade"],
    saison: "ganzjahr",
    emoji: "🌰",
    bildUrl: zimtBioAsset.url,
    bewertung: "gut",
    zutat: "zimt",
    ersetzt: "zimt-classic",
    nachhaltigkeit: {
      regional: 1,
      saisonal: 5,
      verpackung: 3,
      label: 5,
      erklaerung:
        "Zimt wächst nur in den Tropen. Diese Variante ist Bio und Fairtrade: kontrollierter Anbau und faire Preise für die Produzentinnen und Produzenten in Sri Lanka.",
    },
  },
  {
    id: "zimt-classic",
    name: "Ceylon-Zimt gemahlen 32g",
    kategorie: "backzutaten",
    herkunft: "Madagaskar",
    preis: 0.45,
    siegel: [],
    saison: "ganzjahr",
    emoji: "🌰",
    bildUrl: zimtClassicAsset.url,
    bewertung: "schlecht",
    zutat: "zimt",
    problemHinweis:
      "Der günstige Zimt hat kein Label: weder Bio noch Fairtrade. Beim gleichen Gewürz aus dem Süden macht ein Fairtrade-Label den grössten Unterschied.",
    nachhaltigkeit: {
      regional: 1,
      saisonal: 5,
      verpackung: 3,
      label: 1,
      erklaerung:
        "Importgewürz ohne Bio- oder Fairtrade-Standard. Sehr tiefer Preis, der meist zulasten der Löhne im Anbauland geht.",
    },
  },



  {
    id: "eier-bh-import",
    name: "Eier 10er\u00a0 Bodenhaltung",
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
        "Import-Eier aus Bodenhaltung, enge Ställe, lange Transportwege, keine Tierwohl-Label und keine Kontrolle über die Futtermittelherkunft.",
    },
  },
  {
    id: "eier-bio-ch",
    name: "Eier 4er Freiland",
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
    siegel: ["ip-suisse"],
    saison: "ganzjahr",
    emoji: "🧂",
    bildUrl: zuckerAsset.url,
    bewertung: "neutral",
    zutat: "zucker",
    nachhaltigkeit: {
      regional: 5,
      saisonal: 5,
      verpackung: 3,
      label: 4,
      erklaerung: "Schweizer Zuckerrüben von IP-Suisse-Betrieben, regional und mit anerkanntem Nachhaltigkeitsstandard. Papierverpackung.",
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
        "Speisesalz aus Schweizer Berggebieten, sehr kurze Wege, jodiert und fluoridiert. Kartonverpackung, kein zusätzliches Nachhaltigkeitslabel.",
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
      "Zitronen aus Südafrika legen per Schiff oder Flugzeug tausende Kilometer zurück, ohne Bio-Standard. Italienische Bio-/Demeter-Zitronen sind die deutlich nachhaltigere Wahl.",
    nachhaltigkeit: {
      regional: 1,
      saisonal: 3,
      verpackung: 5,
      label: 1,
      erklaerung:
        "Zitronen aus Südafrika werden per Schiff oder Flugzeug importiert, sehr lange Transportwege, kein Bio-Standard.",
    },
  },
  {
    id: "gurke-ch",
    name: "Gurke",
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
    name: "Mandeln gemahlen",
    kategorie: "backzutaten",
    herkunft: "Schweiz (verpackt)",
    preis: 2.8,
    siegel: ["bio"],
    saison: "ganzjahr",
    emoji: "🌰",
    bildUrl: mandelnAsset.url,
    bewertung: "neutral",
    zutat: "nuesse",
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

export interface Rezept {
  titel: string;
  emoji: string;
  zutaten: string[];
  zutatenKeys: ZutatKey[];
}

const REZEPT_TOERTCHEN: Rezept = {
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
  zutatenKeys: [
    "mehl",
    "zucker",
    "salz",
    "butter",
    "zitrone",
    "eier",
    "vollrahm",
    "vanillezucker",
    "erdbeeren",
  ],
};

function waehe(fruchtLabel: string, fruchtKey: ZutatKey, titel: string): Rezept {
  return {
    titel,
    emoji: "🥧",
    zutaten: [
      "200 g Mehl",
      "½ KL Salz",
      "70 g kalte Butter",
      "3 EL gemahlene Nüsse",
      `700 g ${fruchtLabel}`,
      "1 dl Rahm",
      "1 Ei",
      "1 EL Vanillezucker",
      "1 EL Zucker",
      "½ KL Zimt",
    ],
    zutatenKeys: [
      "mehl",
      "salz",
      "butter",
      "nuesse",
      fruchtKey,
      "vollrahm",
      "eier",
      "vanillezucker",
      "zucker",
      "zimt",
    ],
  };
}

const REZEPT_ZWETSCHGEN = waehe("Zwetschgen", "zwetschgen", "Zwetschgenwähe (Blech 28 cm Ø)");
const REZEPT_APFEL = waehe("Äpfel", "aepfel", "Apfelwähe (Blech 28 cm Ø)");

/**
 * Saisonales Rezept:
 * Mai–August → Erdbeer-Törtchen, September → Zwetschgenwähe, Oktober–April → Apfelwähe.
 */
export function getAktuellesRezept(date: Date = new Date()): Rezept {
  const m = date.getMonth() + 1;
  if (m >= 5 && m <= 8) return REZEPT_TOERTCHEN;
  if (m === 9) return REZEPT_ZWETSCHGEN;
  return REZEPT_APFEL;
}

export const START_WARENKORB: string[] = [];

/** @deprecated Nutze getAktuellesRezept() – bleibt für Kompatibilität erhalten. */
export const REZEPT = getAktuellesRezept();

/** @deprecated Nutze getAktuellesRezept().zutatenKeys */
export const REZEPT_ZUTATEN_KEYS = REZEPT.zutatenKeys;

