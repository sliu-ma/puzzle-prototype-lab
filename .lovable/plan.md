## RulesOverlay: Icons/Zahlen bereinigen und Ausrichtung

Datei: `src/routes/finale.tsx` (Zeilen ~839–855)

### Änderungen

Die drei Regel-Zeilen bekommen sinnvolle, nicht-doppelnde Präfixe und eine feste Spaltenbreite, damit alle Texte sauber links bündig untereinander stehen.

1. **Zeile 1** — Präfix `10` (passt: „10 Fragen aus allen Etappen.")
2. **Zeile 2** — Präfix `±` durch lucide-Icon `Scale` (oder `TrendingUp`) ersetzen, damit kein Zeichen mit ähnlicher Semantik wie eine Zahl steht. Text bleibt „Treffer heben die Nadel, Fehler senken sie doppelt so stark."
3. **Zeile 3** — Präfix `3` entfernen (verdoppelt sich mit „Maximal 3 Fehler"). Stattdessen lucide-Icon `AlertTriangle` in `text-destructive`. Text bleibt unverändert.

### Layout-Fix

`<li>` von `flex gap-2` auf `grid grid-cols-[28px_1fr] gap-3 items-start` umstellen. So hat das Präfix (Zahl oder Icon) immer die gleiche Breite und die Fließtexte starten bei allen drei Zeilen an derselben x-Position — unabhängig davon, ob das Präfix „10", „±" oder ein Icon ist.

Icons bekommen `h-5 w-5` und werden vertikal zur ersten Textzeile ausgerichtet (`mt-0.5`).

### Technisches Detail

- Import ergänzen: `Scale, AlertTriangle` aus `lucide-react` (falls nicht bereits importiert).
- Keine weiteren Codepfade betroffen; `RulesOverlay` ist lokal.
