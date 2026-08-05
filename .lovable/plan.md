# Supabase Service-Role-Bindung prüfen und neu setzen

## Ziel
Sicherstellen, dass die Server-Umgebung (Preview und Live) den Schlüssel `SUPABASE_SERVICE_ROLE_KEY` hat, damit die Runden- und Leaderboard-Funktionen zuverlässig laufen.

## Schritte
1. Server-Logs auf die Meldung "Missing Supabase environment variable(s)" prüfen (Published und Preview).
2. Eine Runden-Serverfunktion testweise aufrufen (z. B. Rundenliste/Leaderboard), um den aktuellen Zustand zu sehen.
3. Falls die Bindung fehlt oder ungültig ist: Supabase-Bindung neu setzen (holt Service-Role-Key erneut und aktualisiert die Server-Umgebungsvariablen).
4. Dev-Server neu starten, damit der laufende Prozess die aktualisierten Variablen liest.
5. Erneut aufrufen und bestätigen, dass die Funktion Daten liefert statt eines Fehlers.

## Hinweise
- Es entstehen keine Code-Änderungen; nur Umgebungs-Bindung und Verifikation.
- `SUPABASE_*` bleibt bewusst ausserhalb von `.env` und ausserhalb der Secrets-Liste, da es ein reservierter, plattformverwalteter Prefix ist.
- Für die veröffentlichte App ist danach ggf. ein erneutes Publizieren nötig, damit die Live-Umgebung die Bindung übernimmt.
