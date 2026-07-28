## Ziel
Zweites Badge einführen, Toast-Animation aufwerten, und die Badge-Übersicht im Outro als Karussell mit „Erhalten am"-Metadaten umbauen.

## Umsetzung

### 1. Neuer Badge „Sparsamer Ermittler" (`src/lib/badges.ts`)
- Neuer Eintrag `sparsame-hinweise`: verliehen, wenn beim Bestehen des Hearings **weniger als 3 Hinweise** über alle fünf Etappen zusammen aufgedeckt wurden.
- Persistenz-Format erweitern: statt `string[]` jetzt `{ id: string; earnedAt: string }[]` (ISO-Zeitstempel). `getEarnedBadges()` bleibt für Kompatibilität, dazu `getEarnedBadgeRecords()` und `getBadgeEarnedAt(id)`. Alte Einträge (nur IDs) werden beim Laden migriert (Datum = jetzt).
- Neues Asset via `lovable-assets create` einbinden. Ich frage den Nutzer im Chat, ob er ein SVG hochlädt; bis dahin nutze ich das vorhandene `badge-unter60.svg.asset.json` als Platzhalter (klar dokumentiert).

### 2. Zählen der Hinweise
- Hilfsfunktion `getTotalHintsUsed()` in `src/lib/progress.ts` (oder neben Badge-Logik): liest die fünf Keys `akte-00{1..5}-hints-start-revealed` aus `localStorage`, summiert die Array-Längen.
- In `src/routes/finale.tsx` bei bestandenem Hearing zusätzlich zu `unter-60` prüfen: `if (getTotalHintsUsed() < 3) awardBadge("sparsame-hinweise")`.
- `resetAll()` räumt bereits alle `-revealed`-Keys und `maya-badges-earned` mit auf — keine Änderung nötig.

### 3. Toast-Animation aufwerten (`src/components/case-file/BadgeToast.tsx`)
- Kein Auto-Dismiss mehr — nur Tap/Klick oder ESC schließt.
- Aufwendigere Inszenierung, weiter mit vorhandenen Keyframes (`animate-scale-in`, `animate-fade-in`, `animate-pulse`) plus Tailwind-Utilities (`transition`, `duration`, `delay`):
  - Dunkler Vollbild-Backdrop mit Blur + weichem Radial-Glow.
  - Rotierender/pulsierender Strahlenkranz hinter dem Badge (CSS-Conic-Gradient + `animate-[spin_8s_linear_infinite]`).
  - Badge-SVG mit gestaffeltem Einflug (Scale + leichte Rotation) und Drop-Shadow-Glow.
  - Titel + Beschreibung „typen" verzögert ein (Sequenz per `animation-delay`).
  - Sichtbarer „Weiter"-Button + Hinweis „Tippen zum Schliessen"; kein `setTimeout`-Autoclose.
- Haptik bleibt.

### 4. Badge-Karussell im Outro (`src/components/case-file/BadgeShowcase.tsx`)
- Umbau von Grid → horizontales Snap-Karussell (analog `InputCarousel`, `snap-x snap-mandatory`, Dots, keine externen Deps).
- Zeigt **alle** Registry-Badges — nicht erreichte in Graustufen + Lock-Overlay, erreichte farbig.
- Klick auf eine Kachel öffnet einen Detail-Bereich unter dem Karussell (bzw. Dialog):
  - Bei erhalten: Titel, Beschreibung, „Erhalten am {Datum · Uhrzeit}" (aus `getBadgeEarnedAt`, formatiert mit `toLocaleString('de-CH')`).
  - Bei nicht erhalten: Titel gedämpft, Kriterium („So bekommst du es"), Hinweis „Noch nicht erhalten".
- Position/Header (Zähler `x / n`) bleibt.

## Nicht enthalten
- Kein Redesign des Outros drumherum, keine neuen Sounds/Konfetti.
- Keine Änderung an Scoring, Timer oder Etappen-Flow.
- Zweiter Badge nutzt vorerst dieselbe Grafik; sobald du ein SVG lieferst, tausche ich es via `lovable-assets` aus.