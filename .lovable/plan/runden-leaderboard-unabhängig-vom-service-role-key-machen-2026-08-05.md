# Runden & Leaderboard unabhängig vom Service-Role-Key machen

## Wo der Schlüssel liegt
`SUPABASE_SERVICE_ROLE_KEY` steht nicht in `.env` und nicht in der Secrets-Liste. Es ist eine plattformverwaltete Bindung, die beim Start in die Server-Umgebung injiziert wird. Genau deshalb geht sie bei Umbauten/Deployments immer wieder verloren, und dann fällt der ganze Runden-Teil aus.

## Ursache
Aktuell laufen **alle** Runden-Zugriffe über den Admin-Client (Service-Role). In der Datenbank existiert derzeit **keine einzige** Zugriffsregel (RLS-Policy), also gibt es keinen zweiten Weg zu den Daten. Fehlt die Bindung, ist alles tot.

## Lösung
Die Spiel-Logik bekommt einen eigenen, engen Zugang, der nicht am Service-Role-Key hängt: geprüfte Datenbank-Funktionen mit festgelegtem Verhalten, aufgerufen mit dem öffentlichen Schlüssel. Die Tabellen selbst bleiben komplett gesperrt, es gibt nur diese Funktionen als Türen. Das ist nicht weniger sicher, sondern präziser als heute: statt „Alles-Rechte über einen Schlüssel" gilt „genau diese fünf Vorgänge, mit Team-Token bzw. Lehrer-Passwort geprüft".

## Umsetzung (technisch)
1. **Migration:** RLS auf `rounds`, `teams`, `score_events` aktivieren, **ohne** Tabellen-Policies. Kein direkter Tabellenzugriff für `anon`/`authenticated`.
2. **SECURITY DEFINER Funktionen** (search_path fixiert), `EXECUTE` nur für `anon`, `authenticated`, `service_role`:
   - `round_lookup(code)` – gibt nur Titel/Status/Budget zurück.
   - `round_join(code, team_name, members, token_hash)` – nur bei Status `open`, gibt Team-ID zurück.
   - `round_push_events(team_id, token_hash, events jsonb)` – prüft Token-Hash, idempotenter Upsert, Limit 200 Events.
   - `round_finish(team_id, token_hash)`.
   - `round_leaderboard(code)` – nur Teamname, Punkte-Rohdaten, Status; keine Tokens, keine Mitgliedernamen.
   - Lehrer-Funktionen (`teacher_*`) erhalten ein Passwort-Argument, das gegen einen Hash in einer neuen, für `anon` unlesbaren Tabelle `app_config` geprüft wird. Ohne korrektes Passwort: Abbruch.
3. **`src/lib/rounds.functions.ts`**: Admin-Client durch einen im Handler erzeugten Client mit `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` ersetzen, alle Aufrufe über `.rpc(...)`. Token-Hashing bleibt serverseitig in `rounds.server.ts`, der Klartext-Token verlässt die DB-Schnittstelle nie.
4. **Fallback + Diagnose:** kleiner Helfer, der zuerst den öffentlichen Weg nutzt und nur bei fehlender Konfiguration eine klare, verständliche Fehlermeldung zeigt („Runden-Zugang nicht konfiguriert") statt eines technischen Absturzes.
5. **Keine Änderungen** an Spielinhalt, Scoring-Formel oder UI.

## Ergebnis
Registrierung, Punkte-Sync und Leaderboard funktionieren auch dann, wenn die Service-Role-Bindung fehlt oder nach einem Deployment neu gesetzt werden muss.
