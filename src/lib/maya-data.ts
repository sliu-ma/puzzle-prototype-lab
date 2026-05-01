// Daten für den "Grünen Markt" — Kapitel 1
// Schweiz · CHF · Schweizer Siegel (Bio Suisse, IP-Suisse)

export type Kategorie =
  | "milch-eier"
  | "fruechte-gemuese"
  | "getreide-backen"
  | "fette"
  | "andere";

export interface Produkt {
  id: string;
  name: string;
  kategorie: Kategorie;
  herkunft: string; // Land oder Region
  preis: number; // CHF
  siegel: string[]; // z. B. "Bio Suisse", "IP-Suisse", "Fairtrade", "Bio Import"
  saison: "in" | "out" | "ganzjahr";
  emoji: string;
  // Bewertet das Produkt entlang der Lernziele:
  // "gut" = regional/saisonal/fair · "schlecht" = problematisch · "neutral" = unkritisch
  bewertung: "gut" | "schlecht" | "neutral";
  // Falls "schlecht": Begründung, die nach falschem Bezahlen angezeigt wird.
  problemHinweis?: string;
  // Falls "gut" und es einen direkten "schlechten" Konterpart gibt: ID-Verweis.
  ersetzt?: string;
  // Für das Rezept benötigte Zutat (Schlüssel)
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
}

export const KATEGORIEN: { id: Kategorie; label: string; emoji: string }[] = [
  { id: "milch-eier", label: "Milch & Eier", emoji: "🥛" },
  { id: "fruechte-gemuese", label: "Früchte & Gemüse", emoji: "🍎" },
  { id: "getreide-backen", label: "Getreide & Backen", emoji: "🌾" },
  { id: "fette", label: "Öle & Fette", emoji: "🧈" },
  { id: "andere", label: "Weiteres", emoji: "🛒" },
];

// Produktkatalog — wird im Shop angezeigt.
export const PRODUKTE: Produkt[] = [
  // ── Früchte & Gemüse ────────────────────────────────────────────
  {
    id: "erdbeeren-es",
    name: "Erdbeeren 500g · Bio",
    kategorie: "fruechte-gemuese",
    herkunft: "Spanien",
    preis: 5.9,
    siegel: ["Bio Import"],
    saison: "out",
    emoji: "🍓",
    bewertung: "schlecht",
    zutat: "erdbeeren",
    problemHinweis:
      "Erdbeeren wachsen in der Schweiz erst ab Mai/Juni. Importe aus Südeuropa im März bedeuten lange Transporte oder Plastiktunnel — viel Energie für wenig Geschmack.",
  },
  {
    id: "erdbeeren-ch",
    name: "Erdbeeren 500g",
    kategorie: "fruechte-gemuese",
    herkunft: "Region Thurgau (CH)",
    preis: 7.5,
    siegel: ["IP-Suisse"],
    saison: "in",
    emoji: "🍓",
    bewertung: "gut",
    zutat: "erdbeeren",
    ersetzt: "erdbeeren-es",
  },
  {
    id: "zitrone-it",
    name: "Bio-Zitrone",
    kategorie: "fruechte-gemuese",
    herkunft: "Italien",
    preis: 0.9,
    siegel: ["Bio"],
    saison: "ganzjahr",
    emoji: "🍋",
    bewertung: "neutral",
    zutat: "zitrone",
  },
  {
    id: "aepfel-ch",
    name: "Äpfel 'Gala' 1kg",
    kategorie: "fruechte-gemuese",
    herkunft: "Schweiz",
    preis: 3.9,
    siegel: ["IP-Suisse"],
    saison: "in",
    emoji: "🍎",
    bewertung: "neutral",
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
  },
  {
    id: "eier-bio-ch",
    name: "Eier 6er · Bio-Freiland",
    kategorie: "milch-eier",
    herkunft: "Schweiz",
    preis: 5.4,
    siegel: ["Bio Suisse"],
    saison: "ganzjahr",
    emoji: "🥚",
    bewertung: "gut",
    zutat: "eier",
    ersetzt: "eier-bh-import",
  },
  {
    id: "butter-ch",
    name: "Butter 250g",
    kategorie: "fette",
    herkunft: "Schweiz",
    preis: 3.6,
    siegel: ["IP-Suisse"],
    saison: "ganzjahr",
    emoji: "🧈",
    bewertung: "neutral",
    zutat: "butter",
  },
  {
    id: "vollrahm-ch",
    name: "Vollrahm 2.5dl",
    kategorie: "milch-eier",
    herkunft: "Schweiz",
    preis: 2.4,
    siegel: ["IP-Suisse"],
    saison: "ganzjahr",
    emoji: "🥛",
    bewertung: "neutral",
    zutat: "vollrahm",
  },

  // ── Getreide & Backen ───────────────────────────────────────────
  {
    id: "mehl-ch",
    name: "Weissmehl 1kg",
    kategorie: "getreide-backen",
    herkunft: "Schweiz",
    preis: 1.9,
    siegel: ["IP-Suisse"],
    saison: "ganzjahr",
    emoji: "🌾",
    bewertung: "neutral",
    zutat: "mehl",
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
  },
];

// Rezept: Erdbeer-Törtchen
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

// Initialer Warenkorb-Bestand: enthält die zwei "schlechten" Produkte + ein paar neutrale.
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

// Lernziel: Kein "schlechtes" Produkt mehr im Warenkorb,
// aber alle Rezeptzutaten (über irgendein passendes Produkt) abgedeckt.
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
