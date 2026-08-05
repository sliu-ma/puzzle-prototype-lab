// Ereignis-Log für das Punktesystem. Der Punktestand wird nie direkt
// gespeichert, sondern immer aus diesen Ereignissen berechnet.

import {
  computeScore,
  SCORE_BUDGET_MIN,
  type ScoreBreakdown,
  type ScoreEvent,
} from "./score";

const KEY_EVENTS = "maya-score-events";
export const SCORE_CHANGED = "score:changed";

export function readScoreEvents(): ScoreEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY_EVENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ScoreEvent[]) : [];
  } catch {
    return [];
  }
}

function writeScoreEvents(events: ScoreEvent[]) {
  try {
    window.localStorage.setItem(KEY_EVENTS, JSON.stringify(events));
  } catch {
    /* ignore */
  }
}

/**
 * Fügt ein Ereignis hinzu. Idempotent über die Ereignis-ID, damit dasselbe
 * Ereignis (z. B. nach einem Reload) nicht doppelt zählt.
 */
export function addScoreEvent(event: ScoreEvent) {
  if (typeof window === "undefined") return;
  const events = readScoreEvents();
  if (events.some((e) => e.id === event.id)) return;
  const before = computeScore(events, SCORE_BUDGET_MIN).total;
  events.push(event);
  writeScoreEvents(events);
  const after = computeScore(events, SCORE_BUDGET_MIN).total;
  void import("./round-client").then((m) => m.syncScoreEvents(events));
  window.dispatchEvent(
    new CustomEvent(SCORE_CHANGED, {
      detail: { total: after, delta: after - before, event },
    }),
  );
}


export function getScore(): ScoreBreakdown {
  return computeScore(readScoreEvents(), SCORE_BUDGET_MIN);
}

// ---- Bequeme Erzeuger -------------------------------------------------------

export function recordStageSolved(stage: number, durationSec: number) {
  addScoreEvent({
    id: `stage_solved:${stage}`,
    type: "stage_solved",
    at: Date.now(),
    stage,
    durationSec,
  });
}

export function recordBadgeEarned(badgeId: string) {
  addScoreEvent({
    id: `badge_earned:${badgeId}`,
    type: "badge_earned",
    at: Date.now(),
    badgeId,
  });
}

export function recordHintRevealed(stage: number, level: 1 | 2 | 3) {
  addScoreEvent({
    id: `hint_revealed:${stage}:${level}`,
    type: "hint_revealed",
    at: Date.now(),
    stage,
    level,
  });
}

/**
 * Verbucht eine Hearing-Antwort. Wird erst nach bestandenem Hearing
 * aufgerufen; `attempt` hält die Ereignis-IDs pro Versuch eindeutig.
 */
export function recordHearingAnswer(
  question: number,
  correct: boolean,
  attempt = 1,
) {
  addScoreEvent({
    id: `hearing_answer:${attempt}:${question}`,
    type: "hearing_answer",
    at: Date.now(),
    question,
    correct,
  });
}
