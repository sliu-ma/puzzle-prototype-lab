# Export-Dialog im Lehrer-Dashboard

Statt zwei fest sichtbarer CSV-Buttons gibt es künftig einen einzigen Button **„Export"**. Ein Klick öffnet ein Pop-up, in dem die Lehrperson auswählt, was genau exportiert wird.

## Was der Dialog enthält

- **Auswahl des Umfangs** (Mehrfachauswahl per Checkbox):
  - Übersicht pro Team (eine Zeile je Gruppe)
  - Etappen-Zusammenfassung (Median-/Min-/Max-Zeiten, Hinweise, Einschätzung)
  - Hearing pro Frage (Antworten, falsch, Fehlerquote)
  - Rohdaten pro Ereignis (Langformat für Pivot, SPSS, R)
- **Anonymisieren** – die bestehende Option „Export ohne Namen" wandert mit in den Dialog, damit alle Export-Einstellungen an einem Ort sind.
- **Kurzer Hinweistext** pro Auswahl (eine Zeile, keine langen Blöcke).
- Aktion unten: **„CSV herunterladen"** (deaktiviert, wenn nichts ausgewählt ist) und **„Abbrechen"**.

## Verhalten

- Ausgewählte Blöcke werden in einer Datei untereinander ausgegeben (`auswertung-<CODE>.csv`), getrennt durch eine Leerzeile – so wie heute schon Team-Übersicht, Etappen und Hearing kombiniert sind.
- Ist zusätzlich „Rohdaten pro Ereignis" gewählt, wird dieses Langformat als **zweite Datei** (`auswertung-ereignisse-<CODE>.csv`) heruntergeladen, weil es eine andere Spaltenstruktur hat.
- Standardmässig sind Team-Übersicht, Etappen und Hearing angehakt, Rohdaten nicht.
- Der Export-Button bleibt deaktiviert, solange keine Teams vorhanden sind.

## Technisch

- Datei: `src/components/teacher/ReportPanel.tsx`
- Die bestehenden Funktionen `exportTeamCsv` und `exportEventCsv` werden in Bausteine zerlegt (`teamRows`, `stageRows`, `hearingRows`, `eventRows`), die je nach Auswahl zusammengesetzt und über das vorhandene `csvDownload` ausgegeben werden.
- Dialog über die vorhandene shadcn-`Dialog`-Komponente, lokaler State für die Auswahl; die `anon`-Option nutzt weiterhin den bestehenden State.
- Die bisherigen zwei Buttons, der Info-Popover-Text „Daten exportieren" und das separate „Export ohne Namen"-Label ausserhalb werden entfernt bzw. in den Dialog verschoben.
