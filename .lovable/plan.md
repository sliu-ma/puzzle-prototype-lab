# Schlussscreen neu: Punkte im Zentrum

Der letzte Outro-Schritt („Abschluss der Ermittlung“) wird umgebaut. Heute stehen Zeit und Hinweise als zwei grosse Kacheln im Zentrum, die Punktzahl fehlt komplett.

## Neue Anordnung (von oben nach unten)

1. **Punkte-Held (zentral):** grosse animierte Gesamtpunktzahl (Count-up), darunter Teamname und Rang-Chip („Rang 1“). Solange nur das eigene Team lokal gespeichert ist, ist der Rang 1; sobald andere Teams aus der Datenbank kommen, greift dieselbe Anzeige.
2. **Rangliste:** kompakte Liste mit dem eigenen Team hervorgehoben, plus dezenter Hinweiszeile, dass weitere Teams folgen. Darunter eine aufklappbare Punkte-Aufschlüsselung (Etappen, Hinweis-Abzug, Abzeichen, Hearing) — dieselbe Logik wie im Leaderboard-Dialog.
3. **Kleine Fakten:** Zeit und genutzte Hinweise (x / 15) als zwei schlanke, kleine Chips in einer Zeile statt der bisherigen grossen Kacheln. Zusätzlich gelöste Etappen als dritter Chip.
4. **Badges:** die bestehende Badge-Übersicht bleibt unverändert.
5. **Abschluss-Button** „Zurück zum Start“ bleibt.

Gestaltung: Papier-/Akten-Look wie bisher, Punktzahl in Schreibmaschinen-Ziffern, Siegel „Fall gelöst“ und Konfetti bleiben. Alles mobil-first, einspaltig, ohne horizontales Scrollen.

## Technisch

- `src/routes/finale.tsx`: Step 2 in `OutroScreen` umbauen; Score über `getScore()` aus `src/lib/score-events.ts` einmalig beim Mount einfrieren.
- Rangliste + Aufschlüsselung durch Wiederverwendung von `src/components/case-file/Leaderboard.tsx` in einer kompakten Variante (neues optionales `variant="outro"`-Prop, damit der Dialog unverändert bleibt).
- Count-up-Animation als kleine lokale Hilfsfunktion analog zu `ScoreCounter.tsx`.
- Keine Änderungen an Punktelogik, Badges oder Datenspeicherung.
