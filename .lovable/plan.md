## Ziel
Beim Wechsel zwischen den Haupt-Schritten einer Etappe (z. B. Treffen → Rätsel → Fachlicher Input → Nächstes) soll die Seite automatisch nach oben scrollen. Interne Tab-/Sub-Wechsel innerhalb eines Schritts (z. B. Gutachten A/B/C, Kategorien im Dorfladen, Karussell-Karten im Fachlichen Input) bleiben unverändert und scrollen NICHT.

## Umsetzung

In jeder Etappen-Route (`etappe-1.tsx` bis `etappe-5.tsx`) sowie im Finale gibt es einen zentralen `step`-State, der die Haupt-Abschnitte steuert. Genau dort setzen wir an:

- Einen kleinen Hook `useScrollToTopOnChange(value)` in `src/lib/utils.ts` (oder als eigene Datei `src/hooks/use-scroll-top.ts`) hinzufügen, der bei Änderung des übergebenen Werts `window.scrollTo({ top: 0, behavior: "smooth" })` ausführt.
- In jeder Etappen-Route den Hook mit dem jeweiligen `step`-Wert aufrufen.
- Beim Finale zusätzlich mit dem `questionIndex` (bzw. Frage-Wechsel), damit man bei neuer Frage oben startet — Sub-States innerhalb einer Frage (Auswahl, Drag) bleiben unangetastet.

## Nicht angefasst

- `GutachtenRaetsel` Tabs A/B/C
- `GruenerMarkt` Kategorien-Tabs
- `InputCarousel` Karten-Navigation
- `RouteCards`/`RouteDetail` interner Wechsel

Damit scrollt es nur bei „echten" Seiten-/Abschnittswechseln nach oben.
