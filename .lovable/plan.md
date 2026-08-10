# Punkteanzeige korrigieren

Die Punkte selbst werden richtig berechnet. Falsch ist die **Darstellung**: die Aufschlüsselung summiert sich nicht auf das Total, das Minuszeichen wird als Komma gezeigt, und der Zwischenstand schätzt den Zugewinn statt ihn zu berechnen. Daraus entstehen die verwirrenden Zahlen.

## 1. Aufschlüsselung summiert sich nicht (Hauptursache)

In der Übersicht („Meine Punkte") steht bei „Etappen" bereits der Wert **nach** Hinweis-Abzug, darunter zusätzlich „Abzug durch Hinweise" als negative Zahl. Der Abzug wird damit zweimal gezeigt, und die Zeilen ergeben zusammen nie das Total.

Neu:

```text
Etappen (3 gelöst)            +2810   (Rohpunkte, vor Hinweisen)
Abzug durch Hinweise           -350
Abzeichen (2)                  +800
Hearing (8 richtig, 2 falsch)  +700
------------------------------------
Total                          3960
```

Damit stimmt die Summe genau mit dem angezeigten Total überein.

## 2. Minuszeichen statt Komma

Bei negativen Änderungen zeigt die Punktekachel `,50` statt `−50`. Wird korrigiert.

## 3. Zwischenstand nach der Etappe

Das grüne „+X in dieser Etappe" wird heute geschätzt: Abzeichen werden über ein Zeitfenster (60 Sekunden nach dem Lösen) der Etappe zugeordnet. Fällt ein Abzeichen daneben, passt der Startwert des Hochzählens nicht zum Total, und die Zahlen wirken zufällig.

Neu wird der Zugewinn exakt berechnet: Punktestand aus allen Ereignissen **vor** dieser Etappe gegen den aktuellen Stand. Die Differenz ist immer genau die Zahl, die hochgezählt wird — kein Zeitfenster mehr. Zusätzlich wird der Zugewinn kurz aufgeteilt gezeigt („Etappe +920 · Abzeichen +300"), damit klar ist, woher er kommt.

## Technische Hinweise

- `src/components/case-file/Leaderboard.tsx`: Zeile „Etappen" nutzt `score.stages` Rohpunkte (Summe `rawPoints`) statt `stagePoints`; Abzugszeile bleibt.
- `src/lib/score.ts`: `ScoreBreakdown` erhält `stageRawPoints` (Summe der `rawPoints`), damit die Anzeige nicht selbst rechnen muss.
- `src/components/case-file/ScoreCounter.tsx`: negatives Delta als `−N` formatieren.
- `src/components/case-file/StageScoreRecap.tsx`: `gain` über `computeScore(eventsVorEtappe)` gegen `getScore()` bestimmen; Zeitfenster-Heuristik für Abzeichen entfernen, Aufteilung (Etappe / Abzeichen) aus derselben Rechnung ableiten.
- Keine Änderung an der Punkteregel selbst: gleiche Punkte, nur korrekt dargestellt.
