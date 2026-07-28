// Badge-System — erweiterbar.
// Neue Badges hier eintragen und mit `awardBadge(id)` verleihen.

import badgeUnter60 from "@/assets/badge-unter60.svg.asset.json";
import badgeWenigeHinweise from "@/assets/badge-wenige-hinweise.svg.asset.json";
import badgeOhneHinweise from "@/assets/badge-ohne-hinweise.svg.asset.json";
import badgeEinkauf from "@/assets/badge-einkauf.svg.asset.json";

export type Badge = {
  id: string;
  title: string;
  description: string;
  /** Kurzer Hinweis, wie man das Badge bekommt (für die Übersicht). */
  criteria: string;
  imageUrl: string;
};

export type BadgeRecord = { id: string; earnedAt: string };

export const BADGES: Badge[] = [
  {
    id: "unter-60",
    title: "Blitzermittlerin",
    description:
      "Fall Thermika Ost in unter 60 Minuten geknackt — Maja hätte applaudiert.",
    criteria: "Bestehe das Hearing in weniger als 60 Minuten ab Spielstart.",
    imageUrl: badgeUnter60.url,
  },
  {
    id: "sparsame-hinweise",
    title: "Kalter Kaffee, klarer Kopf",
    description:
      "Fünf Etappen, kaum Tipps: Diese Ermittlerin liest zwischen den Zeilen.",
    criteria:
      "Nimm über alle fünf Etappen zusammen weniger als drei Hinweise in Anspruch.",
    imageUrl: badgeWenigeHinweise.url,
  },
  {
    id: "erstes-ohne-hinweise",
    title: "Solo-Spurensicherung",
    description:
      "Eine ganze Etappe im Alleingang gelöst — kein einziger Tipp aufgedeckt.",
    criteria: "Löse mindestens eine Etappe, ohne einen Hinweis aufzudecken.",
    imageUrl: badgeOhneHinweise.url,
  },
  {
    id: "erstversuch-konsum",
    title: "Perfekter Wocheneinkauf",
    description:
      "Korb gepackt, Kasse geklingelt — beim ersten Versuch alles richtig regional, saisonal und fair.",
    criteria:
      "Bestehe den Konsum-Fall (Etappe 2) beim allerersten Druck auf „Bezahlen“.",
    imageUrl: badgeEinkauf.url,
  },
];

const KEY_EARNED = "maya-badges-earned";

function readRecords(): BadgeRecord[] {
  try {
    const raw = localStorage.getItem(KEY_EARNED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Migration: früher nur ein Array von IDs.
    return parsed
      .map((entry) => {
        if (typeof entry === "string") {
          return { id: entry, earnedAt: new Date().toISOString() };
        }
        if (entry && typeof entry === "object" && typeof entry.id === "string") {
          return {
            id: entry.id,
            earnedAt:
              typeof entry.earnedAt === "string"
                ? entry.earnedAt
                : new Date().toISOString(),
          };
        }
        return null;
      })
      .filter(Boolean) as BadgeRecord[];
  } catch {
    return [];
  }
}

function writeRecords(records: BadgeRecord[]) {
  try {
    localStorage.setItem(KEY_EARNED, JSON.stringify(records));
  } catch {
    /* ignore */
  }
}

export function getEarnedBadgeRecords(): BadgeRecord[] {
  return readRecords();
}

export function getEarnedBadges(): Set<string> {
  return new Set(readRecords().map((r) => r.id));
}

export function hasBadge(id: string): boolean {
  return getEarnedBadges().has(id);
}

export function getBadgeEarnedAt(id: string): Date | null {
  const rec = readRecords().find((r) => r.id === id);
  if (!rec) return null;
  const d = new Date(rec.earnedAt);
  return isNaN(d.getTime()) ? null : d;
}

export function getBadge(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

/**
 * Verleiht ein Badge. Idempotent — feuert nur beim ersten Mal
 * ein `badge:earned`-Event mit dem Badge-Objekt als `detail`.
 */
export function awardBadge(id: string) {
  if (typeof window === "undefined") return;
  const badge = getBadge(id);
  if (!badge) return;
  const records = readRecords();
  if (records.some((r) => r.id === id)) return;
  records.push({ id, earnedAt: new Date().toISOString() });
  writeRecords(records);
  window.dispatchEvent(new CustomEvent("badge:earned", { detail: badge }));
}

/**
 * Summiert die aufgedeckten Hinweise über alle fünf Etappen.
 */
export function getTotalHintsUsed(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  for (let i = 1; i <= 5; i++) {
    try {
      const raw = localStorage.getItem(`akte-00${i}-hints-start-revealed`);
      if (!raw) continue;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) total += arr.length;
    } catch {
      /* ignore */
    }
  }
  return total;
}

/**
 * Anzahl aufgedeckter Hinweise für eine einzelne Etappe (1–5).
 */
export function getStageHintsUsed(stage: number): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(`akte-00${stage}-hints-start-revealed`);
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Verleiht das „Ohne Hinweise"-Badge, wenn die angegebene Etappe
 * ohne einen einzigen aufgedeckten Hinweis gelöst wurde. Idempotent.
 */
export function tryAwardNoHintStage(stage: number) {
  if (getStageHintsUsed(stage) === 0) {
    awardBadge("erstes-ohne-hinweise");
  }
}
