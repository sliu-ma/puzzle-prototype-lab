# Zeit vorbei: Abschluss statt Sackgasse

Heute blockiert ein Vollbild-Screen („Die Zeit ist leider um.“) alles und lässt nur „Zurück zum Start & Zurücksetzen“ zu. Neu endet die Runde mit einem echten Abschluss.

## Neues Verhalten

1. **Pop-up „Die Zeit ist um“** erscheint, sobald das Zeitbudget abgelaufen ist. Kurzer Text von Maja (Gemeindeversammlung hat begonnen) und ein Button **„Zum Abschluss →“**. Kein Zurücksetzen mehr, kein Blockieren der ganzen Seite.
2. **Abschlussseite** zeigt dieselben Angaben wie heute nach gewonnenem Hearing: Schlusspunktzahl, Teamname, Rangliste, Chips für Zeit und genutzte Hinweise, Abzeichen-Übersicht, Button „Zurück zum Start“. Kopfzeile/Siegel sind an die Situation angepasst („Zeit abgelaufen“ statt „Fall gelöst“, ohne Konfetti); Punkte werden ganz normal aus dem bisherigen Spielstand berechnet.
3. **Spiel ist gesperrt**: Nach Zeitablauf lassen sich keine Etappen und kein Hearing mehr öffnen. Auf der Übersicht sind die Etappen-/Finale-Karten deaktiviert und zeigen den Hinweis „Zeit abgelaufen – zum Abschluss“ mit Link zur Abschlussseite. Wer eine Etappen- oder Finale-Adresse direkt aufruft, landet auf einem gesperrten Screen mit demselben Link. Rückblick auf bereits gelöste Etappen bleibt möglich.
4. **Vor Zeitablauf ändert sich nichts**, ebenso nicht am Ablauf, wenn das Hearing rechtzeitig gewonnen wird.

## Technisch

- Neue Route `src/routes/abschluss.tsx`: rendert die Abschluss-Zusammenfassung; ohne Team → Verweis auf Startseite.
- Der Punkte-/Fakten-/Badge-Block aus `OutroScreen` (Step 2 in `src/routes/finale.tsx`) wird in eine gemeinsame Komponente `src/components/case-file/FinalSummary.tsx` ausgelagert (Prop `reason: "won" | "timeout"` steuert Überschrift, Siegel und Konfetti). Das Finale nutzt sie unverändert weiter.
- `src/components/case-file/TimeUpOverlay.tsx` wird zu einem Dialog mit Button auf `/abschluss` (statt `resetAll()`); Einbindung in `GlobalTimer.tsx` bleibt, das Overlay blockiert die Seite nicht mehr.
- Sperre: `StageGate` prüft zusätzlich `isTimeUp()` (Stufe 1–6) und zeigt bei abgelaufener Zeit den gesperrten Screen; auf `src/routes/index.tsx` wird `openStage()` bei abgelaufener Zeit unterdrückt und `NextStepCard` deaktiviert dargestellt.
- Keine Änderungen an Punktelogik, Badges, Timer-Budget oder Datenbank.
