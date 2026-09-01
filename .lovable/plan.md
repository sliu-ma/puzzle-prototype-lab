# Synchrone Rundenzeit, klare Hilfe-Signale, Rundenabschluss

## 1. Zeit für alle Teams synchron

Heute startet die Uhr pro Gerät erst, wenn das Team den Brief gelesen und den Startknopf gedrückt hat. Neu gilt in einer Klassenrunde die Startzeit der Runde (Moment, in dem die Lehrperson startet) für alle Teams gleich:

- Beim gemeinsamen Start im Wartezimmer wird die Startzeit der Runde direkt als Spielstart gesetzt, nicht erst nach dem Briefing.
- Der laufende Timer gleicht sich weiter regelmässig mit der Runde ab (auch bei Zeitzugabe), so bleiben alle Geräte deckungsgleich.
- Einzelspiel ohne Runde bleibt wie heute: Uhr startet nach dem Briefing.

## 2. Einheitliche Logik für „Braucht Hilfe“

Statt einer vermischten Zahl wird die Zeit eines Teams in zwei klar getrennte Abschnitte gelegt:

- **Unterwegs**: von der Lösung des letzten Postens bis zum QR-Scan des nächsten. Lange Zeit hier heisst: Posten nicht gefunden.
- **Am Rätsel**: vom QR-Scan bis zur Lösung. Lange Zeit hier heisst: Mühe mit dem Rätsel.

Schwellen:

| Abschnitt | Gelb | Rot |
| --- | --- | --- |
| Am Rätsel (ab Scan) | 10 min | 15 min |
| Unterwegs (ab letzter Lösung) | 12 min | 20 min |

Die Hilfe-Liste in der Live-Ansicht nennt künftig den Grund im Klartext, z. B. „Posten 3 noch nicht gescannt, seit 21 min unterwegs“ oder „Rätsel 3 seit 16 min offen“. Die Zahl in der Matrix-Zelle zeigt immer die Minuten des aktuellen Abschnitts, mit Symbol für unterwegs bzw. am Rätsel, damit sie nicht mehr fehlinterpretiert wird.

## 3. Rätselzeit vs. Zeit zwischen den Rätseln

- **Rätselzeit** = Scan bis Lösung (so wird sie schon gemessen, bleibt Grundlage der Punkte).
- Die bisher „Wegzeit“ genannte Spanne heisst überall **„Zeit zwischen Rätseln“** (Live-Ansicht, Auswertung, CSV-Spaltenname und Erklärtexte), weil sie Weg, Notizen und Pausen enthält.
- Fehlt ein Scan (Altdaten), wird der Wert als unbekannt gezeigt statt geschätzt.

## 4. Runde abschliessen beendet für alle

Wenn die Lehrperson „Runde abschliessen“ drückt:

- Alle noch aktiven Teams erhalten innerhalb weniger Sekunden ein Pop-up („Die Lehrperson hat die Runde abgeschlossen“) und gelangen zum Abschluss-Screen, gleich wie bei Zeitablauf.
- Die Zeit wird eingefroren, keine neue Etappe und kein Hearing kann mehr gestartet werden; gelöste Etappen bleiben im Rückblick offen.
- Der Abschluss-Screen benennt den Grund („Runde von der Lehrperson beendet“).

## 5. Beitrittsansicht sauber darstellen

Die Vollbild-Ansicht „Beitritt anzeigen“ wird neu aufgebaut: eigener Messrahmen für die Grössenberechnung (heute rechnet sie gegen den falschen Bezug, daher Sprünge), gleichmässige Abstände, QR-Code und Code in fester Proportion, sauberer Umbruch auf Beamer, Laptop und Handy im Hoch- und Querformat.

## Technische Umsetzung

- `src/routes/lobby.tsx`: Startzeit der Runde direkt setzen (neuer Helfer `setStartTs` in `src/lib/progress.ts`), Briefing danach ohne Zeiteinfluss.
- `src/components/case-file/GlobalTimer.tsx`: bestehendes Runden-Polling erweitert um Startzeit-Abgleich und Status `closed` → Overlay + Sperre.
- Neues Overlay `RoundClosedOverlay` analog `TimeUpOverlay`; `src/routes/abschluss.tsx` und `FinalSummary` erhalten Grund `closed`.
- `src/lib/rounds.server.ts`: `ReportTeam` bekommt `phase` (`travel` | `puzzle`), `phaseSinceIso`, `currentScanAt`; `travelMin` wird zu `betweenMin` umbenannt (inkl. CSV-Kopf in `ReportPanel.tsx`).
- `src/components/teacher/ProgressMatrix.tsx`: `assessTeams` nutzt Phase und die vier Schwellen; Zellen und Hilfe-Liste zeigen den Grund.
- `src/components/teacher/JoinCodeCard.tsx`: `WallView` mit innerem Container und einheitlicher Skalierung.
- Sperrlogik nach Zeitablauf (`isTimeUp`) wird um „Runde abgeschlossen“ ergänzt, damit Etappenstart und Hearing gleich reagieren.
