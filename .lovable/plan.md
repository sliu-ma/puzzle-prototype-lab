# Karten-Hinweis entfernen und QR-Sperren wieder aktivieren

## Was sich ändert
1. **Karten-Hinweis zum Gemeindehaus Widnau entfernen**: Der Kasten mit Adresse, Mini-Karte und Routen-Knopf verschwindet am Ende von Etappe 5 und auf der Startseite.
2. **QR-Sperren wieder einschalten**: Etappen und Hearing lassen sich wieder nur per QR-Scan öffnen (manuelle Code-Eingabe bleibt als Notlösung). Der Testmodus, der alle Sperren übersprungen hat, wird ausgeschaltet.

## Technische Details
- `src/routes/etappe-5.tsx` und `src/routes/index.tsx`: Import und Verwendung von `HearingLocationHint` entfernen; Komponentendatei löschen.
- `src/lib/dev-flags.ts`: `DEV_BYPASS_GATES = false`.
- Danach Build prüfen und kurz testen, dass eine Etappe ohne Scan gesperrt ist.
