export type Season = "in" | "out" | "import";

export interface ReceiptItem {
  id: number;
  name: string;
  origin: string;
  originRegion: "regional" | "germany" | "europe" | "world";
  season: Season; // in season (DE March) / not / tropical import
  label: "bio" | "fairtrade" | "none";
  price: string;
}

export const RECEIPT: ReceiptItem[] = [
  {
    id: 1,
    name: "Erdbeeren 250g",
    origin: "Spanien",
    originRegion: "europe",
    season: "out",
    label: "none",
    price: "3,49",
  },
  {
    id: 2,
    name: "Avocado, 2 Stück",
    origin: "Peru",
    originRegion: "world",
    season: "import",
    label: "none",
    price: "2,98",
  },
  {
    id: 3,
    name: "Äpfel 'Boskoop' 1kg",
    origin: "Bodensee, DE",
    originRegion: "regional",
    season: "in",
    label: "bio",
    price: "2,99",
  },
  {
    id: 4,
    name: "Bananen 1kg",
    origin: "Ecuador",
    originRegion: "world",
    season: "import",
    label: "fairtrade",
    price: "1,79",
  },
  {
    id: 5,
    name: "Tomaten 500g",
    origin: "Marokko",
    originRegion: "world",
    season: "out",
    label: "none",
    price: "2,29",
  },
  {
    id: 6,
    name: "Kartoffeln 2kg",
    origin: "Region (DE)",
    originRegion: "regional",
    season: "in",
    label: "none",
    price: "2,49",
  },
  {
    id: 7,
    name: "Kaffee 500g",
    origin: "Kolumbien",
    originRegion: "world",
    season: "import",
    label: "fairtrade",
    price: "7,99",
  },
  {
    id: 8,
    name: "Feldsalat 100g",
    origin: "Region (DE)",
    originRegion: "regional",
    season: "in",
    label: "bio",
    price: "1,49",
  },
];

// Code derivation (see /akte page):
// 1: not in season (DE, March) → 2 (Erdbeeren, Tomaten)
// 2: origin outside Europe → 4 (Peru, Ecuador, Marokko, Kolumbien)
// 3: without Bio/Fairtrade label → 4
// 4: truly regional (DE-Region) → 3
export const SOLUTION_CODE = "2443";
