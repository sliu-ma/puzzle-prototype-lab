# Altlasten auf dem Gerät sauber aufräumen

Wenn auf einem Handy schon einmal eine Runde gespielt wurde, bleiben Reste im Speicher liegen. Das erklärt die beobachteten Merkwürdigkeiten. Vier bestätigte Ursachen:

1. **Wartezimmer-Eintrag der alten Runde bleibt liegen.** Der Eintrag `mm.lobby.pending` wird beim Zurücksetzen bewusst nicht gelöscht. Die Startseite leitet aber sofort und ohne Rückfrage ins Wartezimmer, sobald so ein Eintrag existiert (`StartForm.tsx`, Zeile 102). Ergebnis: Die Gruppe landet im Wartezimmer einer Runde von letzter Woche statt in der Anmeldung.
2. **Zwei Speicherreste werden nie gelöscht.** Das Zurücksetzen entfernt nur Schlüssel mit `maya-` und `akte-` (`progress.ts`, Zeilen 408–424). `etappe-5-tutorial-seen` (Tutorial in Etappe 5) und `mm.teacher.help.done` (abgehakte Hilferufe der Lehrperson, rundenübergreifend) überleben.
3. **Fortschritt und Runde können auseinanderlaufen.** Aufgeräumt wird nur an einer Stelle: im Countdown im Wartezimmer. Es gibt keine Prüfung, ob der gespeicherte Fortschritt überhaupt zur aktuell gespeicherten Runde/Gruppe gehört. Öffnet dasselbe Gerät später eine andere Runde auf einem anderen Weg, mischen sich alte Etappen, Punkte und Hinweise mit der neuen Gruppe.
4. **Nicht gesendete Punkte der alten Runde bleiben im Arbeitsspeicher.** Die Warteschlange in `round-client.ts` (Zeilen 111–116) wird beim Wechsel der Runde nicht geleert, es wird nur weiter im Hintergrund erneut versucht.

## Was geändert wird

**Ein vollständiges Aufräumen.** `resetAll()` in `src/lib/progress.ts` entfernt künftig alle Spiel-Schlüssel: `maya-`, `akte-`, `etappe-` und `mm.` (ausser dem Lehrer-Passwort, das ohnehin nur in der Sitzung liegt). Zusätzlich wird der Wartezimmer-Eintrag mitgelöscht und die Punkte-Warteschlange geleert.

**Runde und Fortschritt fest verkoppeln.** Beim Start einer Partie wird die Kennung der Gruppe zusammen mit dem Fortschritt gespeichert. Beim Öffnen der App prüft die App einmal: gehört der gespeicherte Fortschritt zur gespeicherten Runde/Gruppe? Wenn nicht, wird der alte Stand gelöscht, statt ihn zu vermischen.

**Kein stiller Sprung mehr ins alte Wartezimmer.** Die Startseite springt nur noch ins Wartezimmer, wenn die gespeicherte Runde beim Server noch als offen bzw. laufend bekannt ist. Ist sie abgeschlossen, gelöscht oder unbekannt, wird der Eintrag verworfen und die normale Anmeldung gezeigt. Zusätzlich erscheint im Wartezimmer eine kleine Zeile «Falsche Runde? Neu anmelden», die den Eintrag löscht.

**Hilferuf-Häkchen pro Runde.** Im Lehrerbereich werden die als erledigt markierten Hilferufe unter einem Schlüssel pro Rundencode gespeichert, damit Häkchen aus einer alten Runde nicht in die neue durchschlagen.

**«Neu starten» im Spiel** löscht künftig ebenfalls alles inkl. Wartezimmer-Eintrag; die Gruppe muss sich danach sauber neu anmelden, statt halb in der alten Runde zu hängen.

## Betroffene Dateien

- `src/lib/progress.ts` – vollständigeres `resetAll()`, Gruppen-Kennung beim Fortschritt
- `src/lib/round-client.ts` – Warteschlange beim Rundenwechsel leeren, Wartezimmer-Eintrag mit aufräumen
- `src/components/case-file/StartForm.tsx` – Wartezimmer-Sprung nur nach Prüfung der Runde
- `src/routes/lobby.tsx` – Ausweg «Falsche Runde? Neu anmelden»
- `src/components/case-file/ProgressRecovery.tsx` – Prüfung Fortschritt ↔ Gruppe beim Start
- `src/components/case-file/GutachtenRaetsel.tsx` – Tutorial-Schlüssel auf `akte-`-Präfix umstellen
- `src/components/teacher/MessageRooms.tsx` – Häkchen pro Rundencode

Keine Änderungen an Datenbank, Zugriffsregeln oder Spielinhalten.
