// Server-only Helfer für Klassen-Runden. Kein Client-Import!
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { computeScore, type ScoreEvent } from "./score";

/**
 * Zugang zur Datenbank über den öffentlichen Schlüssel. Die Tabellen selbst
 * sind gesperrt; erreichbar sind nur die geprüften Datenbank-Funktionen
 * (round_* / teacher_*). Dieser Weg hängt bewusst NICHT am
 * plattformverwalteten Service-Role-Key, der bei Deployments verloren gehen kann.
 */
export function roundsDb() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) {
    throw new Error(
      "Runden-Zugang ist nicht konfiguriert. Bitte die Supabase-Verbindung im Projekt prüfen.",
    );
  }
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Passwort nie im Klartext an die Datenbank: nur der Prüfwert wird gesendet. */
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}


export type LeaderboardRow = {
  teamId: string;
  name: string;
  points: number;
  stagesSolved: number;
  hintsUsed: number;
  finished: boolean;
};

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeRoundCode(len = 5): string {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return out;
}

export function makeTeamToken(): string {
  return randomBytes(24).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function assertTeacher(password: string) {
  const expected = process.env["ADMIN_PASSWORT"];
  if (!expected) throw new Error("Lehrer-Passwort ist auf dem Server nicht gesetzt.");
  if (!safeEqual(password, expected)) throw new Error("Passwort falsch.");
}

/** Datenbank-Zeilen zurück in Score-Ereignisse übersetzen. */
export function rowsToEvents(
  rows: { event_id: string; type: string; payload: unknown }[],
): ScoreEvent[] {
  const out: ScoreEvent[] = [];
  for (const r of rows) {
    const p = (r.payload ?? {}) as Record<string, unknown>;
    const base = { id: r.event_id, at: Number(p["at"]) || 0 };
    switch (r.type) {
      case "stage_solved":
        out.push({
          ...base,
          type: "stage_solved",
          stage: Number(p["stage"]) || 0,
          durationSec: Number(p["durationSec"]) || 0,
        });
        break;
      case "badge_earned":
        out.push({ ...base, type: "badge_earned", badgeId: String(p["badgeId"] ?? "") });
        break;
      case "hint_revealed":
        out.push({
          ...base,
          type: "hint_revealed",
          stage: Number(p["stage"]) || 0,
          level: (Number(p["level"]) || 1) as 1 | 2 | 3,
        });
        break;
      case "hearing_answer": {
        // Versuchsnummer: aus der Nutzlast, sonst aus der Ereignis-Kennung
        // `hearing_answer:<versuch>:<frage>` (Altbestand ohne Feld).
        const fromId = Number(r.event_id.split(":")[1]);
        const attempt = Number(p["attempt"]) || (Number.isFinite(fromId) ? fromId : 1) || 1;
        out.push({
          ...base,
          type: "hearing_answer",
          question: Number(p["question"]) || 0,
          correct: Boolean(p["correct"]),
          attempt,
        });
        break;
      }
      default:
        break;
    }
  }
  return out;
}

export function buildLeaderboard(
  teams: { id: string; name: string; finished_at: string | null }[],
  events: { team_id: string; event_id: string; type: string; payload: unknown }[],
  budgetMin: number,
): LeaderboardRow[] {
  const byTeam = new Map<string, typeof events>();
  for (const e of events) {
    const list = byTeam.get(e.team_id) ?? [];
    list.push(e);
    byTeam.set(e.team_id, list);
  }
  const rows = teams.map((t) => {
    const raw = byTeam.get(t.id) ?? [];
    const score = computeScore(rowsToEvents(raw), budgetMin);
    return {
      teamId: t.id,
      name: t.name,
      points: score.total,
      stagesSolved: score.stages.length,
      hintsUsed: raw.filter((e) => e.type === "hint_revealed").length,
      finished: !!t.finished_at,
    };
  });
  rows.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  return rows;
}

/** Eine gelöste Etappe mit getrennter Rätsel- und Wegzeit. */
export type ReportStage = {
  stage: number;
  /** Reine Rätselzeit ab dem QR-Scan, in Minuten. */
  minutes: number;
  /**
   * Zeit zwischen den Rätseln: vom Lösen der Vor-Etappe bis zum Scan dieses
   * Postens, in Minuten. Enthält Weg, Notizen und Pausen.
   */
  betweenMin: number | null;
  /** Höchste auf dieser Etappe genutzte Hinweisstufe (0 = keine). */
  hintLevel: 0 | 1 | 2 | 3;
  solvedAt: string;
};

/** Ein einzelnes Ereignis im Langformat – Rohdaten für die Statistik. */
export type ReportEvent = {
  type: string;
  at: string;
  stage: number | null;
  level: number | null;
  question: number | null;
  correct: boolean | null;
  attempt: number | null;
  badgeId: string | null;
  durationSec: number | null;
};

export type ReportTeam = {
  teamId: string;
  name: string;
  members: string[];
  joinedAt: string;
  finishedAt: string | null;
  points: number;
  stagesSolved: number;
  hintsUsed: number;
  badges: string[];
  hearingCorrect: number;
  hearingWrong: number;
  totalMin: number | null;
  stageMinutes: { stage: number; minutes: number }[];
  /** Detaillierte Etappenwerte inklusive Wegzeit und Hinweisstufe. */
  stages: ReportStage[];
  /** Hinweise pro Etappe – auch für Etappen, die noch nicht gelöst sind. */
  hintsByStage: { stage: number; maxLevel: number; count: number }[];
  /** Etappe, an der das Team gerade arbeitet (6 = Hearing). */
  currentStage: number;
  /** Zeitpunkt der letzten gelösten Etappe (Grundlage für „hängt fest"). */
  lastSolvedAt: string | null;
  /**
   * Aktueller Abschnitt: `travel` = zwischen zwei Rätseln (Posten noch nicht
   * gescannt), `puzzle` = am Rätsel (ab QR-Scan).
   */
  phase: "travel" | "puzzle";
  /** Beginn des aktuellen Abschnitts (null = unbekannt, z. B. vor dem Start). */
  phaseSince: string | null;
  /** QR-Scan der aktuellen Etappe, falls schon erfolgt. */
  currentScanAt: string | null;
  /**
   * Bereits abgeschlossene Wegzeit zum aktuellen Posten (Start des Abschnitts
   * bis QR-Scan). Null, solange das Team noch unterwegs ist.
   */
  travelDoneMin: number | null;
  /** Beginn des Wegs zum aktuellen Posten (Vor-Etappe gelöst bzw. Rundenstart). */
  travelSince: string | null;
  /** Letztes Lebenszeichen irgendeiner Art. */
  lastEventAt: string | null;
  /** Alle Hearing-Antworten über alle Versuche. */
  hearingAttempts: { question: number; correct: boolean; attempt: number }[];
  /** Rohereignisse im Langformat für den Datenexport. */
  events: ReportEvent[];
};


type RawEvent = {
  team_id: string;
  event_id: string;
  type: string;
  payload: unknown;
  created_at: string;
};

/**
 * Zeitpunkt eines Ereignisses in Millisekunden. Bevorzugt wird die im Gerät
 * gesetzte Zeit (`at`), weil Differenzen innerhalb eines Teams damit exakt
 * sind; fehlt sie, greift die Serverzeit.
 */
function eventMs(e: RawEvent): number {
  const p = (e.payload ?? {}) as Record<string, unknown>;
  const at = Number(p["at"]);
  if (Number.isFinite(at) && at > 1e12) return at;
  const server = Date.parse(e.created_at);
  return Number.isFinite(server) ? server : 0;
}

const toMin = (ms: number) => Math.round(ms / 60_000);

/** Auswertung pro Team für die Lehreransicht. */
export function buildReport(
  teams: {
    id: string;
    name: string;
    members: unknown;
    created_at: string;
    finished_at: string | null;
  }[],
  events: RawEvent[],
  budgetMin: number,
  startedAt?: string | null,
): ReportTeam[] {
  const roundStartMs = startedAt ? Date.parse(startedAt) : NaN;
  const byTeam = new Map<string, RawEvent[]>();
  for (const e of events) {
    const list = byTeam.get(e.team_id) ?? [];
    list.push(e);
    byTeam.set(e.team_id, list);
  }

  const rows = teams.map((t) => {
    const raw = byTeam.get(t.id) ?? [];
    const score = computeScore(rowsToEvents(raw), budgetMin);
    const payloadOf = (e: RawEvent) => (e.payload ?? {}) as Record<string, unknown>;

    // Höchste Hinweisstufe und Anzahl pro Etappe – auch für offene Etappen.
    const hintMap = new Map<number, { maxLevel: number; count: number }>();
    for (const e of raw) {
      if (e.type !== "hint_revealed") continue;
      const stage = Number(payloadOf(e)["stage"]) || 0;
      const level = Number(payloadOf(e)["level"]) || 1;
      const cur = hintMap.get(stage) ?? { maxLevel: 0, count: 0 };
      hintMap.set(stage, {
        maxLevel: Math.max(cur.maxLevel, level),
        count: cur.count + 1,
      });
    }

    // Scan- und Lösungszeitpunkte pro Etappe.
    const scanAt = new Map<number, number>();
    for (const e of raw) {
      if (e.type !== "stage_scanned") continue;
      const stage = Number(payloadOf(e)["stage"]) || 0;
      const ms = eventMs(e);
      if (!scanAt.has(stage) || ms < scanAt.get(stage)!) scanAt.set(stage, ms);
    }
    const solvedAt = new Map<number, number>();
    const durations = new Map<number, number>();
    for (const e of raw) {
      if (e.type !== "stage_solved") continue;
      const stage = Number(payloadOf(e)["stage"]) || 0;
      solvedAt.set(stage, eventMs(e));
      durations.set(stage, Number(payloadOf(e)["durationSec"]) || 0);
    }

    // Startpunkt des Teams: Rundenstart (Schule) oder – falls unbekannt – das
    // erste Ereignis. Damit zählt auch der Weg von der Schule zu Posten 1.
    const firstEventMs = raw.length > 0 ? Math.min(...raw.map(eventMs)) : null;
    const originMs = Number.isFinite(roundStartMs) ? roundStartMs : firstEventMs;

    const stages: ReportStage[] = [...solvedAt.keys()]
      .sort((a, b) => a - b)
      .map((stage) => {
        const scan = scanAt.get(stage) ?? null;
        const prevSolved = stage > 1 ? (solvedAt.get(stage - 1) ?? null) : originMs;
        // Zwischenzeit nur, wenn beide Marken vorhanden und plausibel sind.
        let betweenMin: number | null = null;
        if (scan !== null && prevSolved !== null && scan > prevSolved) {
          const min = toMin(scan - prevSolved);
          if (min <= 240) betweenMin = min;
        }
        return {
          stage,
          minutes: Math.max(1, Math.round((durations.get(stage) ?? 0) / 60)),
          betweenMin,
          hintLevel: (hintMap.get(stage)?.maxLevel ?? 0) as 0 | 1 | 2 | 3,
          solvedAt: new Date(solvedAt.get(stage)!).toISOString(),
        };
      });

    const hearingAttempts = raw
      .filter((e) => e.type === "hearing_attempt")
      .map((e) => ({
        question: Number(payloadOf(e)["question"]) || 0,
        correct: payloadOf(e)["correct"] === true,
        attempt: Number(payloadOf(e)["attempt"]) || 1,
      }));

    const hearing = raw.filter((e) => e.type === "hearing_answer");
    const firstEvent = raw.reduce<string | null>(
      (min, e) => (min === null || e.created_at < min ? e.created_at : min),
      null,
    );
    const lastEvent = raw.reduce<string | null>(
      (max, e) => (max === null || e.created_at > max ? e.created_at : max),
      null,
    );
    const startRef = firstEvent ?? t.created_at;
    const totalMin = t.finished_at
      ? Math.max(
          1,
          Math.round(
            (new Date(t.finished_at).getTime() - new Date(startRef).getTime()) / 60_000,
          ),
        )
      : null;

    const solvedStages = stages.map((s) => s.stage).filter((s) => s >= 1 && s <= 5);
    const highestSolved = solvedStages.length > 0 ? Math.max(...solvedStages) : 0;
    const lastSolvedMs = solvedStages.length > 0 ? solvedAt.get(highestSolved)! : null;

    // Aktueller Abschnitt: ohne Scan der aktuellen Etappe ist das Team
    // unterwegs (Posten noch nicht gefunden), mit Scan sitzt es am Rätsel.
    const currentStage = Math.min(6, highestSolved + 1);
    const currentScan = scanAt.get(currentStage) ?? null;
    const phase: "travel" | "puzzle" = currentScan !== null ? "puzzle" : "travel";
    const phaseSinceMs = currentScan ?? lastSolvedMs;

    const exportEvents: ReportEvent[] = raw
      .slice()
      .sort((a, b) => eventMs(a) - eventMs(b))
      .map((e) => {
        const p = payloadOf(e);
        const num = (k: string) => (p[k] === undefined ? null : Number(p[k]));
        return {
          type: e.type,
          at: new Date(eventMs(e)).toISOString(),
          stage: num("stage"),
          level: num("level"),
          question: num("question"),
          correct: p["correct"] === undefined ? null : p["correct"] === true,
          attempt: num("attempt"),
          badgeId: p["badgeId"] === undefined ? null : String(p["badgeId"]),
          durationSec: num("durationSec"),
        };
      });

    return {
      teamId: t.id,
      name: t.name,
      members: Array.isArray(t.members)
        ? (t.members as unknown[]).filter((m): m is string => typeof m === "string")
        : [],
      joinedAt: t.created_at,
      finishedAt: t.finished_at,
      points: score.total,
      stagesSolved: score.stages.length,
      hintsUsed: raw.filter((e) => e.type === "hint_revealed").length,
      badges: raw
        .filter((e) => e.type === "badge_earned")
        .map((e) => String(payloadOf(e)["badgeId"] ?? "")),
      hearingCorrect: hearing.filter((e) => payloadOf(e)["correct"] === true).length,
      hearingWrong: hearing.filter((e) => payloadOf(e)["correct"] !== true).length,
      totalMin,
      stageMinutes: stages.map((s) => ({ stage: s.stage, minutes: s.minutes })),
      stages,
      hintsByStage: [...hintMap.entries()]
        .map(([stage, v]) => ({ stage, maxLevel: v.maxLevel, count: v.count }))
        .sort((a, b) => a.stage - b.stage),
      currentStage,
      lastSolvedAt: lastSolvedMs === null ? null : new Date(lastSolvedMs).toISOString(),
      phase,
      phaseSince: phaseSinceMs === null ? null : new Date(phaseSinceMs).toISOString(),
      currentScanAt: currentScan === null ? null : new Date(currentScan).toISOString(),
      lastEventAt: lastEvent,
      hearingAttempts,
      events: exportEvents,
    } satisfies ReportTeam;
  });

  rows.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  return rows;
}

