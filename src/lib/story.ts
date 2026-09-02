// Gemeinsame Story-Bausteine für Briefing (Handy) und Lehreransicht (Beamer).
import prologueAsset from "@/assets/vorgeschichte.mp4.asset.json";

export const PROLOGUE_VIDEO_URL: string = prologueAsset.url;
export const PROLOGUE_TITLE = "Die Vorgeschichte";
export const PROLOGUE_SUBTITLE = "Maja, Jakob und das Versprechen an der Lichtung";

/** Heutiges Datum minus ein Jahr, ausgeschrieben (z. B. «7. August 2025»). */
export function prologueIntroDate(now: Date = new Date()) {
  const d = new Date(now);
  d.setFullYear(d.getFullYear() - 1);
  return d.toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const PROLOGUE_INTRO_PLACE = "An einer Lichtung mitten im Wald";
export const PROLOGUE_OUTRO_TEXT =
  "Wenige Monate später starb Jakob nach kurzer Krankheit.";

/** Rückkehr-Befehl am Rundenende: erscheint auf allen Handys. */
export const RETURN_TITLE = "Zurück zur Schule";
export const RETURN_NOTICE = "Kehrt zurück zur Schule! In 10 Minuten geht es weiter.";
export const RETURN_BANNER = "Kehrt zurück zur Schule – in 10 Minuten geht es weiter.";
