# Punkte: linearer Abfall, Zeit ab QR-Scan, Leaderboard-Ansicht

## 1. Punkte sinken ab der ersten Sekunde

Der Bonus für Schnelligkeit beginnt sofort zu sinken, nicht erst nach einem Viertel der Etappenzeit.

- Start bei 1000 Punkten, linearer Abfall bis 600 Punkte bei Erreichen der Referenzdauer (10 Minuten bei 90-Minuten-Budget, weiter prozentual gerechnet).
- Danach bleibt es bei 600 Punkten.
- Beispiel: nach 2 Minuten ca. 920 Punkte, nach 5 Minuten 800 Punkte, ab 10 Minuten 600 Punkte.
- Hinweis-Deckel (90 % / 75 % / 50 %) bleibt unverändert.

## 2. Etappenzeit zählt ab dem QR-Scan

Bisher zählt die Zeit ab Spielstart bzw. ab Abschluss der Vorgänger-Etappe, also inklusive Weg und Umschlag. Neu zählt nur die reine Rätselzeit.

- Beim erfolgreichen Scan wird ein Zeitstempel für diese Etappe gespeichert.
- Die Etappendauer für die Punkte = Abschluss minus Scan-Zeitstempel.
- Fallback (kein Scan-Zeitstempel vorhanden, z. B. Freischaltung im Rückblick oder Testmodus): bisherige Berechnung.
- Der 90-Minuten-Gesamttimer und die Badges bleiben unverändert.

## 3. Punkteanzeige als Leaderboard

Tap auf die Punktekachel öffnet neu ein gestaltetes Leaderboard statt der reinen Liste.

- Kopf: Podest-Optik mit dem eigenen Team (Teamname aus der Anmeldung), Rang, Gesamtpunkte, dazu Platzhalter-Zeilen für weitere Teams, die später aus der Datenbank kommen.
- Zeilen im Papier-/Akten-Stil: Rangzahl, Teamname, Punkte, kleiner Balken für den Abstand zur Spitze; das eigene Team hervorgehoben.
- Darunter ein aufklappbarer Bereich „Meine Punkte" mit grober Aufschlüsselung: Etappen gesamt, Abzug durch Hinweise, Abzeichen, Hearing. Keine Detailzeile pro Etappe mehr.
- Fußnote: „Weitere Teams erscheinen, sobald die Ermittlungen verbunden sind."

## Technische Hinweise

- `src/lib/score.ts`: `FULL_UNTIL` entfällt, `stageTimeFactor` wird rein linear von 1.0 auf 0.6 über die Referenzdauer.
- `src/components/case-file/QRGate.tsx`: nach erfolgreichem Scan Zeitstempel unter `maya-stage-scan-ts:<storageKey>` schreiben; Mapping storageKey → Etappe in einem kleinen Helfer.
- `src/lib/progress.ts`: `completeStage` nutzt für `recordStageSolved` den Scan-Zeitstempel der Etappe, sonst den bestehenden Startpunkt. Reset entfernt die Scan-Zeitstempel mit.
- Neu `src/components/case-file/Leaderboard.tsx`, eingebunden im Dialog von `ScoreCounter.tsx`; Teamname aus dem bestehenden Anmelde-Speicher.
- Alle Farben über bestehende Design-Tokens, mobile-first.
