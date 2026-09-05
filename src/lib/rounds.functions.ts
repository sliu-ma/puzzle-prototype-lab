import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const eventSchema = z.object({
  id: z.string().min(1).max(120),
  type: z.enum([
    "stage_solved",
    "badge_earned",
    "hint_revealed",
    "hearing_answer",
    // Reine Erhebungsereignisse für die Auswertung (ohne Punkte-Einfluss).
    "stage_scanned",
    "hearing_attempt",
    "help_requested",
    "message_ack",
  ]),
  at: z.number().int().nonnegative().optional(),
  stage: z.number().int().min(0).max(10).optional(),
  durationSec: z.number().int().min(0).max(86_400).optional(),
  badgeId: z.string().max(80).optional(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  question: z.number().int().min(0).max(100).optional(),
  correct: z.boolean().optional(),
  attempt: z.number().int().min(1).max(20).optional(),
  note: z.string().max(200).optional(),
  messageId: z.string().max(60).optional(),
});



/** Prüft, ob ein eingegebener Code zu einer offenen Klassen-Runde gehört. */
export const lookupRound = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ code: z.string().min(1).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const { roundsDb } = await import("./rounds.server");
    const { data: rows, error } = await roundsDb().rpc("round_lookup", {
      p_code: data.code,
    });
    if (error) throw new Error(error.message);
    const round = rows?.[0];
    if (!round) return { found: false as const };
    return {
      found: true as const,
      code: round.code,
      title: round.title,
      status: round.status,
      budgetMin: round.budget_min,
      startedAt: round.started_at ?? null,
    };
  });

/** Team einer Runde beitreten. Gibt ein geheimes Token für Punkte-Meldungen zurück. */
export const joinRound = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        code: z.string().min(1).max(20),
        teamName: z.string().min(2).max(60),
        members: z.array(z.string().max(60)).max(8).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, makeTeamToken, hashToken } = await import("./rounds.server");

    const token = makeTeamToken();
    const { data: rows, error } = await roundsDb().rpc("round_join", {
      p_code: data.code,
      p_team_name: data.teamName.trim(),
      p_members: data.members.map((m) => m.trim()).filter(Boolean),
      p_token_hash: hashToken(token),
    });
    if (error) {
      if (error.message.includes("duplicate") || error.code === "23505") {
        throw new Error("Dieser Teamname ist in der Runde schon vergeben.");
      }
      throw new Error(error.message);
    }
    const row = rows?.[0];
    if (!row) throw new Error("Beitritt fehlgeschlagen. Bitte nochmals versuchen.");
    return {
      teamId: row.team_id,
      token,
      roundCode: row.round_code,
      roundTitle: row.round_title,
      roundStatus: row.round_status,
      startedAt: row.started_at ?? null,
      budgetMin: row.budget_min ?? 90,
    };
  });

/** Punkte-Ereignisse eines Teams melden (idempotent über die Ereignis-ID). */
export const pushScoreEvents = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        teamId: z.string().uuid(),
        token: z.string().min(10).max(200),
        events: z.array(eventSchema).max(400),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashToken } = await import("./rounds.server");
    if (data.events.length === 0) return { ok: true as const, stored: 0 };

    const events = data.events.map((e) => ({ ...e, at: e.at ?? Date.now() }));
    const { data: stored, error } = await roundsDb().rpc("round_push_events", {
      p_team_id: data.teamId,
      p_token_hash: hashToken(data.token),
      p_events: events,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const, stored: stored ?? 0 };
  });

/** Markiert ein Team als fertig (nach dem Hearing). */
export const finishTeam = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ teamId: z.string().uuid(), token: z.string().min(10).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashToken } = await import("./rounds.server");
    const { error } = await roundsDb().rpc("round_finish", {
      p_team_id: data.teamId,
      p_token_hash: hashToken(data.token),
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Öffentliche Rangliste einer Runde (nur Teamname und Punkte). */
export const getRoundLeaderboard = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ code: z.string().min(1).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const { roundsDb, buildLeaderboard } = await import("./rounds.server");

    const { data: raw, error } = await roundsDb().rpc("round_leaderboard_data", {
      p_code: data.code,
    });
    if (error) throw new Error(error.message);
    const payload = (raw ?? {}) as {
      found?: boolean;
      code?: string;
      title?: string;
      status?: string;
      budgetMin?: number;
      teams?: { id: string; name: string; finished_at: string | null }[];
      events?: { team_id: string; event_id: string; type: string; payload: unknown }[];
    };
    if (!payload.found) return { found: false as const };
    return {
      found: true as const,
      code: payload.code ?? data.code,
      title: payload.title ?? "",
      status: payload.status ?? "open",
      rows: buildLeaderboard(
        payload.teams ?? [],
        payload.events ?? [],
        payload.budgetMin ?? 90,
      ),
    };
  });

/** Eigene Ereignisse einer Gruppe zurückholen (Wiedereinstieg nach Gerätewechsel). */
export const getTeamEvents = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ teamId: z.string().uuid(), token: z.string().min(10).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashToken, rowsToEvents } = await import("./rounds.server");
    const { data: raw, error } = await roundsDb().rpc("round_events", {
      p_team_id: data.teamId,
      p_token_hash: hashToken(data.token),
    });
    if (error) throw new Error(error.message);
    const payload = (raw ?? {}) as {
      events?: { event_id: string; type: string; payload: unknown; created_at: string }[];
    };
    const rows = payload.events ?? [];
    return {
      events: rowsToEvents(rows),
      /** Rohtypen, damit auch Ereignisse ohne Punktebezug ausgewertet werden können. */
      types: rows.map((r) => {
        const p = (r.payload ?? {}) as { stage?: unknown; at?: unknown };
        return {
          eventId: String(r.event_id),
          type: String(r.type),
          stage: Number(p.stage) || 0,
          at: Number(p.at) || 0,
        };
      }),

    };
  });

// ---- Lehrpersonen -----------------------------------------------------------

export const teacherListRounds = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { roundsDb, hashPassword, loginBucket, assertLoginAllowed, noteLoginResult } =
      await import("./rounds.server");
    const bucket = await loginBucket();
    await assertLoginAllowed(bucket);
    const { data: rounds, error } = await roundsDb().rpc("teacher_list_rounds", {
      p_password_hash: hashPassword(data.password),
    });
    if (error) {
      await noteLoginResult(bucket, false);
      throw new Error(error.message);
    }
    await noteLoginResult(bucket, true);
    return (rounds ?? []).map((r) => ({
      code: r.code,
      title: r.title,
      status: r.status,
      created_at: r.created_at,
      teamCount: r.team_count ?? 0,
      budget_min: r.budget_min ?? 90,
      started_at: r.started_at ?? null,
    }));
  });


export const teacherCreateRound = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string().min(1).max(200),
        title: z.string().min(1).max(80),
        budgetMin: z.number().int().min(15).max(240).default(90),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashPassword, makeRoundCode } = await import("./rounds.server");
    const db = roundsDb();
    const passwordHash = hashPassword(data.password);

    let lastError: string | null = null;
    for (let attempt = 0; attempt < 6; attempt++) {
      const { data: rows, error } = await db.rpc("teacher_create_round", {
        p_password_hash: passwordHash,
        p_code: makeRoundCode(),
        p_title: data.title.trim(),
        p_budget_min: data.budgetMin,
      });
      if (!error && rows?.[0]) return rows[0];
      lastError = error?.message ?? null;
      if (error && !/duplicate|unique/i.test(error.message)) throw new Error(error.message);
    }
    throw new Error(
      lastError ?? "Rundencode konnte nicht erzeugt werden. Bitte nochmals versuchen.",
    );
  });

export const teacherSetRoundStatus = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string().min(1).max(200),
        code: z.string().min(1).max(20),
        status: z.enum(["lobby", "closed"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashPassword } = await import("./rounds.server");
    const { error } = await roundsDb().rpc("teacher_set_round_status", {
      p_password_hash: hashPassword(data.password),
      p_code: data.code,
      p_status: data.status,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const teacherDeleteTeam = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ password: z.string().min(1).max(200), teamId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashPassword } = await import("./rounds.server");
    const { error } = await roundsDb().rpc("teacher_delete_team", {
      p_password_hash: hashPassword(data.password),
      p_team_id: data.teamId,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Zustand einer Runde für die Lobby (inkl. Prüfung, ob das eigene Team noch existiert). */
export const getRoundState = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        code: z.string().min(1).max(20),
        teamId: z.string().uuid().optional(),
        token: z.string().min(10).max(200).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashToken } = await import("./rounds.server");
    const { data: raw, error } = await roundsDb().rpc("round_state", {
      p_code: data.code,
      p_team_id: (data.teamId ?? null) as unknown as string,
      p_token_hash: (data.token ? hashToken(data.token) : null) as unknown as string,
    });
    if (error) throw new Error(error.message);
    const p = (raw ?? {}) as {
      found?: boolean;
      code?: string;
      title?: string;
      status?: string;
      budgetMin?: number;
      startedAt?: string | null;
      teamExists?: boolean;
      teams?: { id: string; name: string }[];
      messages?: { id: string; body: string; createdAt: string }[];
    };
    if (!p.found) return { found: false as const };
    return {
      found: true as const,
      code: p.code ?? data.code,
      title: p.title ?? "",
      status: p.status ?? "lobby",
      budgetMin: p.budgetMin ?? 90,
      startedAt: p.startedAt ?? null,
      teamExists: !!p.teamExists,
      teams: p.teams ?? [],
      messages: p.messages ?? [],
    };
  });

/** Nachricht der Lehrperson an alle Gruppen oder an eine einzelne Gruppe. */
export const teacherSendMessage = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string().min(1).max(200),
        code: z.string().min(1).max(20),
        teamId: z.string().uuid().nullable().optional(),
        body: z.string().min(1).max(300),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashPassword } = await import("./rounds.server");
    const { error } = await roundsDb().rpc("teacher_send_message", {
      p_password_hash: hashPassword(data.password),
      p_code: data.code,
      p_team_id: (data.teamId ?? null) as unknown as string,
      p_body: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Die zuletzt gesendeten Nachrichten einer Runde für die Lehreransicht. */
export const teacherListMessages = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ password: z.string().min(1).max(200), code: z.string().min(1).max(20) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashPassword } = await import("./rounds.server");
    const { data: rows, error } = await roundsDb().rpc("teacher_list_messages", {
      p_password_hash: hashPassword(data.password),
      p_code: data.code,
    });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      id: r.id as string,
      teamId: (r.team_id as string | null) ?? null,
      teamName: (r.team_name as string | null) ?? null,
      body: r.body as string,
      createdAt: r.created_at as string,
    }));
  });

export const teacherStartRound = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ password: z.string().min(1).max(200), code: z.string().min(1).max(20) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashPassword } = await import("./rounds.server");
    const { data: startedAt, error } = await roundsDb().rpc("teacher_start_round", {
      p_password_hash: hashPassword(data.password),
      p_code: data.code,
    });
    if (error) throw new Error(error.message);
    return { startedAt: startedAt as string | null };
  });

export const teacherUpdateRound = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string().min(1).max(200),
        code: z.string().min(1).max(20),
        title: z.string().min(1).max(80).optional(),
        budgetMin: z.number().int().min(15).max(240).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashPassword } = await import("./rounds.server");
    const { error } = await roundsDb().rpc("teacher_update_round", {
      p_password_hash: hashPassword(data.password),
      p_code: data.code,
      p_title: (data.title ?? null) as unknown as string,
      p_budget_min: (data.budgetMin ?? null) as unknown as number,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const teacherDeleteRound = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ password: z.string().min(1).max(200), code: z.string().min(1).max(20) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { roundsDb, hashPassword } = await import("./rounds.server");
    const { error } = await roundsDb().rpc("teacher_delete_round", {
      p_password_hash: hashPassword(data.password),
      p_code: data.code,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Auswertung einer Runde: Punkte, Zeiten pro Etappe, Hinweise, Abzeichen. */
export const teacherRoundReport = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ password: z.string().min(1).max(200), code: z.string().min(1).max(20) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const {
      roundsDb,
      hashPassword,
      buildReport,
      loginBucket,
      assertLoginAllowed,
      noteLoginResult,
    } = await import("./rounds.server");
    const bucket = await loginBucket();
    await assertLoginAllowed(bucket);
    const { data: raw, error } = await roundsDb().rpc("teacher_round_report", {
      p_password_hash: hashPassword(data.password),
      p_code: data.code,
    });
    if (error) {
      await noteLoginResult(bucket, false);
      throw new Error(error.message);
    }
    await noteLoginResult(bucket, true);

    const p = (raw ?? {}) as {
      found?: boolean;
      code?: string;
      title?: string;
      status?: string;
      budgetMin?: number;
      startedAt?: string | null;
      teams?: {
        id: string;
        name: string;
        members: unknown;
        created_at: string;
        finished_at: string | null;
      }[];
      events?: {
        team_id: string;
        event_id: string;
        type: string;
        payload: unknown;
        created_at: string;
      }[];
    };
    if (!p.found) return { found: false as const };
    return {
      found: true as const,
      code: p.code ?? data.code,
      title: p.title ?? "",
      status: p.status ?? "lobby",
      budgetMin: p.budgetMin ?? 90,
      startedAt: p.startedAt ?? null,
      teams: buildReport(
        p.teams ?? [],
        p.events ?? [],
        p.budgetMin ?? 90,
        p.startedAt ?? null,
      ),
    };
  });
