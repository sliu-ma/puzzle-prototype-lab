# Siegel beim Hearing

## Ziel
Das Hearing findet im Schulzimmer statt (nicht im Gemeindesaal) und erhält ein offizielles Siegel im Field-Notes-Look.

## Änderungen in `src/routes/finale.tsx`

1. **Ortsangabe anpassen**
   - Kopfzeile: „Gemeindesaal Widnau · 19:00 Uhr" wird zu „Schulzimmer · 19:00 Uhr" (Uhrzeit bleibt dynamisch via `getHearingClock()`).
   - Meta-Titel/Beschreibung der Route: „Hearing im Gemeindesaal" → „Hearing im Schulzimmer".
   - Weitere Textstellen, die den Gemeindesaal erwähnen (Intro-Konversation, Regeln-Overlay, Outro), werden auf „Schulzimmer" umgestellt, ohne die Geschichte umzuschreiben.

2. **Siegel-Komponente**
   - Neue kleine Komponente `HearingSeal` (in derselben Datei oder `src/components/case-file/`): rundes Stempelsiegel im bestehenden Stempelrot (`text-stamp` / `border-stamp`), leicht rotiert, im Stil der vorhandenen `Stamp`-Komponente.
   - Beschriftung: „Gemeinderat Widnau" im Kreis, Mitte „BESCHLOSSEN", darunter das aktuelle Datum.
   - Umsetzung rein mit CSS/SVG, Special Elite (`font-mono-typed`), keine neue Bilddatei nötig.

3. **Einbindung des Siegels**
   - Prominent auf dem Schluss-Dokument (`OutroScreen`, Status `won`): Siegel erscheint mit kurzer Stempel-Animation (Einblenden + leichtes „Aufdrücken"), sobald das Ergebnis aufgedeckt ist.
   - Kleine Variante in der Kopfzeile neben dem Titel «Finale · Hearing» ersetzt den bisherigen „Live"-Stempel nicht; das Siegel ergänzt ihn nur auf dem Ergebnis.

## Nicht geändert
- Spiellogik, Punkte, Badges, Datenbank, Timer.
- Keine neuen Abhängigkeiten.

## Technische Details
- Dateien: `src/routes/finale.tsx` (Ortsangaben, Siegel, Outro-Einbindung), ggf. neues File `src/components/case-file/HearingSeal.tsx`.
- Design-Tokens: bestehende Stempel-/Papierfarben, keine hartcodierten Farben.
- Abschluss: `bunx tsgo --noEmit` und Build prüfen.
