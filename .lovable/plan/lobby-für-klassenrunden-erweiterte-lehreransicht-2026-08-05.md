# Lobby für Klassenrunden + erweiterte Lehreransicht

## 1. Ablauf für die Klasse

- Runde hat neu drei Zustände: **Lobby** (Teams melden sich an), **Läuft** (gemeinsam gestartet), **Beendet**.
- Nach dem Rundencode und der Team-Registrierung landen die Gruppen in einer **Warte-Lobby** statt direkt im Spiel:
  - Rundentitel, eigener Teamname, Liste aller angemeldeten Teams (aktualisiert sich automatisch).
  - Hinweis „Warten auf die Lehrperson – Handy nicht schliessen“.
  - Wird das eigene Team von der Lehrperson entfernt, erscheint eine Meldung und der Weg zurück zur Anmeldung.
- Sobald die Lehrperson startet, springen alle Geräte automatisch in Etappe 1. Der 90-Minuten-Timer beginnt für alle mit der **gemeinsamen Startzeit** der Runde, nicht mit der Registrierung.
- Wer sich später anmeldet, während die Runde schon läuft, startet direkt (Zeit läuft ab gemeinsamer Startzeit) – so bleiben Nachzügler nicht hängen.
- Solo-Codes (`OEKOLOGIE`, Debug-Code) bleiben unverändert: sofort starten, keine Lobby.

## 2. Lehreransicht (`/lehrer`)

Pro Runde ein aufklappbarer Bereich mit drei Reitern: **Lobby**, **Live**, **Auswertung**.

- **Runde verwalten**
  - Titel und Zeitbudget nachträglich anpassen. (Beachte, welche Implikation es hat mit den Triggern der Nachrichten "Noch 15 Minuten" usw und den adaptiven Nachrichten im Text).
  - Runde löschen (mit Rückfrage; löscht Teams und Punkte dieser Runde).
  - Rundencode gross dargestellt, mit Kopier-Knopf.
  - Anmeldung öffnen/schliessen wie heute.
- **Lobby**
  - Live-Liste der Teams mit Mitgliedernamen und Anmeldezeit.
  - Team löschen (falsch angemeldet, Doppelanmeldung).
  - Grosser Knopf „Runde für alle starten“ mit Anzahl Teams.
- **Live**
  - Rangliste mit Punkten, Etappe (x/5), Hinweisen, Status „spielt“ / „fertig“.
  - Verstrichene Zeit der Runde und Restzeit zum Budget.
  - Beamer-Modus: grosse Schrift, nur Rang, Team, Punkte.
- **Auswertung** (nach dem Spiel)
  - Pro Team: Gesamtpunkte, Gesamtzeit bis fertig, Zeit pro Etappe, Anzahl Hinweise, erreichte Abzeichen, Hearing-Ergebnis.
  - Klassenübersicht: Durchschnittspunkte, schnellste Etappe, meistgenutzte Hinweise (zeigt, welche Etappe schwierig war).
  - Export als CSV zum Ablegen/Weiterverwenden.

## 3. Technische Umsetzung

**Migration**

- `rounds`: neue Spalten `started_at timestamptz`, Status erweitert auf `lobby | running | closed` (bestehende `open` → `lobby`, `closed` bleibt).
- Neue/angepasste SECURITY-DEFINER-Funktionen (Rechte wie bisher, Passwort-Hash-Prüfung über `assert_teacher`):
  - `round_state(p_code, p_team_id, p_token_hash)` – Status, `started_at`, Teamnamen der Lobby, ob eigenes Team noch existiert.
  - `teacher_start_round`, `teacher_update_round` (Titel, Budget), `teacher_delete_round`.
  - `teacher_round_report(p_password_hash, p_code)` – Auswertungsdaten inkl. Anmeldezeit, `finished_at`, Ereignisse pro Team.
  - `round_join` akzeptiert Status `lobby` und `running`; `round_lookup` gibt `started_at` mit zurück.

**Frontend**

- `src/lib/rounds.functions.ts`: neue Server-Funktionen `getRoundState`, `teacherStartRound`, `teacherUpdateRound`, `teacherDeleteRound`, `teacherRoundReport`.
- `src/lib/round-client.ts`: `RoundSession` erhält `startedAt` und `status`; Helfer zum Setzen der gemeinsamen Startzeit.
- Neue Route `src/routes/lobby.tsx`: pollt `getRoundState` (alle 3 s), zeigt Teamliste, ruft bei Start `registerTeam` + setzt Startzeitstempel und navigiert zu `/etappe-1`.
- `src/lib/progress.ts`: `registerTeam` erhält optionalen `startTs`, damit der Timer die Rundenstartzeit nutzt.
- `StartForm.tsx`: bei Rundencode nach `joinRound` nach `/lobby` statt direkt ins Spiel; bei laufender Runde direkt starten.
- `src/routes/lehrer.tsx` wird in kleinere Komponenten unter `src/components/teacher/` aufgeteilt (Rundenkarte, Lobby-Panel, Live-Rangliste, Auswertung), damit die Datei schlank bleibt.