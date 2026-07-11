## Ziel
Sobald die Spielenden das Spiel erfolgreich abschliessen (Outro / Hearing bestanden, Stage 7), wird der 90-Minuten-Timer eingefroren. Der Countdown läuft nicht mehr weiter, das Time-Up-Overlay kann nicht mehr auslösen, und Maja-Popups erscheinen nicht mehr.

## Änderungen

**`src/lib/progress.ts`**
- Neue Konstante `KEY_END_TS` (`"maya-end-ts"`).
- Neue Funktion `finishGame()`: schreibt `Date.now()` in `KEY_END_TS` (nur beim ersten Mal), dispatched `maya-progress`.
- Neue Funktion `getEndTs(): number | null`.
- `isTimeUp()` gibt `false` zurück, sobald `getEndTs()` gesetzt ist.
- `resetAll()` entfernt auch `maya-end-ts` (bereits durch `maya-*`-Prefix abgedeckt — verifizieren).

**`src/components/case-file/GlobalTimer.tsx`**
- `endTs` aus `getEndTs()` mit gleicher Sync-Logik wie `startTs` lesen.
- Wenn `endTs` gesetzt: `now` auf `endTs` klemmen → `remaining` bleibt konstant, kein Overlay, keine neuen Beats.
- Interval stoppen, sobald `endTs` gesetzt ist (Performance).
- Optische Kennzeichnung: Timer-Chip in ruhiger Farbe (border-border) + kleines Häkchen/„Fertig" Label statt Uhr, damit klar ist, dass die Zeit gestoppt wurde.

**Aufruf von `finishGame()`**
- In `src/routes/finale.tsx` beim Übergang zum Outro (dort wo `completeStage(6)` bereits läuft, bzw. beim Erreichen von Stage 7). Genaue Stelle wird beim Umsetzen aus der Datei gelesen — Trigger ist das erfolgreiche Beenden des Hearings / Anzeige des `OutroScreen`.

## Verhalten nach Abschluss
- Timer-Anzeige bleibt sichtbar mit der Endzeit (z. B. „⏱ 42:17 · Fertig"), läuft nicht weiter.
- `TimeUpOverlay` wird nicht mehr getriggert, auch wenn die Seite nach 90 min erneut geöffnet wird.
- Bei „Neues Spiel" (`resetAll`) wird auch der End-Zeitstempel gelöscht.
