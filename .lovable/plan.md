# Leaderboard mit Runden-Codes (Supabase)

Ziel: Du erstellst als Admin eine Runde und erhältst einen Code. Teams treten mit diesem Code bei, tippen Teamname und Mitspielernamen ein und spielen. Während des Spiels sehen alle live, wie weit die anderen Teams sind; am Ende Zeit, Hinweise und Rangfolge. Kein Login für Schüler:innen.

Bestätigter Ausgangszustand: Die Datenbank ist leer (keine Tabellen), das Spiel läuft heute komplett über localStorage. Es wird also neu aufgebaut, nichts migriert.

## Admin-Bereich `/admin`
- Zugang über ein geheimes Admin-Passwort (als Projekt-Secret gespeichert, nie im Code). Prüfung serverseitig, danach ein kurzlebiger Admin-Token im Browser.
- Runde erstellen: Titel/Klasse eingeben, System erzeugt einen 6-stelligen Code (z. B. `K7F2QD`).
- Rundenliste mit Code, Anzahl Teams, Status (offen / geschlossen), Link zur Rangliste.
- Aktionen: Runde schliessen (kein Beitritt mehr), Runde löschen, Team entfernen.

## Beitritt (Startseite)
- Neuer Schritt vor dem Spielstart: „Runden-Code eingeben“.
- Danach: Teamname + Namen der Mitspieler:innen.
- Das Team erhält ein geheimes Team-Token (localStorage). Damit werden alle späteren Meldungen abgesichert, ohne Konto.
- Der bestehende Startcode `OEKOLOGIE` bleibt wie bisher als Spielstart-Ritual erhalten.
- Ohne Runden-Code bleibt Solo-Spiel möglich (dann kein Leaderboard-Eintrag).

## Fortschritt melden
Nach jedem gelösten Rätsel (Etappe 1-5) und nach dem Hearing wird an die Datenbank gemeldet: gelöste Etappen, Startzeit, Etappen-Zeitstempel, Anzahl genutzter Hinweise, verdiente Badges, Endzeit. localStorage bleibt die Quelle der Wahrheit im Spiel; die Cloud ist die Anzeige-Kopie. Fällt das Netz aus, spielt das Team normal weiter und die nächste Meldung holt den Stand nach.

## Live-Rangliste `/rangliste`
- Aufruf über Rundencode (auch aus der Übersicht heraus verlinkt, eigenes Team hervorgehoben).
- Spalten: Rang, Teamname, gelöste Etappen (Fortschrittsbalken), benötigte Zeit, genutzte Hinweise, Badges.
- Sortierung: mehr Etappen zuerst, bei Gleichstand kürzere Zeit, dann weniger Hinweise.
- Aktualisiert sich live (Realtime-Abo), plus Fallback-Refresh alle 15 s.
- Nach Spielende: Abschluss-Ansicht mit Podest der drei schnellsten Teams.

## Technische Umsetzung
- Migration: Tabellen `rounds` (code, titel, status, created_at) und `teams` (round_id, name, mitglieder, token_hash, stages_done, hints_used, badges, started_at, finished_at). GRANTs + RLS: anonym nur Lesen einer schmalen, personenfreien Sicht der Rangliste; alle Schreibvorgänge nur über Server-Funktionen.
- Server-Funktionen (`createServerFn`): `createRound`, `listRounds`, `closeRound`, `deleteRound` (Admin-Passwort geprüft), `joinRound`, `reportProgress` (Team-Token geprüft), `getLeaderboard` (öffentlich, ohne Klarnamen-Leak über RLS-Sicht).
- Realtime auf `teams` aktivieren.
- Neue Dateien: `src/routes/admin.tsx`, `src/routes/rangliste.tsx`, `src/lib/leaderboard.functions.ts`, `src/lib/leaderboard.server.ts`, `src/components/case-file/RoundJoin.tsx`, `src/components/case-file/LeaderboardTable.tsx`.
- Anpassungen: `src/lib/progress.ts` (Rundenkontext + Sync-Aufruf), `src/routes/index.tsx` (Beitritt + Rangliste-Link), Etappen-Routen und `finale.tsx` (Fortschritt melden).

## Vor dem Bau nötig
Ich frage per Formular das Admin-Passwort ab und speichere es als Secret. Danach baue ich in dieser Reihenfolge: Migration, Server-Funktionen, Admin-Seite, Beitritt, Sync, Rangliste.
