// Client-seitige Runden-Session (Leaderboard) im localStorage.
import { joinRound, reportProgress } from "./leaderboard.functions";
import { getCurrentStage, getEndTs, getStartTs } from "./progress";
import { getEarnedBadges, getTotalHintsUsed } from "./badges";

const KEY_ROUND = "maya-round-session";

export type RoundSession = {
  roundCode: string;
  roundTitle: string;
  teamId: string;
  teamName: string;
  token: string;
};

export function getRoundSession(): RoundSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_ROUND);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.teamId === "string" && typeof parsed.token === "string") {
      return parsed as RoundSession;
    }
    return null;
  } catch {
    return null;
  }
}

function setRoundSession(session: RoundSession) {
  try {
    localStorage.setItem(KEY_ROUND, JSON.stringify(session));
    window.dispatchEvent(new Event("maya-progress"));
  } catch {
    /* ignore */
  }
}

export type JoinResult =
  | { ok: true; session: RoundSession }
  | { ok: false; reason: "not_found" | "closed" | "name_taken" | "error" };

export async function joinRoundSession(
  code: string,
  teamName: string,
  members: string[],
): Promise<JoinResult> {
  try {
    const res = await joinRound({ data: { code, teamName, members } });
    if (!res.ok) return { ok: false, reason: res.reason };
    const session: RoundSession = {
      roundCode: res.roundCode,
      roundTitle: res.roundTitle ?? "",
      teamId: res.teamId,
      teamName: res.teamName,
      token: res.token,
    };
    setRoundSession(session);
    return { ok: true, session };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/**
 * Meldet den aktuellen Stand an die Rangliste. Fehler werden bewusst
 * verschluckt, damit das Spiel auch ohne Netz weiterläuft.
 */
export function syncRoundProgress() {
  const session = getRoundSession();
  if (!session) return;
  const start = getStartTs();
  const end = getEndTs();
  const stagesDone = Math.max(0, Math.min(6, getCurrentStage() - 1));
  reportProgress({
    data: {
      teamId: session.teamId,
      token: session.token,
      stagesDone,
      hintsUsed: getTotalHintsUsed(),
      badges: [...getEarnedBadges()],
      startedAt: start ? new Date(start).toISOString() : null,
      finishedAt: end ? new Date(end).toISOString() : null,
    },
  }).catch(() => {
    /* offline, ignorieren */
  });
}
