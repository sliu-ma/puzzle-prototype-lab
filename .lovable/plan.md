
# Story-Politur: Narrative Game Layer

Ziel: Bestehende Mechanik unverändert lassen, aber die Story-Beats konsequent erzählerisch inszenieren — Comic-Panels, sprechende Maja, animierte Reaktionen. Keine neuen Rätsel, keine neuen Routen.

## 1. Neue narrative Bausteine (wiederverwendbar)

Neuer Ordner: `src/components/narrative/`

- **`MajaAvatar.tsx`** — CSS/SVG-Avatar von Maja (kein KI-Bild nötig: stilisierte Comic-Figur mit wechselndem Ausdruck: `neutral | denkend | staunend | daumen-hoch | besorgt`). Wird in Sprechblasen und Story-Panels verwendet.
- **`SpeechBubble.tsx`** — Comic-Sprechblase mit Tail (links/rechts), Typewriter-Effekt für den Text (~25 ms/Zeichen, überspringbar per Tap).
- **`ComicPanel.tsx`** — Einzelnes Panel: dicker schwarzer Rahmen, leichte Rotation, Hintergrundfarbe/Skizze als Setting, Maja-Avatar + Sprechblase. Erscheint mit `animate-fade-in` + leichter Scale.
- **`StoryIntro.tsx`** — Container der 2–3 Panels pro Station nacheinander zeigt (Tap → nächstes Panel). Letztes Panel hat „Bereit für das Rätsel?"-Button, der auf den ersten echten Schritt der Etappe weiterleitet.
- **`SuccessReaction.tsx`** — Overlay-Animation bei Rätsel-Erfolg: Maja-Avatar (daumen-hoch/staunend), kurzer Spruch in Sprechblase, Konfetti-/Pulse-Effekt, Auto-Dismiss nach 1.8 s oder Tap.
- **`IntroLetter.tsx`** — Animierte Titelkarte für die Landing Page: Brief „kippt" hereingeflogen (`slide-in-right` + rotate), darunter Maja mit Sprechblase, die den Brief in 2–3 kurzen Sätzen vorliest (Typewriter). „Abenteuer starten" → führt in Team-Registrierung.

## 2. Storyline-Texte (zentral)

Neue Datei `src/lib/story-beats.ts`: pro Etappe ein Array aus 2–3 Panels `{ setting, majaMood, text }`, plus Erfolgs-Spruch und Finale-Charaktere. Hält alle narrativen Texte konsistent an einem Ort.

Beispiel-Struktur:
```text
etappe1 = {
  intro: [
    { setting: "bahnhof-gleis",     mood: "denkend",    text: "Ein Bahnhof, ein Brief, drei Tickets …" },
    { setting: "ticket-closeup",    mood: "staunend",   text: "Welche Route hat Elvira genommen?" },
    { setting: "maja-portrait",     mood: "neutral",    text: "Nur eine passt zu ihr." }
  ],
  success: { mood: "daumen-hoch",   text: "Treffer! Genau ihr Stil." }
}
```

## 3. Integration in bestehende Routen

Jede Etappe (`akte-003`, `akte`, `akte-002`, `akte-004`, `akte-005`) erhält einen neuen Step `"intro"` als ersten Schritt vor `"brief"`:

- Step-Reihenfolge: `intro → brief → … → naechstes`
- `StoryIntro` rendert die Panels für diese Etappe; Button am Ende ruft `goto("brief")`.
- Bestehende Schritte/Mechanik bleiben unangetastet.
- Nach erfolgreichem Lösen des Hauptschritts (vor „input"/„naechstes") wird einmalig `SuccessReaction` als Overlay gezeigt.
- Wo es passt (z. B. nach Brief oder vor Rätsel) erscheint Maja als kleines Avatar-Badge mit kurzer Sprechblase als Begleitkommentar — sparsam einsetzen, nicht überladen.

## 4. Landing Page (`src/routes/index.tsx`)

- Über der bestehenden Team-Registrierung neue `IntroLetter`-Sequenz beim ersten Besuch (Flag in `localStorage: intro-seen`).
- „Abenteuer starten" scrollt/blendet zur Registrierung. Skip-Link „Intro überspringen" sichtbar.

## 5. Finale (`src/routes/finale.tsx`)

- Überzeugungsbarometer dauerhaft oben sichtbar (sticky) mit smoother Füll-Animation (CSS-transition auf width/height).
- Pro Frage erscheint ein **Ratsperson-Charakter** (Comic-Avatar in `ComicPanel`-Stil) mit Sprechblase, die die Frage stellt. 6 Charaktere rotieren (Vetterli, Brönnimann, Tissot, Keller, Brandt + 1 Moderator), Mapping in `story-beats.ts`.
- Richtige Antwort: Barometer-Balken animiert nach oben (grünes Glow), Maja-Avatar reagiert (daumen-hoch).
- Falsche Antwort: Barometer fällt (rotes Shake), Ratsperson schüttelt Kopf (Tilt-Animation), Maja besorgt.
- Endscreens (Sieg/Niederlage) erhalten finale Maja-Sprechblase und passendes Comic-Panel.

## 6. Styling / Token

Keine neuen Farben — bestehende `paper`/`ink`/`stamp`-Tokens nutzen. Comic-Look entsteht durch:
- `border-2 border-ink rounded-sm` + dezente `rotate-[-0.5deg]`
- Sprechblasen: weisser Hintergrund, dicker schwarzer Rand, CSS-Tail via `::after` clip-path
- Animationen ausschliesslich über vorhandene Utilities (`animate-fade-in`, `animate-scale-in`, `hover-scale`) + neue Keyframes `barometer-rise` / `shake` in `src/styles.css`

## Was NICHT geändert wird

- Keine neuen Rätsel, keine neuen Routen, keine Mechanik-Änderungen.
- `StageGate`, `QRGate`, `HintSystem`, `progress.ts` unangetastet.
- Keine externen Assets/KI-Bilder — alle Charaktere als CSS/SVG, damit es schlank bleibt.

## Reihenfolge der Umsetzung

1. `MajaAvatar`, `SpeechBubble`, `ComicPanel`, `StoryIntro`, `SuccessReaction`, `IntroLetter` bauen.
2. `story-beats.ts` mit Texten für alle 5 Etappen + Finale.
3. Landing Page: `IntroLetter` integrieren.
4. Etappen 1–5: `intro`-Step + `SuccessReaction` einhängen.
5. Finale: Barometer-Animation + Ratspersonen-Panels.
6. Build + manueller Durchlauf (Landing → Etappe 1 Intro → Rätsel → Erfolg → … → Finale).
