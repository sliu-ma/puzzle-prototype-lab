## Problem

In der Faktenkarte (fachlicher Input) sieht man beim Wischen einen weissen Verlauf am rechten Rand. Er verschwindet erst auf der letzten Karte.

**Ursache:** In `src/components/case-file/InputCarousel.tsx` gibt es ein „Peek-Fade" – ein Farbverlauf `bg-gradient-to-l from-card to-transparent`, der über dem Carousel liegt, solange man nicht auf der letzten Karte ist. Auf dem cremefarbenen Papier-Hintergrund wirkt er wie ein weisser Streifen.

## Änderung

- Peek-Fade-Element entfernen (das `<div>` mit `pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l …`).
- Der Rest der Swipe-Hinweise (Chevron, Punkte, „Wischen für nächste Karte", floating Hint) bleibt erhalten – das reicht als visueller Hinweis.
- Keine weiteren Dateien betroffen.
