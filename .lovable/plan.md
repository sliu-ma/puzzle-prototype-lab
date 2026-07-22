
## Ziel

Hearing im `src/routes/finale.tsx` in zwei Punkten überarbeiten:

1. **Adaptives, sauberes Feedback** pro Frage — mit korrekter Rechtschreibung und mit Erklärungen, die zu den überarbeiteten Faktenkarten passen. Bei falscher Antwort soll begründet werden, warum genau *diese* Antwort/Zuordnung falsch ist.
2. **Konsistente Zufalls-Anordnung** aller Antwortoptionen bei jeder Fragen-Anzeige — auch bei den Drag-&-Drop-Aufgaben.

## Adaptives Feedback

Aktuell wird nach dem Antworten für alle Fragen dieselbe generische `frage.erklaerung` gezeigt. Neu:

- Das grüne/rote Feedback-Kästchen zeigt weiterhin die Kern-Erklärung (Grammatik korrigiert).
- Zusätzlich bekommt jede Frage eine `feedback`-Funktion, die abhängig von der konkret abgegebenen Antwort einen kurzen adaptiven Text liefert, z. B.:
  - **F1 Slider (28 Rp./km)**: „Du liegst zu tief — der Auto-Vollkostensatz von 74 Rp./km wird oft unterschätzt." / „Zu hoch — der ÖV kostet rund 46 Rp./km, nicht viel weniger." / bei richtig eine Bestätigung.
  - **F2 Autofahrten <5 km**: 22 % → „Zu wenig — der Anteil ist über doppelt so hoch." · 32 % → „Wärmer, aber noch zu tief." · 60 % → „Etwas zu hoch — es ist knapp die Hälfte, nicht die Mehrheit."
  - **F3 Labels (Match)**: Bei jeder falsch gepaarten Karte einzeilig aufzeigen, was das Label wirklich bedeutet und warum die andere Beschreibung besser passt (z. B. „Bio Suisse steht für Anbau ohne synthetische Pestizide — die Beschreibung ‚100 % CH-Herkunft' beschreibt Suisse Garantie.").
  - **F4 Saisongemüse**: Bei falsch — „‚{Eingabe}' hat in der Schweiz aktuell keine Saison. Aktuell im {Jahreszeit}: {Beispiele}."; bei richtig — kurze Bestätigung mit Nennung von zwei weiteren Beispielen.
  - **F5 Biodiversität (Multi)**: Fehlerbeschreibung listet, welche Ursachen fälschlich gewählt („Zu viel Regen ist keine Hauptursache") bzw. übersehen wurden.
  - **F6 Rote Liste**: „1 von 20" → „Zu optimistisch — es ist rund ein Drittel." · „1 von 100" → „Weit daneben — tatsächlich rund 1 von 3."
  - **F7 Heizen**: bei zahlenmäßig danebenliegend Hinweis auf die 6-%-Faustregel und Bedeutung (nicht 1 %, nicht 20 %).
  - **F8 Waschmaschinen**: „Klasse E verbraucht deutlich mehr Strom pro Waschgang — die Etikette geht von A (grün) nach G (rot)."
  - **F9 Energiequellen (Bucket)**: Für jedes falsch einsortierte Item ein kurzer Grund („Gas ist ein fossiler Brennstoff und daher nicht erneuerbar.").
  - **F10 Anteil erneuerbar**: „Zu tief — der Anteil ist höher als vor zehn Jahren." bzw. „Zu hoch — 2023 lag er bei rund 28 %."

Umsetzung: neue Renderer-Prop `feedbackNode` oder das Feedback-Kästchen zieht Text über eine Helper-Funktion `buildFeedback(frage, userAnswer, correct)`. Die konkreten Nutzer-Antworten (Slider-Wert, Multi-Auswahl, Match-Paare, Bucket-Placements, Either-Wahl, Short-Text) müssen von `FrageRenderer` an `FinalePage` hochgereicht werden — dafür wird `onResult` auf `onResult(correct, userAnswer)` erweitert und die aktuelle Antwort im `FinalePage`-State abgelegt (z. B. `antworten[]` neben `ergebnisse[]`, persistiert).

Grammatik-Durchgang aller Fragen-, `erklaerung`- und `hint`-Texte (Groß-/Kleinschreibung der Nomen, Bindestriche, „%") — u. a. „prozent" → „Prozent", „ca 28" bleibt in `akzeptiert`-Liste (Vergleich läuft normalisiert), aber Anzeigetexte werden korrekt gesetzt.

## Zufalls-Anordnung überall

Aktueller Stand:

- `SingleView`, `MultiView`: nutzen `useMemo(() => shuffleIndices(...), [frage])` → schon zufällig.
- `MatchView`: rendert `frage.links` und `frage.rechts` in Original-Reihenfolge.
- `BucketView`: rendert `frage.items` in Original-Reihenfolge; `frage.buckets` ebenfalls fest.
- `EitherView`: rendert `frage.optionen` fest.
- `ShortView`, `SliderView`: keine Optionen — keine Änderung.

Änderung: in `MatchView`, `BucketView`, `EitherView` je eine gemischte Kopie mit `useMemo(() => shuffle([...]), [frage])` erzeugen und für das Rendering verwenden. Die Lösung/`paare`/`solution`/`korrekt`-Prüfung arbeitet weiter mit den IDs, die Anzeige-Reihenfolge ändert sich pro Aufruf.

Zusätzlich bei F9 die Bucket-Reihenfolge (Erneuerbar / Nicht erneuerbar) mischen, damit auch die Ziel-Spalten variieren.

## Betroffene Datei

- `src/routes/finale.tsx` (einzige Datei; keine Struktur- oder Route-Änderungen, keine neuen Assets).

## Nicht verändert

- Fragenkatalog inhaltlich (dieselben 10 Fragen, dieselben korrekten Antworten, Grenzen des Sliders, Bilder von F8).
- Barometer-Logik, Punktesystem, Persistenzschlüssel, Intro-/Outro-Screen.

## Verifikation

Build durchlaufen lassen, im Preview eine Runde spielen: bei jeder Frage einmal falsch und einmal richtig antworten und prüfen, dass (a) das Feedback konkret auf die Wahl eingeht, (b) Rechtschreibung stimmt, (c) beim Neuladen der Frage die Optionen-Reihenfolge wechselt (inkl. Drag-&-Drop-Karten und Buckets).
