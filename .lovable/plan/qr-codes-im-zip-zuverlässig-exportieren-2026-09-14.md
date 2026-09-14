# QR-Codes im ZIP zuverlässig exportieren

## Ziel
Jede exportierte Karten-Grafik enthält garantiert den zugehörigen QR-Code, unabhängig davon, ob die Bildaufnahme ihn rechtzeitig erfasst.

## Umsetzung
1. Die vollständige Karte weiterhin als PNG aufnehmen, damit Gestaltung, Texte und Wegfarben unverändert bleiben.
2. Den QR-Code danach nochmals direkt auf die fertige PNG-Grafik zeichnen. Position und Grösse werden aus dem sichtbaren QR-Feld der jeweiligen Karte übernommen.
3. Erst die zusammengesetzte Grafik ins ZIP legen. Damit hängt der QR-Code nicht mehr vom Bild-Laden innerhalb der Kartenaufnahme ab.
4. Einen vollständigen ZIP-Export mit allen Karten prüfen und kontrollieren, dass jede PNG-Datei einen sichtbaren, scanbaren QR-Code enthält.

## Umfang
Nur der ZIP-Export wird angepasst. PDF-Druck, Kartenlayout, Texte, Farben, Wege und QR-Inhalte bleiben unverändert.

## Technische Details
Die Kartenaufnahme und der QR-Code werden in einem Browser-Canvas zusammengeführt. Der QR-Code wird dabei immer als letzte Ebene über das vorgesehene QR-Feld gezeichnet, bevor die PNG-Datei ins ZIP geschrieben wird.
