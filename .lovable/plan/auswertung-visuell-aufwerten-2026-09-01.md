# Auswertung visuell aufwerten

Ziel: Die Auswertung im Lehrerbereich soll auf einen Blick lesbar sein – Diagramme statt Zahlenkolonnen, Abzeichen als Bilder, und der Etappenvergleich mit klar beschrifteten Balken.

## 1. Klasse gesamt: Diagramme statt Kennzahlen-Kacheln

- Die vier Zahlen-Kacheln (Punkte, Gesamtzeit, Hinweise, Anteil Weg) bleiben als kurze Kopfzeile, werden aber ergänzt durch:
  - **Punkte pro Team** als horizontales Balkendiagramm (sortiert, eigenes Team-Label links, Median als gestrichelte Referenzlinie).
  - **Zeitaufteilung der Klasse** als gestapelter Balken: Rätselzeit vs. Zeit dazwischen (Weg/Pause), mit Legende und Prozentangabe – ersetzt die schwer lesbare Zeile „Anteil Weg“.
- Beschriftete Achsen und Einheiten (min, Punkte) direkt am Diagramm, keine nackten Zahlen.

## 2. Etappen im Vergleich: klar beschriftete Balken

Aktuell steht pro Etappe ein Zahlenraster mit einem unbeschrifteten Balken. Neu:

- Ein gestapeltes Balkendiagramm pro Etappe mit expliziter Legende:
  - Balkenteil 1 = **Rätselzeit (Median, min)**
  - Balkenteil 2 = **Weg zur Etappe (Median, min)**
- Rechts an jedem Balken die Zahl in Minuten, darunter eine Zeile Klartext: „4/6 gelöst · 2 mit Hinweis · 1 mit Auflösung“.
- Farbcodierte Einschätzung („zu einfach / passend / schwierig“) als kleines Badge am Etappentitel statt als Textspalte.
- Zusätzlich pro Etappe die Streuung (min–max) als dünne Linie hinter dem Balken, damit sichtbar wird, ob eine Gruppe ausreisst.

## 3. Hearing-Fragen: Fehlerquote als Diagramm

- Die Fragenliste wird zu einem horizontalen Balkendiagramm „Fehlerquote pro Frage in %“, absteigend sortiert, mit Frage-Nummer und Kurztext als Label. Die schwierigste Frage wird hervorgehoben.

## 4. Abzeichen als Bilder statt Text

- Im Team-Popup (`TeamReportDialog`) werden die Abzeichen als Bild-Kacheln (SVG aus den Assets) mit Titel darunter gezeigt; nicht erreichte Abzeichen erscheinen ausgegraut, damit sichtbar ist, was fehlte.
- In der kompakten Team-Zeile erscheinen bis zu drei kleine Abzeichen-Icons plus „+n“ statt der reinen Anzahl.
- Neuer Klassenüberblick „Welche Abzeichen wurden erreicht?“: pro Abzeichen das Bild plus ein Balken „x von n Teams“.

## 5. Struktur und Mobile

- Reihenfolge: Klasse gesamt (Diagramme) → Pro Team (Zeilen + Popup) → aufklappbare Sektionen „Etappen im Vergleich“, „Hearing-Fragen“, „Abzeichen“ → CSV-Export.
- Alle Diagramme sind auf 393 px Breite lesbar (horizontale Balken, kurze Labels, keine gedrehten Achsentexte).
- Der CSV-Export und die erhobenen Daten bleiben unverändert – es ändert sich nur die Darstellung.

## Technische Notizen

- Umsetzung in `src/components/teacher/ReportPanel.tsx` mit dem bereits vorhandenen Recharts-Wrapper `src/components/ui/chart.tsx` (Farben über Design-Tokens, keine Hardcodes).
- Abzeichen-Bilder über die bestehende `BADGES`-Liste in `src/lib/badges.ts` (`imageUrl`), damit Titel/Bild automatisch mitlaufen.
- Vorhandene Auswertungslogik (`analyseStage`, `analyseQuestions`, `stats`) wird weiterverwendet und nur um die Diagramm-Datenreihen ergänzt; keine Änderung an `rounds.server.ts`.
