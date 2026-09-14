# Biodiversitätsrätsel: klarere Anleitung, ohne die Lösung zu verraten

## Problem
Die Notiz in Etappe 4 sagt nur «Trenne die gefährdeten von den nicht gefährdeten Arten». Nirgends steht, dass die Polaroids ausgeschnitten, sortiert und umgedreht werden müssen und dass der Code auf der Rückseite eines Tieres steckt. Die Spielenden wissen nicht, was sie physisch tun sollen.

## Änderungen (nur `src/routes/etappe-4.tsx`)

### 1. Auftrag als nummerierte Checkliste in der Notiz-Karte
Unter Jakobs Zitat eine kurze Anleitung im Stempel-Look:
1. Schneide die acht Polaroids aus.
2. Sortiere sie in zwei Stapel: gefährdet / nicht gefährdet (unsicher? recherchiere kurz im Internet).
3. Drehe die gefährdeten Tiere um und suche die Zahlen.
4. Gib die drei Zahlen am Schloss von klein nach gross ein.

Damit ist der Weg klar, aber weder welche Tiere gefährdet sind noch welches Tier den Code trägt, wird verraten.

### 2. Hinweis 1 und 2 leicht schärfen
- Hinweis 1 ergänzen: «Unsicher bei einem Tier? Suche kurz im Internet nach ‹Tiername Rote Liste Schweiz›.»
- Hinweis 2 klarer: «Die Zahlen stehen auf der Rückseite eines der gefährdeten Tiere.»
- Auflösung (9 Min) bleibt unverändert.

### 3. Eine Stützzeile beim Zahlenschloss
Beim Code-Schritt eine kleine Zeile ergänzen: «Die Zahlen findest du auf der Rückseite der Polaroids.»

## Bewusst unverändert
- Keine Lösung im Text (welche Tiere gefährdet sind, welches Tier den Code trägt, bleibt geheim).
- Code `123`, Ablauf, physische Polaroids und QR-Codes bleiben gleich.
- Keine Datenbank- oder Designänderungen.

Danach Typecheck und Build prüfen.
