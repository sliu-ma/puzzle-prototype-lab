# Umstieg auf ein eigenes Supabase-Konto

## Ausgangslage (geprüft)

- Die Datenbank dieses Projekts ist leer: keine einzige Tabelle im Schema `public`.
- Es gibt keine Storage-Buckets und keine eigenen Server-/Edge-Funktionen, die Backend-Daten nutzen.
- Der ganze Spielfortschritt (Etappen, Hinweise, Badges, Timer) liegt heute im Browser (localStorage) über `src/lib/progress.ts` und `src/lib/persist.ts`.

Das ist der beste Moment für den Wechsel: es muss praktisch nichts migriert werden, nur die Verbindung getauscht.

## Ablauf

```text
1. Eigenes Supabase-Projekt anlegen (dein Konto, deine Region)
2. In Lovable: Cloud trennen  (unwiderruflich)
3. In Lovable: eigenes Supabase-Konto verbinden
4. Verbindung testen
5. Danach: Leaderboard-Schema in DEINEM Projekt anlegen
```

## Was du selbst machst

**Schritt 1, eigenes Projekt anlegen**
Auf supabase.com ein Konto und ein neues Projekto erstellen. Region möglichst Europa (Frankfurt oder Zürich) wählen. Datenbank-Passwort sicher ablegen, es wird nur dort gezeigt.

**Schritt 2, Lovable Cloud trennen**
Als Workspace-Admin: More, Cloud, Advanced, Disconnect. Wichtig: Das ist unwiderruflich und löscht die Cloud-Daten dieses Projekts. In deinem Fall ist das unkritisch, weil die Datenbank leer ist, aber es lässt sich nicht rückgängig machen.

**Schritt 3, eigenes Supabase verbinden**
In den Projekt-Einstellungen unter Integrationen dein Supabase-Konto autorisieren und das in Schritt 1 erstellte Projekt auswählen. Lovable schreibt dann Projekt-URL und öffentlichen Key automatisch in die Projekt-Umgebung.

## Was ich danach übernehme

- Verbindung prüfen: sicherstellen, dass der generierte Client sauber gegen dein Projekt läuft und die Typen neu erzeugt werden.
- Falls nötig, Reste der alten Anbindung im Code aufräumen (der App-Code selbst nutzt bisher keine Datenbank, also erwarte ich hier nichts).
- Anschliessend das geplante Leaderboard in deinem Projekt aufbauen: Tabellen `rounds` und `teams`, Zugriffsregeln, Server-Funktionen für Beitritt und Fortschritt, Admin-Bereich und Live-Rangliste. Der bestehende Leaderboard-Plan bleibt inhaltlich gültig.

## Was sich für dich ändert

- Du hast volle Kontrolle: eigenes Dashboard, SQL-Editor, Logs, Backups, eigene Abrechnung bei Supabase (Free-Tier reicht für dieses Projekt problemlos).
- Kein Cloud-Verbrauch mehr auf der Lovable-Rechnung. Nach der aktuellen Auswertung waren das allerdings nur rund 2 von 220 Credits, spürbar wird also vor allem die Unabhängigkeit, nicht die Ersparnis.
- Zusatzdienste, die auf Lovable Cloud aufsetzen (etwa Lovable AI ohne eigenen Schlüssel oder die verwalteten E-Mail-Funktionen), stehen dann nicht mehr zur Verfügung. Das Spiel nutzt heute keine davon.
- Anmelde-Anbieter wie Google richtest du künftig selbst im Supabase-Dashboard ein. Für das Leaderboard ist das nicht nötig, dort melden sich Teams ohne Konto über Runden-Code an.

## Technische Details

- Nach dem Verbinden werden `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` und die serverseitigen Gegenstücke neu gesetzt; `src/integrations/supabase/client.ts` und `types.ts` sind generiert und werden automatisch aktualisiert.
- Migrationen laufen weiterhin über das Migrations-Werkzeug, dann gegen dein Projekt. Für jede neue Tabelle in `public` gehören GRANTs, RLS und Policies in dieselbe Migration.
- Server-Logik bleibt bei `createServerFn` im TanStack-Start-Runtime, externe Aufrufe bei Routen unter `src/routes/api/public/*`. Am Aufbau ändert der Kontowechsel nichts.
- Reihenfolge ist wichtig: erst trennen, dann verbinden, dann Migrationen. Neue Tabellen jetzt anzulegen wäre verlorene Arbeit.
