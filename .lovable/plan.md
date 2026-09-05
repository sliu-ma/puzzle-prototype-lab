# Nachrichten als Chaträume

Der Reiter «Nachrichten» wird zu einem Postfach mit Chaträumen: ein Raum «Alle Gruppen» plus ein Raum pro Gruppe der Runde. Jede Nachricht – deine eigenen und die Hilferufe der Gruppen – landet automatisch im richtigen Raum und wird dort zeitlich sortiert angezeigt.

## Was du sehen wirst

**Raumliste** (Einstieg im Reiter «Nachrichten»)
- Oben «Alle Gruppen», darunter jede Gruppe der Runde.
- Pro Raum: Name, letzte Nachricht als Vorschau, Uhrzeit («vor 4 Min»).
- Räume mit einem noch nicht beantworteten Hilferuf stehen mit farbigem Punkt oben; die Sortierung folgt der letzten Aktivität.
- Der Reiter selbst zeigt weiterhin die Anzahl offener Hilferufe als Zähler.

**Im Raum**
- Fortlaufender Verlauf, älteste oben, neueste unten: deine Nachrichten rechts, Meldungen der Gruppe links.
- Bei jedem Hilferuf steht direkt darunter der Spielstand im Klartext, z. B. «Etappe 3 · Widnauer Riet · am Rätsel seit 12 Min · Hinweis 2 genutzt · 2 Etappen gelöst» – dazu der Text, den die Gruppe geschrieben hat.
- Unten ein Schreibfeld (max. 300 Zeichen) mit Senden-Knopf; Empfänger ist immer der Raum, in dem du bist – kein Auswählen mehr nötig.
- Bei deinen Nachrichten steht die Lesebestätigung: im Gruppenraum «gelesen» bzw. «noch nicht gelesen», im Raum «Alle Gruppen» «gelesen 3/5».
- Ein Hilferuf gilt als beantwortet, sobald du im Raum antwortest; zusätzlich gibt es «Erledigt», um eine Meldung ohne Antwort abzuhaken.
- Im Raum «Alle Gruppen» erscheinen nur deine Rundmeldungen (Hilferufe gehören immer zur Gruppe).

Der Live-Reiter behält den kurzen Hinweis, wenn neue Meldungen da sind, und verlinkt in den betreffenden Raum. Die Ansicht aktualisiert sich weiterhin alle 15 Sekunden.

## Technische Umsetzung

Datenbank (Migration):
- `teacher_list_messages` bekommt `LIMIT 300` statt 20, damit der Verlauf pro Raum vollständig ist (reines `CREATE OR REPLACE FUNCTION`, keine Schemaänderung, keine neuen Grants).

Client:
- Neue Komponente `src/components/teacher/MessageRooms.tsx`: hält den ausgewählten Raum (`"all"` oder `teamId`), baut aus `teacherListMessages` (deine Nachrichten) und `report.teams[].helpRequests` (Meldungen) je Raum eine chronologische Liste, rendert Raumliste und Thread. Kontextzeile über die bestehenden Helfer `assessTeams` und `COL_NAME` aus `ProgressMatrix.tsx`, Hinweise über `hintsByStage` – keine neue Logik.
- `MessagePanel.tsx` wird zum reinen Schreibfeld `MessageComposer` (Props `password`, `code`, `teamId | null`, `onSent`); die Empfängerauswahl und die Liste des Gesendeten entfallen, weil beides jetzt der Raum abbildet.
- `HelpFeed.tsx` entfällt; der `localStorage`-Schlüssel `mm.teacher.help.done` wird für «Erledigt» weiterverwendet und wandert in `MessageRooms.tsx`.
- `src/routes/lehrer.$code.tsx`: der Schritt `messages` rendert `MessageRooms` statt `MessagePanel` + `HelpFeed`; `useRoundReport` (15 s) und `pendingCount` bleiben, `replyTarget` wird durch die Raumauswahl ersetzt. Der Hinweis im Live-Schritt setzt den Raum der betroffenen Gruppe.
- Keine Änderung an `getRoundState`, `TeacherMessageOverlay.tsx` oder der Gruppenansicht – die Gruppen sehen Nachrichten weiterhin als Pop-up.
