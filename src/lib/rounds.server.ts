// Server-only Helfer für Klassen-Runden. Kein Client-Import!
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { computeScore, type ScoreEvent } from "./score";

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

/**
 * Liefert den privilegierten Server-Client, oder null, wenn die
 * Umgebungs-Bindung (Service-Role-Key) fehlt. So bleibt das Spiel spielbar,
 * auch wenn die Server-Bindung nach einem neuen Build verloren geht.
 */
export async function tryAdmin() {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Zugriff erzwingt die Initialisierung des Clients.
    void supabaseAdmin.from;
    return supabaseAdmin;
  } catch (err) {
    console.error("[rounds] Supabase-Serverbindung nicht verfügbar:", err);
    return null;
  }
}
