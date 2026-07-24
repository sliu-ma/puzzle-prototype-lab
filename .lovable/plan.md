## Ziel
Ein kleines Coach-Mark-Tutorial mit Spotlight für die Etappe 5 (Gutachten-Rätsel), analog zum bestehenden `MarketTutorial` in Etappe 2. Es erklärt in vier Schritten die Bedienung.

## Wiederverwendung
Die bestehende `MarketTutorial`-Komponente (`src/components/case-file/MarketTutorial.tsx`) ist generisch genug (Spotlight über `targetRef`) und wird direkt wiederverwendet. Keine neue Tutorial-Komponente nötig.

## Änderungen in `src/components/case-file/GutachtenRaetsel.tsx`

1. Vier `useRef<HTMLDivElement | null>(null)` für die Ziele anlegen:
   - `faktenRef` → Marlenes Faktenkarte (an `Faktenkasten`-Wrapper)
   - `aussageRef` → erste anklickbare Aussage (`ChunkItem`)
   - `tabsRef` → Akten-Tabs-Container (Zeile 249)
   - `pruefenRef` → „Prüfen"-Button (Zeile 238)

2. Steps definieren mit den vom Nutzer vorgegebenen Texten:
   1. „Marlenes Faktenkarte – ihre geprüften Daten. Nutze sie als Vergleich."
   2. „Klicke auf eine Aussage, wenn du das Gefühl hast, sie ist falsch."
   3. „Wechsle zwischen den Gutachten (Akte A–C)."
   4. „Wenn 5 Aussagen markiert sind, drücke auf Prüfen."

3. State + Persistenz:
   - `useState` `showTutorial` initial `true`, wenn `localStorage.getItem("etappe-5-tutorial-seen")` nicht gesetzt ist.
   - Beim Schliessen: `localStorage.setItem("etappe-5-tutorial-seen", "1")`.
   - „? Hilfe"-Button oben rechts im Header (neben Markierungen/Prüfen oder in der Titelzeile) zum manuellen Neustart.

4. `<MarketTutorial open={showTutorial} steps={steps} onClose={...} />` am Ende des JSX rendern.

## Technische Details
- Refs müssen auf tatsächlich existierende DOM-Elemente zeigen. Für die Aussage (Step 2) wird die erste `ChunkItem`-Instanz im ersten Gutachten referenziert (`aktuell === 0`). Falls der Nutzer bereits ein anderes Gutachten offen hat, kann das Tutorial zunächst `setAktuell(0)` triggern, damit Step 2 sichtbar ist.
- Der `Faktenkasten`-Wrapper braucht ein zusätzliches `ref`-forwarding: entweder eine `<div ref={faktenRef}>`-Umhüllung um `<Faktenkasten>` in `GutachtenRaetsel.tsx` (einfacher, kein API-Wechsel).
- `ChunkItem`: analog per Wrapper-`<div ref>` um das erste Element im ersten Body-Chunk.
- Kein Reset des Tutorials bei „Neues Spiel" nötig, da `resetAll` bereits `localStorage` leert.

## Nicht im Scope
- Keine Änderung an bestehender Rätsel-Logik, Texten oder Layout.
- Keine Änderung an `MarketTutorial.tsx`.
