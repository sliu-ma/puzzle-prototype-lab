# Sicherheit der Klassen-Runden: Antwort und Absicherung

## Kurzantwort auf deine Bedenken

Die wichtigste Entscheidung ist die, die du schon getroffen hast: **wir öffnen die Tabellen nicht für die Öffentlichkeit.** Damit fallen deine Punkte 1, 2 und 8 grösstenteils weg — es gibt keine `anon`-Leserechte, keine öffentliche View, keine `SECURITY DEFINER`-Funktion. Alle Datenbankzugriffe passieren weiterhin nur im Server-Code; der Browser bekommt ausschliesslich fertig berechnete Ranglisten-Zeilen.

Zum aktuellen Stand, geprüft im Code:

- Die Rangliste liest nur `id, name, finished_at` der Teams und gibt pro Zeile Teamname, Punkte, gelöste Etappen, Hinweise, fertig-Status zurück. Das geheime `token_hash` wird nur beim Prüfen eines Team-Tokens gelesen und nie zurückgegeben.
- Der `payload` in `score_events` kann gar keine sensiblen Daten enthalten: das Zod-Schema erlaubt nur `at`, `stage`, `durationSec`, `badgeId`, `level`, `question`, `correct`. Keine Namen, keine Tokens, keine Lösungen.
- Das Lehrer-Passwort wird zeitkonstant verglichen (`timingSafeEqual`), nie geloggt.
- Alle Abfragen nennen die Spalten explizit, kein `select('*')`.

Es bleiben trotzdem echte offene Punkte — die packen wir an.

## Was ich umsetzen werde

1. **Missbrauch/Scraping bremsen (dein Punkt 3)**
   - Kurzer Server-Cache für die Rangliste pro Rundencode (ca. 10 Sekunden). Wiederholte Abfragen kosten dann keine Datenbanklast.
   - Einfaches Rate-Limit pro Client-IP für die öffentlichen Aufrufe (Code prüfen, Team beitreten, Punkte melden, Rangliste). Bei Überschreitung eine freundliche Meldung statt Fehler.
   - Zusätzliches, strengeres Limit auf die Lehrer-Aufrufe, damit das Passwort nicht durchprobiert werden kann. Aktuell ist das die grösste reale Lücke.

2. **Saubere Fehlerbehandlung überall (deine Punkte 5 und 9)**
   - Die Team- und Lehrer-Funktionen bekommen die gleiche defensive Prüfung wie schon `lookupRound` und die Rangliste: fehlt die Server-Bindung, kommt eine klare Meldung, kein Stacktrace.
   - Logs enthalten nur „vorhanden ja/nein" und Statustexte, niemals Schlüsselwerte. Ich prüfe die bestehende Log-Zeile in `rounds.server.ts` entsprechend nach.

3. **Generierte Dateien nicht anfassen (dein Punkt 7)**
   - Es bleibt beim Wrapper `tryAdmin` in `src/lib/rounds.server.ts`. Die generierte `client.server.ts` wird nicht verändert. Das dokumentiere ich im Runbook.

4. **Kleiner Bug am Rande**
   - Ein leeres Passwortfeld löst momentan einen Validierungsfehler im Browser aus. Das Formular prüft künftig vorher und meldet „Bitte Passwort eingeben".

5. **Runbook (deine Punkte 4, 6, 10)**
   - Eine kurze Datei `RUNBOOK.md`: Was tun, wenn die Rangliste ausfällt; wie die Server-Bindung erneuert wird; dass Live erst nach erneutem Publizieren aktualisiert ist; welche drei Klicks als Smoke-Test dienen (Statuszeile auf `/lehrer`, Runde anlegen, Code in der Anmeldung prüfen).

## Was ich bewusst nicht mache

- **Keine öffentliche View / keine `anon`-Rechte.** Das wäre nur nötig, wenn die Rangliste ohne Server funktionieren müsste. Sie muss es nicht — bei Ausfall zählt das Spiel lokal weiter.
- **Kein externes Monitoring/Alerting.** Für eine Schulklasse ist die Statuszeile auf der Lehrer-Seite die passende Dosis; ein Sentry- oder Ping-Dienst wäre zusätzlicher Aufwand und ein weiterer Ort, an dem Daten liegen. Sag Bescheid, wenn du es trotzdem willst.
- **Keine Materialized View.** Die Punkteberechnung ist bei ein paar Dutzend Teams günstig; der Cache genügt.

## Technische Details

- Neuer Server-Helfer in `src/lib/rounds.server.ts`: `rateLimit(bucket, key, max, windowMs)` (In-Memory pro Worker, ausreichend als Missbrauchsbremse) und `cacheGet/cacheSet` für die Rangliste.
- IP über `getRequestIP({ xForwardedFor: true })` aus `@tanstack/react-start/server`, in den Handlern von `lookupRound`, `joinRound`, `pushScoreEvents`, `getRoundLeaderboard` und den vier `teacher*`-Funktionen.
- Rückgabewerte werden um `rateLimited: true` erweitert; `StartForm.tsx`, `Leaderboard.tsx` und `lehrer.tsx` zeigen dafür eine ruhige Hinweiszeile.
- `joinRound`, `pushScoreEvents`, `finishTeam` und die `teacher*`-Funktionen wechseln von `supabaseAdmin` auf `tryAdmin()` mit klarer Meldung bei fehlender Bindung.
- Keine Datenbank-Migration nötig.
