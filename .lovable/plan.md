## Ziel

Hinweise werden nicht mehr automatisch angezeigt, sobald sie freigeschaltet sind. Stattdessen sehen die Schüler:innen im Panel eine Aufforderung („Du kannst dir den ersten Hinweis anschauen. Klicke auf das Schloss.") und müssen aktiv auf das Schloss klicken, um den jeweiligen Hinweis zu enthüllen. Zusätzlich wird im Outro neben der benötigten Zeit auch die Anzahl der insgesamt genutzten Hinweise angezeigt.

## Änderungen

### 1. `src/components/case-file/HintSystem.tsx`
- Neuer State `revealed: Set<number>` — welche Hinweise die Schüler:innen tatsächlich aufgedeckt haben. Persistiert unter `${storageKey}-revealed` in `localStorage`.
- Verhalten pro Tab / Hinweis:
  - **Gesperrt** (Zeit noch nicht erreicht): Schloss + „Noch gesperrt" (wie bisher).
  - **Freigeschaltet, aber nicht aufgedeckt**: großes Schloss-Icon + Text „Du kannst dir {Label} anschauen. Klicke auf das Schloss." + Button „Hinweis aufdecken".
  - **Aufgedeckt**: Titel + Body (wie heute).
- Der Badge auf dem Floating Button zählt weiterhin freigeschaltete Hinweise (damit Schüler:innen wissen, dass etwas verfügbar ist), Farbwechsel bleibt.
- Tab-Icons: 🔒 gesperrt, 🔓 freigeschaltet, ✅ (oder gefüllt) aufgedeckt — kleiner visueller Fortschritt.
- Beim Öffnen springt der aktive Tab auf den neuesten freigeschalteten, aber noch nicht aufgedeckten Hinweis (fallback: letzter aufgedeckter).

### 2. Gemeinsamer Zähler
- In `HintSystem.tsx` neue exportierte Konstante `HINT_STORAGE_KEYS` mit den fünf Storage-Keys der Etappen:
  ```
  akte-001, akte-002, akte-003, akte-004, akte-005 → jeweils `-hints-start-revealed`
  ```
- Exportierte Hilfsfunktion `getTotalRevealedHints(): number`, die alle fünf Keys aus `localStorage` liest und die Größen der Sets summiert.

### 3. `src/routes/finale.tsx` — `OutroScreen` (Schluss-Karte)
- Zusätzlich zur „Benötigte Zeit"-Kachel eine zweite kleine Statistik-Kachel „Genutzte Hinweise" mit `getTotalRevealedHints()` von 0–15.
- Layout: zwei Kacheln nebeneinander (auf Mobile untereinander), gleiches Design wie die bestehende Zeit-Kachel, andere Akzentfarbe (z. B. `amber`), Icon `Lightbulb` (lucide).

## Nicht ändern

- Freischaltzeiten (3 / 6 / 9 Min.) und Storage-Keys der Etappen bleiben.
- Restlicher Text im Outro, Intro, Timer, Reset-Verhalten (`resetAll` räumt bereits per Präfix auf — `-revealed`-Keys werden mit den bestehenden `-hints-start`-Keys nicht automatisch entfernt; ich erweitere `resetAll` in `src/lib/progress.ts` um die fünf zusätzlichen `-revealed`-Keys, damit ein Reset sauber bleibt).