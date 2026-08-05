# Zwischenstand-Moment nach jeder Etappe

Ein einmaliger, ruhiger "Punkteabrechnung"-Moment pro Etappe: Die Punkte der gerade gelösten Etappe zählen animiert hoch, danach klettert das Team sichtbar im Leaderboard nach oben.

## Wann er erscheint (keine Kollisionen)

Feste Reihenfolge nach dem Lösen eines Rätsels:

```text
Rätsel gelöst
  -> "Gelöst!"-Stempel (SuccessBurst)
  -> Badge-Overlays (falls welche verdient, Warteschlange wie bisher)
  -> Fachlicher Input (Karussell)
  -> [NEU] Zwischenstand: Punkte + Rangaufstieg
  -> Abschlusskarte "Etappe X öffnen" + Umschlag-Dialog
```

Der Zwischenstand liegt damit zwischen Input und Umschlag-Karte, also nie gleichzeitig mit dem Umschlag-Pop-up. Zusätzliche Absicherung: er startet erst, wenn kein Badge-Overlay mehr offen ist, und wird pro Etappe nur einmal gezeigt (gemerkt im Gerätespeicher, beim Rückblick auf eine gelöste Etappe erscheint er nicht erneut).

## Was man sieht

1. Kopf: "Zwischenstand · Etappe X von 5"
2. Abrechnung, Zeile für Zeile eingeblendet:
   - Etappenpunkte (inkl. Zeitabzug)
   - Hinweis-Faktor, nur wenn Hinweise genutzt wurden
   - Badge-Punkte, nur wenn in dieser Etappe Badges dazukamen
3. Grosse Gesamtpunktzahl, die vom alten auf den neuen Wert hochzählt
4. Rangaufstieg: Kompakte Leaderboard-Liste (Medaillen-Design wie bisher). Die eigene Zeile startet auf dem alten Platz und wandert animiert auf den neuen Platz, mit kurzem Aufleuchten und "Rang X → Y".
5. Solo-Spiel ohne Klassenrunde: statt Rangliste eine Punkte-Zeitleiste der bisherigen Etappen, damit der Moment auch allein Sinn ergibt.
6. Ein Button "Weiter" schliesst den Moment; Overlay ist auch per Tap ausserhalb / ESC schliessbar. Reduzierte Bewegung wird respektiert (kein Kletter-Effekt, direkte Anzeige).

Ganz auf Handy ausgelegt: volle Breite, grosse Zahl, Button unten im Daumenbereich.

## Technische Umsetzung

- Neue Komponente `src/components/case-file/StageScoreRecap.tsx`: Overlay mit Count-Up (Muster aus `ScoreCounter`), Abrechnungszeilen aus `getScore()`/`computeScore` in `src/lib/score.ts` und kompakter Rangliste (wiederverwendete Zeilen-/Medaillen-Darstellung aus `Leaderboard.tsx`, in eine gemeinsame `RankRow`-Darstellung ausgelagert).
- Rangdaten: `getRoundLeaderboard` aus `src/lib/rounds.functions.ts` einmal vorher (alter Rang, vor dem Buchen der Etappenpunkte) und einmal nachher abfragen; ohne Runde (`getRoundSession() === null`) greift die Solo-Variante.
- Anzeige-Steuerung: neues Flag pro Etappe in `src/lib/persist.ts` (`akte-N-recap-seen`).
- Badge-Kollision: `BadgeToast.tsx` meldet seinen Offen/Zu-Zustand über ein Fensterereignis (`badge:overlay`); `StageScoreRecap` wartet auf "zu", bevor es einblendet.
- Einbindung in `src/routes/etappe-1.tsx` bis `etappe-5.tsx` im Schritt `naechstes`, direkt nach dem bestehenden `completeStage(n)`-Effekt, sodass die gebuchten Punkte schon vorliegen. Die Umschlag-Karte bleibt unverändert und wird erst nach dem Schliessen des Zwischenstands bedienbar.
