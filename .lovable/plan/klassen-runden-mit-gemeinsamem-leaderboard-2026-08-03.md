# Klassen-Runden mit gemeinsamem Leaderboard

Heute läuft alles nur im Browser des Teams (localStorage), die Datenbank ist leer. Damit eine Klasse gegeneinander spielen kann, braucht es drei Bausteine: eine Runde, die Teams einer Runde, und Punkte, die live in die Datenbank geschrieben werden.

## 1. Runde (Lehrperson)

- Neue Lehrer-Ansicht `/lehrer`: Runde erstellen (Titel/Klasse, optional Zeitbudget), erzeugt automatisch einen kurzen Rundencode (z. B. `MAYA-4B7K`).
- Liste der eigenen Runden mit Status (offen / gestartet / beendet) und Knopf „Runde schliessen“.
- Zugang zur Lehrer-Ansicht über ein Lehrer-Passwort (bereits vorhandenes Secret `ADMIN_PASSWORT`), keine echte Benutzerverwaltung nötig.

## 2. Anmeldung der Gruppen

- Schritt 1 der Anmeldung akzeptiert neu auch einen Rundencode. Bestehende Codes `OEKOLOGIE` und `KRXZMVBQ` funktionieren unverändert weiter (dann Einzelspiel ohne Runde).
- Bei Rundencode: Team wird in der Datenbank angelegt (Teamname, Mitglieder, Runde) und erhält ein geheimes Team-Token, das lokal gespeichert wird. Damit schreibt nur dieses Gerät die Punkte dieses Teams.
- Doppelte Teamnamen in derselben Runde werden abgelehnt.

## 3. Punkte und Leaderboard

- Bei jedem Punkte-Ereignis (Etappe gelöst, Abzeichen, Hinweis, Hearing-Antwort) wird das Ereignis zusätzlich an den Server geschickt. Der Server berechnet den Punktestand aus den Ereignissen selbst, exakt mit derselben Formel wie heute lokal, so bleibt Manipulation über die Anzeige wirkungslos.
- Läuft offline weiter: kann nicht gesendet werden, bleibt das Ereignis in einer lokalen Warteschlange und wird später nachgereicht. Das Spiel hängt nie am Netz.
- Das bestehende Leaderboard zeigt nun alle Teams der Runde, live aktualisiert (Rang, Teamname, Punkte, Etappen, eigenes Team hervorgehoben). Ohne Runde bleibt die heutige Einzel-Ansicht.
- Der Schlussscreen zeigt den das aktuell Resultat, hat eine Gruppe ("Gegner") noch nicht fertig gespielt wird vermerkt "Noch am spielen".
- Lehrer-Ansicht enthält eine Beamer-taugliche Rangliste der Runde (grosse Schrift, automatische Aktualisierung) mit Fortschritt pro Team.

## 4. Praktisches für den Unterricht

- Rundencode als grosse Anzeige plus QR-Code zum Beitreten in der Lehrer-Ansicht.
- „Runde zurücksetzen“ löscht nur die Punkte der Runde, nicht andere Runden.
- Ein Gerät = ein Team. Wechselt ein Team das Gerät, kann es mit Rundencode und Teamname plus Team-Token nicht einfach weiterspielen, daher Hinweis: dasselbe Handy behalten.

## Technische Hinweise

- Migration mit Tabellen `rounds` (code, titel, status, budget_min), `teams` (round_id, name, members, token_hash) und `score_events` (team_id, event_id eindeutig, typ, payload). Grants und RLS: kein direkter Schreibzugriff für `anon`; alle Schreibvorgänge laufen über Serverfunktionen mit Service-Rolle nach Prüfung des Team-Tokens. Leaderboard-Lesen über eine Serverfunktion, die nur Teamname, Punkte und Etappenzahl liefert.
- Serverfunktionen (`createServerFn`) in `src/lib/rounds.functions.ts`: `createRound`, `joinRound`, `pushScoreEvents`, `getLeaderboard`, `closeRound`. Punkteberechnung serverseitig über das bestehende, browserfreie `src/lib/score.ts`.
- `src/lib/score-events.ts` bekommt eine Sync-Schicht (Warteschlange in localStorage, Wiederholung bei Fehlern); `addScoreEvent` bleibt die einzige Schreibstelle.
- `src/components/case-file/Leaderboard.tsx` liest die Runden-Rangliste über TanStack Query mit kurzem Polling; Fallback auf lokale Anzeige ohne Runde.
- Neue Route `src/routes/lehrer.tsx` (öffentlich, Passwortprüfung serverseitig) plus `src/routes/lehrer.$code.tsx` für die Beamer-Ansicht.