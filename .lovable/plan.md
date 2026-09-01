# Live-Übersicht: klarere Abschnitts-Anzeige

Ziel: Auf einen Blick sehen, ob eine Gruppe gerade **unterwegs** ist (Posten noch nicht gefunden) oder **am Rätsel** sitzt – inklusive des Wegs von der Schule zum ersten Posten.

## Was neu ist

1. **Jede Zeile bekommt eine kleine Weg-/Rätsel-Leiste** statt nur einer Zahl im Kästchen:

```text
Team Fuchs   [E1 ✓ 8']——[ 6' unterwegs ]──QR──[ 11' am Rätsel E2 ]   42 Pkt
```

- Erster Abschnitt: Zeit seit Rundenstart bzw. seit Lösung der Vor-Etappe = unterwegs.
- QR-Marke: sichtbarer Punkt, sobald der QR-Code am Posten gescannt wurde.
- Danach läuft die Rätselzeit weiter, die Wegzeit bleibt als abgeschlossener Balken stehen.

2. **Der Weg von der Schule zählt mit.** Für Etappe 1 ist der Startpunkt der Rundenstart (Lehrperson startet die Runde), so wird der Schulweg als „unterwegs zu E1" angezeigt und in der Auswertung als Zwischenzeit für Etappe 1 gespeichert (heute bleibt sie leer).

3. **Zellen-Beschriftung eindeutig.** In der Matrix zeigt die aktive Zelle künftig die Zahl plus ein Symbol: Fussgänger-Icon = unterwegs, Lupen-Icon = am Rätsel. Damit ist klar, worauf sich die Minutenzahl bezieht.

4. **Hearing.** Für das Hearing gibt es keinen QR-Posten. Es wird ab Lösung von Etappe 5 direkt als „am Hearing" (Rätselphase) gewertet, statt dauerhaft als „unterwegs" zu erscheinen.

5. **Legende gekürzt** und an die neue Darstellung angepasst; Schwellen bleiben: 10/15 min am Rätsel, 12/20 min unterwegs.

## Technische Umsetzung

- `src/lib/rounds.server.ts`
  - `betweenMin` für Etappe 1 aus `round.started_at` (Fallback: erstes Event des Teams) berechnen.
  - `phase` für `currentStage === 6` auf `puzzle` setzen, `phaseSince` = Lösung Etappe 5.
  - Zusätzlich pro Team `travelDoneMin` (abgeschlossene Wegzeit zum aktuellen Posten) mitliefern, damit die Leiste beide Segmente zeigen kann.
- `src/components/teacher/ProgressMatrix.tsx`
  - Neue Komponente `PhaseBar` (Weg-Segment, QR-Marke, Rätsel-Segment) pro Team-Zeile unter der Etappen-Matrix.
  - `Cell` erhält Icon-Variante für die aktive Zelle (`Footprints` / `Search` aus lucide-react).
  - `assessTeams` unverändert in der Logik, nur `phaseSince`-Fallback auf Rundenstart bleibt bestehen (deckt den Schulweg ab).
  - Legendentext anpassen.
- `src/components/teacher/ReportPanel.tsx`: Spaltenbeschriftung „Zeit zwischen Rätseln" für Etappe 1 als „Schulweg → Posten 1" ausweisen.
