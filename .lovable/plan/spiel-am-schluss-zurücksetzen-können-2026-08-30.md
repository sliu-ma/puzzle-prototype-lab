# Spiel am Schluss zurücksetzen können

Auf dem Schlussscreen (nach gewonnenem Hearing und nach Zeitablauf) gibt es heute nur „Zurück zum Start“. Der Spielstand bleibt gespeichert, dadurch landet man wieder im Abschluss und kommt nicht raus.

## Neues Verhalten

- Unter dem Button „Zurück zum Start“ kommt ein zweiter, dezenter Button **„Neue Ermittlung starten (alles zurücksetzen)“**.
- Ein Klick fragt kurz nach („Wirklich alles löschen? Punkte, Abzeichen und Fortschritt gehen verloren.“). Nach Bestätigung wird der komplette Spielstand gelöscht und die Startseite geöffnet, sodass eine neue Runde von vorn beginnt.
- Beide Abschluss-Situationen (Hearing gewonnen und Zeit abgelaufen) erhalten den Button, da sie dieselbe Karte nutzen.

## Technisch

- `src/components/case-file/FinalSummary.tsx`: zweiten Button im Footer-Bereich ergänzen, der `resetAll()` aus `@/lib/progress` aufruft und anschliessend auf `/` navigiert (harter Reload, damit alle Anzeigen leer starten). Bestätigung über den bestehenden AlertDialog aus `@/components/ui/alert-dialog`.
- Keine Änderungen an Punktelogik, Badges oder Datenbank.
