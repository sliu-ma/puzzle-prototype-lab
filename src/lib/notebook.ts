/** Jakobs Notizbuch: gesammelte Faktenkarten + eigene Notizen (nur lokal). */
export type SavedFactCard = { title: string; body: string; hint?: string };
export type SavedFactSet = { stage: number; title: string; cards: SavedFactCard[] };

export const STAGE_NAMES: Record<number, string> = {
  1: "Mobilität",
  2: "Konsum",
  3: "Wohnen",
  4: "Biodiversität",
  5: "Energie",
};

const factKey = (s: number) => `maya-notebook-facts-${s}`;
const NOTES_KEY = "maya-notebook-notes";
export const NOTEBOOK_EVENT = "maya-notebook";

export function saveFactSet(set: SavedFactSet) {
  try {
    const had = localStorage.getItem(factKey(set.stage));
    localStorage.setItem(factKey(set.stage), JSON.stringify(set));
    window.dispatchEvent(new CustomEvent(NOTEBOOK_EVENT, { detail: { newStage: had ? null : set.stage } }));
  } catch { /* ignore */ }
}

export function getFactSets(): SavedFactSet[] {
  const out: SavedFactSet[] = [];
  for (let s = 1; s <= 5; s++) {
    try {
      const raw = localStorage.getItem(factKey(s));
      if (raw) out.push(JSON.parse(raw));
    } catch { /* ignore */ }
  }
  return out;
}

export function getNotes(): string {
  try { return localStorage.getItem(NOTES_KEY) ?? ""; } catch { return ""; }
}
export function setNotes(v: string) {
  try { localStorage.setItem(NOTES_KEY, v); } catch { /* ignore */ }
}
