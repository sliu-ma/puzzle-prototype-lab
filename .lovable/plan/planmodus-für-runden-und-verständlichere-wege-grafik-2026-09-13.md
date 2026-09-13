# Planmodus für Runden und verständlichere Wege-Grafik

## Teil 1: Planmodus

Heute kennt eine Runde drei Zustände: Lobby, läuft, abgeschlossen. Eine neu erstellte Runde steht sofort in der Lobby, das heisst der Rundencode funktioniert direkt und Gruppen könnten beitreten. Wege und Verzweigungen lassen sich nur im Moment des Erstellens festlegen, danach nicht mehr.

Neu kommt davor ein Zustand **«In Planung»**:

- Eine neu erstellte Runde startet in der Planung. Der Beitritt für Gruppen ist gesperrt: wer den Code eingibt, sieht «Diese Runde ist noch nicht offen».
- In der Planung ist alles frei bearbeitbar: Titel, Zeitbudget, Anzahl Wege, Verzweigungen pro Posten, Ortsbeschreibungen. So kann eine Runde Tage vorher fertig vorbereitet und das Material gedruckt werden.
- Ein Knopf **«Runde für Gruppen öffnen»** schaltet auf Lobby. Ab dann sind Anzahl Wege und Verzweigungen gesperrt (Ortsbeschreibungen bleiben wie heute jederzeit änderbar), weil die QR-Codes schon gedruckt sind.
- Solange keine Gruppe beigetreten ist, lässt sich die Runde mit **«Zurück in Planung»** wieder öffnen. Sobald Gruppen drin sind, geht das nicht mehr.
- Im Reiter «Vorbereiten» steht eine kurze Checkliste: Titel und Zeit gesetzt, Wege festgelegt, Orte eingetragen, QR-Codes gedruckt oder als ZIP geladen. Erst danach wird der Öffnen-Knopf hervorgehoben.
- Die Rundenliste zeigt den Status «In Planung» als eigenes Etikett, damit vorbereitete und laufende Runden auseinandergehalten werden.

## Teil 2: Wege-Grafik verständlicher

Heute zeigt die Grafik nur Buchstaben in kleinen Kästchen, und die Ortsbeschreibungen liegen darunter in einem separaten, einklappbaren Block. Man muss also zwischen Grafik und Liste hin und her springen.

Neu:

- Der eingetragene Ort steht direkt an der Station in der Grafik, zum Beispiel «Haltestelle Bünteli», unter oder neben dem Kästchen mit den Wegbuchstaben. Lange Namen werden gekürzt und im Tooltip vollständig gezeigt.
- Ist noch kein Ort eingetragen, steht dort ein leiser Platzhalter «Ort offen» als sichtbare Erinnerung.
- Die Eingabefelder für die Orte gehören zur Grafik: pro Posten eine Zeile direkt unter der jeweiligen Spalte statt eine getrennte Liste weiter unten. Der separate Block «Orte der Stationen» verschwindet.
- Die Posten bekommen zusätzlich zur Bezeichnung ihre Nummer (1 bis 5 plus Hearing), damit die Reihenfolge auf einen Blick klar ist.
- Stationen, an denen mehrere Wege zusammenlaufen, werden als ein Kästchen mit allen Buchstaben und deren Farbpunkten gezeigt, mit dem Hinweis «ein QR-Code».
- Auf dem Handy wird die Grafik weiterhin seitlich scrollbar; darunter steht kompakt dieselbe Information als Liste pro Posten, damit man ohne Scrollen arbeiten kann.

## Technische Details

- Datenbank: `rounds.status` erhält den zusätzlichen Wert `planning`. `teacher_create_round` legt neue Runden mit diesem Status an. `round_join` und `round_lookup` weisen Runden in Planung ab. `teacher_set_round_status` erlaubt `planning` nur, wenn die Runde noch keine Gruppen hat.
- Neue Funktion `teacher_set_round_paths(password, code, path_count, branches, station_descriptions)`, die nur im Status `planning` schreibt, damit sich die Sperre nicht über die Oberfläche umgehen lässt.
- `teacher_list_rounds` und `teacher_round_report` geben den neuen Status unverändert mit; `STATUS_LABEL` in `src/lib/teacher-session.ts` erhält den Eintrag «In Planung».
- `src/routes/lehrer.$code.tsx`: Reiter «Vorbereiten» wird zum Planungsbereich mit Checkliste, Wege-Editor und Öffnen-Knopf; Lobby- und Live-Reiter bleiben unverändert.
- `BranchDiagram.tsx` erhält Ortstexte im SVG plus die Eingabefelder pro Postenspalte; `PathsPanel.tsx` verliert den separaten Ortsblock und nutzt stattdessen die Grafik.
- Keine Änderung an den QR-Zeichenfolgen, der Punkteformel oder den physischen Codes vor Ort.

## Prüfung

Runde erstellen, in Planung bearbeiten, Beitritt als Gruppe testet die Sperre, öffnen, Beitritt möglich, Wege danach gesperrt, Start, laufende Runde und Auswertung unverändert. Bestehende Runden bleiben in ihrem heutigen Status.
