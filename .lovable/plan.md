# QR-Druck: Seitenhintergrund und Farbcodierung korrigieren

Zwei Korrekturen am QR-Druck (`src/components/teacher/QRPrintList.tsx`, Druckfarben in `src/styles.css`).

## 1. Seitenhintergrund

- Die ganze gedruckte A4-Seite (`.print-qr-page`) bekommt den Hintergrund `#FAF7EF` (Creme).
- Die Kartenfläche innen bleibt ein Tick heller (wie bisher mit `print-color-adjust: exact` gesichert, damit die Farben im Druck nicht wegfallen).

## 2. Farbcodierung pro Karte

Aktuell nimmt jede Karte die Farbe des ersten Buchstabens (`letters[0]`). Das stimmt nicht, wenn:

- eine Station mehreren Wegen dient (geteilter QR-Code): Rahmen und Postenname bekommen die Farbe des ersten Buchstabens, obwohl die Karte für mehrere Wege gilt.
- die Buchstabenreihenfolge nicht zur eigentlichen Zuordnung passt.

Neu:

- Karte mit genau einem Weg: Rahmen, Postenname und Buchstaben-Badge in der Weg-Farbe (A rot, B grün, C blau, D gelb).
- Karte mit mehreren Wegen (geteilter QR-Code): jeder Buchstabe behält sein eigenes farbiges Badge; Rahmen und Postenname werden neutral (Dunkelbraun aus dem Theme), damit keine Weg-Farbe falsch dominiert.

## Technische Details

- In `QRPrintList.tsx`: Bedingung `it.letters.length === 1 ? PATH_COLOR[it.letters[0]] : theme-neutral` für Rahmen und Titelzeile.
- In `styles.css` im `@media print`-Block: `.print-qr-page { background: #FAF7EF; }`, Kartenhintergrund bleibt heller Cremeton.
- Keine Änderungen an Tokens, QR-Inhalten oder der Datenbank.
