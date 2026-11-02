# Saisonfrucht im Fachinput Konsum nach Monat anpassen

## Problem
Die Saisonkarte im Fachinput von Etappe 2 teilt das Jahr in vier feste Jahreszeiten. Von September bis November gilt «Herbst» und zeigt immer Kürbis und Zwetschge. Zwetschgen haben aber nur im August und September Saison. Im November ist das also falsch. Ausserdem passt es nicht zum Rezept: Ab Oktober wird eine Apfelwähe gebacken.

## Lösung
Die Karte zeigt nur noch Produkte, die **im aktuellen Monat** in der Schweiz Saison haben. Sie richtet sich damit nach derselben Logik wie das Rezept:
- September: Zwetschge und Kürbis (passt zur Zwetschgenwähe)
- Oktober und November: Apfel und Kürbis (passt zur Apfelwähe)
- Dezember bis Februar: Apfel und Rosenkohl
- Frühling und Sommer bleiben wie bisher (Spargel/Rhabarber, Erdbeere/Gurke)

Die Bezeichnung der Jahreszeit bleibt sichtbar. Die Monatsleiste markiert weiterhin den aktuellen Monat.

## Technische Details
- `src/components/case-file/ConsumptionCharts.tsx`: `getSaisonInfo()` nimmt alle Produkte aus einer gemeinsamen Liste, filtert auf `months.includes(aktuellerMonat)` und bevorzugt Produkte der aktuellen Jahreszeit sowie die Frucht des Rezepts (`getRezeptFuerMonat` aus `maya-data.ts`). Angezeigt werden höchstens 2.
- Es werden keine neuen Bilder benötigt, die Assets sind schon vorhanden.
- Danach kurz prüfen: Typecheck, und im Browser den Fachinput von Etappe 2 im November ansehen.
