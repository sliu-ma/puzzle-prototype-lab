# Drei QR-Karten pro A4-Seite mit Creme-Hintergrund

## Ziel

Drei QR-Druckkarten statt zwei pro A4-Seite. Die Aussenfläche (Seite/Hintergrund) in Creme `oklch(0.975 0.012 85)`, die Karteninnenfläche heller in `oklch(0.99 0.008 85)`.

## Änderungen

### `src/components/teacher/QRPrintList.tsx`

- `PAGE_SIZE` von `2` auf `3` setzen.

### `src/styles.css` (Druckregeln `@media print`)

- `.print-qr-page`: `grid-template-rows` von `repeat(2, 132mm)` auf `repeat(3, ...)` mit passender Zeilenhöhe für drei Karten.
- `min-height` an drei Karten anpassen (A4 hoch mit 12 mm Rand = ~273 mm nutzbar; drei Karten plus Lücken).
- `.print-qr-page` und Druckhintergrund auf Creme `oklch(0.975 0.012 85)` setzen (entspricht `--paper`).
- `.print-qr-card` Hintergrund auf `oklch(0.99 0.008 85)` setzen (entspricht `--card`), damit die Karte sich hell vom Creme-Hintergrund abhebt.
- Innenabstände/Ränder der Karte leicht verkleinern, damit Text und QR bei drei Karten pro Seite noch gut lesbar bleiben; farbiger Wegbuchstabe und Rand bleiben erhalten.
- Keine Änderung an Tokens, QR-Inhalt, Wegfarben oder Bedienelementen; nur Drucklayout und Farben.

## Prüfung

- Druckvorschau mit mehr als drei Codes: genau drei Karten pro Seite, korrekte Seitenumbrüche, keine geteilte Karte.
- Creme-Hintergrund und hellere Kartenfläche im Druck sichtbar.
- Karten für gemeinsame und getrennte Wege weiterhin richtige Buchstaben und Farben.
