## Änderungen am Badge-System

### 1. „Sparsamer Ermittler" nach Etappe 5 verleihen
- In `src/routes/etappe-5.tsx` beim erfolgreichen Abschluss der Etappe (dort wo aktuell `markStageComplete(5)` bzw. der Erfolgs-Übergang läuft) einmalig prüfen: wenn `getTotalHintsUsed() < 3` und die Etappe frisch abgeschlossen wurde → `awardBadge("sparsame-hinweise")`.
- Aus `src/routes/finale.tsx` (Bereich Sieg-Handling im Hearing) den `sparsame-hinweise`-Award entfernen — dort bleibt nur noch „unter-60".
- Damit erscheinen die Badges nicht mehr gleichzeitig nach dem Hearing.

### 2. Karussell im Outro vereinfachen (`BadgeShowcase.tsx`)
- Kacheln enthalten nur noch das Badge-SVG (erhalten farbig, sonst grayscale + Lock-Overlay). Keine Titel/Texte mehr in der Kachel.
- Klick auf ein Badge öffnet einen **Dialog** (shadcn `Dialog`) statt einer Detail-Sektion darunter:
  - Erhalten: Badge-Bild groß, Titel, Beschreibung, „Erhalten am {Datum · Uhrzeit}".
  - Nicht erhalten: Badge grau, Titel gedämpft, Kriterium („So bekommst du es"), Hinweis „Noch nicht erhalten".
- Detail-Bereich unter dem Karussell entfällt komplett. Header + Dots bleiben.

### 3. Toast-Animation: Hintergrund + Konfetti (`BadgeToast.tsx`)
- Backdrop wechselt von grün-lastig zu einem neutral-dunklen Look, der zu beiden Badges passt: dunkler Ink-/Slate-Overlay mit Blur + weichem, warmem Radial-Glow in Papierton (statt Emerald). Rotierender Strahlenkranz und Inner-Glow werden ebenfalls auf warm/neutral (Amber/Paper/Stamp) umgestellt, damit sie zu Gold-Badges passen und weder Gelb noch Grün dominieren.
- Drop-Shadow des Badge-SVG in warmem Ton (statt Emerald-Glow).
- **Konfetti** wird als weitere Ebene ergänzt: leichte, DOM-basierte Lösung ohne neue Dependency — ca. 40 absolut positionierte, farbige Rechtecke, die per CSS-Keyframe von oben nach unten fallen und dabei rotieren. Neue Keyframes werden lokal in `BadgeToast.tsx` per `<style>`-Tag mitgeliefert (keine `tailwind.config` nötig, da das Projekt Tailwind v4 ohne Config nutzt). Palette: Stamp-Rot, Kraft-Beige, Amber, Papercream — passend zum Design-System.
- Verhalten unverändert: nur Tap/Klick/ESC schließt, Haptik bleibt.

### 4. Nicht enthalten
- Keine Änderungen an Badge-Logik, IDs, Persistenz oder Vergabekriterien außer dem Verschieben aus Punkt 1.
- Keine neuen Sounds, keine neue Dependency (Konfetti bleibt CSS-only).

## Technische Details
- Neue Konfetti-Partikel: Array von ~40 Elementen, pro Partikel randomisierte `left`, `animationDelay`, `animationDuration` (2.2–3.8s), Farbe aus fixer Palette, `will-change: transform`. Keyframes `badge-confetti-fall` (translateY 0 → 110vh, rotate 0 → 720deg) im inline `<style>`.
- Dialog: bestehender shadcn `Dialog` aus `@/components/ui/dialog`; kein Backdrop-Konflikt mit dem Toast, weil Toast und Outro-Dialog nie gleichzeitig sichtbar sind.
- Award-Trigger Etappe 5: gate über `hasBadge("sparsame-hinweise")` bzw. das Idempotenz-Guard in `awardBadge`, damit ein Rückblick auf die Etappe das Badge nicht erneut auslöst.