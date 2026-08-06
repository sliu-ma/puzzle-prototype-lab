# Hearing-Punkte im Leaderboard korrigieren

## Befund (geprüft)

Beim Spielgerät stimmt die Rechnung: wird das Hearing erst im zweiten Anlauf bestanden, gibt es 0 Hearing-Punkte, nur das Badge „Zweiter Anlauf“.

In der Datenbank fehlt die Versuchsnummer. Die gespeicherten Hearing-Ereignisse enthalten nur `at`, `question`, `correct` — kein `attempt` (in der Datenbank nachgeprüft). Zwei Stellen verlieren die Information:

1. Die Prüfung der übermittelten Ereignisse in `src/lib/rounds.functions.ts` kennt das Feld `attempt` nicht und entfernt es beim Übertragen.
2. Die Rückübersetzung der Datenbankzeilen in `src/lib/rounds.server.ts` liest `attempt` ebenfalls nicht.

Folge: serverseitig gilt jeder Durchgang als erster Versuch, deshalb werden die (perfekten) Antworten des zweiten Durchgangs voll gewertet — Leaderboard und Auswertung zeigen zu viele Punkte.

## Korrektur

- Versuchsnummer mitübertragen: `attempt` in die Ereignis-Prüfung aufnehmen (ganze Zahl, 1–20), damit sie in der Datenbank landet.
- Versuchsnummer beim Auswerten lesen: in der Rückübersetzung `attempt` übernehmen. Fällt das Feld weg (Altbestand), wird es aus der Ereignis-Kennung `hearing_answer:<versuch>:<frage>` abgeleitet, damit auch bereits gespielte Runden korrekt gewertet werden.
- Danach ergibt die Server-Berechnung genau dasselbe Resultat wie die Anzeige auf dem Gerät: kein Hearing-Punkt bei Wiederholung, Badge-Punkte bleiben.

## Technisch

- `src/lib/rounds.functions.ts`: `eventSchema` um `attempt: z.number().int().min(1).max(20).optional()` ergänzen.
- `src/lib/rounds.server.ts`: in `rowsToEvents` beim Fall `hearing_answer` `attempt` setzen — aus `payload.attempt`, sonst aus dem zweiten Segment von `event_id`.
- Keine Datenbankänderung, keine Änderung an `score.ts` (die Regel dort ist bereits richtig).
- Verifikation: Auswertung/Leaderboard einer Runde mit wiederholtem Hearing prüfen — Hearing-Punkte 0, Badge „Zweiter Anlauf“ 150.
