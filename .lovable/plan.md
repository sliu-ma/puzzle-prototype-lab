## Ziel
1. **Vor dem Hearing**: Eine animierte Sprechblasen-Konversation als Einstieg in die Fragen einbauen (Gemeindepräsident → Maja → Ratsmitglied).
2. **Schlussscreen** entschlacken: kein Barometer, keine Statistik-Kacheln, kein „ENDE". Stattdessen kurze Nachricht + benötigte Zeit + ein schön animierter „Zurück zum Start"-Button.

## Umsetzung

### 1. Neuer Einstieg vor den Fragen (`src/routes/finale.tsx`)

Die bestehende Einstiegs-Karte („Geben Sie uns fünf Minuten.") wird durch eine mehrstufige, animierte Sprechblasen-Sequenz ersetzt, die die vorhandene `SpeechBubble`-Komponente wiederverwendet (bereits im File definiert).

Ablauf (Nutzer tippt sich Schritt für Schritt durch — jede neue Blase erscheint mit `animate-fade-in`):

1. Erzähl-Absatz: „Drinnen herrscht gedämpfte Stimmung."
2. Sprechblase **Gemeindepräsident** (rechts, tone `stamp`): „Dann kommen wir nun zur finalen Abstimmung über das Projekt Waldlichtung–"
3. Erzähl-Absatz: „Maja geht nach vorne."
4. Sprechblase **Maja** (links, tone `amber`): „Entschuldigung – dürfen wir kurz das Wort ergreifen? Wir haben neue Daten, die für die Abstimmung relevant sind."
5. Sprechblase **Ratsmitglied Schmid** (rechts, tone `emerald`, Arme verschränkt-Hinweis als kurzer Kursivtext davor): „Das Verfahren läuft seit Monaten. Was soll das jetzt noch ändern?"
6. Überleitung: kurzer Erzählsatz „Maja legt die Unterlagen auf den Tisch. Der Saal wird still. Die Fragen kommen." + Button **„Fragen beantworten →"** → `setStarted(true)` (bestehende Logik).

Umsetzung technisch:
- Neuer State `introBubble` (0–5), Weiter-Button bringt nächste Blase / am Ende Start.
- Sequenz als Array `INTRO_SEQUENCE` mit `{ kind: "narration" | "bubble", ... }` — sauber und leicht erweiterbar.
- Alte „Geben Sie uns fünf Minuten"-PaperCard entfällt.

### 2. Zeit-Messung für den Schlussscreen (`src/lib/progress.ts`)

- Neuen Helper `getElapsedSince(ts: number)` bzw. direkter Zugriff auf `getStartTs()` genügt. Im Outro:
  - `elapsedMs = Date.now() - getStartTs()`
  - Formatiert als `"MM min SS s"` bzw. bei ≥ 60 min als `"1 h 12 min"`.
- Wert wird beim ersten Mount des Erfolgs-Zweigs in `useState(() => ...)` eingefroren, damit er nicht mehr weiterläuft.

### 3. Schlussscreen neu (`OutroScreen` Step 2 in `finale.tsx`)

Step 0 (Reaktionen als Sprechblasen) und Step 1 (Maja & Elvira vor dem Saal) bleiben unverändert.

Step 2 wird komplett vereinfacht:
- Kein Barometer-Kasten (grüner Prozent-Block entfällt).
- Kein 3-Spalten-Stat-Grid (Fragen / Korrekt / Fehler entfällt).
- Kein „ENDE"-Schriftzug.
- Kein „Nochmal spielen"-Button.

Neuer Inhalt der Karte:
- Stempel „Fall gelöst" bleibt.
- Titel: „Ihr habt es geschafft."
- Kurzer Fliesstext (2–3 Sätze) als Abschluss der Ermittlung.
- Ein zentrierter, sanft animierter Info-Block:
  - Icon (Uhr), Label „Benötigte Zeit", grosser Wert (z. B. `42 min 18 s`).
  - `animate-scale-in` beim Erscheinen, dezenter Puls auf dem Icon.
- Ein einzelner, prominenter Button **„← Zurück zum Start"** unten:
  - Volle Breite auf Mobile, `animate-fade-in` beim Mount, `hover:-translate-y-0.5` + weicher Glow (`shadow-lg hover:shadow-xl`), leichter Sparkle-Akzent (`Sparkles`-Icon links, das langsam pulsiert).
  - Führt via `<Link to="/">` zurück zur Übersicht — kein Reset des Fortschritts.

`SuccessConfetti` bleibt als dezenter Hintergrund-Effekt auf der Karte erhalten (statt im entfernten Barometer-Block), um „schön animiert" beizubehalten.

## Technische Details
- Props von `OutroScreen`: `barometer`, `treffer`, `fehler`, `total`, `onReset` werden bis auf `onReset` (für Step 1 nicht benötigt, entfällt ganz) obsolet — Signatur verschlankt.
- Call-Site (`{status === "won" && <OutroScreen ... />}`) entsprechend anpassen.
- Ungenutzte Imports (`Gauge` in Outro-Nähe etc.) bereinigen; `Sparkles`, `RefreshCw` bleiben nur, wo noch verwendet.
- Keine Änderungen an Fragen-Renderern, Barometer während des Spiels, oder Verlust-Zweig.

## Offen
- Soll der „Zurück zum Start"-Button den Fortschritt **zurücksetzen** (neuer Durchlauf möglich) oder nur navigieren (Team-Registrierung bleibt bestehen, Etappen bleiben freigespielt)? Ich gehe im Plan von **nur navigieren** aus, weil du „nicht nochmals spielen" explizit erwähnt hast — sag Bescheid, falls doch Reset gewünscht ist.
