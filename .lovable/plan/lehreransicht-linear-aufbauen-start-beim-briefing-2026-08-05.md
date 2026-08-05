# Lehreransicht linear aufbauen + Start beim Briefing

## 1. Start beim Briefing statt Etappe 1

Beim gemeinsamen Start springen alle Geräte künftig auf die Startseite, wo das Briefing (IntroScreen) erscheint. Erst danach geht es zur Übersicht bzw. Etappe 1. Der Timer läuft weiterhin ab der gemeinsamen Startzeit der Runde.

## 2. Countdown in der Lobby

Wenn die Lehrperson startet, zeigt die Lobby zuerst einen sichtbaren Countdown (3 – 2 – 1 – Los), damit die Klasse gemeinsam losgeht, bevor das Briefing öffnet.

## 3. Eine Seite pro Runde

- `/lehrer` ist nur noch eine schlanke, lineare Liste: Rundencode gross, Titel, Status, Anzahl Teams, ein Tipp «öffnen». Kein Aufklappen, keine verschachtelten Reiter.
- Neue Seite `/lehrer/<code>` pro Runde mit klarem, linearem Ablauf im Stil von Quiz-Apps:
  1. **Vorbereiten** – Code gross + Kopieren, Titel und Zeitbudget bearbeiten, Runde löschen.
  2. **Lobby** – Teamliste live, Team entfernen, grosser Startknopf.
  3. **Live** – schlichte Rangliste (Rang, Team, Punkte, Etappe, fertig/spielt) plus verstrichene und verbleibende Zeit.
  4. **Auswertung** – Kennzahlen statt Rangliste (siehe Punkt 5).
  Der Schritt richtet sich automatisch nach dem Rundenstatus (Lobby → Live → Auswertung), lässt sich aber manuell wechseln.

## 4. Bearbeiten nur vor dem Spiel

Titel, Zeitbudget und Löschen sind nur sichtbar, solange die Runde in der Lobby ist. Sobald sie läuft, ist der Bereich ausgeblendet mit dem Hinweis «Änderungen nur vor dem Start möglich». (Löschen bleibt nach Abschluss möglich.)

## 5. Auswertung als Kennzahlen

Keine zweite Rangliste. Stattdessen:

- **Klasse gesamt**: Anzahl Teams, wie viele fertig, Ø Punkte, Ø Gesamtzeit, Ø Hinweise, Ø Zeit pro Etappe (E1–E5), schwierigste Etappe (meiste Hinweise / längste Zeit), Ø Hearing-Fehler.
- **Pro Team**: Gesamtzeit, Zeit je Etappe, Hinweise, Abzeichen, Hearing-Ergebnis, Punkte – als kompakte Zeile, sortiert nach Teamname statt als Podest.
- CSV-Export bleibt, ergänzt um die Klassen-Durchschnitte.

## 6. Beamer-Modus entfernt

Der Beamer-Umschalter in der Live-Ansicht wird gestrichen; die Live-Rangliste bleibt gut lesbar.

## 7. Wording «Runde abschliessen»

Statt «Anmeldung schliessen» / «Anmeldung öffnen» heisst es künftig **«Runde abschliessen»** (Status «abgeschlossen») und **«Runde wieder öffnen»**. Die Anzeige nutzt Lobby / läuft / abgeschlossen.

## Technische Umsetzung

- `src/routes/lobby.tsx`: nach `status === "running"` erst Countdown-Overlay (3 s), dann `beginGame` und `navigate({ to: "/" })`; Briefing-Flag nicht setzen, damit `IntroScreen` erscheint.
- Neue Route `src/routes/lehrer.$code.tsx` (Passwort aus `sessionStorage`, sonst Login-Feld) mit den vier Schritten; `src/routes/lehrer.tsx` wird zur Liste + Anlegen-Formular.
- `src/components/teacher/`: `RoundCard.tsx` → schlanke Listenzeile mit Link; `LiveBoard.tsx` ohne Beamer-State; `ReportPanel.tsx` neu als Kennzahlen-Panel (Aggregation aus dem bestehenden `teacherRoundReport`-Ergebnis, inkl. Ø Etappenzeiten aus `stageMinutes`); `LobbyPanel.tsx` behält Teamliste/Start, Hinweistext auf Briefing angepasst.
- Bearbeiten/Statuswechsel nutzen die bestehenden Funktionen `teacherUpdateRound`, `teacherDeleteRound`, `teacherSetRoundStatus`, `teacherStartRound` – keine Datenbankänderung nötig.
