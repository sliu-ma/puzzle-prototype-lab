// Spielfortschritt (Team & Etappen) – clientseitig in localStorage.
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
export const TIMER_DURATION_MIN = 90;

export type StageInfo = {
  nr: number;
  to: "/akte-003" | "/akte" | "/akte-002" | "/akte-004" | "/akte-005" | "/finale";
  ort: string;
  thema: string;
};

export const STAGES: StageInfo[] = [
  { nr: 1, to: "/akte-003", ort: "Bahnhof", thema: "Mobilität" },
  { nr: 2, to: "/akte", ort: "Dorfladen", thema: "Konsum" },
  { nr: 3, to: "/akte-002", ort: "Wald-Lichtung", thema: "Biodiversität" },
  { nr: 4, to: "/akte-004", ort: "Elviras Haus", thema: "Wohnen" },
  { nr: 5, to: "/akte-005", ort: "Wasserkraftwerk", thema: "Energie" },
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

export function getCurrentStage(): number {
  try {
    const s = parseInt(localStorage.getItem(KEY_STAGE) ?? "0", 10);
    return Number.isFinite(s) && s > 0 ? s : 0;
  } catch {
    return 0;
  }
}

export function completeStage(n: number) {
  try {
    const current = getCurrentStage();
    if (n + 1 > current) {
      localStorage.setItem(KEY_STAGE, String(n + 1));
      window.dispatchEvent(new Event("maya-progress"));
    }
  } catch {
    /* ignore */
  }
}

export function resetAll() {
  try {
    localStorage.removeItem(KEY_TEAM);
    localStorage.removeItem(KEY_CODE);
    localStorage.removeItem(KEY_STAGE);
    // QR-Unlocks ebenfalls löschen, damit eine neue Klasse sauber starten kann
    [
      "akte-001-unlocked",
      "akte-002-unlocked",
      "akte-003-unlocked",
      "akte-004-unlocked",
      "akte-005-unlocked",
    ].forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event("maya-progress"));
  } catch {
    /* ignore */
  }
}
