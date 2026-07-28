## Änderungen in `src/routes/finale.tsx`

### 1. Multiple-Choice: nur „grün oder neutral"

**Problem:** In `MultiView` behalten falsch gewählte Optionen nach dem Absenden weiterhin die stamp-Hervorhebung (`border-stamp bg-stamp/10`). Erwartet ist: entweder alle eigenen Antworten grün (bei Volltreffer) oder alles neutral.

**Fix in `MultiView` (ca. Zeile 1272-1284):**
- Bei `submitted && !allCorrect` alle Optionen komplett neutral rendern (`border-border bg-paper`), unabhängig davon, ob der User sie ausgewählt hatte.
- Checkbox-Icon rechts (`✓`) im nicht-korrekten Endzustand ebenfalls neutralisieren.
- Grüner Zustand bleibt nur, wenn `allCorrect === true` und Option ausgewählt war.

`SingleView` wird gleich mitgeprüft: das aktuelle Verhalten (nur bei richtiger Wahl grün, sonst neutral) bleibt bestehen. Die Erklärung wird bereits über `buildFeedback` im roten Feedback-Panel angezeigt, das gilt für beide Views.

### 2. Feedback-Duplikation bei Biodiversitäts-Ursachen (F5)

**Problem:** In `buildFeedback` (Zeile 1046) ist der Satz „„Zu viel Regen" ist keine Hauptursache …" bereits fest eingebaut, gleichzeitig steht derselbe Kern in `frage.erklaerung` (Zeile 249). Ergebnis: doppelt.

**Fix:** Zeile 1046 kürzen auf reines
```
Fälschlich gewählt: <Optionen>.
```
Die inhaltliche Aufklärung liefert danach `frage.erklaerung` einmalig.

### 3. Feedback der letzten Frage vor dem Outro anzeigen

**Problem:** Sobald die letzte Frage beantwortet wird, wechselt `status` sofort auf `won`/`lost` und der Screen springt direkt zum `OutroScreen` bzw. „Versuch es nochmals". Der Nutzer sieht das Feedback der letzten Frage nicht.

**Fix in der Render-Logik (ca. Zeile 493-612):**
- Neuer lokaler State `showResult` (default `false`).
- Solange `showResult === false`, wird die Fragenansicht mit Feedback-Panel weiterhin angezeigt, auch wenn `status !== "running"`.
- Der Weiter-Button auf der letzten Frage bekommt den Text „Zum Ergebnis →" und setzt `showResult = true` beim Klick.
- Erst dann wird `OutroScreen` (bei `won`) bzw. der Lost-Screen (bei `lost`) gerendert.
- `reset()` setzt `showResult` wieder auf `false`.

Alle anderen Zweige (Zurück-Navigation, Review-Modus) bleiben unverändert.

### 4. Saison-Feedback: Ein- und Mehrzahl-Duplikate entfernen

**Problem:** `SAISON_ANTWORTEN` enthält bewusst Singular- und Pluralformen sowie ae/ä-Varianten für die Erkennung. Das Feedback nutzt aber `SAISON_ANTWORTEN[season].slice(0, 5)`, wodurch z. B. „Erdbeere, Erdbeeren" und „Apfel, Äpfel, Aepfel" doppelt/dreifach erscheinen.

**Fix:**
- Neue kuratierte Anzeige-Liste `SAISON_ANZEIGE: Record<Season, string[]>` mit je nur einer Schreibweise pro Frucht/Gemüse (z. B. Winter: `Rosenkohl, Äpfel, Lauch, Nüsslisalat, Karotten, Randen, Sellerie, Pastinaken, Chicorée, Wirsing, Rotkohl, Zwiebeln, Kartoffeln`; analog für Frühling/Sommer/Herbst).
- `erklaerung` in F4 (Zeile 229-230) verwendet `SAISON_ANZEIGE[season].slice(0, 4)`.
- `buildFeedback`-Zweig für `frage.id === 4` (Zeile 1058) verwendet `SAISON_ANZEIGE[season].slice(0, 5)`.
- `SAISON_ANTWORTEN` bleibt unverändert (weiterhin für die Eingabe-Erkennung inkl. Erdbeere/Erdbeeren).

Ich prüfe zusätzlich weitere Feedback-Texte in `buildFeedback` auf ähnliche Duplikate (Match/Bucket geben aktuell keine `erklaerung` doppelt aus, das ist konsistent).

## Nicht betroffen

Sonstige Views (Match, Order, Bucket, Either, Slider, Short), Story-Texte, Badges, Timer, Progress-Tracking, andere Etappen.