# Rätsel-Rückblick: Lösungen speichern und wieder anschauen

## Ziel
Sobald ein Rätsel gelöst wird, werden Auswahl/Antworten der Schüler:innen im `localStorage` gespeichert. Am Ende (und optional jederzeit von der Startseite aus) können alle Rätsel erneut geöffnet werden — mit den gemachten Eingaben, aber im reinen Lese-/Review-Modus.

## Ansatz

### 1. Zentrale Speicher-Helfer (`src/lib/progress.ts`)
Neue kleine API ergänzen (keine bestehende Logik ändern):
- `saveSolution(stage, data)` — speichert unter `maya-solution-<stage>` als JSON, dispatched `maya-progress`.
- `getSolution<T>(stage)` — liest zurück (oder `null`).
- `resetAll()` löscht diese Keys mit (Prefix `maya-` erfasst sie bereits).

### 2. Rätsel-Komponenten schreiben ihre Lösung
Jeweils direkt bevor `completeStage(n)` läuft, `saveSolution(n, {...})` aufrufen:
- **Etappe 1 · Mobilität** (`RouteCards`/`etappe-1`): gewählte Route + evtl. Reihenfolge.
- **Etappe 2 · Dorfladen** (`GruenerMarkt`): finaler Warenkorb (Produkt-IDs + Mengen).
- **Etappe 3 · Wald** (`GutachtenRaetsel`): Zuordnungen / Antworten.
- **Etappe 4 · Haus** (`EnergyGame`): pro Gerät die gewählte Option.
- **Etappe 5 · Wasserkraftwerk**: gelöste Antwort/Code.
- **Finale**: Kernentscheidungen des Hearings.

Format pro Etappe klein und stabil (z. B. `{ v: 1, choices: {...} }`), damit spätere Änderungen migrierbar bleiben.

### 3. Review-Modus in den Rätsel-Komponenten
Neuer optionaler Prop `reviewMode?: boolean` (+ ggf. `initialSolution`):
- Alle Auswahl-Controls werden `disabled` / nicht-interaktiv.
- Kein `onErfolg`/`completeStage` mehr, keine Timer/Hints.
- Ein deutlicher Hinweis-Banner oben: „Rückblick — deine Lösung vom Spiel".

Die Etappen-Routes nehmen `reviewMode` aus einem Search-Param (`?review=1`) auf. Im Review-Modus:
- `StageGate` und `QRGate` werden übersprungen (freier Zugang zum Rückblick).
- Nur der Rätsel-Schritt wird gerendert (kein Brief/Weiter-Flow nötig — oder Brief bleibt zur Einbettung, ohne "Weiter").

### 4. Einstiegspunkte für den Rückblick
- **Auf der Startseite** (`src/routes/index.tsx`): Sektion „Rückblick" unter dem Fortschritt — pro abgeschlossener Etappe ein Link `/<etappe>?review=1`. Erscheint sobald mind. eine Lösung gespeichert ist.
- **Am Ende des Finales**: gleiche Liste als Abschluss-Sammlung („Schaut euch alle Rätsel nochmals an").

## Technische Details

- Storage-Keys: `maya-solution-1` … `maya-solution-6` (JSON, versioniert).
- `saveSolution` triggert `window.dispatchEvent(new Event("maya-progress"))`, damit Übersicht/Finale reaktiv aktualisieren.
- Search-Param via TanStack Router: `validateSearch: (s) => ({ review: s.review === "1" ? "1" : undefined })` pro Etappen-Route.
- `reviewMode` verhindert Nebeneffekte (kein `completeStage`, kein `saveSolution`, kein Timer-Reset, kein Envelope-Prompt zur nächsten Etappe).
- Backfill: Falls für eine bereits gelöste Etappe (noch) keine Solution gespeichert ist, wird der Review-Link leicht ausgegraut mit Hinweis „Keine gespeicherte Lösung — bitte Etappe erneut spielen".

## Umfang / Reihenfolge der Umsetzung
1. Helfer in `progress.ts` + Typen.
2. Alle fünf Rätsel-Komponenten: `reviewMode` einbauen + `saveSolution` beim Lösen.
3. Etappen-Routes: `?review=1` durchreichen, Gates im Review überspringen.
4. Übersicht auf Startseite + Abschluss-Liste im Finale.

Kein neuer Backend-Bedarf, alles clientseitig — passt zum bestehenden localStorage-Ansatz.
