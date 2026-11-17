// Majas Hearing-Notizen nach jedem Fachinput: Pool pro Etappe, pro Versuch werden 3 Aussagen gezogen.
export type FactStatement = { text: string; correct: boolean };

export const FACT_CHECK_DRAW = 3;

export const FACT_CHECKS: Record<number, FactStatement[]> = {
  1: [
    { text: "Zu den Vollkosten eines Autos gehören auch Versicherung, Parken und Reparaturen.", correct: true },
    { text: "Ein Zug transportiert im Schnitt so viele Personen wie 90 Autos.", correct: true },
    { text: "Fast die Hälfte aller Autofahrten in der Schweiz ist kürzer als 5 Kilometer.", correct: true },
    { text: "Die meisten Autofahrten in der Schweiz sind länger als 50 Kilometer.", correct: false },
    { text: "Zu den Autokosten gehört nur das Benzin.", correct: false },
    { text: "Der Verkehr verursacht in der Schweiz kaum Treibhausgase.", correct: false },
  ],
  2: [
    { text: "Regionale und saisonale Lebensmittel haben kürzere Transportwege.", correct: true },
    { text: "Zu viel einkaufen ist ein Grund für Food-Waste.", correct: true },
    { text: "Labels zeigen zum Beispiel faire Herstellung oder Umweltschutz an.", correct: true },
    { text: "Labels auf Verpackungen sagen nichts über ein Produkt aus.", correct: false },
    { text: "Importierte Ware hat immer kürzere Lagerzeiten als regionale.", correct: false },
    { text: "Ein abgelaufenes Haltbarkeitsdatum spielt beim Food-Waste keine Rolle.", correct: false },
  ],
  3: [
    { text: "Geräte der Klasse A brauchen wenig Strom.", correct: true },
    { text: "Wer Energie spart, spart auch Geld.", correct: true },
    { text: "Nebenkosten lassen sich durch Energiesparen um bis zu 30 % senken.", correct: true },
    { text: "Geräte der Klasse G sind die sparsamsten.", correct: false },
    { text: "Kleine Änderungen im Alltag bringen beim Energiesparen nichts.", correct: false },
    { text: "Energieetiketten zeigen, wie teuer ein Gerät im Laden ist.", correct: false },
  ],
  4: [
    { text: "Jede dritte untersuchte Art in der Schweiz ist gefährdet oder ausgestorben.", correct: true },
    { text: "Bedrohte Arten stehen auf der Roten Liste.", correct: true },
    { text: "Die Vielfalt der Arten sichert vieles, was wir zum Leben brauchen.", correct: true },
    { text: "Für den Rückgang der Biodiversität gibt es nur einen einzigen Grund.", correct: false },
    { text: "Die Vielfalt der Arten ist für unser Leben unwichtig.", correct: false },
    { text: "Auf der Roten Liste stehen die häufigsten Arten der Schweiz.", correct: false },
  ],
  5: [
    { text: "Erneuerbare Energien verursachen im Betrieb praktisch kein CO₂.", correct: true },
    { text: "Solar- und Windenergie machen die Schweiz unabhängiger von Importen.", correct: true },
    { text: "2024 war die Schweiz energetisch zu 68 Prozent vom Ausland abhängig.", correct: true },
    { text: "2023 stammten bereits rund 90 Prozent der Energie aus erneuerbaren Quellen.", correct: false },
    { text: "Die Schweiz ist energetisch kaum vom Ausland abhängig.", correct: false },
    { text: "Alle Energiequellen verursachen gleich viel CO₂ pro Kilowattstunde.", correct: false },
  ],
};

/** Zieht zufällig `n` Aussagen; vermeidet nach Möglichkeit die zuletzt gezeigten. */
export function drawStatements(pool: FactStatement[], n = FACT_CHECK_DRAW, avoid: FactStatement[] = [], rnd = Math.random): FactStatement[] {
  const shuffle = <T,>(a: T[]) => {
    const c = [...a];
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  };
  const fresh = shuffle(pool.filter((s) => !avoid.includes(s)));
  const rest = shuffle(pool.filter((s) => avoid.includes(s)));
  return [...fresh, ...rest].slice(0, Math.min(n, pool.length));
}

const key = (stage: number) => `maya-fact-check-${stage}-passed`;
export function isFactCheckPassed(stage: number) {
  try { return localStorage.getItem(key(stage)) === "1"; } catch { return false; }
}
export function markFactCheckPassed(stage: number) {
  try { localStorage.setItem(key(stage), "1"); } catch { /* ignore */ }
}
