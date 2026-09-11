# QR-Druck, Weganzeige und Ortsbeschreibungen

## Umsetzung

- Die QR-Druckansicht wird auf maximal sechs QR-Codes pro A4-Seite begrenzt. Jeder Code behält Postenname und Wegbuchstaben, die technische Zeichenfolge unter dem QR-Code entfällt.
- Auf der QR-Sperrseite der Gruppen wird nur noch der zugeteilte Buchstabe angezeigt. Stationsnummer und Gesamtzahl der Stationen werden nicht mehr verraten.
- Wege können nur in der Lobby zufällig verteilt oder pro Gruppe geändert werden. Nach dem Start sind Buchstaben und Verteilung nur noch lesbar. Später beitretende Gruppen erhalten weiterhin automatisch den aktuell am wenigsten belegten Weg.
- Beim Erstellen einer Runde kann für jede Station eine kurze Ortsbeschreibung erfasst werden, zum Beispiel „Haltestelle Bünteli“. Diese Angaben werden gespeichert und im Lehrerbereich einklappbar angezeigt, aber weder den Gruppen noch auf den QR-Ausdrucken gezeigt.

## Technische Details

- Neue JSON-Spalte für Stationsbeschreibungen bei Runden, inklusive Aktualisierung der bestehenden Rundenfunktionen für Erstellen, Auflisten, Status und Auswertung. Bestehende Runden erhalten leere Beschreibungen.
- Die Datenbankfunktionen für zufällige und manuelle Wegzuweisung prüfen zusätzlich, dass die Runde noch in der Lobby ist. Damit lässt sich die Sperre nicht nur über die Oberfläche umgehen.
- Das Verzweigungsdiagramm erhält im Bearbeitungsmodus Beschreibungsfelder pro Station und im Lehrerbereich eine einklappbare Ortsübersicht.
- Druckregeln verwenden feste Kartenhöhen und Seitenumbrüche nach jeweils sechs QR-Codes.
- Abschliessend werden Erstellung, Lobby-Zuteilung, Sperre nach dem Start, spätes Beitreten, Schüleransicht und mehrseitiger QR-Druck geprüft.
