# Etappennamen korrigieren + Uhr im Lehrerdashboard anhalten

## 1. E4 = Wohnen, E5 = Energie

In der Lehreransicht sind die Themen vertauscht: dort steht heute E4 „Energie" und E5 „Gutachten".
Richtig ist (wie in der Spielübersicht hinterlegt): E1 Mobilität, E2 Konsum, E3 Biodiversität,
**E4 Wohnen**, **E5 Energie**, HEA Hearing.

Wirkt sich sofort aus auf: Live-Statuszeilen, Detail-Popup, Klassenverteilung, Auswertung
(Etappenvergleich, „zäheste Etappe") und den CSV-Export.

## 2. Zeit stoppt am Rundenende

Heute laufen alle Uhren im Dashboard endlos weiter („läuft seit 263 min", „Unterwegs zu E2
seit 256 min"), obwohl die Runde längst vorbei ist.

Neu gibt es eine **Rundenuhr mit Endpunkt**:

- Endzeitpunkt = Rundenstart + Zeitbudget (z. B. 90 min). Ab dann friert alles ein.
- Ist die Runde vorher abgeschlossen worden, gilt der Zeitpunkt des Abschlusses (ersatzweise
  das letzte Ereignis einer Gruppe) als Endpunkt.
- Kopfzeile: Restzeit bleibt auf 0:00 und statt „läuft seit … min" steht dann
  „Runde beendet · Dauer 90 min von 90".
- Statuszeilen: „Unterwegs zu E2 · seit 14 min" bleibt auf dem Stand vom Rundenende stehen,
  mit Zusatz „(bei Rundenende)". Es kommen keine neuen Warnfarben mehr dazu, bestehende
  bleiben sichtbar.
- Gruppen, die vor dem Ende fertig wurden, sind wie bisher „Fertig · X min".

## Technische Umsetzung

- `src/components/teacher/ProgressMatrix.tsx`
  - `COL_NAME`: 4 → „Wohnen", 5 → „Energie".
  - `assessTeams(teams, startedAt, now)` bekommt ein bereits gedeckeltes `now` übergeben;
    zusätzlich ein Flag `roundOver`, das neue Warnungen unterdrückt und das Label
    „(bei Rundenende)" auslöst.
- `src/components/teacher/LiveBoard.tsx`
  - Neue Ableitung `endMs = startMs + budgetMin*60_000`; bei `status === "closed"`
    zusätzlich der frühere Wert aus dem letzten `lastEventAt` aller Teams.
  - `effectiveNow = Math.min(now, endMs)` wird an `ProgressMatrix` weitergereicht;
    `elapsedMs` und Restzeit nutzen denselben Deckel.
  - `LiveBoard` erhält dafür `status` als zusätzliche Prop aus `src/routes/lehrer.$code.tsx`
    (dort bereits als `round.status` vorhanden).
- Keine Änderungen an Datenmodell, Serverlogik oder Punktevergabe.
