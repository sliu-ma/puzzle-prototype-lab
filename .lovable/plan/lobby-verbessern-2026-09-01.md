# Lobby verbessern

Die Lobby ist der Moment, in dem 20 Jugendliche gleichzeitig mit dem Handy einsteigen — dort entscheidet sich, ob die Lektion ruhig oder chaotisch beginnt. Drei Baustellen, nach Nutzen sortiert.

## Bündel A — Beitritt beschleunigen (grösster Effekt)

Aktuell muss jede Gruppe den Rundencode von Hand abtippen und danach Teamname und Namen erfassen. Das kostet Zeit und erzeugt Tippfehler.

- **QR-Code und Beitritts-Link für die Runde.** Im Lehrer-Tab „Lobby" ein grosser QR-Code plus Link `…/?r=CODE`. Wer ihn scannt, landet direkt bei Schritt 2 (Teamname), der Code ist schon geprüft und eingesetzt.
- **Beitrittsansicht für die Wand.** Ein Vollbild-Knopf „Beitritt anzeigen": nur Code, QR-Code und ein Live-Zähler „3 Teams angemeldet". Rein für die Anmeldung, kein Live-Stand während des Spiels.
- **Doppelte Teamnamen abfangen.** Gleiche oder fast gleiche Namen in derselben Runde werden abgewiesen mit „Diesen Teamnamen gibt es schon" — sonst sind zwei „Adler" im Leaderboard nicht unterscheidbar.

## Bündel B — Verlässlichkeit vor dem Start

- **Anzeige, welche Geräte wirklich wach sind.** Jedes Wartezimmer meldet sich ohnehin alle 3 Sekunden beim Server; dieser Zeitstempel wird gespeichert und im Lehrer-Dashboard als grüner Punkt („Gerät bereit") bzw. grauer Punkt („seit 2 min keine Verbindung") gezeigt. So startest du nicht mit einer Gruppe, deren Handy im Rucksack liegt.
- **„Wir sind bereit"-Knopf** im Wartezimmer und Bildschirmsperre verhindern (Wake Lock), damit das Handy während der Wartezeit nicht zugeht. Der Hinweis „Handy nicht schliessen" wird dadurch überflüssig.
- **Rückkehr statt Doppelanmeldung.** Heute lebt die Wartezimmer-Zuordnung nur in der Tab-Sitzung: schliesst iOS den Tab, meldet sich die Gruppe neu an und die Runde hat ein Geisterteam. Die Zuordnung wird dauerhaft gespeichert, ein erneuter Aufruf führt zurück ins Wartezimmer.

## Bündel C — Wartezeit sinnvoll füllen

- Teamliste zeigt Beitrittszeit und Personenzahl, das eigene Team bleibt oben angeheftet.
- Verbindungsstatus als ruhiges Symbol statt roter Fehlerbox, die bei jedem Funkloch aufblitzt.

## Technische Umsetzung

- **Migration:** `teams.last_seen_at`, `teams.ready_at`; eindeutiger Index auf `(round_id, lower(name))`. Neue bzw. erweiterte Funktionen: `round_state` stempelt `last_seen_at`, neu `round_set_ready`, `round_update_team`, `round_leave`, `teacher_rename_team`. `round_join` prüft den Namen und liefert einen sprechenden Fehler. `teacher_round_report` gibt `lastSeenAt` und `readyAt` mit.
- **Frontend:** `src/routes/index.tsx` liest `?r=CODE` und übergibt es an `StartForm`; `src/components/teacher/LobbyPanel.tsx` erhält QR-Code (`qrcode`-Paket), Wandansicht, Bereit-Punkte, Umbenennen und Start-Dialog; `src/routes/lobby.tsx` erhält Ausweiskarte, Bereit-Knopf, Wake Lock, Bearbeiten/Verlassen; `src/lib/round-client.ts` speichert die Wartezimmer-Zuordnung dauerhaft unter einem Schlüssel, den `resetAll()` nicht löscht.
- **Nebenbei:** `syncScoreEvents` schneidet auf die letzten 200 Ereignisse zu, der Server nimmt inzwischen 400 — Grenze angleichen, damit bei langen Runden keine frühen Etappen-Ereignisse verloren gehen.

Sag Bescheid, wenn du nur einen Teil willst — Bündel A allein bringt schon den grössten Zeitgewinn.