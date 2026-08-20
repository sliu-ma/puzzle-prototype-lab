# Zeithinweise schliessen sich selbst

Die Maja-Meldungen des globalen Timers (15/30/45/60/75/80/85 Minuten) bleiben heute offen, bis jemand „Verstanden“ drückt. Wer das Handy länger nicht anschaut, muss mehrere Meldungen nacheinander wegklicken.

## Neues Verhalten

- Jede Zeitmeldung schliesst sich nach 1 Minute automatisch.
- Kommt in der Zwischenzeit eine neue Meldung, ersetzt sie die alte sofort – es stapelt sich nichts mehr.
- Der Button „Verstanden“ bleibt, wer schneller ist, schliesst weiterhin selbst.
- Ein schmaler Fortschrittsbalken unter dem Text zeigt, dass die Meldung von selbst verschwindet.
- Die dringenden Meldungen der letzten 15 Minuten verhalten sich gleich (auch 1 Minute), damit die Ermittlung nicht blockiert wird.
- Das Bonuszeit-Pop-up („+X Minuten mehr Zeit“) bleibt unverändert, es muss weiterhin bestätigt werden.

## Technische Umsetzung

Nur `src/components/case-file/GlobalTimer.tsx`:

- Beim Setzen von `popup` einen Timer (60 s) starten, der `setPopup(null)` aufruft; Timer aufräumen, wenn das Pop-up vorher geschlossen wird.
- Die Bedingung `if (due && !popup)` zu `if (due)` ändern, damit eine fällige Meldung eine noch offene direkt überschreibt (jede Meldung wird weiterhin nur einmal via `markShown` angezeigt).
- Fortschrittsbalken als einfache CSS-Animation über bestehende Tokens, keine neuen Abhängigkeiten.

Keine Änderungen an Punkten, Badges, Timer-Logik oder Datenbank.
