# QR-Druck: QR-Code-Grösse an drei Karten pro Seite anpassen

## Befund aus dem hochgeladenen PDF

Das PDF zeigt noch die **alte** Version mit zwei grossen Karten pro A4-Seite (Seite 1: zwei Karten, Seite 2: eine Karte). Es wurde also vor der Umstellung auf drei Karten gedruckt beziehungsweise aus einem nicht aktualisierten Tab. Inhalt, Farbcodierung und Buchstaben-Badges sind korrekt (geteilte Stationen zeigen beide Buchstaben neutral, einzelne Wege farbig).

Ein echter Fehler im aktuellen Drei-Karten-Layout ist trotzdem sichtbar begründet: Die Kartenzeile ist nur 87 mm hoch, nach Innenabstand bleiben rund 73 mm. Der QR-Code ist aber als Quadrat mit bis zu 92 mm Breite definiert und ragt damit oben und unten aus der Karte heraus beziehungsweise wird abgeschnitten.

## Änderung

### `src/styles.css` (Druckregeln `@media print`)

- `.print-qr-code`: Breite an die Kartenhöhe koppeln statt an die Spaltenbreite, zum Beispiel `flex: 0 0 auto; width: 66mm; max-width: none;`.
- Das QR-Bild im Druck auf die nutzbare Höhe begrenzen (`height: 66mm; width: 66mm`), damit es mit Rahmen und Padding sicher in die 87-mm-Zeile passt.
- Weissrand um den QR-Code (`margin` beim Erzeugen) bleibt erhalten, damit der Code zuverlässig scanbar bleibt.

## Nicht geändert

- Drei Karten pro Seite, Creme-Hintergrund `#FAF7EF`, hellere Kartenfläche.
- Farbcodierung, Texte, Wegbuchstaben, QR-Inhalte.

## Hinweis für den nächsten Druck

- Vor dem Drucken die Lehrerseite einmal neu laden, damit die aktuelle Version mit drei Karten pro Seite gedruckt wird.

## Prüfung

- Druckvorschau: drei Karten pro Seite, QR-Codes vollständig innerhalb der Karten, nichts abgeschnitten.
- QR-Codes bleiben scanbar (ausreichende Grösse und Weissrand).
</content>
</invoke>
