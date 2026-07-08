## Ziel

Alle gelösten Etappen bleiben in der Übersicht anklickbar. Beim erneuten Öffnen sehen die Schüler:innen ihre eigenen Antworten, Auswahl, aufgedeckten Faktenkarten und den erreichten Story-Stand wieder — nichts geht verloren.

## Ansatz

Ein kleiner `**usePersistentState**`-Hook (in `src/lib/persist.ts`), der wie `useState` funktioniert, aber Wert automatisch in `localStorage` unter einem festen Key spiegelt und beim Mount wiederherstellt. Alle relevanten `useState`-Aufrufe in den Etappen-Komponenten werden auf diesen Hook umgestellt. Dadurch wird pro Etappe der vollständige Zustand persistent:

- Schritt/Step (`brief` → `naechstes`), bereits freigeschaltete Steps
- Alle Antworten & Eingaben (Start/Ziel, Route-Auswahl, Ofen/Beleuchtung-Optionen usw.)
- Aufgedeckte Faktenkarten, geöffnete Hinweise
- Story-/Modal-Zustände, die den Fortschritt widerspiegeln

Keys werden pro Etappe präfigiert (`akte-1-*`, `akte-2-*` …), sodass ein Reset über die bestehende `resetAll()`-Logik weiterhin alles löscht (sie räumt bereits `maya-*` und `akte-*` auf).

## Übersicht (Startseite)

`ProgressPanel` rendert gelöste Etappen (`status === "done"`) neu als anklickbaren `Link` statt statischer `div`:

- Grüne Umrandung + `CheckCircle2` bleiben, aber die ganze Zeile ist ein Link zur Etappe.
- „Aktuell“ und „Gesperrt“ bleiben unverändert.

## Etappen-Seite (Wiederansicht)

`StageGate` erlaubt bereits den Zugriff, wenn `current >= stage` — an der Zugriffsregel ändert sich nichts. Zwei kleine Ergänzungen:

- Wenn `current > stage` (Etappe schon abgeschlossen), zeigt die Seite oben einen dezenten Hinweisstreifen: „Rückblick · Etappe X abgeschlossen · Ihr könnt eure Antworten nochmals ansehen.“
- Das `QRGate` (Scanner-Sperre) merkt sich bereits per `storageKey`, dass gescannt wurde — beim Wiederbesuch entfällt das Scannen also automatisch.

## Technische Details

- Neue Datei `src/lib/persist.ts`
  - `usePersistentState<T>(key, initial)` — SSR-sicher (Wert-Init im `useEffect`), JSON-serialisiert, feuert `maya-progress` bei Reset nicht, damit die Übersicht ruhig bleibt.
  - `usePersistentSet<T>(key, initial)` als dünner Wrapper für die `Set<Step>`-Fälle (JSON-Array-Serialisierung).
- Etappen 1–5 (`src/routes/etappe-{1..5}.tsx`):
  - `useState`-Aufrufe für Step, Fehler-Meldungen (Fehler nicht persistieren), Antworten, `selectedRouteId`, `unlockedSteps`, `openFact`-artige Flags werden gezielt auf `usePersistentState` umgestellt (Fehler & rein visuelle Modal-States bleiben `useState`).
  - Keys: `akte-1-step`, `akte-1-unlocked-steps`, `akte-1-start`, `akte-1-ziel`, `akte-1-route`, analog für 2–5.
- `EnergyGame` (`choices`) und `GruenerMarkt` (Auswahl/geöffnete Faktenkarten) bekommen ebenfalls persistente Keys — der `Reset`-Button dort setzt weiterhin lokal zurück und schreibt den Default in den Storage.
- `HintSystem`: geöffnete Hinweise werden persistiert (`akte-<n>-hints-open`), sodass der Rückblick den Stand zeigt.
- `finale.tsx`: gleiche Behandlung für die Finale-Antworten, damit der Hearing-Stand konservierbar ist.
- `src/lib/progress.ts`: keine strukturelle Änderung; `resetAll()` deckt die neuen Keys durch das bestehende `akte-`/`maya-`-Präfix bereits ab.
- `src/routes/index.tsx`: „done“-Zeilen als `<Link to={s.to}>` mit gleichem Styling, plus Mikrotext „Nochmals ansehen →“.

## Nicht Teil dieses Plans

- Kein Backend / Lovable Cloud — bleibt bewusst lokal (localStorage), da das Spiel geräte-lokal läuft und ein Reset bereits alles löscht.
- Keine Änderung an Aufgaben-Logik, Design-Tokens oder Textinhalten.
- Kein separater Rückblick-Screen — bewusst in die bestehende Übersicht integriert, wie gewünscht.

## Ablauf der Umsetzung

1. `src/lib/persist.ts` anlegen.
2. `src/routes/index.tsx`: „done“-Etappen anklickbar machen.
3. `StageGate` um Rückblick-Banner ergänzen.
4. Etappen 1–5 + Finale + `EnergyGame` + `GruenerMarkt` + `HintSystem` auf persistente States umstellen.
5. Typecheck + kurzer Browser-Sanity-Check (Etappe 1 lösen, zurück zur Übersicht, erneut öffnen — Route-Auswahl noch vorhanden).