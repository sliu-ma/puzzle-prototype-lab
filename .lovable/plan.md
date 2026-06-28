
# Story-Politur — Narrative Game Feel

Aktuelle Storyline bleibt unverändert. Ich poliere nur Präsentation & Pacing, damit das Spiel sich wie ein narratives Adventure anfühlt — nicht wie eine Rätselsammlung.

## 1. Intro-Screen (`/` Landing) — Animierte Titelkarte

**Aktuell:** Statische "Vertraulich"-Karte mit Startformular direkt sichtbar.

**Neu:**
- Beim ersten Laden (vor Team-Registrierung): animierter Brief von Elvira fliegt herein, Schreibmaschinen-Text Zeile für Zeile, Stempel "EILIG" knallt rein.
- Brief-Inhalt (handschriftlich, kurz):
  > *"Maja, wenn Du das liest, bin ich schon weg. Heute Abend, 19 Uhr, entscheidet der Rat über das Gaskraftwerk. Ich habe fünf Hinweise im Dorf hinterlegt. Folge ihnen. — Elvira"*
- "Brief öffnen" → "Ermittlung starten" Button → blendet Startformular ein (Team + Code).
- Wenn Team schon registriert: Intro überspringen, direkt zum Fortschritts-Panel.

**Neue Datei:** `src/components/story/IntroLetter.tsx`

## 2. Story-Einleitung pro Etappe — Comic-Panel-Sequenz

**Aktuell:** Jede Akte startet direkt mit Voicemail/Rätselkarte.

**Neu:** Vor dem QR-Gate (bzw. nach Unlock, vor dem Rätsel) zeigt jede Etappe 2–3 Comic-Panels:
- Pro Panel: gerahmter Hintergrund (Farbverlauf passend zum Ort) + kurzer Erzähltext + Maja-Sprechblase (max. 1 Satz).
- Panels erscheinen nacheinander mit `fade-in` + leichtem `scale-in`. Tap/Klick = nächstes Panel.
- Letztes Panel: Button **„Bereit für das Rätsel?"** → öffnet das eigentliche Puzzle.
- Re-Spielbar: kleiner "Story nochmal lesen"-Button auf der Rätsel-Seite.

**Beispiel Etappe 1 (Bahnhof / Mobilität):**
1. *„Der erste Hinweis: ein Bahnticket in Elviras Mantel."* — Maja: „Genf? Was wollte sie dort?"
2. *„Im Etui: drei mögliche Routen. Eine davon muss Elvira gewählt haben."* — Maja: „Welche ist nachhaltig genug für sie?"

Inhalte werden in `src/lib/story-beats.ts` zentral gepflegt (eine Quelle der Wahrheit). Komponente `src/components/story/StoryIntro.tsx` rendert die Panels generisch.

## 3. Auflösungs-Animation

**Aktuell:** Rätsel löst → direkter Sprung zum Teaser-Text.

**Neu:** Zwischen Lösung und Teaser eine kurze Erfolgs-Sequenz (~1.5 s):
- Vollbild-Overlay: grosser grüner Haken-Stempel knallt rein (`scale-in` + Wackler), darunter „Hinweis gesichert" mit Etappen-Symbol.
- Danach Fade auf den bestehenden Teaser-Text (der zur nächsten Etappe leitet).
- Komponente: `src/components/story/SuccessStamp.tsx` (wiederverwendbar in allen 5 Akten).

## 4. Finale — Ratspersonen als Figuren

**Aktuell:** Fragen erscheinen als nackte Karten mit Barometer oben.

**Neu:**
- Bühne-Layout: oben Barometer (bleibt), darunter eine **Ratsperson-Karte** mit:
  - Avatar (stilisierte Figur — SVG/Initial-Badge mit Rolle, z. B. „Vetterli · Werke", „Brönnimann · Finanzen", „Tissot · Umwelt", „Keller · Sozial", „Brandt · Wirtschaft").
  - Sprechblase mit der Frage in direkter Rede.
- 10 Fragen → 5 Ratspersonen rotieren (jede stellt 2 Fragen, passend zu ihrem Ressort).
- **Richtig:** Sprechblase wird grün, Maja-Reaktion „Überzeugt!", Barometer-Balken animiert nach oben (`transition` + kurzer Puls).
- **Falsch:** Sprechblase wird rot, Ratsperson schüttelt Kopf (CSS-Shake), Barometer fällt sichtbar.
- Bestehende Frage-Typen (single/multi/short/match/order) bleiben unverändert — nur die Verpackung ändert sich.

## Technische Notizen

- Alles Frontend, keine neuen Routen, keine Datenmodell-Änderungen.
- Story-Inhalte in `src/lib/story-beats.ts` (5 Etappen × je 2–3 Panels + Erfolgstext).
- Ratspersonen-Daten in `src/lib/council.ts` (5 Personen × Name/Ressort/Akzentfarbe + Frage-Zuordnung).
- Komponenten nutzen bestehende design tokens (`--stamp`, `--paper`, etc.) und vorhandene Animationen (`fade-in`, `scale-in`).
- Keine neuen Bilder nötig — Avatare als gestylte Initial-Badges (konsistent mit dem Akten-Look).
- Code-Splitter-Regeln beachtet: Komponenten als reguläre TSX, keine Server-Funktionen.

## Geänderte/Neue Dateien

- **Neu:** `src/components/story/IntroLetter.tsx`, `src/components/story/StoryIntro.tsx`, `src/components/story/SuccessStamp.tsx`, `src/lib/story-beats.ts`, `src/lib/council.ts`
- **Edit:** `src/routes/index.tsx` (Intro-Letter einbinden), `src/routes/akte.tsx`, `akte-002.tsx`, `akte-003.tsx`, `akte-004.tsx`, `akte-005.tsx` (StoryIntro + SuccessStamp einhängen), `src/routes/finale.tsx` (Ratspersonen-Layout, Barometer-Animationen)
