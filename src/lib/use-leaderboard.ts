import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type RankedTeam = {
  id: string;
  name: string;
  members: string[];
  stagesDone: number;
  hintsUsed: number;
  badges: string[];
  durationMin: number | null;
  finished: boolean;
};

const TEAM_COLUMNS =
  "id, name, members, stages_done, hints_used, badges, started_at, finished_at";

function mapTeam(row: Record<string, unknown>): RankedTeam {
  const started = row["started_at"] ? new Date(String(row["started_at"])).getTime() : null;
  const finished = row["finished_at"] ? new Date(String(row["finished_at"])).getTime() : null;
  return {
    id: String(row["id"]),
    name: String(row["name"]),
    members: Array.isArray(row["members"]) ? (row["members"] as string[]) : [],
    stagesDone: Number(row["stages_done"] ?? 0),
    hintsUsed: Number(row["hints_used"] ?? 0),
    badges: Array.isArray(row["badges"]) ? (row["badges"] as string[]) : [],
    durationMin:
      started && finished && finished > started
        ? Math.max(1, Math.round((finished - started) / 60_000))
        : null,
    finished: Boolean(finished),
  };
}

export function rankTeams(teams: RankedTeam[]): RankedTeam[] {
  return [...teams].sort((a, b) => {
    if (b.stagesDone !== a.stagesDone) return b.stagesDone - a.stagesDone;
    const at = a.durationMin ?? Number.POSITIVE_INFINITY;
    const bt = b.durationMin ?? Number.POSITIVE_INFINITY;
    if (at !== bt) return at - bt;
    if (a.hintsUsed !== b.hintsUsed) return a.hintsUsed - b.hintsUsed;
    return a.name.localeCompare(b.name, "de-CH");
  });
}

type State = {
  loading: boolean;
  error: string | null;
  roundTitle: string | null;
  teams: RankedTeam[];
};

/** Lädt die Rangliste einer Runde und hält sie per Realtime aktuell. */
export function useLeaderboard(code: string | null) {
  const [state, setState] = useState<State>({
    loading: Boolean(code),
    error: null,
    roundTitle: null,
    teams: [],
  });

  useEffect(() => {
    if (!code) {
      setState({ loading: false, error: null, roundTitle: null, teams: [] });
      return;
    }
    let cancelled = false;
    let roundId: string | null = null;

    const loadTeams = async (id: string) => {
      const { data, error } = await supabase
        .from("teams")
        .select(TEAM_COLUMNS)
        .eq("round_id", id);
      if (cancelled) return;
      if (error) {
        setState((s) => ({ ...s, loading: false, error: "Rangliste nicht erreichbar." }));
        return;
      }
      setState((s) => ({
        ...s,
        loading: false,
        error: null,
        teams: rankTeams((data ?? []).map((r) => mapTeam(r as Record<string, unknown>))),
      }));
    };

    const init = async () => {
      const { data: round, error } = await supabase
        .from("rounds")
        .select("id, title")
        .eq("code", code.trim().toUpperCase())
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setState({
          loading: false,
          error: "Rangliste nicht erreichbar.",
          roundTitle: null,
          teams: [],
        });
        return;
      }
      if (!round) {
        setState({
          loading: false,
          error: "Diesen Rundencode gibt es nicht.",
          roundTitle: null,
          teams: [],
        });
        return;
      }
      roundId = round.id;
      setState((s) => ({ ...s, roundTitle: round.title ?? "" }));
      await loadTeams(round.id);
    };

    void init();

    const channel = supabase
      .channel(`leaderboard-${code}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        () => {
          if (roundId) void loadTeams(roundId);
        },
      )
      .subscribe();

    const poll = window.setInterval(() => {
      if (roundId) void loadTeams(roundId);
    }, 20_000);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [code]);

  return state;
}
