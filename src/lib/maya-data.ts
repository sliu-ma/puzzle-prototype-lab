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
  // Detail-Infos (Biovision-Stil)
  beschreibung?: string;
  erhaeltlichBei?: string;
  zutatenInfo?: string;
  hinweis?: string;
  wichtigeInfo?: string;
  tipp?: string;
  // Nachhaltigkeits-Score 1–5 (5 = sehr nachhaltig)
  score?: 1 | 2 | 3 | 4 | 5;
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
    score: 2,
    beschreibung:
      "Frische Erdbeeren in der 500g-Schale, kultiviert unter Folientunneln in Südspanien.",
    erhaeltlichBei: "Grossverteiler · ganzjährig im Kühlregal",
    zutatenInfo: "100% Erdbeeren · Bio-Anbau",
    hinweis:
      "In der Region Huelva werden für den Erdbeeranbau riesige Wassermengen aus geschützten Gebieten entnommen.",
    wichtigeInfo:
      "Transport per LKW über 1'800 km. Anbau ausserhalb der Schweizer Saison (Mai–Juli).",
    tipp: "Warte auf die Schweizer Saison ab Mai — der Geschmack ist unvergleichlich besser.",
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
    score: 5,
    beschreibung:
      "Sonnengereifte Erdbeeren von Schweizer Höfen, geerntet in der laufenden Saison.",
    erhaeltlichBei: "Hofladen · Wochenmarkt · regionale Detailhändler",
    zutatenInfo: "100% Erdbeeren aus Freilandanbau",
    hinweis: "Saisonale Frucht — nur Mai bis Juli erhältlich.",
    wichtigeInfo:
      "IP-Suisse fördert Biodiversität, weniger Pestizide und faire Bedingungen für Bauernfamilien.",
    tipp: "Frisch verarbeiten oder einfrieren, damit du auch ausserhalb der Saison etwas davon hast.",
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
    score: 4,
    beschreibung: "Unbehandelte Bio-Zitrone aus Süditalien.",
    erhaeltlichBei: "Detailhändler · Bio-Läden",
    zutatenInfo: "100% Zitrusfrucht · Bio-Anbau",
    hinweis: "Schale ist unbehandelt und kann mitverwendet werden.",
    tipp: "Zitronen wachsen in der Schweiz nicht — Bio aus Europa ist die nachhaltigste Option.",
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
    score: 5,
    beschreibung: "Knackige Gala-Äpfel von Schweizer Hochstammkulturen.",
    erhaeltlichBei: "Detailhändler · Hofladen",
    zutatenInfo: "100% Äpfel",
    tipp: "Lagerfähig — ideal als Pausensnack oder fürs Backen.",
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
    score: 2,
    beschreibung: "Rispentomaten aus Treibhaus-Kulturen in Nordafrika.",
    erhaeltlichBei: "Grossverteiler · ganzjährig",
    hinweis: "Anbau in beheizten Folientunneln, hoher Wasserbedarf.",
    tipp: "Schweizer Tomaten gibt es Juli–Oktober — bis dann lieber Lagergemüse verwenden.",
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
    score: 1,
    beschreibung: "Eier aus Bodenhaltung, 6er-Karton, importiert aus EU-Grossbetrieben.",
    erhaeltlichBei: "Discounter · Grossverteiler",
    zutatenInfo: "Hühnereier · Käfigfreie Bodenhaltung (EU-Standard)",
    hinweis:
      "Bodenhaltung bedeutet bis zu 9 Tiere pro m² ohne Zugang ins Freie.",
    wichtigeInfo:
      "Schweizer Tierschutzgesetz wird hier nicht angewendet. Lange Transportwege.",
    tipp: "Pro Ei nur wenige Rappen mehr für Schweizer Bio-Freiland — grosser Unterschied für die Tiere.",
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
    score: 5,
    beschreibung:
      "Eier von Schweizer Bio-Höfen mit täglichem Auslauf ins Freie und Bio-Futter.",
    erhaeltlichBei: "Hofladen · Bio-Laden · Detailhändler",
    zutatenInfo: "Hühnereier · Bio Suisse Knospe · Freilandhaltung",
    hinweis:
      "Maximal 2'000 Hühner pro Hof, gentech-freies Bio-Futter, Auslauf garantiert.",
    tipp: "Hühner sind Allesfresser — füttere Schalen- und Essensreste nicht weg, sondern auf den Kompost.",
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
    score: 4,
    beschreibung: "Schweizer Butter aus Wiesenmilch.",
    erhaeltlichBei: "Detailhändler · Hofladen",
    zutatenInfo: "Pasteurisierter Rahm aus Schweizer Milch",
    tipp: "In Massen geniessen — tierische Fette haben einen hohen CO₂-Fussabdruck.",
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
    score: 4,
    beschreibung: "Schweizer Vollrahm 35% Fett.",
    erhaeltlichBei: "Detailhändler",
    zutatenInfo: "Pasteurisierter Rahm",
    tipp: "Reste lassen sich einfrieren — z. B. portioniert in einer Eiswürfelform.",
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
    score: 4,
    beschreibung: "Weissmehl aus Schweizer Weizen.",
    erhaeltlichBei: "Detailhändler · Mühle",
    zutatenInfo: "Weizenmehl Type 400",
    tipp: "Vollkornmehl ist nährstoffreicher — gerne mischen.",
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
    score: 3,
    beschreibung: "Kristallzucker aus Schweizer Zuckerrüben.",
    erhaeltlichBei: "Detailhändler",
    zutatenInfo: "Saccharose 100%",
    tipp: "Kristall- und Würfelzucker sind in der Schweiz hergestellt — Rohrzucker meist Importware.",
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
    score: 3,
    beschreibung: "Zucker mit echten Vanille-Extrakten.",
    erhaeltlichBei: "Detailhändler",
    zutatenInfo: "Zucker, Vanille-Extrakt",
    hinweis: "Vanille ist eine Importware — Madagaskar deckt 80% des Weltmarkts.",
    tipp: "Eine ganze Vanilleschote ist nachhaltiger und intensiver im Geschmack.",
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
    score: 3,
    beschreibung: "Naturbelassenes Meersalz aus der Bretagne.",
    erhaeltlichBei: "Detailhändler · Bio-Laden",
    zutatenInfo: "100% Meersalz",
    tipp: "Schweizer Salz aus Salinen (z. B. Schweizerhall) ist regional verfügbar.",
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
