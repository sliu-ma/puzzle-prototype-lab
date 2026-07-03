## Ziel

URL-Pfade so umbenennen, dass sie mit der Etappen-Nummer korrelieren.

| Etappe | Bisher | Neu |
|---|---|---|
| 1 · Bahnhof | `/akte-003` | `/etappe-1` |
| 2 · Dorfladen | `/akte` | `/etappe-2` |
| 3 · Wald | `/akte-002` | `/etappe-3` |
| 4 · Elviras Haus | `/akte-004` | `/etappe-4` |
| 5 · Wasserkraftwerk | `/akte-005` | `/etappe-5` |
| Finale | `/finale` | `/finale` (unverändert) |

## Umsetzung

1. **Route-Dateien umbenennen** (`mv`, Inhalte bleiben identisch):
   - `src/routes/akte-003.tsx` → `src/routes/etappe-1.tsx`
   - `src/routes/akte.tsx` → `src/routes/etappe-2.tsx`
   - `src/routes/akte-002.tsx` → `src/routes/etappe-3.tsx`
   - `src/routes/akte-004.tsx` → `src/routes/etappe-4.tsx`
   - `src/routes/akte-005.tsx` → `src/routes/etappe-5.tsx`

2. **`createFileRoute("...")` in jeder Datei anpassen** — Pfad muss dem Dateinamen entsprechen (`"/etappe-1"` … `"/etappe-5"`).

3. **`src/lib/progress.ts`** — `STAGES[].to` und der `to`-Union-Typ auf neue Pfade umstellen.

4. **Alle `navigate({ to: "..." })`-Aufrufe** in den Etappen-Dateien anpassen (Zeiger auf die jeweils nächste Etappe): `/akte` → `/etappe-2`, `/akte-002` → `/etappe-3`, `/akte-004` → `/etappe-4`, `/akte-005` → `/etappe-5`.

5. **`src/routeTree.gen.ts`** wird vom Vite-Plugin automatisch neu generiert — nicht anfassen.

## Was NICHT geändert wird

- **`localStorage`-Keys** (`akte-00X-unlocked`, `akte-00X-hints-start`, `maya-clock-akte-00X`) bleiben — sind reine Interna, keine URLs. Das erspart Migrationslogik und der bestehende `resetAll()`-Präfix (`akte-*`) wischt sie weiterhin sauber weg.
- **QR-Tokens** (`AKTE_003_TOKEN` etc.) bleiben unverändert — die gedruckten QR-Codes im Dorf enthalten Text-Tokens, keine URLs, funktionieren also weiter.
- **Konstantennamen im Code** (`AKTE_003_TOKEN`, `HINTS_003`, `AkteGated`, `AktePage`) bleiben — reine Symbole ohne User-Sichtbarkeit.
- **`/finale`** bleibt.

## Verifikation

Nach dem Umbau `tsgo --noEmit` laufen lassen: alle `navigate`- und `<Link to>`-Aufrufe sind über den `to`-Typ in `progress.ts` bzw. TanStacks generiertem RouteTree typisiert und würden bei einem übersehenen Pfad einen Compile-Error werfen.
