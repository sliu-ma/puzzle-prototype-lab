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

/**
 * Zeitbudget dieser Partie in Minuten. Wird direkt aus dem lokalen Speicher
 * gelesen (gleicher Schlüssel wie in progress.ts), um Ring-Importe zu vermeiden.
 */
function budgetMin(): number {
  if (typeof window === "undefined") return SCORE_BUDGET_MIN;
  try {
    const v = window.localStorage.getItem("maya-budget-min");
    const n = v ? parseInt(v, 10) : NaN;
    if (Number.isFinite(n) && n >= 15 && n <= 240) return n;
  } catch {
    /* ignore */
  }
  return SCORE_BUDGET_MIN;
}

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
  const before = computeScore(events, budgetMin()).total;
  events.push(event);
  writeScoreEvents(events);
  const after = computeScore(events, budgetMin()).total;
  void import("./round-client").then((m) => m.syncScoreEvents(events));
  window.dispatchEvent(
    new CustomEvent(SCORE_CHANGED, {
      detail: { total: after, delta: after - before, event },
    }),
  );
}

/**
 * Führt Ereignisse vom Server mit den lokalen zusammen (ohne erneut zu
 * senden). Grundlage für den Wiedereinstieg auf einem anderen Gerät.
 */
export function mergeScoreEvents(incoming: ScoreEvent[]): number {
  if (typeof window === "undefined" || incoming.length === 0) return 0;
  const events = readScoreEvents();
  const ids = new Set(events.map((e) => e.id));
  let added = 0;
  for (const e of incoming) {
    if (!e?.id || ids.has(e.id)) continue;
    ids.add(e.id);
    events.push(e);
    added += 1;
  }
  if (added === 0) return 0;
  writeScoreEvents(events);
  window.dispatchEvent(
    new CustomEvent(SCORE_CHANGED, {
      detail: { total: computeScore(events, budgetMin()).total, delta: 0 },
    }),
  );
  return added;
}

/** Hilferuf an die Lehrperson (ohne Punkteeinfluss). */
export function recordHelpRequest(stage: number, note?: string) {
  addScoreEvent({
    id: `help_requested:${Date.now()}`,
    type: "help_requested",
    at: Date.now(),
    stage,
    ...(note ? { note: note.slice(0, 200) } : {}),
  });
}

/** Lesebestätigung einer Nachricht der Lehrperson. */
export function recordMessageAck(messageId: string) {
  addScoreEvent({
    id: `message_ack:${messageId}`,
    type: "message_ack",
    at: Date.now(),
    messageId,
  });
}




export function getScore(): ScoreBreakdown {
  return computeScore(readScoreEvents(), budgetMin());
}

/** Zeitbudget dieser Partie (für Berechnungen ausserhalb dieses Moduls). */
export function getScoreBudgetMin(): number {
  return budgetMin();
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
 * QR-Scan einer Etappe. Reines Erhebungsereignis: es verändert die Punkte
 * nicht, macht aber die Wegzeit zwischen zwei Posten auswertbar
 * (Wegzeit = Scan der Etappe n − Lösung der Etappe n−1).
 */
export function recordStageScanned(stage: number) {
  addScoreEvent({
    id: `stage_scanned:${stage}`,
    type: "stage_scanned",
    at: Date.now(),
    stage,
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
    attempt,
  });
}

/**
 * Protokolliert jede einzelne Hearing-Antwort sofort – auch in einem
 * Versuch, der später scheitert. Reines Erhebungsereignis ohne Punkte,
 * damit für die Auswertung sichtbar wird, welche Frage Mühe macht.
 */
export function recordHearingAttempt(
  question: number,
  correct: boolean,
  attempt: number,
) {
  addScoreEvent({
    id: `hearing_attempt:${attempt}:${question}`,
    type: "hearing_attempt",
    at: Date.now(),
    question,
    correct,
    attempt,
  });
}

