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
      case "hearing_answer":
        out.push({
          ...base,
          type: "hearing_answer",
          question: Number(p["question"]) || 0,
          correct: Boolean(p["correct"]),
        });
        break;
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
};

/** Auswertung pro Team für die Lehreransicht. */
export function buildReport(
  teams: {
    id: string;
    name: string;
    members: unknown;
    created_at: string;
    finished_at: string | null;
  }[],
  events: {
    team_id: string;
    event_id: string;
    type: string;
    payload: unknown;
    created_at: string;
  }[],
  budgetMin: number,
): ReportTeam[] {
  const byTeam = new Map<string, typeof events>();
  for (const e of events) {
    const list = byTeam.get(e.team_id) ?? [];
    list.push(e);
    byTeam.set(e.team_id, list);
  }

  const rows = teams.map((t) => {
    const raw = byTeam.get(t.id) ?? [];
    const score = computeScore(rowsToEvents(raw), budgetMin);
    const stageMinutes = raw
      .filter((e) => e.type === "stage_solved")
      .map((e) => {
        const p = (e.payload ?? {}) as Record<string, unknown>;
        return {
          stage: Number(p["stage"]) || 0,
          minutes: Math.max(1, Math.round((Number(p["durationSec"]) || 0) / 60)),
        };
      })
      .sort((a, b) => a.stage - b.stage);
    const hearing = raw.filter((e) => e.type === "hearing_answer");
    const firstEvent = raw.reduce<string | null>(
      (min, e) => (min === null || e.created_at < min ? e.created_at : min),
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
        .map((e) => String(((e.payload ?? {}) as Record<string, unknown>)["badgeId"] ?? "")),
      hearingCorrect: hearing.filter(
        (e) => ((e.payload ?? {}) as Record<string, unknown>)["correct"] === true,
      ).length,
      hearingWrong: hearing.filter(
        (e) => ((e.payload ?? {}) as Record<string, unknown>)["correct"] !== true,
      ).length,
      totalMin,
      stageMinutes,
    } satisfies ReportTeam;
  });

  rows.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  return rows;
}
