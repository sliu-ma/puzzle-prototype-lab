## Problem

In `MatchView` und `BucketView` (`src/routes/finale.tsx`) wird die Ghost-Kachel mit einem festen Offset `left: ghost.x + 12, top: ghost.y + 12` positioniert. Dadurch erscheint sie beim Greifen sichtbar rechts/unter dem Finger — besonders auf Mobile stört das.

Zusätzlich hat der Ghost andere Dimensionen als das Original (`px-3 py-2`, ohne Breite/Höhe der Quelle), also „springt" die Kachel beim Aufnehmen auch in der Größe.

## Lösung

Pointer-Offset relativ zur gegriffenen Kachel beim `pointerdown` messen und den Ghost so positionieren, dass genau der Punkt unter dem Finger bleibt, auf den geklickt wurde. Ghost bekommt zusätzlich die Originalbreite/-höhe, damit keine Größenänderung stattfindet.

### Änderungen in `src/routes/finale.tsx`

Für **beide** Drag-Komponenten (`MatchView`, `BucketView`):

1. **Neuer State** neben `ghost`:
   ```ts
   const [grab, setGrab] = useState<{ dx: number; dy: number; w: number; h: number } | null>(null);
   ```

2. **`startDrag`** misst das BoundingRect der gegriffenen Kachel:
   ```ts
   const el = e.currentTarget as HTMLElement;
   const rect = el.getBoundingClientRect();
   setGrab({
     dx: e.clientX - rect.left,
     dy: e.clientY - rect.top,
     w: rect.width,
     h: rect.height,
   });
   ```

3. **Ghost-Style** ohne willkürlichen `+12`-Offset, mit Originalmaßen und `transform` für schärfere Bewegung:
   ```tsx
   style={{
     left: 0,
     top: 0,
     width: grab.w,
     height: grab.h,
     transform: `translate(${ghost.x - grab.dx}px, ${ghost.y - grab.dy}px)`,
   }}
   ```
   Padding/Border des Ghosts an das Original angleichen (gleiche Klassen wie die Quelle: `rounded border-2 ...`), damit visuell nichts springt.

4. **`endDrag`** setzt zusätzlich `setGrab(null)`.

### Weitere Prüfungen

- Kein `transform`/`scale`/`zoom` auf Parent-Containern in `finale.tsx` gefunden, das die Cursor-Koordinaten verzerren würde. `position: fixed` + `clientX/Y` bleiben korrekt.
- `pointer-events-none` auf dem Ghost bleibt, damit `elementFromPoint` in `findTarget`/`findRightAt` weiter das Ziel unter dem Finger erkennt.
- Bilder im Ghost bleiben mit `draggable={false}`, um Browser-Ghost zu unterdrücken.

## Ergebnis

Die Kachel startet und bleibt exakt unter Finger/Cursor an der Stelle, an der sie gegriffen wurde — kein sichtbarer vertikaler oder horizontaler Sprung mehr.