import { useEffect, useState } from "react";
import { MarketTutorial, type TutorialStep } from "./MarketTutorial";

const KEY = "maya-overview-tour-done";

const STEPS: { sel: string; text: string }[] = [
  { sel: "next", text: "Hier seht ihr euren nächsten Posten. Geht vor Ort und startet dort die Etappe." },
  { sel: "timer", text: "Die Uhr läuft bis zur Gemeinderatssitzung. Behaltet eure verbleibende Zeit im Blick." },
  { sel: "score", text: "Für gelöste Rätsel und schlaue Entscheidungen sammelt euer Team Punkte fürs Leaderboard." },
  { sel: "notebook", text: "In Jakobs Notizbuch findet ihr nach jeder gelösten Etappe neue Faktenkarten und eure eigenen Notizen." },
  { sel: "badges", text: "Hier sammelt ihr Abzeichen, zum Beispiel für hohes Tempo oder Genauigkeit." },
  { sel: "help", text: "Steckt ihr fest? Über den Hilfe-Knopf könnt ihr eurer Lehrperson direkt eine Nachricht schicken." },
];

/** Coach-Mark-Tour auf der Übersicht, einmalig nach dem Briefing. */
export function OverviewTour() {
  const [steps, setSteps] = useState<TutorialStep[] | null>(null);

  useEffect(() => {
    try { if (localStorage.getItem(KEY)) return; } catch { return; }
    const t = window.setTimeout(() => {
      const found = STEPS.flatMap(({ sel, text }) => {
        const el = document.querySelector<HTMLElement>(`[data-tour="${sel}"]`);
        return el ? [{ targetRef: { current: el }, text, padding: 6 }] : [];
      });
      if (found.length) setSteps(found);
    }, 600);
    return () => window.clearTimeout(t);
  }, []);

  const close = () => {
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setSteps(null);
  };

  return <MarketTutorial open={!!steps} steps={steps ?? []} onClose={close} />;
}
