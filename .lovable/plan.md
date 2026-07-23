## Anpassungen Hearing (`src/routes/finale.tsx`)

### 1. Slider F1: Bereich 0–40 Rappen
`max` der Slider-Frage F1 von `50` auf `40` setzen. Zielwert 28 mit Toleranz ±3 bleibt.

### 2. Label „Bio" statt „Bio Suisse"
In F3 (Match):
- `links[0].label`: „Bio Suisse" → „Bio"
- `erklaerung`: „Bio Suisse = …" → „Bio = konsequenter Bio-Anbau …"
- Feedback in `buildFeedback` prüft die Ausgabe (nutzt `links[].label`, sollte automatisch stimmen; kurz gegenchecken).

### 3. Zuordnungs-Kontrolle (Bucket F9) verifizieren

Der Screenshot zeigt: Nutzer sagt „richtig gelöst", die App wertet als falsch. Code-Review zeigt Logik korrekt (`placements[it.id] === solution[it.id]`). Vor dem Fix reproduzieren; wahrscheinlichste Ursachen:

- **Refs pro Rerender**: `ref={(el) => { bucketRefs.current[bucket.id] = el }}` schreibt bei jedem Render, `findTarget` iteriert `Object.entries` – Reihenfolge egal, da per ID abgefragt. Vermutlich unproblematisch, aber Ref-Callback so bauen, dass beim Unmount `null` gesetzt und beim Neu-Mount überschrieben wird (kein alter Eintrag).
- **Pointer-Capture bei Drop**: nach dem Drop wandert das Item in einen anderen Container → das capturete Element wird unmontiert, `pointerup` kann verloren gehen. Absichern durch expliziten `releasePointerCapture` in `endDrag` und `dragging`-Reset in einem `useEffect`-Cleanup.
- **Hit-Test bei überlappenden Bounding-Rects**: falls Buckets identische Y-Bereiche mit Pool teilen, kann `findTarget` den falschen Bucket zurückgeben. In der aktuellen Layout-Struktur unkritisch, aber wir prüfen die Rects im Playwright-Lauf.

Vorgehen: Playwright-Reproduktion via Cheat-Code `KRXZMVBQ` → F9 durchspielen, `placements` und `submit`-Argument loggen. Fix richtet sich nach dem Ergebnis; erwartetes Minimalpaket:

- `bucketRefs`-Callback räumt beim Unmount auf.
- `endDrag` ruft `releasePointerCapture` und resettet zuverlässig.
- Zusätzlich: nach dem Drop den `placements`-State per functional update so schreiben, dass ein doppelt gefeuerter `pointerup` nicht zwei Buckets nacheinander setzen kann (Guard via `dragging`-Snapshot).

### 4. Neues Überzeugungsbarometer: Nadel −N … 0 … +N

Barometer wird von „0–100 fällt bei Fehlern" auf eine bipolare Nadel umgestellt.

- Scoring:
  - `correct` → `needle += 1`
  - `wrong` → `needle -= 2`
  - 10 Fragen. Mit ≥ 4 falschen Antworten ist selbst bei sonst allen richtigen Treffern das Ergebnis negativ (`-8 + 6 = -2` bei 4 falsch / 6 richtig; garantiert `< 0`). Bei ≤ 3 falschen ist Rettung möglich (`-6 + 7 = +1`).
  - Anzeige normalisiert auf `[-10, +10]`, gezeichnet als halbkreisförmige Skala mit Nadel (SVG, drehbar von −90° bis +90°). Negativer Bereich rot, positiver grün, Mitte neutral.
- Bestehende `barometer`-Berechnung im Header und die Abbruchbedingung „Barometer auf null" werden ersetzt durch:
  - Live-Anzeige der Nadel.
  - Endauswertung: `needle < 0` → **Hearing nicht bestanden**, Overlay mit „Der Rat ist nicht überzeugt. Wiederhole das Hearing." und Button „Hearing neu starten" (setzt `ergebnisse`, `antworten`, `aktuell`, `finished`-Flag zurück – Etappenstatus im globalen Store bleibt bis zum Bestehen offen).
  - `needle >= 0` → Outro wie bisher.
- Rückblick-Modus (`review`) bleibt unabhängig verfügbar.

### 5. Intro-Overlay „Überzeuge den Rat"

Beim ersten Betreten des Hearings (vor Frage 1) ein grafisches Overlay:

- Titel: „Überzeuge den Rat"
- Kurztext: „Du hast 10 Fragen. Maximal 3 Fehler sind erlaubt, sonst kippt der Rat gegen dich. Viel Erfolg."
- Visuell: Papierkarte mit Stempel, Nadel-Vorschau (Barometer), Icon (Gavel/Scale aus lucide-react), Button „Los geht's".
- State via `useState` (nicht persistent), zeigt sich nur beim frischen Betreten des Hearings. Im Review-Modus nicht.

### Technische Referenzen

- Slider F1: `src/routes/finale.tsx:164–180`
- Label „Bio": `src/routes/finale.tsx:203–215`, `buildFeedback` ~`826–924`
- BucketView: `src/routes/finale.tsx:1511–1700`
- Barometer-Komponente: `src/routes/finale.tsx:622–` und Header/Failure-Overlay `~370–600`
- Fragen-Container/Intro-Overlay: `FinalePage` Rendering ab `~427`

### Test

- Playwright-Lauf mit Cheat-Code `KRXZMVBQ`, komplettes Hearing zweimal:
  1. 4 bewusst falsche Antworten → Fail-Overlay + Wiederhol-Button funktioniert.
  2. ≤ 3 Fehler → Nadel positiv, Outro erscheint.
- F9 mit korrekter Zuordnung → `submit` liefert `ok = true`.
- F1 Slider: Max = 40, Zielbereich 25–31 wertet als richtig.