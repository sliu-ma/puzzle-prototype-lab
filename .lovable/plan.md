## Ziel
Im Hearing (`src/routes/finale.tsx`) soll das farbliche Feedback vereinheitlicht werden:

- **Richtig** → die vom User gewählte/eingegebene Antwort wird **grün** hervorgehoben.
- **Falsch** → **keine** rote Einfärbung auf den Antwortoptionen. Die falsche Antwort wird ausschliesslich über das bestehende **rote Feedback-Panel** unter der Frage (Rahmen + Erklärungstext aus `buildFeedback`) kommuniziert.
- In **keinem** Fall wird die korrekte Antwort farblich verraten.

Damit müssen Schüler:innen bei einer falschen Antwort das Feedback-Panel lesen, um zu erfahren, was stimmt.

## Konkrete Änderungen pro Antworttyp (`src/routes/finale.tsx`)

### 1. Single Choice (`SingleView`)
- Grüne Einfärbung der Option **nur** wenn User richtig geraten hat (seine eigene Wahl).
- Keine rote Einfärbung mehr auf falscher User-Wahl, kein `XCircle`-Icon.
- Kein Dimming (`opacity-60`) auf nicht gewählten Optionen.

### 2. Multiple Choice (`MultiView`)
- Nach `submit`: hat der User **exakt** die korrekte Auswahl getroffen, werden **seine** angekreuzten Optionen grün. Andernfalls bleiben alle Optionen visuell neutral (nur der bereits selektierte Zustand ist noch als „gecheckt" sichtbar). Keine rote Markierung. Kein Dimming.

### 3. Either / Bildvergleich (`EitherView`)
- Nur die vom User geklickte Karte wird grün, wenn korrekt. Sonst neutral. Keine rote Karte, keine grüne „richtige" Karte.

### 4. Short Answer (`ShortView`)
- Bei korrekter Eingabe: Input-Rahmen grün. Bei falscher Eingabe: Rahmen neutral. Keine rote Umrandung, keine Anzeige der Musterlösung – das rote Feedback-Panel bleibt der einzige Fehler-Hinweis.

### 5. Match / Drag & Drop (`MatchView`)
- Nach `submit`: bei `ok === true` werden alle Links-Kacheln grün. Bei `ok === false` bleiben alle Kacheln neutral (aktuelles Standard-Styling). Keine per-Paar-Einfärbung mehr, kein Rot.

### 6. Order (`OrderView`)
- Analog Match: bei komplett richtiger Reihenfolge werden alle Zeilen grün, sonst bleiben alle neutral. Kein Rot.

### 7. Bucket Sort (`BucketView`)
- Analog: bei komplett richtiger Zuordnung werden alle platzierten Items grün, sonst bleiben alle neutral. Kein Rot.

### 8. Slider (`SliderView`)
- Bei Treffer im Toleranzbereich: Wert-Anzeige/Rahmen grün.
- Zeile 1946–1950 (Anzeige des Zielwerts) entfernen – die korrekte Antwort darf nicht verraten werden.
- Bei Fehler: kein visuelles Highlight; Erklärung kommt nur aus dem Feedback-Panel.

## Feedback-Panel (unter der Frage)
Bleibt unverändert – zeigt weiterhin:
- **Grüner** Rahmen + „Treffer · Barometer steigt" bei korrekter Antwort.
- **Roter** Rahmen + „Fehler · Barometer fällt" + Erklärungstext bei falscher Antwort.

Das ist der einzige „rote" Kanal in der neuen Version.

## Nicht enthalten
- Keine Änderungen an Scoring, Barometer, Badges, `buildFeedback`-Texten, Reihenfolge der Fragen oder anderen Etappen.
- Keine strukturellen Umbauten – nur die `className`-Bedingungen der Reveal-Zustände sowie der zusätzliche `allCorrect`-Merker für Match/Order/Bucket.

## Technische Details
- Ausschliesslich Bearbeitung in `src/routes/finale.tsx`.
- Muster: alle Reveal-Zweige der Form `reveal && isCorrect && "border-emerald-…"` bleiben nur, wenn `isMine`/`isSel` ebenfalls zutrifft. Alle `border-destructive/60 bg-destructive/10`-Zweige und die `XCircle`-Icons in den Optionslisten werden entfernt. `opacity-60`-Dimming auf nicht-gewählten Optionen entfällt.
- Für Match/Order/Bucket wird nach `submit` ein `allCorrect: boolean`-State gesetzt und im JSX genutzt, um alle Kacheln uniform grün zu färben oder neutral zu lassen.
