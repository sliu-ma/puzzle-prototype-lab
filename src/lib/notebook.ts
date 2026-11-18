/** Jakobs Notizbuch: freigeschaltete Etappen (über Prüffragen) + eigene Notizen. */
import { isFactCheckPassed } from "@/lib/fact-checks";

export const STAGE_NAMES: Record<number, string> = {
  1: "Mobilität", 2: "Konsum", 3: "Wohnen", 4: "Biodiversität", 5: "Energie",
};
const NOTES_KEY = "maya-notebook-notes";
export const NOTEBOOK_EVENT = "maya-notebook";

export function getUnlockedStages(): number[] {
  return [1, 2, 3, 4, 5].filter((s) => isFactCheckPassed(s));
}
/** Nach bestandenen Prüffragen: Notizbuch informieren (Toast + Puls). */
export function announceFactsCollected(stage: number) {
  try { window.dispatchEvent(new CustomEvent(NOTEBOOK_EVENT, { detail: { newStage: stage } })); } catch { /* ignore */ }
}
export function getNotes(): string {
  try { return localStorage.getItem(NOTES_KEY) ?? ""; } catch { return ""; }
}
export function setNotes(v: string) {
  try { localStorage.setItem(NOTES_KEY, v); } catch { /* ignore */ }
}
