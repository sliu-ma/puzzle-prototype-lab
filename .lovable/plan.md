# Hilferufe: Stand einfrieren, erledigte nicht mehr blinken

## Was du sehen wirst

**1. Der Stand beim Hilferuf bleibt stehen**

Im Chatraum steht unter jedem Hilferuf künftig der Spielstand **zum Zeitpunkt des Hilferufs**, nicht der aktuelle. Beispiel: «14:32 · Etappe 3 · Widnauer Riet · am Rätsel seit 12 Min · Hinweis 2 genutzt · 2 Etappen gelöst» – auch wenn die Gruppe längst weiter ist, wenn du die Meldung erst später liest. Der aktuelle Stand der Gruppe bleibt weiterhin oben im Raumkopf sichtbar, klar getrennt vom eingefrorenen Stand («jetzt: …»).

**2. Erledigte Meldungen blinken nicht mehr**

Hakst du eine Meldung im Chatraum als erledigt ab (oder hast du in diesem Raum danach geantwortet), dann
- blinkt die Gruppe im Reiter «Live» nicht mehr rot und zeigt keine Hilferuf-Zeile mehr,
- zählt sie nicht mehr im Zähler am Reiter «Nachrichten» und nicht im Hinweis-Banner im Live-Reiter.

Nicht erledigte Hilferufe verhalten sich unverändert.

## Technische Umsetzung

Server (`src/lib/rounds.server.ts`, keine Datenbankänderung):
- Beim Aufbau der `helpRequests` pro Gruppe wird aus dem bereits vorhandenen Ereignisstrom der Stand zum Ereigniszeitpunkt rekonstruiert (gleiche Logik wie für den aktuellen Stand, aber nur mit Ereignissen `eventMs(e) <= at`): `stagesSolved`, `currentStage`, `phase`, `phaseSinceMs` → `minutesInPhase`, `hintLevel` der damaligen Etappe.
- Der Rückgabetyp `helpRequests` wird um `snapshot: { stage, phase, minutesInPhase, hintLevel, stagesSolved }` erweitert; `at`, `stage`, `note` bleiben. Der Typ in `src/components/teacher/LobbyPanel.tsx` (`ReportTeam`) wird mitgezogen.

Client:
- `src/components/teacher/MessageRooms.tsx`: die Kontextzeile eines Hilferufs nutzt `snapshot` statt des Live-Status `st`; der Live-Status bleibt nur in der Kopfzeile des Raums. Die Helfer zum Lesen/Schreiben der Erledigt-Häkchen (`doneKey/readDone/writeDone`, Schlüssel `mm.teacher.help.done.<code>`) wandern in ein kleines Modul `src/lib/teacher-help-done.ts`, damit Live-Ansicht und Chat dieselbe Quelle nutzen; zusätzlich wird beim Setzen ein `window`-Event ausgelöst, damit andere Reiter sofort nachziehen.
- Einheitliche ID eines Hilferufs (`teamId|at|stage|note`) kommt aus diesem Modul, damit Live und Chat identisch schlüsseln.
- `src/routes/lehrer.$code.tsx`: `pendingCount` zählt nur Hilferufe, die weder abgehakt noch nach ihrem Zeitpunkt beantwortet sind. Dafür wird die Liste der gesendeten Nachrichten (`teacherListMessages`) einmal auf Routen-Ebene geladen (15 s, wie bisher im Chat) und an `MessageRooms` sowie an die Live-Ansicht durchgereicht; `MessageRooms` lädt dann nicht mehr selbst.
- `src/components/teacher/ProgressMatrix.tsx`: `TeamRow` bekommt die Menge der erledigten/beantworteten Hilferuf-IDs; `helpFresh` gilt nur noch für den neuesten nicht erledigten Hilferuf. Fällt er weg, greift wieder die normale Zeit-/Hinweis-Bewertung.

Keine Migration, keine Änderung an der Gruppenansicht.
