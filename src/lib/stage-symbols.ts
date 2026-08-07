// Etappen werden im UI mit Symbolen statt Nummern bezeichnet.
// Die interne Nummerierung (Routen, localStorage, DB) bleibt unverändert.

export type StageNr = 1 | 2 | 3 | 4 | 5 | 6;

export const STAGE_SYMBOLS: Record<StageNr, { glyph: string; name: string }> = {
  1: { glyph: "▲", name: "Dreieck" },
  2: { glyph: "●", name: "Kreis" },
  3: { glyph: "■", name: "Quadrat" },
  4: { glyph: "✚", name: "Kreuz" },
  5: { glyph: "★", name: "Stern" },
  6: { glyph: "✦", name: "Siegel" },
};

function entry(nr: number) {
  return STAGE_SYMBOLS[(nr as StageNr) in STAGE_SYMBOLS ? (nr as StageNr) : 6];
}

/** Symbol einer Etappe, z. B. "▲". */
export function stageGlyph(nr: number): string {
  return entry(nr).glyph;
}

/** Name des Symbols, z. B. "Dreieck". */
export function stageName(nr: number): string {
  return entry(nr).name;
}

/** Sichtbares Label, z. B. "Etappe ▲" (nr 6: "Hearing"). */
export function stageLabel(nr: number): string {
  return nr === 6 ? "Hearing" : `Etappe ${stageGlyph(nr)}`;
}

/** Vorlesbares Label, z. B. "Etappe Dreieck". */
export function stageLabelA11y(nr: number): string {
  return nr === 6 ? "Hearing" : `Etappe ${stageName(nr)}`;
}
