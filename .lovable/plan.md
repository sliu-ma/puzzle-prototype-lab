# Animiertes Intro & Sieg-Outro

Zwei neue, vollflächige Animationssequenzen im bestehenden Papier-Akte-Look (Stempel, getippter Text, Polaroids, Tape, Sepia). Keine neuen Fonts oder Bibliotheken — wir nutzen vorhandene Tailwind-Keyframes (`fade-in`, `scale-in`) plus ein paar zusätzliche in `src/styles.css` (typewriter, stamp-slam, paper-drop, ink-draw).

---

## 1) Intro — „Akte wird geöffnet"

**Trigger:** Direkt nach erfolgreicher Team-Registrierung in `src/routes/index.tsx`, bevor Etappe 1 freigeschaltet wird. Überspringbar (Skip-Button oben rechts) und über einen kleinen „Briefing erneut ansehen"-Link im Fortschrittspanel wiederholbar. Status in `localStorage` (`maya-intro-seen`).

**Ablauf — 5 Beats, ~45 s gesamt, Auto-Advance + „Weiter"-Button:**

1. **Stempel-Slam** — Schwarzer Fade, dann knallt der rote Stempel „VERTRAULICH · GRÜNWALD" mittig auf. Datum/Uhrzeit typewritert darunter.
2. **Der Brief** — Polaroid-artiger Briefumschlag fällt auf den Tisch, öffnet sich, Zeile für Zeile getippt: „Samstag, 14:12. Tante Elvira ist weg. Auf dem Tisch ein Brief…". Roter Unterstrich wird unter „Gaskraftwerk" gezogen.
3. **Maja (Polaroid)** — Polaroid mit Initiale „M" auf farbigem Hintergrund kippt herein, Bildunterschrift: „Maja, 17 — eure Spielfigur. Ihr seht, was sie sieht."
4. **Elvira (Polaroid)** — Zweites Polaroid daneben: „Elvira, 71 — eure Grosstante. Verschwunden. Hat fünf Hinweise im Dorf hinterlegt."
5. **Spielerklärung** — Drei kurze Karten staffeln sich ein: QR scannen → Rätsel lösen → nächste Etappe. Plus Hinweis auf Tipps nach 3/6/9 min. Abschluss: „Bereit?" + Button „Etappe 1 öffnen →" (führt zu `/akte-003`).

Pro Beat: Stempel/Polaroid mit `scale-in` + leichter Rotation, Text mit Typewriter-Cursor. Sepia-Hintergrund + dezente Papierfasern wie auf der Startseite. Skip-Button springt direkt zu Beat 5.

## 2) Outro — „Sieg im Gemeindesaal"

**Trigger:** Im `src/routes/finale.tsx`, wenn das Überzeugungsbarometer ≥ Sieg-Schwelle erreicht. Ersetzt die aktuelle Sieg-Karte; bestehendes Konfetti bleibt als Akzent. Verlierer-Endscreen bleibt unverändert.

**Ablauf — 5 Beats, ~30 s, Auto-Advance:**

1. **Schlag des Hammers** — Schwarzer Fade, Stempel-Slam „ABGELEHNT" rot über stilisiertem Gemeinderats-Protokoll, Hammergeräusch ersetzt durch visuellen Stempel-Shake.
2. **Schlagzeile** — Zeitungsausschnitt-Karte kippt herein, getippt: „Gemeinderat Grünwald lehnt Gaskraftwerk ab. Knappe Mehrheit nach Bürgerhearing."
3. **Elvira lebt** — Polaroid „E" mit Notiz: „Danke, Maja. Du hast meine Hinweise gelesen." Tape oben.
4. **Eure Bilanz** — Kompakte Karte mit Teamname, finalem Barometer-Wert, gelösten Etappen (5/5). Optional: Anzahl genutzter Tipps.
5. **Abspann** — Headline „Akte 001–005 · Geschlossen", Untertitel „Ökologie ist viele kleine Entscheidungen.", Buttons „Zur Übersicht" und „Neues Spiel starten" (Reset).

Konfetti läuft während Beat 4–5 dezent im Hintergrund. Sieg-Status wird wie bisher persistiert.

---

## Technische Umsetzung

- **Neu:** `src/components/case-file/AktenIntro.tsx` — selbstständige Vollbild-Sequenz mit Beat-Index, `useEffect`-Timer für Auto-Advance, Skip- und Weiter-Buttons. Props: `onComplete()`.
- **Neu:** `src/components/case-file/SiegOutro.tsx` — analog, Props: `teamName`, `barometer`, `onRestart`, `onHome`.
- **Neu:** `src/components/case-file/Polaroid.tsx` (klein, wiederverwendbar) — Initiale auf Farb-Hintergrund, Tape, Bildunterschrift.
- **Edit `src/styles.css**` — Keyframes ergänzen: `typewriter` (width 0→100% + caret), `stamp-slam` (scale 1.6→1 + rotate + shadow), `paper-drop` (translateY -40px + rotate + fade), `ink-draw` (stroke-dashoffset für SVG-Linie). Plus Utility-Klassen.
- **Edit `src/routes/index.tsx**` — Nach `registerTeam(...)` Intro-Overlay einblenden, statt direkt Progress-Panel. `localStorage`-Flag `maya-intro-seen`. Im `ProgressPanel` kleiner Link „Briefing erneut ansehen" (setzt Flag zurück und öffnet Overlay).
- **Edit `src/routes/finale.tsx**` — Sieg-Branch rendert `<SiegOutro …/>` statt der aktuellen Erfolgs-Card. Niederlage bleibt wie bisher.

Keine neuen Pakete, keine neuen Fonts, kein Backend.