## Ziel
Beim Hearing (`src/routes/finale.tsx`) soll das Gerät kurz vibrieren, wenn eine Antwort falsch ist — als haptisches Feedback zusätzlich zur visuellen Rückmeldung.

## Umsetzung
- In `src/routes/finale.tsx` an der Stelle, an der eine Antwort als falsch erkannt wird (Auswertung nach „Prüfen"), einen Aufruf `navigator.vibrate?.(...)` ergänzen.
- Vibrationsmuster: kurzes Doppel-Pulsieren, z. B. `[80, 60, 120]` (leichter, klar spürbarer Fehler-Buzz — nicht zu aggressiv).
- Feature-Guard: nur ausführen, wenn `typeof navigator !== "undefined" && "vibrate" in navigator`. Kein Fehler auf iOS Safari (dort ist die API nicht vorhanden — `?.` verhindert Crash, es passiert einfach nichts).
- Kein Vibrieren bei richtiger Antwort, kein Vibrieren im Review-Modus (nur beim tatsächlichen ersten Auswerten einer Antwort).

## Nicht enthalten
- Keine Änderung an Scoring, UI, Feedback-Text oder Barometer.
- Keine Vibration in anderen Etappen (nur Hearing, wie gewünscht).
