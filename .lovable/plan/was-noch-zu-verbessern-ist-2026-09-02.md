# Was noch zu verbessern ist

Nach Durchsicht des Codes: das Spiel ist inhaltlich fertig, die offenen Punkte betreffen vor allem **Verlässlichkeit im echten Einsatz mit einer Klasse**. Sortiert nach Nutzen.

## 1. Punkte gehen im Funkloch verloren (wichtigster Punkt)

Geprüft in `src/lib/round-client.ts`: Ereignisse werden nur dann zum Server geschickt, wenn ein **neues** Ereignis entsteht. Scheitert die Übertragung (Zug, Riet, Keller), passiert nichts weiter — beim letzten Ereignis einer Gruppe (Hearing-Antwort vor dem Abschluss) bleibt es dauerhaft liegen. Zusätzlich werden nur die letzten 200 Ereignisse gesendet (`round-client.ts:113`), ältere unübertragene fallen raus.

**Korrektur:** Wiederholversuch mit wachsendem Abstand, automatischer Nachversand bei Wiederverbindung (`online`-Ereignis) und beim Verlassen der Seite; Grenze auf die serverseitig erlaubten 400 anheben. Kleines Symbol im Kopf, wenn Punkte noch nicht übertragen sind.

## 2. Gruppe verliert die Anmeldung, wenn iOS den Tab schliesst

Die Wartezimmer-Zuordnung liegt in `sessionStorage` (`round-client.ts:34-62`). Kommt der Tab zurück, ist sie weg, die Gruppe meldet sich neu an — die Lehrperson sieht ein Geisterteam.

**Korrektur:** Zuordnung dauerhaft speichern (unter einem Schlüssel, den das Zurücksetzen nicht löscht), erneuter Aufruf führt zurück ins Wartezimmer.

## 3. Weisser Bildschirm bei einem Fehler

`src/routes/__root.tsx` hat eine „Seite nicht gefunden"-Ansicht, aber **keine Fehleransicht**. Ein Absturz in einem Rätsel zeigt der Gruppe nichts als Weiss — mitten in der Lektion ohne Support.

**Korrektur:** Fehleransicht im Papier-Look mit „Nochmals versuchen" und „Zur Übersicht"; der Spielstand bleibt erhalten, weil er lokal liegt.

## 4. Lehrperson merkt nicht, wenn das Dashboard veraltet ist

`LiveBoard.tsx` fragt alle 8 Sekunden ab; bei anhaltendem Fehler zeigt es einfach weiter alte Zahlen.

**Korrektur:** Sichtbarer Hinweis „keine Verbindung, Stand von HH:MM" statt stiller Alterung.

## 5. Kleinere Feinheiten

- `<html lang="en">` (`__root.tsx:76`) obwohl alles Deutsch ist — Screenreader lesen falsch vor.
- Kein Vorschaubild für geteilte Links (`og:image` fehlt überall). Relevant, weil der Beitritts-Link im Klassenchat landet.
- „Wirklich neu starten?" nutzt das Browser-`confirm()` (`index.tsx:174`) — auf dem Handy stilfremd; das vorhandene Dialog-Bauteil passt besser.
- Das Menü auf der Startseite (`index.tsx:320`) schliesst nicht bei Tippen daneben oder mit Escape.
- Der QR-Scanner zeigt bei Problemen technische Diagnosedaten direkt den Jugendlichen (`QRGate.tsx:392`) — besser einklappen.

## Vorschlag

Punkte 1–3 zusammen umsetzen, das ist der Unterschied zwischen „läuft" und „läuft auch, wenn etwas schiefgeht". 4 und 5 danach.

Sag, welche Punkte ich anpacken soll — oder „alles", dann arbeite ich die Liste von oben nach unten durch.
