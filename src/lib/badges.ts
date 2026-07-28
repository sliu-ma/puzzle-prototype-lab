// Badge-System — erweiterbar.
// Neue Badges hier eintragen und mit `awardBadge(id)` verleihen.

import badgeUnter60 from "@/assets/badge-unter60.svg.asset.json";

export type Badge = {
  id: string;
  title: string;
  description: string;
  /** Kurzer Hinweis, wie man das Badge bekommt (für die Übersicht). */
  criteria: string;
  imageUrl: string;
};

export const BADGES: Badge[] = [
  {
    id: "unter-60",
    title: "Unter 60 Minuten",
    description: "Das Hearing in weniger als einer Stunde bestanden.",
    criteria: "Löse alle Etappen und bestehe das Hearing in unter 60 Minuten.",
    imageUrl: badgeUnter60.url,
  },
];

const KEY_EARNED = "maya-badges-earned";

export function getEarnedBadges(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY_EARNED);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function hasBadge(id: string): boolean {
  return getEarnedBadges().has(id);
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
  try {
    const earned = getEarnedBadges();
    if (earned.has(id)) return;
    earned.add(id);
    localStorage.setItem(KEY_EARNED, JSON.stringify([...earned]));
    window.dispatchEvent(
      new CustomEvent("badge:earned", { detail: badge }),
    );
  } catch {
    /* ignore */
  }
}
