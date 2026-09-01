# Live-Matrix: eine Statuszeile pro Gruppe, Details im Popup

Ziel: In der Live-Ansicht sieht man pro Gruppe nur noch **eine** klare Aussage – z. B. „An E1 seit 7 min dran“ – farblich hervorgehoben, wenn es zu lange dauert. Alles Detaillierte kommt erst beim Antippen.

## Die neue Zeile

```text
Team Fuchs        Am Rätsel E2 · seit 7 min          42 Pkt  >
Team Dachs        Unterwegs zu E3 · seit 14 min      31 Pkt  >
Team Reh          Fertig · 1:12 h                    58 Pkt  >
```

- Eine Karte pro Gruppe, ganze Karte antippbar (mind. 48 px hoch).
- Status in Klartext: „Unterwegs zu E2“, „Am Rätsel E2“, „Am Hearing“, „Fertig“.
- Erste Etappe: „Unterwegs von der Schule zu Posten 1“.
- Rechts Punkte und ein kleiner Pfeil als Hinweis auf Details.
- Farbe nur bei Bedarf: ruhig (normal), gelb (Warnschwelle), rot (Alarmschwelle) – gleiche Schwellen wie bisher (10/15 min am Rätsel, 12/20 min unterwegs). Rot pulsiert dezent, damit es auf dem Handy auffällt.
- Sortierung: auffällige Gruppen (rot, dann gelb) zuoberst, danach nach Fortschritt.
- Die bisherige Etappen-Matrix, die Phasenleiste und die lange Legende verschwinden aus der Hauptansicht.
- Der Block „Braucht evtl. Hilfe“ und die Klassenverteilung bleiben, gekürzt auf das Wesentliche.

## Das Detail-Popup (Tap auf eine Gruppe)

Ein Dialog (auf dem Handy als Sheet von unten) mit:

1. Kopf: Teamname, aktueller Status, Punkte, ggf. Warnhinweise („Auflösung genutzt“, „hinter der Klasse“).
2. Aktueller Abschnitt: Wegzeit bis QR-Scan, ob gescannt, Zeit am Rätsel.
3. Verlauf pro Etappe 1–5 + Hearing als kompakte Liste:
   - Etappe, Thema, Wegzeit, Rätselzeit, genutzte Hinweisstufe, Punkte.
   - Noch offene Etappen gedämpft.
4. Fuss: Startzeit / Gesamtdauer bzw. Endzeit bei fertigen Gruppen.

Keine neuen Daten nötig – alles kommt aus dem bestehenden Report.

## Technische Umsetzung

- `src/components/teacher/ProgressMatrix.tsx`
  - `assessTeams` bleibt unverändert (liefert Phase, Minuten, Severity, Gründe).
  - Neue Komponente `TeamRow` (Statuszeile) ersetzt Matrix-Zellen + `PhaseBar` in der Hauptansicht; `Cell`/`PhaseBar` wandern ins Detail-Popup bzw. entfallen.
  - Neue Komponente `TeamDetailDialog` auf Basis von `@/components/ui/dialog` (bzw. `sheet` auf schmalen Displays via `useIsMobile`), gesteuert durch `useState<TeamStatus | null>`.
  - Statuslabel-Helfer `statusLabel(s)` für die Klartext-Formulierung.
  - Sortierung nach Severity, dann Etappe, dann Name.
- Farben ausschliesslich über bestehende Tokens (`stamp`, `primary`, `muted`); keine neuen Hex-Werte.
- `LiveBoard.tsx` bleibt unverändert (übergibt weiterhin `teams`, `startedAt`, `now`).
- `ReportPanel.tsx` bleibt unverändert – die Auswertung behält ihre Detailtabellen.
