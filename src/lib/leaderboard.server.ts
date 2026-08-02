// Server-only Helfer für Runden & Leaderboard.
// Wird ausschliesslich aus leaderboard.functions.ts heraus benutzt.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const adminSchema = z.object({ password: z.string().min(1).max(200) });

export function parseAdminInput(data: unknown) {
  return adminSchema.parse(data);
}

export function parseCreateRoundInput(data: unknown) {
  return adminSchema.extend({ title: z.string().max(80).default("") }).parse(data);
}

export function parseRoundStatusInput(data: unknown) {
  return adminSchema
    .extend({ roundId: z.string().uuid(), status: z.enum(["open", "closed"]) })
    .parse(data);
}

export function parseRoundDeleteInput(data: unknown) {
  return adminSchema.extend({ roundId: z.string().uuid() }).parse(data);
}

export function parseTeamDeleteInput(data: unknown) {
  return adminSchema.extend({ teamId: z.string().uuid() }).parse(data);
}

export function parseJoinRoundInput(data: unknown) {
  return z
    .object({
      code: z.string().min(3).max(20),
      teamName: z.string().min(2).max(40),
      members: z.array(z.string().max(40)).max(8).default([]),
    })
    .parse(data);
}

export function parseProgressInput(data: unknown) {
  return z
    .object({
      teamId: z.string().uuid(),
      token: z.string().min(10).max(200),
      stagesDone: z.number().int().min(0).max(6),
      hintsUsed: z.number().int().min(0).max(99),
      badges: z.array(z.string().max(60)).max(30).default([]),
      startedAt: z.string().datetime().nullable().default(null),
      finishedAt: z.string().datetime().nullable().default(null),
    })
    .parse(data);
}

export function generateRoundCode(): string {
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += CODE_ALPHABET[(bytes[i] ?? 0) % CODE_ALPHABET.length];
  }
  return out;
}

export function generateTeamToken(): string {
  return randomBytes(24).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function checkAdminPassword(input: string): boolean {
  const expected = process.env["ADMIN_PASSWORT"];
  if (!expected) throw new Error("ADMIN_PASSWORT ist nicht gesetzt.");
  const a = createHash("sha256").update(input ?? "", "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export function normalizeCode(code: string): string {
  return (code ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

export function cleanName(name: string, max = 40): string {
  return (name ?? "").trim().slice(0, max);
}

export function cleanMembers(members: unknown): string[] {
  if (!Array.isArray(members)) return [];
  return members
    .filter((m): m is string => typeof m === "string")
    .map((m) => cleanName(m, 30))
    .filter((m) => m.length > 0)
    .slice(0, 8);
}

export type LeaderboardTeam = {
  id: string;
  name: string;
  members: string[];
  stagesDone: number;
  hintsUsed: number;
  badges: string[];
  startedAt: string | null;
  finishedAt: string | null;
  durationMin: number | null;
};

export function toLeaderboardTeam(row: {
  id: string;
  name: string;
  members: string[] | null;
  stages_done: number | null;
  hints_used: number | null;
  badges: string[] | null;
  started_at: string | null;
  finished_at: string | null;
}): LeaderboardTeam {
  const started = row.started_at ? new Date(row.started_at).getTime() : null;
  const finished = row.finished_at ? new Date(row.finished_at).getTime() : null;
  const durationMin =
    started && finished && finished > started
      ? Math.max(1, Math.round((finished - started) / 60_000))
      : null;
  return {
    id: row.id,
    name: row.name,
    members: row.members ?? [],
    stagesDone: row.stages_done ?? 0,
    hintsUsed: row.hints_used ?? 0,
    badges: row.badges ?? [],
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    durationMin,
  };
}

/** Rangfolge: mehr Etappen zuerst, dann kürzere Zeit, dann weniger Hinweise. */
export function sortLeaderboard(teams: LeaderboardTeam[]): LeaderboardTeam[] {
  return [...teams].sort((a, b) => {
    if (b.stagesDone !== a.stagesDone) return b.stagesDone - a.stagesDone;
    const at = a.durationMin ?? Number.POSITIVE_INFINITY;
    const bt = b.durationMin ?? Number.POSITIVE_INFINITY;
    if (at !== bt) return at - bt;
    if (a.hintsUsed !== b.hintsUsed) return a.hintsUsed - b.hintsUsed;
    return a.name.localeCompare(b.name, "de-CH");
  });
}
