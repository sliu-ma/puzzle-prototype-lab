# Etappe 3 — Neue Tiere & 3-stelliger Code (456)

## Rätsel-Update

- 8 Polaroids statt 7, neue Mechanik: **nur hinter der Kreuzotter** stehen alle drei Zahlen (4, 5, 6). Hinter den anderen gefährdeten Tieren steht nichts.
- Code wird **3-stellig: 456** (aufsteigend sortiert).
- Gefährdungslage explizit **bezogen auf die Schweiz** (Rote Liste BAFU) in allen Texten und Hinweisen.

### Tierliste (Schweiz)

| Tier | Status |
|---|---|
| Kreuzotter | stark gefährdet — **Code 456 dahinter** |
| Teichmolch | stark gefährdet |
| Luchs | stark gefährdet |
| Moor-Wiesenvögelchen | vom Aussterben bedroht |
| Waldeidechse | potentiell gefährdet |
| Reh | nicht gefährdet |
| Rotkehlchen | nicht gefährdet |
| Biber | nicht gefährdet |

## Änderungen

### `src/components/case-file/CodeLock.tsx`
- Code-Länge dynamisch machen: neue Prop `length?: number` (default 4). State-Array und Index-Logik nutzen `expected.length`.
- Fokus-/Backspace-Navigation auf neue Länge anpassen.

### `src/routes/akte-002.tsx`
- `EXPECTED_CODE = "456"`, `<CodeLock expected={EXPECTED_CODE} />` bleibt (Länge wird abgeleitet).
- Brief-Text (Beobachtungsbuch) leicht anpassen: Hinweis auf 8 Tiere und „**in der Schweiz** gefährdet vs. nicht gefährdet" sowie neue Mechanik („hinter einer einzigen Karte verbirgt sich der ganze Code").
- „Code eintippen"-Screen: Hinweistext anpassen („drei Zahlen", Schweiz-Kontext).
- Hinweise (`HINTS_002`) neu formuliert:
  - **Tipp 1 (3 Min):** Schweiz-Kontext betonen — gemäss Roter Liste der Schweiz (BAFU). Aufgabe: 8 Polaroids in gefährdet (inkl. potentiell gefährdet & vom Aussterben bedroht) vs. nicht gefährdet trennen. Hinweis: 5 davon sind in der Schweiz in irgendeiner Form bedroht, 3 nicht.
  - **Tipp 2 (6 Min):** Karten umdrehen — die meisten Rückseiten sind leer. Nur hinter **einer** der gefährdeten Karten stehen drei Zahlen versteckt.
  - **Tipp 3 (9 Min, Auflösung):** Hinter der **Kreuzotter** stehen die Zahlen 4, 5 und 6. Aufsteigend ergibt das den Code **456**.

### Optional: Input-Karten (Etappe 3)
Falls in den Fachinput-Karten konkrete Tier-Beispiele genannt werden (Feldhase, Apollofalter), durch die neuen Arten ersetzen oder neutraler formulieren. Werde ich beim Umsetzen prüfen und nur bei Bedarf anpassen.

## Out of scope
- Polaroid-/Bild-Assets bleibt beim Lehrer (Druckvorlage).
- Andere Etappen werden nicht angefasst.
