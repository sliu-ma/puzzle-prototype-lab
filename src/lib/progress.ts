// Spielfortschritt (Team & Etappen), clientseitig in localStorage.
// Linearer Ablauf: currentStage gibt an, welche Etappe als nächstes freigeschaltet ist.
//   1 = Etappe 1 (Bahnhof)
//   2 = Etappe 2 (Dorfladen)
//   3 = Etappe 3 (Wald)
//   4 = Etappe 4 (Haus)
//   5 = Etappe 5 (Wasserkraftwerk)
//   6 = Finale (Hearing)
//   7 = Finale abgeschlossen

export const START_CODE = "OEKOLOGIE";

const KEY_TEAM = "maya-team-name";
const KEY_CODE = "maya-team-code";
const KEY_STAGE = "maya-current-stage";
export const KEY_START_TS = "maya-start-ts";
export const KEY_END_TS = "maya-end-ts";
export const TIMER_DURATION_MIN = 90;

export type StageInfo = {
  nr: number;
  to: "/etappe-1" | "/etappe-2" | "/etappe-3" | "/etappe-4" | "/etappe-5" | "/finale";
  ort: string;
  thema: string;
};

export const STAGES: StageInfo[] = [
  { nr: 1, to: "/etappe-1", ort: "Bahnhof", thema: "Mobilität" },
  { nr: 2, to: "/etappe-2", ort: "Dorfladen", thema: "Konsum" },
  { nr: 3, to: "/etappe-3", ort: "Wald-Lichtung", thema: "Biodiversität" },
  { nr: 4, to: "/etappe-4", ort: "Elviras Haus", thema: "Wohnen" },
  { nr: 5, to: "/etappe-5", ort: "Wasserkraftwerk", thema: "Energie" },
  { nr: 6, to: "/finale", ort: "Gemeindesaal", thema: "Finale" },
];

export function getTeam(): { name: string; code: string } | null {
  try {
    const name = localStorage.getItem(KEY_TEAM);
    const code = localStorage.getItem(KEY_CODE);
    if (!name || !code) return null;
    return { name, code };
  } catch {
    return null;
  }
}

export function registerTeam(name: string, code: string) {
  try {
    localStorage.setItem(KEY_TEAM, name.trim());
    localStorage.setItem(KEY_CODE, code.trim());
    if (!localStorage.getItem(KEY_STAGE)) {
      localStorage.setItem(KEY_STAGE, "1");
    }
    if (!localStorage.getItem(KEY_START_TS)) {
      localStorage.setItem(KEY_START_TS, String(Date.now()));
    }
    window.dispatchEvent(new Event("maya-progress"));
  } catch {
    /* ignore */
  }
}

export function getStartTs(): number | null {
  try {
    const v = localStorage.getItem(KEY_START_TS);
    if (!v) return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function getEndTs(): number | null {
  try {
    const v = localStorage.getItem(KEY_END_TS);
    if (!v) return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Markiert das Spiel als beendet und friert damit den Timer ein. */
export function finishGame() {
  try {
    if (!localStorage.getItem(KEY_END_TS)) {
      localStorage.setItem(KEY_END_TS, String(Date.now()));
      window.dispatchEvent(new Event("maya-progress"));
    }
  } catch {
    /* ignore */
  }
}


// ---- Adaptive Zeit-Helfer ---------------------------------------------------
export function formatClock(d: Date): string {
  return d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
}

/** Aktuelle Uhrzeit im Format "HH:MM". */
export function getNowClock(): string {
  return formatClock(new Date());
}

/** Uhrzeit, zu der das Hearing endet (Start + 90 min). Null falls kein Start. */
export function getHearingClock(): string | null {
  const ts = getStartTs();
  if (!ts) return null;
  return formatClock(new Date(ts + TIMER_DURATION_MIN * 60_000));
}

/** True, wenn die 90 Minuten seit Registrierung abgelaufen sind. */
export function isTimeUp(): boolean {
  if (getEndTs()) return false;
  const ts = getStartTs();
  if (!ts) return false;
  return Date.now() >= ts + TIMER_DURATION_MIN * 60_000;
}

/**
 * Einmalig eingefrorene Uhrzeit pro Schlüssel (localStorage).
 * Beim ersten Aufruf wird die aktuelle Zeit gespeichert und
 * bei weiteren Aufrufen zurückgegeben, so bleibt ein Zeitstempel
 * in einer Akte stabil, auch wenn die Karte erneut geöffnet wird.
 */
export function getFrozenClock(key: string): string {
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const now = getNowClock();
    localStorage.setItem(key, now);
    return now;
  } catch {
    return getNowClock();
  }
}



export function getCurrentStage(): number {
  try {
    const s = parseInt(localStorage.getItem(KEY_STAGE) ?? "0", 10);
    return Number.isFinite(s) && s > 0 ? s : 0;
  } catch {
    return 0;
  }
}

const stageDoneKey = (n: number) => `maya-stage-${n}-done-ts`;

export function completeStage(n: number) {
  try {
    if (!localStorage.getItem(stageDoneKey(n))) {
      localStorage.setItem(stageDoneKey(n), String(Date.now()));
    }
    const current = getCurrentStage();
    if (n + 1 > current) {
      localStorage.setItem(KEY_STAGE, String(n + 1));
      window.dispatchEvent(new Event("maya-progress"));
    }
  } catch {
    /* ignore */
  }
}

/** Zeitstempel, wann Etappe n abgeschlossen wurde (null falls unbekannt). */
export function getStageDoneTs(n: number): number | null {
  try {
    const v = localStorage.getItem(stageDoneKey(n));
    if (!v) return null;
    const parsed = parseInt(v, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Dauer einer Etappe in Minuten: Zeit zwischen dem Abschluss der
 * Vor-Etappe (bzw. Spielstart) und dem Abschluss dieser Etappe.
 * Null, wenn keine Zeitstempel vorliegen (ältere Spielstände).
 */
export function getStageDurationMin(n: number): number | null {
  const done = getStageDoneTs(n);
  if (!done) return null;
  const prev = n > 1 ? getStageDoneTs(n - 1) : null;
  const from = prev ?? getStartTs();
  if (!from || done <= from) return null;
  return Math.max(1, Math.round((done - from) / 60_000));
}

/** Verbleibende Millisekunden der 90-Minuten-Frist (0 falls abgelaufen). */
export function getRemainingMs(): number | null {
  const start = getStartTs();
  if (!start) return null;
  const deadline = start + TIMER_DURATION_MIN * 60_000;
  const ref = getEndTs() ?? Date.now();
  return Math.max(0, deadline - ref);
}

/** "MM:SS" bzw. "H:MM:SS" für die verbleibende Zeit. */
export function formatRemaining(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function resetAll() {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith("maya-") || k.startsWith("akte-")) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event("maya-progress"));
  } catch {
    /* ignore */
  }
}

