# Eingabe der Zeichenfolge ausblenden

Heute steht auf jedem Sperrbildschirm ein Feld, in das die Zeichenfolge unter dem QR-Code getippt werden kann. Damit lässt sich eine Etappe öffnen, ohne vor Ort zu sein. Dieses Feld verschwindet für die Lernenden – die Funktion bleibt aber im Code erhalten, damit du sie später mit einem Handgriff wieder einschalten kannst.

## So wird es sich anfühlen

- Auf dem Sperrbildschirm einer Etappe gibt es nur noch die Kamera-Schaltfläche. Kein Eingabefeld, kein Hinweis auf eine Zeichenfolge.
- Klappt die Kamera nicht, steht dort neu: «Wenn die Kamera nicht startet, frag die Lehrperson.»
- Alles andere (Scannen, Fehlermeldungen, Punktezählung ab Scan) bleibt unverändert.

## Technische Umsetzung

In `src/components/case-file/QRGate.tsx`:
- Neue Konstante `ALLOW_MANUAL_ENTRY = false` zuoberst, mit Kommentar, dass ein Umstellen auf `true` die manuelle Eingabe wieder sichtbar macht.
- Der Block mit Label «Code von Hand eingeben», Eingabefeld und Schaltfläche «Öffnen» wird nur noch gerendert, wenn `ALLOW_MANUAL_ENTRY` gesetzt ist. Die Logik (`unlockManually`, `manual`, `manualError`) bleibt unverändert im Code stehen.
- Der Hinweistext im Fehlerkasten («Der Code steht auch als Zeichenfolge unter dem QR-Bild …») wird ersetzt durch einen Text ohne Erwähnung der Zeichenfolge; die alte Variante bleibt an denselben Schalter gebunden.
