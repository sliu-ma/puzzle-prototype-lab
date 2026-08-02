# Live-Leaderboard mit Runden-Codes

## Ziel

Du als Lehrperson erstellst eine Runde und erhältst einen kurzen Code. Teams tippen diesen Code ein, geben Teamname und Mitspielende ein und starten. Während des Spiels sehen alle Teams live, wer wie weit ist; am Schluss die Gesamtzeit. Kein Login für Schülerinnen und Schüler.

## Ablauf

```text
Admin (/admin, Passwort)        Team (Startseite)
  Runde erstellen        ->      Code eingeben  (oder Offline-Start mit OEKOLOGIE)
  Code z. B. "7KQ4"              Teamname + Mitspielende
  Live-Board + Steuerung         Spiel wie bisher + Button "Rangliste"
                                 Nach jeder Etappe: Fortschritt geht an die Runde
```

## Was gebaut wird

**Admin-Bereich `/admin`**
- Zugang über ein geheimes Admin-Passwort (serverseitig geprüft, verschlüsselte Session, nichts im Browser-Code).
- Neue Runde erstellen (optional mit Klassenbezeichnung), Code wird generiert und gross angezeigt.
- Liste aller Runden, Live-Board pro Runde, Runde schliessen bzw. löschen.

**Beitritt auf der Startseite**
- Zwei Wege: „Runde beitreten“ (Rundencode) oder wie bisher „Offline starten“ mit dem Startcode OEKOLOGIE (dann ohne Leaderboard).
- Beim Beitritt: Teamname plus Namen der Mitspielenden (Felder zum Hinzufügen/Entfernen).
- Danach normaler Intro- und Spielablauf; Runden- und Team-Zuordnung wird lokal gespeichert, damit ein Reload nicht verloren geht.

**Fortschritt melden**
- Bei jedem Etappenabschluss und beim Hearing-Abschluss wird der Stand an die Runde gemeldet: gelöste Etappen, Startzeit, Endzeit, Anzahl genutzter Hinweise.
- Das bestehende lokale Fortschrittssystem bleibt führend; die Meldung ist ein zusätzlicher Sync (schlägt sie fehl, läuft das Spiel normal weiter).

**Live-Rangliste `/rangliste`**
- Erreichbar aus der Übersicht und über einen kompakten Rang-Hinweis im Spiel.
- Tabelle: Rang, Teamname (Mitspielende antippbar), gelöste Etappen als Punktekette, benötigte Zeit bzw. Endzeit, genutzte Hinweise.
- Live-Aktualisierung, eigenes Team hervorgehoben.
- Sortierung: mehr gelöste Etappen zuerst, bei Gleichstand kürzere Zeit, dann weniger Hinweise.

## Was du vielleicht noch bedenken willst

Vorschläge, die ich einbaue, wenn du sie willst (sag einfach welche):
- Doppelte Teamnamen in derselben Runde blockieren.
- Runde „sperren“, damit nach Spielstart niemand mehr beitritt.
- Admin-Ansicht mit genutzten Hinweisen pro Etappe je Team.
- Badges im Leaderboard anzeigen.

## Technische Details

- Datenbank (Postgres-Backend des Projekts): Tabelle `rounds` (Code, Bezeichnung, Status, Zeitstempel) und `teams` (Runde, Teamname, Mitspielende, gelöste Etappen, Start-/Endzeit, genutzte Hinweise, geheimes Team-Token) inkl. RLS und Zugriffsrechten.
- Zugriff ohne Konto: Leserechte für die Rangliste über eine schmale öffentliche Leseregel mit eingeschränkten Spalten; Beitritt und Fortschritts-Updates laufen ausschliesslich über Server-Funktionen, die das Team-Token prüfen. Kein direktes Schreiben aus dem Browser.
- Admin: `ADMIN_PASSWORD` als Secret, Prüfung timing-safe in einer Server-Funktion, verschlüsselte Session über `SESSION_SECRET`; nur damit sind Runden-Erstellung und Admin-Board erreichbar.
- Live-Updates über Realtime-Abo auf `teams` mit Polling als Rückfall.
- Neue Dateien: `src/routes/admin.tsx`, `src/routes/rangliste.tsx`, `src/lib/leaderboard.functions.ts` (nur Server-Funktionen), `src/lib/leaderboard.server.ts` (Helfer), `src/lib/round.ts` (lokaler Runden-/Team-Zustand), `src/start.ts` für die Middleware-Registrierung.
- Anpassungen: `src/routes/index.tsx` (Beitritt, Link zur Rangliste), `src/lib/progress.ts` (Sync-Hook bei `completeStage`/`finishGame`), Etappen-Routen bleiben inhaltlich unverändert.
