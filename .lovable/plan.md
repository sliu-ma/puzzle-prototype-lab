## Anpassungen Hearing (`src/routes/finale.tsx`)

### 1. Kurzantworten robuster prüfen

Die Prüfung in `ShortView` vergleicht normalisierten Text 1:1 mit `frage.akzeptiert`. Zahlwörter, „%" und Groß/Klein werden zwar teilweise abgedeckt, sind aber pro Frage hart gepflegt. Ziel: alternative Schreibweisen zentral behandeln.

- `normalize()` erweitern: `%` und das Wort `prozent` entfernen, mehrfache Leerzeichen und Füllwörter (`ca`, `circa`, `ungefähr`, `rund`, `etwa`, `ungefaehr`) strippen, `ß → ss`.
- Zahl-Normalisierung: deutsche Zahlwörter 0–20 sowie 30, 40 … 100 auf Ziffern mappen (`sechs → 6`, `achtundzwanzig → 28`).
- Prüfung: nach Normalisierung zusätzlich einen reinen Zahlenvergleich versuchen (falls sowohl Nutzertext als auch ein Akzeptanzwert als Zahl parsebar sind, gilt Gleichheit).
- `akzeptiert`-Listen dadurch deutlich kürzen: F7 → `["6"]`, F10 → `["28"]` (mit Toleranz ±1 über Zahlvergleich → 27/28/29 gelten weiter).
- Fruchtnamen (F4): Groß/Kleinschreibung ist bereits egal, aber Umlaute doppelt gepflegt. Nach `normalize()` (bereits mit Diakritika-Strip) reicht die einfache Form (`apfel`, `kuerbis` bleibt via NFD-Strip). Duplikate wie `äpfel`/`aepfel` können raus.

### 2. Hinweise bei Kurzantworten entfernen

`hint` in F4, F7, F10 auf leeren String setzen und im Rendering (`ShortView`) den kompletten Hint-Block entfernen. Das `hint`-Feld bleibt im Typ optional bestehen.

### 3. Gedankenstriche vermeiden

Alle `—` (em-dash) und `–` (en-dash) in Fragen, Feedback (`buildFeedback`) und Erklärungen durch Punkt, Komma oder Doppelpunkt ersetzen. Betroffen sind u. a. `SliderView`-Feedback, F4/F7/F10-Feedback, F5/F6-Mappings und mehrere Erklärungstexte.

### 4. Zuordnungs-Kontrolle prüfen und fixen

Die Prüf-Logik in `MatchView` (`pairs[l.id] === frage.paare[l.id]`) und `BucketView` (`placements[it.id] === frage.solution[it.id]`) ist auf Code-Ebene korrekt. Der Bug muss also aus der Interaktion kommen. Vor dem Fix daher reproduzieren:

- Playwright-Lauf gegen `/finale` mit dem Cheat-Code `KRXZMVBQ`, F3 (Match, Labels) und F9 (Bucket, Energiequellen) durchspielen und `submit`-Ergebnis + `userAnswer` loggen.
- Verdachtsmomente, die dabei geprüft werden:
  - **Shuffle-Instabilität:** `useMemo(..., [frage])` wird bei jedem Rerender neu evaluiert, wenn `frage` referenziell wechselt (Frage-Objekt kommt aus `buildFragen()` in einem Modul-Scope, sollte stabil sein — im Review-Modus wird `FRAGEN[i]` reingereicht, ebenfalls stabil). Falls doch instabil, würden Ref-Zuordnungen springen und ein Drop könnte auf dem falschen Ziel landen.
  - **`setPointerCapture` auf `e.target`:** Bei einem Klick auf ein Kind-Element (Icon/Label) wird der Pointer am Kind gecaptured; nach dem Loslassen feuern `pointermove/up` nur noch dort, nicht am Container mit `onPointerMove`/`onPointerUp`. Ergebnis: `endDrag` läuft nie, `dragging` bleibt gesetzt, der nächste Klick wirkt wie ein Drop mit alten Koordinaten. Fix: Capture konsequent am umschließenden Draggable setzen (`e.currentTarget.setPointerCapture(...)`) und `onPointerMove`/`onPointerUp`/`onPointerCancel` auf das Draggable statt den äußeren Container hängen — oder Capture ganz weglassen und `document`-Listener nutzen.
  - **Pool-Rückstellung im Bucket:** Beim Ziehen eines Items zurück in den Pool wird `placements[id] = null`, `allDone` verlangt aber `!== null` für jedes Item → Submit bleibt deaktiviert, wirkt evtl. wie „Zuordnung wird nicht geprüft". Ggf. UX-Text ergänzen („Ziehe alle Begriffe in eine Spalte").

Der Fix ergibt sich aus dem Reproduktionsschritt. Falls sich `setPointerCapture` bestätigt: Umbau wie oben und ein kurzer Regressionstest mit Playwright (drag über Kind-Element, drag mit Icon, drag zurück in Pool).

### 5. Reviewmodus / Feedback

Feedback-Texte in `buildFeedback` an die Änderungen aus (1) und (3) angleichen (keine Gedankenstriche, Zahlwörter im Feedback ausschreiben oder ganz weglassen). Bestehende Groß-/Kleinschreibungs-Korrekturen bleiben.

### Technische Referenzen

- Kurzantwort-Prüfung: `src/routes/finale.tsx` Zeilen 1138–1195 (`normalize`, `ShortView`)
- Fragen-Definitionen: Zeilen 218–336 (F4, F7, F10 Hints / akzeptiert)
- Match-/Bucket-Prüfung: Zeilen 1197–1391 (`MatchView`), 1489–1660 (`BucketView`)
- Feedback: Zeilen 826–924 (`buildFeedback`)
- Saison-Listen: Zeilen 132–155
