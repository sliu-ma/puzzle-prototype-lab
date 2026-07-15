// Achievement system — 14 badges, unlockable via localStorage, toast on unlock.
import { toast } from "sonner";

import badgeBlitz from "@/assets/badges/blitzermittler.png";
import badgePunkt from "@/assets/badges/punktlandung.png";
import badgeMarathon from "@/assets/badges/marathon.png";
import badgeSprinter from "@/assets/badges/sprinter.png";
import badgeSolo from "@/assets/badges/solo-detektiv.png";
import badgeKopf from "@/assets/badges/kopf-statt-karte.png";
import badgeGenug from "@/assets/badges/genuegsam.png";
import badgeWelt from "@/assets/badges/weltreisende.png";
import badgeGruen from "@/assets/badges/gruener-daumen.png";
import badgeOrni from "@/assets/badges/ornitholog.png";
import badgeEnergie from "@/assets/badges/energie-champion.png";
import badgeRecall from "@/assets/badges/perfect-recall.png";
import badgeNeugier from "@/assets/badges/neugierig.png";
import badgeZurueck from "@/assets/badges/zurueckgeblickt.png";

export type AchievementId =
  | "blitzermittler"
  | "punktlandung"
  | "marathon"
  | "sprinter"
  | "solo-detektiv"
  | "kopf-statt-karte"
  | "genuegsam"
  | "weltreisende"
  | "gruener-daumen"
  | "ornitholog"
  | "energie-champion"
  | "perfect-recall"
  | "neugierig"
  | "zurueckgeblickt";

export type Achievement = {
  id: AchievementId;
  titel: string;
  beschreibung: string;
  badge: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "blitzermittler", titel: "Blitzermittler:in", beschreibung: "Spiel unter 60 Minuten abgeschlossen.", badge: badgeBlitz },
  { id: "punktlandung", titel: "Punktlandung", beschreibung: "In den letzten 5 Minuten fertig geworden.", badge: badgePunkt },
  { id: "marathon", titel: "Marathonläufer:in", beschreibung: "Das Spiel bis zum Ende durchgezogen.", badge: badgeMarathon },
  { id: "sprinter", titel: "Sprinter:in", beschreibung: "Eine Etappe in unter 5 Minuten gelöst.", badge: badgeSprinter },
  { id: "solo-detektiv", titel: "Solo-Detektiv:in", beschreibung: "Gesamtes Spiel ohne einen einzigen Hinweis.", badge: badgeSolo },
  { id: "kopf-statt-karte", titel: "Kopf statt Karte", beschreibung: "Eine Etappe komplett ohne Hinweis gelöst.", badge: badgeKopf },
  { id: "genuegsam", titel: "Genügsam", beschreibung: "Maximal 3 Hinweise im ganzen Spiel genutzt.", badge: badgeGenug },
  { id: "weltreisende", titel: "Weltreisende:r", beschreibung: "Optimale Route in Etappe 1 auf Anhieb gefunden.", badge: badgeWelt },
  { id: "gruener-daumen", titel: "Grüner Daumen", beschreibung: "Warenkorb im ersten Versuch korrekt.", badge: badgeGruen },
  { id: "ornitholog", titel: "Ornitholog:in", beschreibung: "Kreuzotter-Code im ersten Versuch geknackt.", badge: badgeOrni },
  { id: "energie-champion", titel: "Energiespar-Champion", beschreibung: "Über 4'000 ESP erreicht.", badge: badgeEnergie },
  { id: "perfect-recall", titel: "Perfect Recall", beschreibung: "Alle 10 Fragen im Finale auf Anhieb richtig.", badge: badgeRecall },
  { id: "neugierig", titel: "Neugierig", beschreibung: "Jedes Produkt im Dorfladen mindestens einmal geöffnet.", badge: badgeNeugier },
  { id: "zurueckgeblickt", titel: "Zurückgeblickt", beschreibung: "Alle abgeschlossenen Etappen im Rückblick nochmals geöffnet.", badge: badgeZurueck },
];

const KEY_UNLOCKED = "maya-achievements";
const KEY_HINT_STAGE = "maya-hint-stage-";        // + stage n → "1" if hint revealed
const KEY_WRONG_STAGE = "maya-wrong-stage-";      // + stage n → "1" if wrong attempt happened
const KEY_STAGE_COMPLETE_TS = "maya-stage-complete-ts-"; // + n → timestamp
const KEY_PRODUCTS_OPENED = "maya-products-opened"; // JSON array of ids
const KEY_REVIEW_OPENED = "maya-review-opened";     // JSON array of stage numbers

function safeGetJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSetJSON(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}

export function getUnlocked(): Record<AchievementId, number> {
  return safeGetJSON<Record<AchievementId, number>>(KEY_UNLOCKED, {} as Record<AchievementId, number>);
}

export function isUnlocked(id: AchievementId): boolean {
  return !!getUnlocked()[id];
}

export function getUnlockedIds(): AchievementId[] {
  const map = getUnlocked();
  return (Object.keys(map) as AchievementId[]).filter((k) => !!map[k]);
}

export function unlock(id: AchievementId): boolean {
  if (typeof window === "undefined") return false;
  const map = getUnlocked();
  if (map[id]) return false;
  map[id] = Date.now();
  safeSetJSON(KEY_UNLOCKED, map);
  const meta = ACHIEVEMENTS.find((a) => a.id === id);
  if (meta) {
    try {
      toast.success(`🏅 Badge freigeschaltet: ${meta.titel}`, {
        description: meta.beschreibung,
        duration: 6000,
      });
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new Event("maya-achievements"));
  return true;
}

// --- Trackers -----------------------------------------------------------

/** Signal: Hinweis wurde in Etappe n aufgedeckt. Blockiert "kopf-statt-karte" für diese Etappe. */
export function markHintRevealed(stage: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY_HINT_STAGE + stage, "1");
  } catch { /* ignore */ }
}
export function hintUsedInStage(stage: number): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(KEY_HINT_STAGE + stage) === "1"; } catch { return false; }
}

/** Signal: Fehlversuch in Etappe n. Blockiert die First-Try-Achievements. */
export function markWrongAttempt(stage: number) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY_WRONG_STAGE + stage, "1"); } catch { /* ignore */ }
}
export function hadWrongAttempt(stage: number): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(KEY_WRONG_STAGE + stage) === "1"; } catch { return false; }
}

/** Wird von completeStage aufgerufen: Timestamp pro Etappe einfrieren. */
export function markStageComplete(stage: number) {
  if (typeof window === "undefined") return;
  try {
    const k = KEY_STAGE_COMPLETE_TS + stage;
    if (!localStorage.getItem(k)) localStorage.setItem(k, String(Date.now()));
  } catch { /* ignore */ }
}
export function getStageCompleteTs(stage: number): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_STAGE_COMPLETE_TS + stage);
    return raw ? parseInt(raw, 10) : null;
  } catch { return null; }
}

/** Produkt-Öffnung im Dorfladen tracken. */
export function markProductOpened(id: string) {
  const arr = safeGetJSON<string[]>(KEY_PRODUCTS_OPENED, []);
  if (!arr.includes(id)) {
    arr.push(id);
    safeSetJSON(KEY_PRODUCTS_OPENED, arr);
  }
}
export function getOpenedProducts(): string[] {
  return safeGetJSON<string[]>(KEY_PRODUCTS_OPENED, []);
}

/** Rückblick-Öffnung tracken. */
export function markReviewOpened(stage: number) {
  const arr = safeGetJSON<number[]>(KEY_REVIEW_OPENED, []);
  if (!arr.includes(stage)) {
    arr.push(stage);
    safeSetJSON(KEY_REVIEW_OPENED, arr);
  }
}
export function getReviewOpened(): number[] {
  return safeGetJSON<number[]>(KEY_REVIEW_OPENED, []);
}

// --- Check helpers ------------------------------------------------------

/** Etappen-Achievements prüfen, wenn eine Etappe abgeschlossen wird. */
export function checkStageAchievements(stage: number) {
  // kopf-statt-karte: any stage completed without a revealed hint
  if (!hintUsedInStage(stage)) {
    unlock("kopf-statt-karte");
  }
  // sprinter: this stage completed within 5 min from previous stage's completion (or game start for stage 1)
  const nowTs = Date.now();
  let prevTs: number | null = null;
  if (stage === 1) {
    try {
      const raw = localStorage.getItem("maya-start-ts");
      prevTs = raw ? parseInt(raw, 10) : null;
    } catch { prevTs = null; }
  } else {
    prevTs = getStageCompleteTs(stage - 1);
  }
  if (prevTs && nowTs - prevTs < 5 * 60_000) {
    unlock("sprinter");
  }
  markStageComplete(stage);
}

/** Prüfe alle Endspiel-Achievements. Wird beim erfolgreichen Finale ausgelöst. */
export function checkFinishAchievements(opts: {
  totalHints: number;
  perfectFinale: boolean;
  allProductsCount: number;
  totalStages: number;
}) {
  unlock("marathon");

  // Zeit-basiert
  try {
    const startRaw = localStorage.getItem("maya-start-ts");
    if (startRaw) {
      const start = parseInt(startRaw, 10);
      const elapsedMin = (Date.now() - start) / 60_000;
      if (elapsedMin < 60) unlock("blitzermittler");
      // Punktlandung: in den letzten 5 min (>= 85 min elapsed, max 90)
      if (elapsedMin >= 85 && elapsedMin <= 90) unlock("punktlandung");
    }
  } catch { /* ignore */ }

  // Hinweise
  if (opts.totalHints === 0) unlock("solo-detektiv");
  if (opts.totalHints <= 3) unlock("genuegsam");

  // Finale
  if (opts.perfectFinale) unlock("perfect-recall");

  // Neugierig
  const opened = getOpenedProducts();
  if (opts.allProductsCount > 0 && opened.length >= opts.allProductsCount) {
    unlock("neugierig");
  }

  // Zurückgeblickt: alle abgeschlossenen Etappen im Rückblick geöffnet
  const rev = getReviewOpened();
  if (opts.totalStages > 0 && rev.length >= opts.totalStages) {
    unlock("zurueckgeblickt");
  }
}

/** Wird von resetAll aufgerufen. */
export function resetAchievements() {
  if (typeof window === "undefined") return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k === KEY_UNLOCKED || k === KEY_PRODUCTS_OPENED || k === KEY_REVIEW_OPENED) {
        toRemove.push(k);
      } else if (
        k.startsWith(KEY_HINT_STAGE) ||
        k.startsWith(KEY_WRONG_STAGE) ||
        k.startsWith(KEY_STAGE_COMPLETE_TS)
      ) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}
