# Auswertung fokussieren: vier Kennzahlen, Popups für Etappen und Hearing

Alle Änderungen betreffen nur die Darstellung in `src/components/teacher/ReportPanel.tsx`. Datenerhebung, Punkteberechnung und CSV-Inhalte bleiben unverändert.

## 1. Klasse gesamt: vier Kacheln

```text
Abgeschlossen   3 von 6      Punkte      58 (Median)
Spielzeit       72 min       Hinweise    4 (Median)
```

- Neue Kachel „Abgeschlossen“: Anzahl Teams mit Endzeit von allen Teams.
- „Punkte“, „Spielzeit“ (bisher Gesamtzeit), „Hinweise“ bleiben mit Median und Ø/Spannweite als Untertitel.

## 2. Grafiken entfernen

- Balkendiagramm „Punkte pro Team“ und der gestapelte Balken „Zeitaufteilung der Klasse“ verschwinden. Die Teamliste folgt direkt auf die Kacheln.

## 3. Pro Team: ausführlicheres Popup

Die kompakte Zeile pro Team bleibt (Name, Punkte, Etappen, Zeit, Hinweise, Warnpunkt). Das Popup wird ergänzt:

- Etappentabelle wie bisher (Weg, Rätselzeit, Hinweisstufe, Abweichung zum Klassenmedian), zusätzlich pro Etappe die erreichten Punkte, sofern in den Daten vorhanden.
- Neuer Hearing-Block mit allen zehn Fragen einzeln: Frage-Nummer, Kurztext, richtig/falsch je Versuch (z. B. „Versuch 1 ✗ · Versuch 2 ✓“). Falsche Antworten hervorgehoben.
- Kopf: Versuche total, Ergebnis (bestanden / nicht bestanden), Punkte, Status.
- Abzeichenkacheln bleiben (erreicht farbig, fehlend ausgegraut).

## 4. Etappen im Vergleich: Zeile + Popup

- Liste mit einer antippbaren Zeile pro Etappe (E1–E5): Name, Median-Rätselzeit, Anzahl gelöst, Einschätzung als Badge.
- Popup pro Etappe zeigt: Thema, wie viele Teams gelöst haben, Median/Ø/Min/Max der Rätselzeit, Median Wegzeit, Anzahl Teams mit Hinweis Stufe 1/2/3, durchschnittliche Punkte dieser Etappe sowie eine Liste aller Teams mit ihrer Zeit und Hinweisstufe (sortiert nach Zeit).

## 5. Hearing pro Frage: Matrix + Popup

- Pro Frage eine Zeile: Frage-Nummer, Kurztext, Fehlerquote in Prozent, Balken; schwierigste Frage hervorgehoben.
- Klick öffnet ein Popup pro Frage mit der Team-Liste: welches Team hat die Frage richtig oder falsch beantwortet, inklusive Versuchsnummer.
- Zweitversuche: pro Team wird der jeweils **letzte** Versuch als Ergebnis gewertet und angezeigt; ein vorher falscher Versuch erscheint als Zusatz „im 1. Versuch falsch“. Die Fehlerquote der Frage nutzt den ersten Versuch jedes Teams, damit die ursprüngliche Schwierigkeit sichtbar bleibt; beide Werte werden benannt.

## 6. Abzeichen der Klasse entfernen

- Der aufklappbare Abschnitt „Abzeichen der Klasse“ verschwindet komplett. Abzeichen bleiben nur im Team-Popup und als Icons in der Teamzeile.

## Technisch

- Nur `src/components/teacher/ReportPanel.tsx`.
- Neue lokale Komponenten `StageRow` / `StageReportDialog` und `QuestionRow` / `QuestionReportDialog`, gleiche Machart wie das bestehende `TeamReportDialog` (`@/components/ui/dialog`), Zustand über `useState<number | null>`.
- Hearing-Auswertung wird um eine Hilfsfunktion erweitert, die aus `hearingAttempts` pro Team und Frage den ersten und letzten Versuch bestimmt; Altrunden ohne Versuchsnummer fallen wie bisher auf `events` zurück.
- Etappenpunkte aus den vorhandenen Team-Daten (`stageMinutes`/`stages` bzw. Score-Felder); ist kein Punktwert je Etappe vorhanden, entfällt die Spalte statt geschätzt zu werden.
- Ungenutzte Helfer (`BarRow`-Nutzung für Punkte/Zeitaufteilung, `LegendDot`, `teamsByPoints`) werden entfernt bzw. auf die verbleibenden Diagramme reduziert. Farben nur über bestehende Tokens.
