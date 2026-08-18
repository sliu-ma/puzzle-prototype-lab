# Postenkarten vollständig entfernen

## Ausgangslage

Im Lehrerdashboard gibt es aktuell **keine** Oberfläche mehr für Postenkarten: `src/routes/lehrer.$code.tsx` und die Panels (Lobby, Live, Auswertung) enthalten keinen Bezug zu Stationen oder Fotos. Übrig sind nur noch die Reste im Backend.

## Was entfernt wird

- Die Tabelle `round_stations` (inkl. aller Zeilen und Verknüpfungen zur Runde).
- Die drei Datenbank-Funktionen, die nur für Postenkarten existieren: Stationen auflisten, speichern, löschen.
- Der private Foto-Ablageort `station-photos` samt der zugehörigen Zugriffsregeln, da er ausschliesslich für Postenkarten-Bilder gedacht war.

## Was unverändert bleibt

Runden, Teams, Punkte-Ereignisse, Lehrer-Login und die gesamte Spiel-Logik. Am Spielerlebnis und an der Lehreransicht ändert sich sichtbar nichts.

## Technische Schritte

1. Migration:
   - `DROP FUNCTION public.teacher_upsert_station(...)`, `public.teacher_list_stations(...)`, `public.teacher_delete_station(...)`.
   - `DROP TABLE public.round_stations` (mit Trigger `update_round_stations_updated_at`).
   - `DROP POLICY` der vier `station_photos_*`-Regeln auf `storage.objects`.
   - `DELETE FROM storage.buckets WHERE id = 'station-photos'` (vorher Objekte in diesem Bucket löschen, damit der Löschvorgang nicht an einer Fremdschlüssel-Prüfung scheitert).
2. `src/integrations/supabase/types.ts` wird nach der Migration automatisch neu generiert; die Typen `round_stations` und die drei Funktionen verschwinden dort. Keine Code-Datei im `src/`-Baum referenziert sie, daher sind keine weiteren Anpassungen nötig.
3. Security-Memory-Notiz zu `station-photos` entfällt bzw. wird aktualisiert, da der Bucket nicht mehr existiert.
