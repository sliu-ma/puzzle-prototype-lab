import { createServerFn } from "@tanstack/react-start";
import {
  checkAdminPassword,
  cleanMembers,
  cleanName,
  generateRoundCode,
  generateTeamToken,
  hashToken,
  normalizeCode,
  parseAdminInput,
  parseCreateRoundInput,
  parseJoinRoundInput,
  parseProgressInput,
  parseRoundDeleteInput,
  parseRoundStatusInput,
  parseTeamDeleteInput,
} from "./leaderboard.server";

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator(parseAdminInput)
  .handler(async ({ data }) => ({ ok: checkAdminPassword(data.password) }));

export const adminCreateRound = createServerFn({ method: "POST" })
  .inputValidator(parseCreateRoundInput)
  .handler(async ({ data }) => {
    if (!checkAdminPassword(data.password)) return { ok: false as const };
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      for (let attempt = 0; attempt < 6; attempt++) {
        const code = generateRoundCode();
        const { data: row, error } = await supabaseAdmin
          .from("rounds")
          .insert({ code, title: cleanName(data.title, 80) })
          .select("id, code, title, status, created_at")
          .single();
        if (!error && row) return { ok: true as const, round: row };
        if (error && error.code !== "23505") throw error;
      }
      console.error("[Leaderboard] Kein freier Rundencode nach sechs Versuchen.");
      return { ok: false as const, reason: "code_generation_failed" as const };
    } catch (error) {
      console.error("[Leaderboard] Runde konnte nicht erstellt werden.", error);
      return { ok: false as const, reason: "backend_unavailable" as const };
    }
  });

export const adminListRounds = createServerFn({ method: "POST" })
  .inputValidator(parseAdminInput)
  .handler(async ({ data }) => {
    if (!checkAdminPassword(data.password)) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rounds, error } = await supabaseAdmin
      .from("rounds")
      .select("id, code, title, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    const ids = (rounds ?? []).map((r) => r.id);
    let counts: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: teams, error: tErr } = await supabaseAdmin
        .from("teams")
        .select("id, round_id")
        .in("round_id", ids);
      if (tErr) throw tErr;
      counts = (teams ?? []).reduce<Record<string, number>>((acc, t) => {
        acc[t.round_id] = (acc[t.round_id] ?? 0) + 1;
        return acc;
      }, {});
    }
    return {
      ok: true as const,
      rounds: (rounds ?? []).map((r) => ({ ...r, teamCount: counts[r.id] ?? 0 })),
    };
  });

export const adminSetRoundStatus = createServerFn({ method: "POST" })
  .inputValidator(parseRoundStatusInput)
  .handler(async ({ data }) => {
    if (!checkAdminPassword(data.password)) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("rounds")
      .update({ status: data.status })
      .eq("id", data.roundId);
    if (error) throw error;
    return { ok: true as const };
  });

export const adminDeleteRound = createServerFn({ method: "POST" })
  .inputValidator(parseRoundDeleteInput)
  .handler(async ({ data }) => {
    if (!checkAdminPassword(data.password)) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("rounds").delete().eq("id", data.roundId);
    if (error) throw error;
    return { ok: true as const };
  });

export const adminDeleteTeam = createServerFn({ method: "POST" })
  .inputValidator(parseTeamDeleteInput)
  .handler(async ({ data }) => {
    if (!checkAdminPassword(data.password)) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("teams").delete().eq("id", data.teamId);
    if (error) throw error;
    return { ok: true as const };
  });

export const joinRound = createServerFn({ method: "POST" })
  .inputValidator(parseJoinRoundInput)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = normalizeCode(data.code);
    const { data: round, error } = await supabaseAdmin
      .from("rounds")
      .select("id, code, title, status")
      .eq("code", code)
      .maybeSingle();
    if (error) throw error;
    if (!round) return { ok: false as const, reason: "not_found" as const };
    if (round.status !== "open") return { ok: false as const, reason: "closed" as const };

    const token = generateTeamToken();
    const { data: team, error: insErr } = await supabaseAdmin
      .from("teams")
      .insert({
        round_id: round.id,
        name: cleanName(data.teamName),
        members: cleanMembers(data.members),
        token_hash: hashToken(token),
        started_at: new Date().toISOString(),
      })
      .select("id, name")
      .single();
    if (insErr) {
      if (insErr.code === "23505" || insErr.message.includes("duplicate")) {
        return { ok: false as const, reason: "name_taken" as const };
      }
      throw insErr;
    }
    return {
      ok: true as const,
      roundCode: round.code,
      roundTitle: round.title,
      teamId: team.id,
      teamName: team.name,
      token,
    };
  });

export const reportProgress = createServerFn({ method: "POST" })
  .inputValidator(parseProgressInput)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: team, error } = await supabaseAdmin
      .from("teams")
      .select("id, token_hash, stages_done, started_at, finished_at")
      .eq("id", data.teamId)
      .maybeSingle();
    if (error) throw error;
    if (!team || team.token_hash !== hashToken(data.token)) {
      return { ok: false as const };
    }
    const { error: upErr } = await supabaseAdmin
      .from("teams")
      .update({
        stages_done: Math.max(team.stages_done ?? 0, data.stagesDone),
        hints_used: data.hintsUsed,
        badges: data.badges,
        started_at: team.started_at ?? data.startedAt,
        finished_at: team.finished_at ?? data.finishedAt,
      })
      .eq("id", data.teamId);
    if (upErr) throw upErr;
    return { ok: true as const };
  });
