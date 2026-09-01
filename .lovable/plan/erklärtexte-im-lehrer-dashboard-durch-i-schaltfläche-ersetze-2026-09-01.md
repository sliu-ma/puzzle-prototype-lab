# Erklärtexte im Lehrer-Dashboard durch „i"-Schaltfläche ersetzen

## Ziel
Die fixen, teils langen Erklärtexte unter den Sektionen des Lehrer-Dashboards
(`src/components/teacher/ReportPanel.tsx`) verschwinden. Stattdessen gibt es ein
kleines, antippbares „i"-Icon, das ein Popover mit der Erklärung öffnet. Das
Dashboard wirkt aufgeräumter, die Info bleibt bei Bedarf verfügbar.

## Umsetzung

### 1. Neue Komponente `InfoHint` (in ReportPanel.tsx)
- Import von `Info` (lucide-react) und `Popover`/`PopoverTrigger`/`PopoverContent`
  aus `@/components/ui/popover`.
- Kleine runde Schaltfläche mit `Info`-Icon; `aria-label` für Zugänglichkeit.
- Tippen öffnet ein Popover (`align="start"`) mit Titel + Erklärungstext.
- Funktioniert auf Mobil (Click-to-Toggle statt Hover).

### 2. Sektion-Komponente erweitern
`Section` erhält einen optionalen Prop `hint` (ReactNode) + `hintLabel` (string).
Ist `hint` gesetzt, wird oben rechts in der aufgeklappten Sektion ein `InfoHint`
gerendert (ausserhalb des CollapsibleTriggers, damit keine Buttons verschachtelt
werden).

### 3. Erklärtexte durch „i" ersetzen
Die folgenden fixen `<p>`-Erklärtexte werden entfernt und als `InfoHint` hinterlegt:

| Stelle | bisheriger Text | „i" bei |
|---|---|---|
| Pro Team (h3) | „Tippe auf eine Gruppe …" | neben h3 „Pro Team" |
| Etappen im Vergleich (Section) | „Wert = Median … zäheste/schnellste Etappe" | oben rechts im Section-Inhalt |
| Hearing pro Frage (HearingMatrix) | „✓ richtig · ✗ falsch … F1 … F10"-Legende | oben rechts über der Matrix |
| TeamReportDialog · Etappen | „Rechte Spalte: Abweichung …" | neben Label „Etappen" |
| TeamReportDialog · Hearing | „V = Versuch … blieb falsch" | neben Label „Hearing" |
| TeamReportDialog · Abzeichen | „Ausgegraut = nicht erreicht" | neben Label „Abzeichen" |
| Rohdaten-Export | „Die Rohdaten enthalten … Pivot …" | neben den CSV-Buttons |

### 4. Inhalt der Popovers
Kurz und prägnant, gleicher Inhalt wie bisherige Texte – nur hinter das „i"
verschoben. Die Hearing-Legende listet weiterhin ✓/✗/– und die zehn
Fragenlabels.

## Nicht Teil dieser Änderung
- Keine neuen Daten/Kennzahlen (das bleibt eine separate Beratung).
- Keine Änderungen an den Diagrammen, der Matrix oder den CSV-Exporten.
- Keine Änderungen ausserhalb von `ReportPanel.tsx`.
