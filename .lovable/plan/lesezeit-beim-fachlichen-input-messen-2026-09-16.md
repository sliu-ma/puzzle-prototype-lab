# Lesezeit beim Fachlichen Input messen

Ja, das ist möglich. Heute wird pro Etappe nur die Rätselzeit, die Wegzeit und die Hinweisnutzung erfasst. Der fachliche Input (die Wischkarten) wird nicht gemessen. Das ergänzen wir.

## Was die Lehrperson danach sieht

In der Auswertung erscheint pro Etappe eine neue Kennzahl **«Lesezeit Fachinput»** (Median, Spannweite über alle Gruppen), und in der Etappen-Detailansicht die Lesezeit jeder Gruppe. Zusätzlich sichtbar:

- Gesamtlesezeit pro Gruppe (Summe über alle fünf Etappen)
- Ein Hinweis, wenn eine Gruppe die Karten offensichtlich nur durchgewischt hat (z. B. unter 15 Sekunden)
- Die Werte kommen in den CSV-Export (Spalte pro Etappe und im Rohdaten-Export)

Für die Schülerinnen und Schüler ändert sich nichts: keine Anzeige, keine Punkte, kein Zeitdruck. Es ist eine reine Erhebung für die Masterarbeit.

## Wie gemessen wird

Gezählt wird die Zeit, in der die Input-Karten wirklich sichtbar auf dem Bildschirm sind: Start beim Öffnen des Inputs, Stopp beim Weiterklicken, Zurückgehen oder wenn das Handy in den Hintergrund geht bzw. der Bildschirm gesperrt wird. Kommt die Gruppe später zurück, wird weitergezählt und die Werte werden addiert. Zusätzlich wird festgehalten, wie viele der Karten überhaupt angesehen wurden (z. B. 2 von 3), damit sichtbar wird, ob durchgewischt wurde.

## Technische Umsetzung

1. **Neuer Ereignistyp** `input_read` in `src/lib/score.ts` (Erhebungsereignis ohne Punkteeinfluss), mit `stage`, `durationSec`, `cardsSeen`, `cardsTotal`. Aufnahme in die `z.enum`-Liste und die optionalen Felder in `eventSchema` (`src/lib/rounds.functions.ts`), damit die Ereignisse serverseitig akzeptiert werden.
2. **Erfassung** in `src/components/case-file/InputCarousel.tsx`: neue Pflicht-Prop `stage`; sichtbare Lesezeit über einen Timer plus `visibilitychange`; höchster erreichter Karten-Index als `cardsSeen`; beim Verlassen (`onNext`/`onBack`/Unmount) genau ein `input_read`-Ereignis pro Etappe über `addScoreEvent` (idempotente ID `input_read:<stage>`, Aggregation bei erneutem Besuch). Prop `stage` in `etappe-1.tsx` bis `etappe-5.tsx` ergänzen.
3. **Auswertung** in `src/lib/rounds.server.ts` (`buildReport`): pro Etappe `readSec`, `cardsSeen`, `cardsTotal` aus den Ereignissen aggregieren, in `ReportStage` ergänzen, plus `readMinTotal` auf `ReportTeam`.
4. **Darstellung** in `src/components/teacher/ReportPanel.tsx`: Kennzahl «Lesezeit Fachinput» in der Etappen-Analyse (`analyseStage`), Zeile in der Detail-Ansicht pro Gruppe, Markierung bei sehr kurzer Lesezeit, neue Spalten in den CSV-Exporten (`teams`, `stages`, `events`).

Keine Datenbank-Migration nötig: Ereignisse laufen über den bestehenden `round_push_events`-Weg. Alte Runden ohne diese Ereignisse zeigen «–».

## Prüfung

`bunx tsgo --noEmit`, Build, und ein Durchlauf einer Etappe im Preview, bei dem das Ereignis nach dem Weiterklicken im lokalen Ereignis-Log auftaucht.
