# Etappennummern durch Symbole ersetzen

Ziel: Überall im sichtbaren Text und in den Grafiken erscheinen statt „Etappe 1…5" Symbole. Reihenfolge und Spiellogik bleiben unverändert; die URLs (`/etappe-1` … `/etappe-5`) bleiben ebenfalls gleich.

## Symbolzuordnung (feste Reihenfolge wie heute)

```text
Etappe 1  Bahnhof            ▲  Dreieck
Etappe 2  Dorfladen          ●  Kreis
Etappe 3  Wald-Lichtung      ■  Quadrat
Etappe 4  Jakobs Haus        ✚  Kreuz
Etappe 5  Wasserkraftwerk    ★  Stern
Hearing   Gemeindesaal       ✦  Siegel (bleibt „Hearing")
```

Angezeigt wird jeweils „Etappe ▲" (Symbol statt Zahl). Für Vorlese-/Screenreader-Texte und für Fälle, in denen ein Symbol allein unklar wäre, wird der Symbolname genutzt („Etappe Dreieck").

## Wo sich etwas ändert

- Übersicht: Pfad-Knoten zeigen das Symbol statt der Zahl; Texte wie „Weiter zu Etappe 3", „Hearing · nach Etappe 5", Umschlag-Hinweise.
- Umschlag-Dialog: Siegel-Aufdruck zeigt das Symbol; Titel „Umschlag ▲".
- Etappen-Seiten: Kopfzeilen, QR-Gate-Labels („Etappe ★ · Versiegelt"), Übergangskarten („Weiter zu Etappe ◆"), Fussnoten.
- Erfolgs-Animation, Zwischenstand, Etappen-Sperre (StageGate), „Nächster Schritt"-Karte, Hinweis-System.
- Lehrer-Auswertung und Leaderboard: Etappenspalten/-kürzel nutzen die Symbole.
- Badge-Beschreibungen: „Etappe 2" → „Etappe ●" (Ortsname bleibt zusätzlich genannt, z. B. „Konsum-Fall").
- Nicht verändert: Routen/Links, localStorage-Schlüssel, Datenbankfelder, interne Nummerierung im Code, Seiten-Titel für Suchmaschinen (dort bleibt der Ortsname führend, Symbolname statt Zahl).

## Technische Umsetzung

- Neue Datei `src/lib/stage-symbols.ts`:
  - `STAGE_SYMBOLS: Record<1|2|3|4|5|6, { glyph: string; name: string }>`
  - `stageGlyph(nr)`, `stageName(nr)`, `stageLabel(nr)` → `"Etappe ▲"` (für nr 6: `"Hearing"`), `stageLabelA11y(nr)` → `"Etappe Dreieck"`.
- Neue kleine Komponente `src/components/case-file/StageSymbol.tsx` für den Symbol-Badge (Kreisfläche mit Glyph), damit Pfad-Knoten, Umschlag-Siegel und Karten dasselbe Aussehen nutzen; `aria-label` mit dem Symbolnamen.
- Anpassungen der Anzeige (nur Text/Props, keine Logik) in:
  `src/routes/index.tsx` (inkl. `PathNode`), `src/routes/etappe-1..5.tsx`, `src/routes/finale.tsx`,
  `src/components/case-file/EnvelopeDialog.tsx`, `SuccessBurst.tsx`, `StageScoreRecap.tsx`, `StageGate.tsx`, `NextStepCard.tsx`, `HintSystem.tsx`, `QRGate.tsx`, `Leaderboard.tsx`,
  `src/components/teacher/ReportPanel.tsx`, `src/lib/badges.ts` (nur Beschreibungstexte).
- CSV-Export der Lehrer-Auswertung: Spaltenüberschriften bekommen den Symbolnamen (kein Symbol, damit die Datei überall lesbar bleibt).
