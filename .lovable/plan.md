# Lehrerdashboard verbessern

Geprüft: `src/routes/lehrer.index.tsx`, `src/routes/lehrer.$code.tsx`, `src/components/teacher/LobbyPanel.tsx`, `LiveBoard.tsx`, `ReportPanel.tsx` sowie die Report-Datenstruktur in `src/lib/rounds.server.ts`.

Das Dashboard ist funktional vollständig (Vorbereiten → Lobby → Live → Auswertung). Die folgenden Punkte sind konkrete, im Code belegte Schwachstellen — geordnet nach Nutzen für die Lehrperson im Unterricht.

## 1. Live-Ansicht zeigt nicht, wer feststeckt (grösster Nutzen)

**Ist:** `LiveBoard.tsx:40-66` zeigt pro Team nur Rang, Name, `stagesSolved/5`, Anzahl Hinweise und Punkte. Eine Lehrperson sieht damit *nicht*, welches Team seit 20 Minuten an derselben Etappe hängt — genau die Information, die sie zum gezielten Helfen braucht.

**Neu:** Pro Team eine Spalte „seit X min an E3". Die Daten liegen bereits vor: `ReportTeam.stageMinutes` (abgeschlossene Etappen) plus `joinedAt`/`startedAt` — die Zeit in der aktuellen Etappe ist die verstrichene Rundenzeit minus der Summe der abgeschlossenen Etappenzeiten. Teams über einem Schwellwert (z. B. 15 min in derselben Etappe) werden farblich markiert (`stamp`-Rahmen + Warnsymbol), damit sie ins Auge springen.

## 2. Restzeit in der Live-Ansicht springt nur alle 8 Sekunden

**Ist:** `LiveBoard.tsx:19-23` berechnet `elapsedMin`/`remainingMin` aus `Date.now()`, aber es gibt keinen eigenen Sekunden-Ticker — die Anzeige aktualisiert sich nur, wenn der 8-Sekunden-Poll ein Re-Render auslöst. Zudem ist die Angabe minutengenau und klein gesetzt.

**Neu:** Eigener 1-Sekunden-Ticker und eine gut lesbare `MM:SS`-Restzeit oben in der Live-Ansicht, damit die Lehrperson den Stand auf einen Blick am Beamer/Handy sieht.

## 3. Lade-Spinner dreht permanent

**Ist:** `useRoundReport` (`LobbyPanel.tsx:38-50`) setzt bei *jedem* Poll `setLoading(true)`. Da Lobby alle 4 s, Live alle 8 s und Auswertung alle 20 s pollen, rotiert das `RefreshCw`-Icon quasi dauernd und signalisiert fälschlich „lädt gerade".

**Neu:** `loading` nur beim allerersten Laden setzen; für Folge-Polls stattdessen einen dezenten „zuletzt aktualisiert HH:MM:SS"-Zeitstempel anzeigen. Zusätzlich einen manuellen Aktualisieren-Button (die `reload`-Funktion existiert bereits, wird in `LiveBoard`/`ReportPanel` aber nicht genutzt).

## 4. Jede Aktion lädt alle Runden

**Ist:** `lehrer.$code.tsx:83-96`: `load()` ruft `teacherListRounds` (alle Runden der Lehrperson) und filtert clientseitig auf den einen Code. `run()` (Zeile 130-141) ruft `load()` nach *jeder* Aktion — Titel speichern, +5 Minuten, Status ändern. Mit vielen Runden wird das unnötig langsam und überträgt fremde Rundendaten.

**Neu:** Der bereits vorhandene Report-Aufruf `teacherRoundReport` liefert `code`, `title`, `status`, `budgetMin`, `startedAt` für genau diese Runde. Die Rundenseite kann ihre Kopfdaten daraus beziehen, statt die ganze Liste zu holen. `teamCount` ergibt sich aus `teams.length`.

## 5. Zeit lässt sich nur nachgeben, nicht kürzen

**Ist:** `lehrer.$code.tsx:412-432` bietet nur `+5` und `+10`. Wenn die Lehrperson sich vertippt hat oder die Lektion früher endet, gibt es keinen Weg zurück.

**Neu:** `−5` ergänzen (mit Untergrenze: nicht unter die bereits verstrichene Zeit + 5 min, damit keine Runde rückwirkend beendet wird). Hinweis ergänzen, dass Kürzen nur nach oben korrigierte Zeit zurücknimmt.

## 6. Rundenliste wird mit der Zeit unübersichtlich

**Ist:** `lehrer.index.tsx:219-249` listet alle Runden ungefiltert in Ladereihenfolge. Nach einem Schuljahr sind das dutzende Einträge, abgeschlossene und aktive gemischt.

**Neu:** Gruppierung nach Status (aktiv/Lobby zuoberst, abgeschlossene eingeklappt darunter) und Anzeige des Erstelldatums (`created_at` ist bereits im `RoundItem`, wird aber nirgends dargestellt).

## 7. Kleinere Korrekturen

- **Schritt folgt dem Status nicht nach:** `lehrer.$code.tsx:108-113` setzt den Schritt nur einmal (`step !== null`-Guard). Wechselt der Status später (z. B. Runde abgeschlossen), bleibt die Ansicht stehen. Vorschlag: beim Statuswechsel dezent auf den passenden Schritt hinweisen statt hart umzuschalten.
- **Abzeichen fehlen live:** `ReportTeam.badges` wird in der Live-Ansicht nicht genutzt, obwohl es motivierend wäre, sie am Beamer zu zeigen.

## Technische Details

- `src/components/teacher/LiveBoard.tsx`: Sekunden-Ticker via `useState`/`useInterval`, Berechnung „Minuten in aktueller Etappe" aus `stageMinutes` + `startedAt`, Hervorhebung ab Schwellwert, optional Badge-Anzeige.
- `src/components/teacher/LobbyPanel.tsx`: `useRoundReport` um `firstLoad`-Flag und `lastUpdated`-Zeitstempel erweitern; `reload` in Live/Report durchreichen.
- `src/routes/lehrer.$code.tsx`: Kopfdaten aus `teacherRoundReport` statt `teacherListRounds`; `−5`-Button mit Untergrenze; Statuswechsel-Hinweis.
- `src/routes/lehrer.index.tsx`: Gruppierung nach Status, `created_at` anzeigen.
- Keine Änderungen an Datenbank, RPC-Funktionen, Punktelogik oder am Spielablauf der Schülerinnen und Schüler.

## Umfang

Die Punkte sind unabhängig voneinander. 1–3 bringen im Unterricht am meisten und sind zusammen der kleinste sinnvolle Schritt; 4–7 sind Aufräumarbeiten.
