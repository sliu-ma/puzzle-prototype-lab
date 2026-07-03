# Fix: Drag-Ghost driftet ~300 px nach unten

## Diagnose
`MatchView` und `BucketView` (in `src/routes/finale.tsx`) rendern das Ghost-Element mit `position: fixed`. Beide Views stecken jedoch in einer `PaperCard`, die inline `transform: rotate(0.2deg)` setzt.

Ein Ancestor mit `transform` erzeugt laut CSS-Spec einen neuen Containing Block für `fixed`-Nachfahren — `top/left` beziehen sich dann nicht mehr auf den Viewport, sondern auf die `PaperCard`. Sobald die Seite gescrollt ist, erscheint der Ghost um genau die Scroll-Distanz zwischen `PaperCard`-Oberkante und Viewport-Oberkante versetzt (typisch ~300 px bei den Match/Bucket-Fragen).

## Änderung
Ghost aus dem transformierten Kontext herausheben, indem er per React-Portal direkt in `document.body` gerendert wird.

1. In `src/routes/finale.tsx`:
   - `import { createPortal } from "react-dom";`
   - In `MatchView`: den JSX-Block „Drag ghost" (Zeilen ~1100–1113) mit `createPortal(<div …>…</div>, document.body)` umschließen. SSR-Guard: nur portalen, wenn `typeof document !== "undefined"`.
   - In `BucketView` (Zeilen ~1383–1390) identisch portalen.

Das Ghost bleibt `pointer-events-none fixed z-50 …` mit `left: ghost.x + 12, top: ghost.y + 12` — jetzt aber echt viewport-relativ, weil `body` keinen transformierten Ancestor hat.

## Warum nicht alternativ die Rotation entfernen?
Die 0.2°-Rotation ist bewusstes Papier-Feeling und wird an vielen Stellen genutzt. Der Portal-Fix ist lokal, ändert kein Styling und wirkt sich nur auf die zwei betroffenen Ghosts aus.

## Verifikation
- Frage mit Match/Bucket öffnen, Seite scrollen, Kachel greifen → Ghost sitzt direkt am Cursor (+12/+12 Offset), sowohl bei Maus als auch bei Touch.
- Drop-Ziel-Erkennung (`findRightAt` / Bucket-Hover) ist nicht betroffen, weil sie ohnehin mit `getBoundingClientRect` + `clientX/Y` arbeitet.
