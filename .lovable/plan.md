## Ziel

Hinweise im `HintSystem` können nur in Reihenfolge aufgedeckt werden: Tipp 2 erst, wenn Tipp 1 aufgedeckt ist; Auflösung erst, wenn Tipp 1 und Tipp 2 aufgedeckt sind.

## Änderungen in `src/components/case-file/HintSystem.tsx`

- Neue Ableitung `canReveal(hint)`: `true` nur wenn alle vorherigen Hinweise (nach `id`/Reihenfolge) bereits in `revealed` sind.
- `reveal(id)` bricht ab, wenn `canReveal` false ist.
- Tab-Verhalten:
  - Ein zeitlich freigeschalteter Tab, dessen Vorgänger noch nicht aufgedeckt ist, bleibt anklickbar (damit Schüler:innen sehen, was noch kommt), zeigt aber im Inhalt statt Aufdeck-Button eine Sperr-Meldung: „Decke zuerst {vorheriges Label} auf." (Icon 🔒).
  - Aufdeck-Button und „Hinweis aufdecken"-CTA werden nur gerendert, wenn `canReveal` true ist.
- `openPanel()`: bevorzugt jetzt den ersten *aufdeckbaren* (zeitlich frei + Vorgänger aufgedeckt) noch nicht aufgedeckten Hinweis; Fallback wie bisher.
- Badge-Zähler auf dem Floating-Button bleibt unverändert (zeigt weiterhin zeitlich freigeschaltete Hinweise).

Keine anderen Dateien betroffen; Storage-Format und `getTotalRevealedHints` bleiben gleich.
