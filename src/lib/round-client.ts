// Klassen-Runde auf dem Gerät: Zuordnung Team ↔ Runde und Abgleich der
// Punkte-Ereignisse mit dem Server. Ohne Runde läuft alles rein lokal weiter.
import type { ScoreEvent } from "./score";
import { pushScoreEvents, finishTeam } from "./rounds.functions";

const KEY_ROUND = "maya-round";
const KEY_PENDING = "maya-lobby-pending";

export type RoundSession = {
  code: string;
  title: string;
  teamId: string;
  token: string;
  startedAt?: string | null;
};

/**
 * Wartezimmer-Daten: überlebt absichtlich `resetAll()` (sessionStorage),
 * damit beim gemeinsamen Start neu registriert werden kann.
 */
export type PendingJoin = {
  code: string;
  title: string;
  teamId: string;
  token: string;
  teamName: string;
  members: string[];
  budgetMin: number;
};

export function getPendingJoin(): PendingJoin | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY_PENDING);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<PendingJoin>;
    if (!p.code || !p.teamId || !p.token || !p.teamName) return null;
    return {
      code: p.code,
      title: p.title ?? "",
      teamId: p.teamId,
      token: p.token,
      teamName: p.teamName,
      members: Array.isArray(p.members) ? p.members : [],
      budgetMin: typeof p.budgetMin === "number" ? p.budgetMin : 90,
    };
  } catch {
    return null;
  }
}

export function setPendingJoin(p: PendingJoin) {
  try {
    window.sessionStorage.setItem(KEY_PENDING, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function clearPendingJoin() {
  try {
    window.sessionStorage.removeItem(KEY_PENDING);
  } catch {
    /* ignore */
  }
}

export function getRoundSession(): RoundSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY_ROUND);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<RoundSession>;
    if (!p.code || !p.teamId || !p.token) return null;
    return {
      code: p.code,
      title: p.title ?? "",
      teamId: p.teamId,
      token: p.token,
      startedAt: p.startedAt ?? null,
    };
  } catch {
    return null;
  }
}

export function setRoundSession(s: RoundSession) {
  try {
    window.localStorage.setItem(KEY_ROUND, JSON.stringify(s));
    window.dispatchEvent(new Event("maya-progress"));
  } catch {
    /* ignore */
  }
}

let timer: number | null = null;

/**
 * Schiebt alle bekannten Ereignisse zum Server (idempotent). Fehler werden
 * bewusst geschluckt: Offline-Spiel bleibt möglich, der nächste Abgleich
 * überträgt die Ereignisse erneut.
 */
export function syncScoreEvents(events: ScoreEvent[]) {
  const session = getRoundSession();
  if (!session || events.length === 0) return;
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    void pushScoreEvents({
      data: {
        teamId: session.teamId,
        token: session.token,
        events: events.slice(-200).map((e) => ({ ...e })),
      },
    }).catch(() => undefined);
  }, 400);
}

export function markRoundFinished() {
  const session = getRoundSession();
  if (!session) return;
  void finishTeam({ data: { teamId: session.teamId, token: session.token } }).catch(
    () => undefined,
  );
}
