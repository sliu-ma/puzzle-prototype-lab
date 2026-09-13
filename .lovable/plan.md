# QR-Druckkarten wie die bestehende Vorlage und Orte nachträglich bearbeiten

## Ziel

Die gedruckten QR-Codes werden zu grossen Einsatzkarten im Stil der gezeigten Vorlage. Auf jeder A4-Seite stehen genau zwei Karten. Ortsbeschreibungen lassen sich nach dem Erstellen einer Runde weiterhin im Lehrerdashboard ergänzen oder ändern.

## QR-Druckkarten

- Das Drucklayout von sechs kleinen QR-Feldern auf zwei grosse Karten pro A4-Seite umstellen.
- Jede Karte übernimmt die klare Zweiteilung der Vorlage:
  - links Etappennummer und Etappenname, die Überschrift «Ihr habt das Siegel gefunden!» und ein kurzer Scan-Hinweis
  - rechts ein grosser QR-Code mit ausreichend weissem Rand
- Den vorhandenen Field-Notes-Look mit Papierfläche, Serifenschrift und feinen Linien beibehalten.
- Den zugehörigen Wegbuchstaben deutlich und in seiner bestehenden Farbe A bis D zeigen; bei einer gemeinsamen Station alle gültigen Buchstaben anzeigen.
- Den Code beziehungsweise Hash weiterhin nicht als Text abdrucken.
- Seitenumbrüche so festlegen, dass nie mehr als zwei vollständige Karten auf einer Seite erscheinen und keine Karte geteilt wird.
- Die Bildschirmvorschau an dasselbe Kartenformat annähern, während beim Drucken weiterhin ausschliesslich die Karten erscheinen.

## Ortsbeschreibungen nachträglich bearbeiten

- «Orte der Stationen» im Lehrerdashboard von der reinen Anzeige zu einem einklappbaren Bearbeitungsbereich machen.
- Für jede tatsächliche Station ein Feld mit Etappe und zugehörigem Weg oder zugehörigen Wegen anzeigen.
- Änderungen über einen klaren Speichern-Knopf sichern und Erfolg, laufendes Speichern sowie Fehler verständlich anzeigen.
- Ortsbeschreibungen auch nach dem Start und nach Abschluss einer Runde erlauben; Wege und Anzahl der Stationen bleiben nach dem Start weiterhin unveränderlich.
- Eingaben weiterhin auf 160 Zeichen begrenzen und vor dem Speichern passend zur bestehenden Stationsstruktur normalisieren.

## Technische Umsetzung

- `QRPrintList` erhält das neue Karten-Markup und die dynamischen Texte; die Druckregeln in `styles.css` werden auf zwei Karten je A4-Seite angepasst.
- `PathsPanel` verwaltet einen bearbeitbaren Entwurf der Ortsangaben und aktualisiert ihn nach erfolgreichem Speichern aus dem Rundenbericht.
- Eine validierte Serverfunktion ruft die Datenbankfunktion zum Speichern der Ortsangaben auf.
- Die derzeit nicht verfügbare Datenbankfunktion zum Ändern von `station_descriptions` wird als Migration wieder ergänzt, jedoch ohne die bisherige Lobby-Beschränkung. Passwortprüfung, Rundenzuordnung und 160-Zeichen-Limit bleiben erhalten.
- Keine Änderung an QR-Zeichenfolgen, Wegverteilung, Punkten oder sichtbaren Schülerseiten.

## Prüfung

- Druckvorschau mit mehr als zwei Codes kontrollieren: zwei Karten pro Seite, korrekte Seitenumbrüche, keine Dashboard-Inhalte und kein Hashtext.
- Karten für gemeinsame und getrennte Wege auf richtige Buchstaben und Farben prüfen.
- Ortsangaben in Lobby, laufender und abgeschlossener Runde speichern, neu laden und erneut kontrollieren.
- Mobile Lehrerdashboard-Ansicht sowie Projektprüfung und aktuellen Build-Status kontrollieren.
