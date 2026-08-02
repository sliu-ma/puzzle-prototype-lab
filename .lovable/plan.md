# Runden-Erstellung auf der veröffentlichten Seite reparieren

## Verifizierte Ursache

- Die Vorschau kann Runden erstellen, die veröffentlichte Seite nicht.
- Die aktuellen Produktionsprotokolle melden bei jedem Versuch ausdrücklich: `Missing Supabase environment variable(s): SUPABASE_SERVICE_ROLE_KEY`.
- Der Fehler entsteht beim Laden des serverseitigen Supabase-Admin-Clients vor dem Insert. Das Formular, der Rundencode und die Datenbankstruktur sind daher nicht die Ursache.
- Das Secret ist im verbundenen Supabase-Projekt vorhanden, aber nicht an die derzeit veröffentlichte Server-Laufzeit gebunden.

## Umsetzung

1. **Supabase-Secrets neu binden**
   - Die verwalteten Supabase-Laufzeitvariablen erneut aus dem verbundenen Projekt beziehen.
   - Den Service-Role-Key ausschließlich als Server-Secret verwenden; nichts davon in Browsercode oder Repository schreiben.

2. **Veröffentlichte Laufzeit aktualisieren**
   - Eine neue Veröffentlichung erzeugen, damit die neu gebundene Server-Konfiguration die aktuell veröffentlichte Version ersetzt.
   - Keine Änderung an RLS, Grants oder Tabellen vornehmen, da ein korrekt gebundener Service-Client diese für die privilegierte Admin-Operation nicht benötigt.

3. **Produktionsablauf verifizieren**
   - Auf der veröffentlichten URL anmelden, eine Testrunde erstellen und prüfen, dass sie sofort in der Liste erscheint.
   - Die Testrunde wieder löschen.
   - Anschließend die Produktionsprotokolle prüfen: keine Meldung zu einer fehlenden Supabase-Variable und kein Fehler beim Insert.

4. **Fehlerbehandlung absichern**
   - Die bestehende kontrollierte Fehlermeldung beibehalten.
   - Nur falls die Produktionsprüfung trotz korrekter Secret-Bindung scheitert, den konkreten Supabase-Fehler serverseitig diagnostizieren; keine öffentlichen Schreibrechte als Umgehung hinzufügen.

## Technische Grenzen

- Keine Datenbankmigration.
- Keine Abschwächung der RLS- oder Tabellenberechtigungen.
- Keine Veröffentlichung eines Service-Schlüssels an den Browser.
- Keine Änderungen außerhalb des Leaderboard-Admin-Ablaufs.