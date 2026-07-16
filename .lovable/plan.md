## Ziel
Die Info-Dialoge visuell aufwerten mit einem kleinen, konsistenten Icon-Element im Akten-Stil: Lucide-Icon in einem kreisförmigen Stempel-Rahmen (grüner/roter Ring, Papier-Hintergrund, leichte Rotation) oben mittig im Dialog.

## Wiederverwendbare Komponente
Neue Komponente `src/components/case-file/IconStamp.tsx`:
- Props: `icon` (Lucide-Component), `tone` ("neutral" | "urgent" | "success"), `rotate?` (default -4°)
- Rendering: runder Rahmen (~64px), 2–3px Border, `bg-paper`, sanfter Schatten, leichte Rotation wie ein Stempel; Icon in `tone`-Farbe (neutral = `stamp`, urgent = `destructive`, success = `emerald-700`)
- Reduziertes Motion respektieren (statisch, keine Animation nötig)

## Integration

**1. Recherche-Tipp Dialoge**
- `src/routes/etappe-3.tsx` — Dialog "Recherche-Tipp": `Search`-Icon (neutral) über `DialogTitle`
- Analog prüfen und ergänzen in weiteren Etappen, die einen ähnlichen Recherche-/Info-Dialog verwenden (z. B. `showCodeHint`-Muster in etappe-1/2/4/5, falls vorhanden — nur wo bereits Dialog existiert, kein neuer Inhalt)

**2. Maja Timer-Popups** (`src/components/case-file/GlobalTimer.tsx`)
- Nicht-urgent Beats: `Clock`-Icon (neutral, `stamp`-Farbe)
- Urgent Beats (`at >= 75`): `AlertTriangle`-Icon (destructive, dezent pulsierend über bestehende `animate-pulse`-Klasse)
- Icon-Stempel oberhalb des `DialogTitle` platzieren; bestehende ⚠/✉-Emojis im Titel entfernen (durch den visuellen Stempel ersetzt)

## Nicht im Scope
- Hinweis-Karten (HintSystem) und Envelope-Dialoge bleiben unverändert
- Keine neuen Animationen/Sounds, keine Farbtoken-Änderungen in `styles.css`

## Technische Notizen
- Nur `lucide-react` (bereits installiert), keine neuen Dependencies
- Tailwind-Klassen mit vorhandenen Design-Tokens (`bg-paper`, `text-stamp`, `text-destructive`, `border-stamp`)
- Aufwand: ~1 neue Datei + 2 bearbeitete Dateien
