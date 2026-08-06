# Sicherheitsarchitektur festhalten

Keine Code-Änderung. Es wird nur die Security-Memory des Projekts aktualisiert, damit die bestehende Architektur später nicht versehentlich aufgeweicht wird.

## Inhalt der Notiz

- **Zugriffsmodell:** Die App hat keine Supabase-Auth-Nutzer. Zugriff läuft ausschliesslich über `SECURITY DEFINER`-RPCs. Tabellen (`rounds`, `teams`, `score_events`, `app_config`) haben RLS aktiv, keine Policies und keine Rechte für `anon`/`authenticated` — direkter Tabellenzugriff ist unmöglich.
- **Absichtlich öffentlich:** Der Supabase-anon-Key im Browser-Bundle ist unkritisch und beabsichtigt.
- **Team-Identität:** Über einen clientseitig erzeugten Token, in der DB nur als SHA-256-Hash (`teams.token_hash`) gespeichert und in jeder RPC geprüft.
- **Lehrer-Identität:** SHA-256-Hash gegen `app_config.teacher_password_hash` via `assert_teacher`; deren EXECUTE-Recht ist `anon`/`authenticated` entzogen.

## Was nie passieren darf

- Der Service-Role-Key darf nie in Client-Code, Bundle oder `VITE_*`-Variablen gelangen.
- Keine `USING (true)`-Policies oder Tabellen-Grants für `anon`/`authenticated` auf `rounds`, `teams`, `score_events`, `app_config`.
- `app_config` darf nie über eine RPC lesbar gemacht werden, die den Passwort-Hash zurückgibt.
- Lehrer-RPCs dürfen nie ohne `assert_teacher` aufgerufen werden können.

## Akzeptierte Risiken

- Ein geteilter Rundencode erlaubt jedem den Beitritt als Team — das ist für den Unterrichtskontext gewollt.
- Das Lehrer-Passwort ist ein einzelnes, ungesalzenes Hash-Geheimnis ohne Rate-Limit. Für den aktuellen Einsatz akzeptiert.
