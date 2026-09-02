// Klassen-Runde auf dem Gerät: Zuordnung Team ↔ Runde und Abgleich der
// Punkte-Ereignisse mit dem Server. Ohne Runde läuft alles rein lokal weiter.
import type { ScoreEvent } from "./score";
import { pushScoreEvents, finishTeam } from "./rounds.functions";

const KEY_ROUND = "maya-round";
/**
 * Wartezimmer-Daten liegen dauerhaft im localStorage, damit eine Gruppe nach
 * einem geschlossenen Tab (iOS beendet Tabs gern) zurück ins Wartezimmer
 * findet statt sich ein zweites Mal anzumelden. Der Schlüssel trägt bewusst
 * kein `maya-`-Präfix, damit `resetAll()` ihn nicht löscht.
 */
const KEY_PENDING = "mm.lobby.pending";
const LEGACY_KEY_PENDING = "maya-lobby-pending";

/** Der Server nimmt bis zu 400 Ereignisse pro Übertragung an. */
const MAX_PUSH_EVENTS = 400;
/** Wartezeiten der Wiederholversuche in Millisekunden. */
const RETRY_DELAYS = [2000, 5000, 15000, 30000, 60000];

export const SYNC_CHANGED = "round:sync";

export type RoundSession = {
  code: string;
  title: string;
  teamId: string;
  token: string;
  startedAt?: string | null;
};

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
    const raw =
      window.localStorage.getItem(KEY_PENDING) ??
      window.sessionStorage.getItem(LEGACY_KEY_PENDING);
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
    window.localStorage.setItem(KEY_PENDING, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function clearPendingJoin() {
  try {
    window.localStorage.removeItem(KEY_PENDING);
    window.sessionStorage.removeItem(LEGACY_KEY_PENDING);
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

// ---- Abgleich der Ereignisse ------------------------------------------------

let timer: number | null = null;
let queued: ScoreEvent[] = [];
let inFlight = false;
let attempt = 0;
let pendingCount = 0;
let listenersBound = false;

function setPending(n: number) {
  if (pendingCount === n) return;
  pendingCount = n;
  try {
    window.dispatchEvent(
      new CustomEvent(SYNC_CHANGED, { detail: { pending: pendingCount } }),
    );
  } catch {
    /* ignore */
  }
}

/** Anzahl noch nicht übertragener Ereignisse (0 = alles beim Server). */
export function getPendingSyncCount(): number {
  return pendingCount;
}

function bindListeners() {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;
  // Wieder Netz: sofort nachliefern, ohne auf ein neues Ereignis zu warten.
  window.addEventListener("online", () => flushNow());
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") flushNow();
  });
  // Seite wird verlassen: letzten Stand noch anstossen.
  window.addEventListener("pagehide", () => flushNow());
}

function schedule(delay: number) {
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    void push();
  }, delay);
}

async function push() {
  if (inFlight) return;
  const session = getRoundSession();
  if (!session || queued.length === 0) return;
  inFlight = true;
  const batch = queued.slice(-MAX_PUSH_EVENTS).map((e) => ({ ...e }));
  try {
    await pushScoreEvents({
      data: { teamId: session.teamId, token: session.token, events: batch },
    });
    attempt = 0;
    setPending(0);
  } catch {
    // Fehlgeschlagen: Ereignisse bleiben in der Warteschlange und werden mit
    // wachsendem Abstand erneut versucht.
    setPending(queued.length);
    const delay = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)]!;
    attempt += 1;
    schedule(delay);
  } finally {
    inFlight = false;
  }
}

/** Sofortiger Versuch (Wiederverbindung, Seitenwechsel). */
export function flushNow() {
  if (queued.length === 0 || inFlight) return;
  if (timer) window.clearTimeout(timer);
  timer = null;
  void push();
}

/**
 * Schiebt alle bekannten Ereignisse zum Server (idempotent). Fehler führen zu
 * einem Wiederholversuch mit wachsendem Abstand; offline bleibt das Spiel
 * uneingeschränkt spielbar.
 */
export function syncScoreEvents(events: ScoreEvent[]) {
  const session = getRoundSession();
  if (!session || events.length === 0) return;
  bindListeners();
  queued = events;
  setPending(events.length);
  attempt = 0;
  schedule(400);
}

export function markRoundFinished() {
  const session = getRoundSession();
  if (!session) return;
  flushNow();
  void finishTeam({ data: { teamId: session.teamId, token: session.token } }).catch(
    () => undefined,
  );
}
