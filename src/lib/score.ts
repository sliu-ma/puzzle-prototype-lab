// Reine Punkteberechnung. Kein Browser-Zugriff, damit die gleiche Funktion
// später unverändert auf dem Server laufen kann.

export type ScoreEvent =
  | { id: string; type: "stage_solved"; at: number; stage: number; durationSec: number }
  | { id: string; type: "badge_earned"; at: number; badgeId: string }
  | { id: string; type: "hint_revealed"; at: number; stage: number; level: 1 | 2 | 3 }
  | { id: string; type: "hearing_answer"; at: number; question: number; correct: boolean };

/** Zeitbudget, auf das der Zeitfaktor bezogen wird (Minuten). */
export const SCORE_BUDGET_MIN = 90;

export const STAGE_BASE_POINTS = 1000;
export const STAGE_MIN_POINTS = 600;
/** Referenzdauer pro Etappe bei einem 90-Minuten-Budget. */
export const STAGE_REF_SHARE = 10 / 90;


/** Faktor auf die Etappenpunkte je höchster genutzter Hinweisstufe. */
export const HINT_FACTOR: Record<1 | 2 | 3, number> = {
  1: 0.9,
  2: 0.75,
  3: 0.5,
};

export const BADGE_POINTS: Record<string, number> = {
  "unter-60": 500,
  "sparsame-hinweise": 400,
  "erstes-ohne-hinweise": 300,
  "erstversuch-konsum": 300,
  "route-anhieb": 300,
  "letzte-5-minuten": 250,
};

export const HEARING_CORRECT = 100;
export const HEARING_WRONG = -50;

export type ScoreBreakdown = {
  total: number;
  stages: {
    stage: number;
    points: number;
    rawPoints: number;
    hintLevel: 0 | 1 | 2 | 3;
    durationSec: number;
  }[];
  stagePoints: number;
  hintPenalty: number;
  badges: { badgeId: string; points: number }[];
  badgePoints: number;
  hearingCorrect: number;
  hearingWrong: number;
  hearingPoints: number;
};

/**
 * Zeitfaktor einer Etappe: 1.0 (sofort) bis 0.6 (ab Referenzdauer).
 * Sinkt ab der ersten Sekunde linear.
 */
export function stageTimeFactor(durationSec: number, budgetMin: number): number {
  const refSec = budgetMin * STAGE_REF_SHARE * 60;
  if (refSec <= 0) return 1;
  const ratio = Math.max(0, durationSec) / refSec;
  const floor = STAGE_MIN_POINTS / STAGE_BASE_POINTS;
  if (ratio >= 1) return floor;
  return 1 - (1 - floor) * ratio;
}


export function computeScore(
  events: ScoreEvent[],
  budgetMin: number,
): ScoreBreakdown {
  const seen = new Set<string>();
  const uniq = events.filter((e) => {
    if (!e || seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  // Höchste genutzte Hinweisstufe pro Etappe.
  const hintLevel = new Map<number, 1 | 2 | 3>();
  for (const e of uniq) {
    if (e.type !== "hint_revealed") continue;
    const cur = hintLevel.get(e.stage) ?? 0;
    if (e.level > cur) hintLevel.set(e.stage, e.level);
  }

  const stages: ScoreBreakdown["stages"] = [];
  for (const e of uniq) {
    if (e.type !== "stage_solved") continue;
    const factor = stageTimeFactor(e.durationSec, budgetMin);
    const rawPoints = Math.round(STAGE_BASE_POINTS * factor);
    const level = hintLevel.get(e.stage) ?? 0;
    const hintFactor = level === 0 ? 1 : HINT_FACTOR[level];
    stages.push({
      stage: e.stage,
      points: Math.round(rawPoints * hintFactor),
      rawPoints,
      hintLevel: level,
      durationSec: e.durationSec,
    });
  }
  stages.sort((a, b) => a.stage - b.stage);

  const stagePoints = stages.reduce((s, x) => s + x.points, 0);
  const hintPenalty = stages.reduce((s, x) => s + (x.rawPoints - x.points), 0);

  const badges = uniq
    .filter((e): e is Extract<ScoreEvent, { type: "badge_earned" }> => e.type === "badge_earned")
    .map((e) => ({ badgeId: e.badgeId, points: BADGE_POINTS[e.badgeId] ?? 0 }));
  const badgePoints = badges.reduce((s, x) => s + x.points, 0);

  const answers = uniq.filter(
    (e): e is Extract<ScoreEvent, { type: "hearing_answer" }> => e.type === "hearing_answer",
  );
  const hearingCorrect = answers.filter((a) => a.correct).length;
  const hearingWrong = answers.length - hearingCorrect;
  const hearingPoints = hearingCorrect * HEARING_CORRECT + hearingWrong * HEARING_WRONG;

  const total = Math.max(0, stagePoints + badgePoints + hearingPoints);

  return {
    total,
    stages,
    stagePoints,
    hintPenalty,
    badges,
    badgePoints,
    hearingCorrect,
    hearingWrong,
    hearingPoints,
  };
}
