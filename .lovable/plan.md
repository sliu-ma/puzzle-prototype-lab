## Ziel
Ein erweiterbares Badge-System einführen. Beim Erreichen eines Badges erscheint eine kurze Animation (Badge-Grafik + Beschreibung). Am Ende (Outro nach dem Hearing) gibt es eine Übersicht aller erreichbaren Badges — freigeschaltete hervorgehoben, noch nicht erreichte ausgegraut.

Erster Badge: **„Unter 60 Minuten"** — verliehen, wenn das Hearing erfolgreich abgeschlossen wird und die verstrichene Zeit seit Start < 60 Min ist.

## Umsetzung

### 1. Badge-Registry (`src/lib/badges.ts`, neu)
- Typ `Badge = { id, title, description, criteria, svgAsset }`.
- Registry-Array mit allen Badges (aktuell nur `unter-60`, weitere später ergänzbar).
- Persistenz in `localStorage` unter `badges-earned` (Set von IDs).
- Funktionen:
  - `awardBadge(id)` → speichert, feuert Custom-Event `badge:earned` mit Badge-Daten (nur wenn noch nicht verliehen).
  - `getEarnedBadges()`, `hasBadge(id)`.
- `resetAll()` in `src/lib/progress.ts` räumt `badges-earned` mit auf.

### 2. Asset
- Das hochgeladene SVG `unter60.svg` als Projekt-Asset via `lovable-assets create` einbinden → `src/assets/badge-unter60.svg.asset.json`.

### 3. Animation-Komponente (`src/components/case-file/BadgeToast.tsx`, neu)
- Globaler Listener auf `badge:earned`.
- Zeigt bildschirmfüllendes, aber dezentes Overlay: Badge-SVG (scale-in + leichter Glanz), darunter Titel + Beschreibung.
- Auto-Dismiss nach ~3.5 s, tap-to-dismiss.
- Nutzt vorhandene Utility-Klassen (`animate-scale-in`, `animate-fade-in`) — keine neuen Keyframes nötig.
- In `src/routes/__root.tsx` einmal mounten, damit es auf allen Seiten funktioniert.

### 4. Vergabe des ersten Badges
- In `src/routes/finale.tsx` an der Stelle, an der das Hearing als bestanden gilt (Outro-Trigger), prüfen:
  - Startzeit aus dem bestehenden Timer (`src/lib/progress.ts`, `getStartTime()` bzw. Äquivalent) lesen.
  - Wenn `now - start < 60 * 60 * 1000` → `awardBadge("unter-60")`.
- Nur einmal, nicht im Review-Modus.

### 5. Badge-Übersicht im Outro
- Im Erfolgs-/Outro-Screen (nach dem Hearing in `src/routes/finale.tsx`) ein neues Panel „Deine Auszeichnungen":
  - Grid aller Registry-Einträge.
  - Freigeschaltete: farbiges SVG + Titel + Beschreibung.
  - Nicht erreichte: gleiche Kachel, aber Graustufen/Opacity 40 %, Beschreibung als „Noch nicht erreicht".
- So sieht man sofort, welche Badges es überhaupt gibt.

## Nicht enthalten
- Keine weiteren Badges — Struktur ist so gebaut, dass du sie mit einer Zeile in der Registry + einem `awardBadge(...)`-Aufruf ergänzen kannst.
- Keine Änderungen an Scoring, Timer-Logik oder Etappen-Flow.
- Kein Konfetti, keine Sounds.
