# Eigene Etappen-Reihenfolge pro Gruppe

Ziel: Die Reihenfolge bleibt fest vorgegeben (linear, kein Springen), aber jede Gruppe läuft eine andere Route. So stehen nicht alle Teams gleichzeitig am selben Ort.

## Grundidee: Rotation statt Zufall

Heute ist "Etappe 3" gleichzeitig die Position im Ablauf *und* das Rätsel (Wald-Lichtung, Biodiversität). Diese zwei Dinge werden getrennt:

- **Position** 1–5: die wievielte Station ein Team löst.
- **Station** 1–5: welches Rätsel/welcher Ort dahintersteht.

Jedes Team bekommt beim Beitritt einen Startversatz. Team 1 startet bei Station 1, Team 2 bei Station 2 usw. – danach zyklisch weiter:

```text
Team A: 1 -> 2 -> 3 -> 4 -> 5
Team B: 2 -> 3 -> 4 -> 5 -> 1
Team C: 3 -> 4 -> 5 -> 1 -> 2
Team D: 4 -> 5 -> 1 -> 2 -> 3
Team E: 5 -> 1 -> 2 -> 3 -> 4
```

Vorteil gegenüber Zufall: Bei bis zu 5 Teams ist garantiert **nie** ein Ort doppelt belegt. Ab 6 Teams wiederholt sich der Versatz, dann teilen sich jeweils zwei Teams eine Route – immer noch viel besser als heute, wo alle gleichzeitig starten. Das Finale (Gemeindesaal) bleibt für alle die letzte Station.

## Was die Gruppen merken

- Die Übersicht zeigt "Station 1 von 5" nach der eigenen Route, nicht mehr die feste Nummer des Rätsels.
- Der Umschlag-Hinweis am Ende einer Etappe nennt den **nächsten Ort der eigenen Route**, also bei jedem Team einen anderen.
- Jede Gruppe braucht ihre Route auch am Anfang: nach dem Briefing wird der erste Ort genannt.
- Die Sperre bleibt: nur die aktuelle Station ist offen, gelöste bleiben als Rückblick sichtbar.

## Was die Lehrperson braucht

- In der Lobby/Runde: pro Team die zugeteilte Route sichtbar (z. B. "B → C → D → E → A"), damit man beim Verteilen der QR-Codes und beim Nachfragen den Überblick hat.
- Ein Schalter pro Runde: Reihenfolge **fix** (wie heute, alle gleich) oder **rotiert**. So bleibt der Einzelspieler- und Testbetrieb unverändert.
- Auswertung: Zeiten weiter pro Rätsel vergleichbar (Station 3 = Biodiversität bei allen), zusätzlich die Position in der eigenen Route.

## Fairness und Punkte

- Punkte, Hinweise und Badges hängen weiter am **Rätsel**, nicht an der Position – so bleibt die Rangliste vergleichbar.
- Badges, die "das erste Rätsel" oder "auf Anhieb" prüfen, werden auf "erste Station der eigenen Route" umgestellt.
- Zeitbudget (90 Minuten) und Timer bleiben unverändert für alle gleich.

## Umsetzung (technisch)

1. **Datenbank**: `rounds.stage_mode` (`fixed` | `rotate`) und `teams.stage_order` (jsonb, z. B. `[3,4,5,1,2]`). `round_join` vergibt den Versatz deterministisch nach Beitrittsreihenfolge und gibt `stage_order` zurück; `round_state`, `teacher_list_rounds` und `teacher_round_report` liefern es mit aus. Neue Spalten mit Default, damit laufende Runden weiterlaufen.
2. **Client-Zustand**: `stage_order` in `round-client.ts` / `progress.ts` ablegen. Neue Helfer: `getStageOrder()`, `getStationForPosition(pos)`, `getPositionForStation(station)`; Fallback `[1,2,3,4,5]` für Einzelspieler.
3. **Fortschritt**: `KEY_STAGE` zählt künftig die **Position**. `completeStage(station)` schreibt Ereignisse weiter mit der Stationsnummer, erhöht aber die Position. `StageGate` prüft, ob die Station der aktuellen Position entspricht (statt `current < stage`).
4. **UI**: Übersicht (`index.tsx`), `NextStepCard`, `EnvelopeDialog`, `StageScoreRecap` und `SuccessBurst` beziehen Reihenfolge und Ortsnamen aus der Team-Route.
5. **Lehreransicht**: `LobbyPanel` zeigt die Route pro Team, `ReportPanel` ergänzt die Routenspalte.
6. **Migration-Reihenfolge**: erst SQL (Spalten + Funktionen), danach der Code, der die neuen Felder liest.

## Offene Punkte für später

- Ob bei mehr als 5 Teams zusätzlich ein Zeitversatz beim Start (z. B. 60 Sekunden) gewünscht ist.
- Ob die Lehrperson Routen manuell überschreiben darf.
