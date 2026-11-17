// Kleiner Vermittler, damit sich Vollbild-Overlays nicht überlagern.
// Aktuell meldet nur das Badge-Overlay seinen Zustand.

export const BADGE_OVERLAY = "badge:overlay";

let badgeOpen = false;

export function setBadgeOverlayOpen(open: boolean) {
  if (badgeOpen === open) return;
  badgeOpen = open;
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BADGE_OVERLAY, { detail: { open } }));
}

export function isBadgeOverlayOpen() {
  return badgeOpen;
}

// Während der Wissenscheck offen ist, warten Badge-Overlays.
export const FACT_CHECK = "factcheck:open";
let factCheckOpen = false;
export function setFactCheckOpen(open: boolean) {
  if (factCheckOpen === open) return;
  factCheckOpen = open;
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FACT_CHECK, { detail: { open } }));
}
export function isFactCheckOpen() {
  return factCheckOpen;
}
