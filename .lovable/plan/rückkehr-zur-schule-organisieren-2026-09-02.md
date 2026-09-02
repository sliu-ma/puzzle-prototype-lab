# Rückkehr zur Schule organisieren

Ziel: Sobald die Zeit um ist (oder die Lehrperson es auslöst), sehen alle Gruppen auf dem Handy einen unmissverständlichen Rückkehr-Befehl. Rätseln ist ab diesem Moment gesperrt – wie beim Zeitende.

## Ablauf für die Gruppen

1. Bis zum Ablauf des Zeitbudgets läuft alles wie heute: alle dürfen an ihren Rätseln bleiben.
2. Zeit um (oder Lehrperson löst Rückruf aus): Vollbild-Pop-up, das nicht wegklickbar ist:
  - Titel: "Zurück zur Schule"
  - Text: "Kehrt zurück zur Schule! In 10 Minuten geht es weiter."
  - Ein Button: "Zum Abschluss →"
3. Keine neuen Etappen, kein Hearing mehr – gelöste Etappen bleiben nur zum Nachlesen offen (Verhalten ist heute schon so, wird beibehalten).
4. Auf dem Abschluss-Screen bleibt eine schmale Rückkehr-Leiste oben stehen ("Kehrt zurück zur Schule in 10 Minuten geht es weiter"), damit der Hinweis unterwegs nicht verloren geht. Sie erscheint auch für Teams, die vor Zeitende fertig geworden sind.

## Ablauf für die Lehrperson

- Im Lehrer-Dashboard wird aus "Runde abschliessen" ein klar benannter Rückruf: Button "Runde beenden & alle zurückrufen" mit Bestätigungsdialog ("Alle Gruppen erhalten den Befehl, zur Schule zurückzukehren. Rätsel werden gesperrt.").
- Damit kann die Lehrperson die Gruppen auch vor Zeitende zurückrufen, wenn es zeitlich knapp wird.
- Die Live-Übersicht bleibt nach dem Rückruf sichtbar und zeigt weiterhin, welche Gruppen noch unterwegs bzw. noch nicht am Abschluss sind.

## Technische Umsetzung

- `src/components/case-file/TimeUpOverlay.tsx` und `RoundClosedOverlay.tsx`: Texte auf den Rückkehr-Befehl umstellen, gemeinsame Konstante für Treffpunkt-/Rückkehrtext (z. B. `RETURN_NOTICE` in `src/lib/story.ts`), Button-Ziel bleibt `/abschluss`.
- `src/components/case-file/FinalSummary.tsx`: Rückkehr-Banner oben, wenn Runde beendet ist (Zeit abgelaufen `isRoundOver()` oder `isRoundClosed()`).
- `src/routes/lehrer.$code.tsx`: Button-Label und Bestätigungstext des bestehenden `closed`-Statuswechsels anpassen (keine neue Serverlogik nötig – `teacher_set_round_status` mit `closed` existiert und wird vom `GlobalTimer` alle 10 s abgeholt).
- Keine Datenbank-Änderung, keine neue Route.