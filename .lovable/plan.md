# Rätsel vollständig auf Widnau adaptieren

Der Mobilitätsposten (Etappe 1) ist bereits auf Widnau/Heerbrugg umgestellt: Verbindungen, Koordinaten, Karte, Auto-Ziel Gässelistrasse 2 und die Zielprüfung (Widnau und Heerbrugg werden akzeptiert). Übersicht und Finale nennen ebenfalls Widnau bzw. Gemeindesaal Widnau.

Offen ist noch Folgendes.

## 1. Restfehler beheben (zwingend)

- `src/routes/etappe-1.tsx`, Zeile 429: die Fussleiste zeigt weiterhin "ETAPPE 1 · BAHNHOF SPEICHER" → "ETAPPE 1 · BAHNHOF HEERBRUGG".

Das ist die einzige verbliebene Speicher-Nennung im Code.

## 2. Ortsnamen der übrigen Etappen (Entscheidung nötig)

Die Etappen 2–5 sind ortsneutral bzw. fiktiv benannt und funktionieren in Widnau ohne Änderung. Falls sie konkret in Widnau verankert werden sollen, betrifft das jeweils Seitentitel, QR-Gate-Text, Notizkopf und Fussleiste:

- Etappe 2 "Dorfladen Berger" (`src/routes/etappe-2.tsx`, Zeilen 31, 50, 196, 318)
- Etappe 3 "Wald-Lichtung / Forsthaus" (`src/routes/etappe-3.tsx`, Zeilen 38, 84, 200) – möglich: Widnauer Riet / Rheinauen
- Etappe 4 "Jakobs Haus / Küchentisch" (`src/routes/etappe-4.tsx`, Zeilen 52, 73, 189) – ortsneutral, Änderung optional
- Etappe 5 "Altes Wasserkraftwerk" (`src/routes/etappe-5.tsx`, Zeilen 27, 187) – möglich: altes Pumpwerk am Rhein

## 3. Ausserhalb des Codes (dein Teil)

- QR-Codes an den realen Standorten in Widnau neu platzieren (Tokens bleiben unverändert, es ändert sich nur der physische Ort).
- Die Notiztexte beschreiben Fundorte ("Bank am Gleis 1", "Holztresen") – prüfen, ob sie zu den echten Orten in Widnau passen.

## Technische Details

Nur Textersetzungen in Route-Dateien. Rätsellogik, Punkte, Badges, Hinweistimer, Datenbank und Tokens bleiben unverändert. `src/lib/mobility-data.ts` braucht keine weiteren Änderungen.
