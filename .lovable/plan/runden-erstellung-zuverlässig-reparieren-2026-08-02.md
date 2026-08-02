# Runden-Erstellung zuverlässig reparieren

## Verifizierter Ist-Zustand

- Die Admin-Anmeldung funktioniert, weil sie nur `ADMIN_PASSWORT` prüft.
- Beim Erstellen einer Runde wird anschließend der serverseitige Supabase-Client geladen.
- Die Produktionsprotokolle zeigen bei jedem Versuch ausdrücklich: `SUPABASE_SERVICE_ROLE_KEY` fehlt in der veröffentlichten Laufzeit.
- Die Tabellen `rounds` und `teams` existieren, `rounds` ist leer, und `service_role` besitzt die notwendigen Rechte. Eine Datenbankmigration ist daher nicht erforderlich.

## Umsetzung

1. **Supabase-Verbindung neu an die Laufzeit binden**
   - Die URL, der Publishable Key und insbesondere der Service-Role-Key werden erneut aus dem verbundenen Supabase-Projekt bezogen und als Server-Laufzeitvariablen gebunden.
   - Es wird kein Schlüssel in Browsercode oder Repository geschrieben.

2. **Server-Funktionen robust strukturieren**
   - Die Leaderboard-Server-Funktionen bleiben schmale TanStack-Wrapper.
   - Server-only Hilfen und Umgebungszugriffe werden ausschließlich innerhalb der Handler geladen, damit sie weder im Client-Bundle landen noch beim Server-Function-Splitting verloren gehen.
   - Die Rundenerstellung liefert einen kontrollierten Fehler mit einer serverseitig protokollierten Ursache statt nur eines undifferenzierten Absturzes.

3. **Admin-Oberfläche präzisieren**
   - Fehler beim Anmelden, fehlende Backend-Konfiguration und Datenbankfehler werden getrennt behandelt.
   - Während Erstellen und Neuladen bleibt der Button zuverlässig gesperrt; bei Erfolg erscheint die neue Runde unmittelbar mit ihrem Code.

4. **End-to-End verifizieren**
   - Mit dem echten Admin-Ablauf anmelden, eine Testrunde erstellen und prüfen, dass sie in Supabase und in der Liste erscheint.
   - Runde wieder entfernen und bestätigen, dass keine neuen Laufzeitfehler auftreten.
   - Da der Fehler auf der veröffentlichten URL auftritt, muss die korrigierte Laufzeitbindung anschließend mit einer neuen Veröffentlichung aktiv werden.

## Technische Grenzen

- Keine Änderung an RLS, Grants oder Tabellenstruktur.
- Kein Abschwächen der Sicherheit durch öffentliche Schreibrechte oder einen Browserzugriff mit Service-Role-Key.
- Keine Änderungen außerhalb des Admin- und Leaderboard-Ablaufs.