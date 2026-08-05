// Lehrer-Passwort nur für die aktuelle Browser-Sitzung merken, damit die
// Rundenseiten nicht bei jedem Wechsel neu nach dem Passwort fragen.
const KEY = "maya-teacher-pw";

export function getTeacherPassword(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function setTeacherPassword(pw: string) {
  try {
    window.sessionStorage.setItem(KEY, pw);
  } catch {
    /* ignore */
  }
}

export function clearTeacherPassword() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export const STATUS_LABEL: Record<string, string> = {
  lobby: "Lobby",
  running: "läuft",
  closed: "abgeschlossen",
};
