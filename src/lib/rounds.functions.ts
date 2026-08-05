import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const eventSchema = z.object({
  id: z.string().min(1).max(120),
  type: z.enum(["stage_solved", "badge_earned", "hint_revealed", "hearing_answer"]),
  at: z.number().int().nonnegative().optional(),
  stage: z.number().int().min(0).max(10).optional(),
  durationSec: z.number().int().min(0).max(86_400).optional(),
  badgeId: z.string().max(80).optional(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  question: z.number().int().min(0).max(100).optional(),
  correct: z.boolean().optional(),
});

/** Prüft, ob die Serverbindung zur Datenbank steht (für die Lehrpersonen-Seite). */
export const checkRoundsHealth = createServerFn({ method: "POST" }).handler(async () => {
  const { tryAdmin } = await import("./rounds.server");
  const admin = await tryAdmin();
  if (!admin) return { ok: false as const, reason: "binding" as const };
  const { error } = await admin.from("rounds").select("id").limit(1);
  if (error) return { ok: false as const, reason: "query" as const };
  return { ok: true as const };
});

/** Prüft, ob ein eingegebener Code zu einer offenen Klassen-Runde gehört. */
export const lookupRound = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ code: z.string().min(1).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const { tryAdmin, rateLimit, callerKey } = await import("./rounds.server");
    if (!rateLimit("lookup", await callerKey(), 40, 60_000)) {
      return { found: false as const, unavailable: true as const, rateLimited: true as const };
    }
    const admin = await tryAdmin();
    if (!admin) return { found: false as const, unavailable: true as const };
    const { data: round, error } = await admin
      .from("rounds")
      .select("code, title, status, budget_min")
      .eq("code", data.code.trim().toUpperCase())
      .maybeSingle();
    if (error) return { found: false as const, unavailable: true as const };
    if (!round) return { found: false as const, unavailable: false as const };
    return {
      found: true as const,
      unavailable: false as const,
      code: round.code,
      title: round.title,
      status: round.status,
      budgetMin: round.budget_min,
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
    const {
      makeTeamToken,
      hashToken,
      tryAdmin,
      rateLimit,
      callerKey,
      BINDING_MESSAGE,
      RATE_MESSAGE,
    } = await import("./rounds.server");
    if (!rateLimit("join", await callerKey(), 15, 5 * 60_000)) throw new Error(RATE_MESSAGE);
    const supabaseAdmin = await tryAdmin();
    if (!supabaseAdmin) throw new Error(BINDING_MESSAGE);

    const { data: round } = await supabaseAdmin
      .from("rounds")
      .select("id, code, title, status")
      .eq("code", data.code.trim().toUpperCase())
      .maybeSingle();
    if (!round) throw new Error("Diese Runde existiert nicht.");
    if (round.status !== "open") throw new Error("Diese Runde ist geschlossen.");

    const token = makeTeamToken();
    const { data: team, error } = await supabaseAdmin
      .from("teams")
      .insert({
        round_id: round.id,
        name: data.teamName.trim(),
        members: data.members.map((m) => m.trim()).filter(Boolean),
        token_hash: hashToken(token),
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505" || error.code === "23P01" || error.code === "23000") {
        throw new Error("Dieser Teamname ist in der Runde schon vergeben.");
      }
      if (error.message.includes("duplicate")) {
        throw new Error("Dieser Teamname ist in der Runde schon vergeben.");
      }
      throw new Error(error.message);
    }
    return { teamId: team.id, token, roundCode: round.code, roundTitle: round.title };
  });

/** Punkte-Ereignisse eines Teams melden (idempotent über die Ereignis-ID). */
export const pushScoreEvents = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        teamId: z.string().uuid(),
        token: z.string().min(10).max(200),
        events: z.array(eventSchema).max(200),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { hashToken, safeEqual } = await import("./rounds.server");

    const { data: team } = await supabaseAdmin
      .from("teams")
      .select("id, token_hash")
      .eq("id", data.teamId)
      .maybeSingle();
    if (!team || !safeEqual(hashToken(data.token), team.token_hash)) {
      throw new Error("Team nicht bekannt.");
    }
    if (data.events.length === 0) return { ok: true as const, stored: 0 };

    const rows = data.events.map((e) => {
      const { id, type, ...rest } = e;
      return {
        team_id: team.id,
        event_id: id,
        type: type as string,
        payload: { at: e.at ?? Date.now(), ...rest } as unknown as Record<string, never>,
      };
    });

    const { error } = await supabaseAdmin
      .from("score_events")
      .upsert(rows, { onConflict: "team_id,event_id", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
    return { ok: true as const, stored: rows.length };
  });

/** Markiert ein Team als fertig (nach dem Hearing). */
export const finishTeam = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ teamId: z.string().uuid(), token: z.string().min(10).max(200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { hashToken, safeEqual } = await import("./rounds.server");
    const { data: team } = await supabaseAdmin
      .from("teams")
      .select("id, token_hash, finished_at")
      .eq("id", data.teamId)
      .maybeSingle();
    if (!team || !safeEqual(hashToken(data.token), team.token_hash)) {
      throw new Error("Team nicht bekannt.");
    }
    if (!team.finished_at) {
      await supabaseAdmin
        .from("teams")
        .update({ finished_at: new Date().toISOString() })
        .eq("id", team.id);
    }
    return { ok: true as const };
  });

/** Öffentliche Rangliste einer Runde (nur Teamname und Punkte). */
export const getRoundLeaderboard = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ code: z.string().min(1).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const { tryAdmin, buildLeaderboard } = await import("./rounds.server");
    const admin = await tryAdmin();
    const empty = { found: false as const, unavailable: true as const, rows: [] };
    if (!admin) return empty;

    const { data: round, error } = await admin
      .from("rounds")
      .select("id, code, title, status, budget_min")
      .eq("code", data.code.trim().toUpperCase())
      .maybeSingle();
    if (error) return empty;
    if (!round) return { found: false as const, unavailable: false as const, rows: [] };

    const { data: teams } = await admin
      .from("teams")
      .select("id, name, finished_at")
      .eq("round_id", round.id);
    const teamList = teams ?? [];
    if (teamList.length === 0) {
      return {
        found: true as const,
        unavailable: false as const,
        code: round.code,
        title: round.title,
        status: round.status,
        rows: [],
      };
    }
    const { data: events } = await admin
      .from("score_events")
      .select("team_id, event_id, type, payload")
      .in(
        "team_id",
        teamList.map((t) => t.id),
      );
    return {
      found: true as const,
      unavailable: false as const,
      code: round.code,
      title: round.title,
      status: round.status,
      rows: buildLeaderboard(teamList, events ?? [], round.budget_min),
    };
  });


// ---- Lehrpersonen -----------------------------------------------------------

export const teacherListRounds = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { assertTeacher } = await import("./rounds.server");
    assertTeacher(data.password);

    const { data: rounds } = await supabaseAdmin
      .from("rounds")
      .select("code, title, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    const list = rounds ?? [];
    const { data: teams } = await supabaseAdmin.from("teams").select("id, round_id");
    const { data: roundIds } = await supabaseAdmin.from("rounds").select("id, code");
    const codeById = new Map((roundIds ?? []).map((r) => [r.id, r.code]));
    const counts = new Map<string, number>();
    for (const t of teams ?? []) {
      const code = codeById.get(t.round_id);
      if (code) counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    return list.map((r) => ({ ...r, teamCount: counts.get(r.code) ?? 0 }));
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { assertTeacher, makeRoundCode } = await import("./rounds.server");
    assertTeacher(data.password);

    for (let attempt = 0; attempt < 6; attempt++) {
      const code = makeRoundCode();
      const { data: round, error } = await supabaseAdmin
        .from("rounds")
        .insert({ code, title: data.title.trim(), budget_min: data.budgetMin })
        .select("code, title, status")
        .single();
      if (!error && round) return round;
    }
    throw new Error("Rundencode konnte nicht erzeugt werden. Bitte nochmals versuchen.");
  });

export const teacherSetRoundStatus = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        password: z.string().min(1).max(200),
        code: z.string().min(1).max(20),
        status: z.enum(["open", "closed"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { assertTeacher } = await import("./rounds.server");
    assertTeacher(data.password);
    const { error } = await supabaseAdmin
      .from("rounds")
      .update({ status: data.status })
      .eq("code", data.code.trim().toUpperCase());
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const teacherDeleteTeam = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ password: z.string().min(1).max(200), teamId: z.string().uuid() })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { assertTeacher } = await import("./rounds.server");
    assertTeacher(data.password);
    const { error } = await supabaseAdmin.from("teams").delete().eq("id", data.teamId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
