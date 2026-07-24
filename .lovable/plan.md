## Ziel

Kleines Onboarding-Tutorial für den "Grünen Markt" (Etappe 2), das beim ersten Öffnen automatisch startet. Der Bildschirm wird abgedunkelt, nur ein Element ist als heller "Spotlight" sichtbar. Ein kleiner Kommentar erklärt den Schritt. 3 Schritte, dann verschwindet das Tutorial.

## UX-Ablauf

Schritt 1 — Spotlight auf die Kategorien-Leiste
Kommentar: "Wechsle hier zwischen Produktgruppen."

Schritt 2 — Spotlight auf eine Produktkarte
Kommentar: "Tippe auf ein Produkt für Details, Herkunft und Labels."

Schritt 3 — Spotlight auf die Warenkorb-Leiste (unten sticky)
Kommentar: "Tippe hier, um deinen Warenkorb einzusehen."

Nach Schritt 3: "Los geht's" → Tutorial schließt.

Steuerung:
- "Weiter" Button rechts unten am Kommentar
- "Überspringen" Link oben rechts
- Tap auf dunklen Bereich = Weiter
- Kein Interaktions-Zwang mit den echten Elementen (Spotlight ist rein visuell, klickt nichts durch)

Persistenz:
- localStorage-Key `akte-2-tutorial-seen` (via `usePersistentState`).
- Läuft nur beim ersten Mal automatisch. Ein kleiner "?"-Button oben rechts im Markt-Header ermöglicht Neustart des Tutorials.
- `resetAll` in `src/lib/progress.ts` löscht den Key mit (damit "Neues Spiel" das Tutorial wieder zeigt).

## Umsetzung (technisch)

Neue Komponente `src/components/case-file/MarketTutorial.tsx`:
- Props: `steps: { targetRef: RefObject<HTMLElement>; text: string }[]`, `open`, `onClose`.
- Misst `getBoundingClientRect()` des aktuellen Ziels, rendert ein `fixed inset-0` Overlay via Portal.
- Dark Layer: vier `div`s um den Spotlight-Rechteck herum (top/bottom/left/right), jeweils `bg-black/70`. Damit ist der Zielbereich sichtbar, der Rest abgedunkelt — ohne SVG-Mask, funktioniert überall.
- Ring um Spotlight: dünner heller Rahmen + `animate-pulse`.
- Kommentar-Bubble: Positioniert unter (Schritt 1, 2) bzw. über (Schritt 3, weil Warenkorb unten sticky ist) dem Spotlight. Fallback: falls Platz knapp, zentriert.
- Re-measure bei Resize/Scroll (ResizeObserver + scroll listener auf window).
- Sanftes Fade-in (bestehende `animate-fade-in` Utility).

Änderungen in `src/components/case-file/GruenerMarkt.tsx`:
- Drei `useRef` anhängen: `kategorienRef` (Kategorien-Scroller-Div), `produktRef` (erste Karte im Grid), `cartBarRef` (sticky Cart-Bar).
- `useEffect`: wenn `!tutorialSeen`, starte Tutorial nach kurzem Delay (100ms, damit Layout gesetzt ist).
- Header bekommt kleinen "?"-Button rechts, der Tutorial manuell startet.

Änderung in `src/lib/progress.ts`:
- In `resetAll` den Key `akte-2-tutorial-seen` mit-entfernen.

Keine neuen Packages nötig.

## Geänderte Dateien

- `src/components/case-file/MarketTutorial.tsx` (neu)
- `src/components/case-file/GruenerMarkt.tsx` (Refs, Tutorial-Trigger, Help-Button)
- `src/lib/progress.ts` (Reset-Key)
