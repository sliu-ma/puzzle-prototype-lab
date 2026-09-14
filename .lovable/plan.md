# Biodiversitätsrätsel: Klarer machen, dass die Polaroids ausgeschnitten werden

## Problem
Die Notiz in Etappe 4 sagt nur «Trenne die gefährdeten von den nicht gefährdeten Arten». Die Spielenden wissen nicht, dass sie die Polaroids ausschneiden, sortieren und umdrehen müssen. Der Hauptpunkt «ausschneiden» fehlt.

## Änderungen (nur `src/routes/etappe-4.tsx`)

### 1. Notiz-Karte: Ausschneiden und Trennen als klarer Auftrag
Jakobs Zitat wird ersetzt durch eine direktere Formulierung in diese Richtung:
«Schneide die Polaroids aus und trenne die gefährdeten von den nicht gefährdeten Arten, um die Kiste zu öffnen. Die Gefährdeten erzählen eine Geschichte — drehe sie um und lies die Zahlen.»

Damit steht das Ausschneiden klar voran; welche Tiere gefährdet sind und welches Tier den Code trägt, bleibt ungesagt.

### 2. Hinweis 1 ergänzen
«Unsicher bei einem Tier? Suche kurz im Internet nach ‹Tiername Rote Liste Schweiz›.»
Hinweis 2 und Auflösung bleiben unverändert.

### 3. Stützzeile beim Zahlenschloss
«Die Zahlen stehen auf der Rückseite der Polaroids.»

## Bewusst unverändert
- Keine Lösung im Text.
- Code `123`, Ablauf, physische Polaroids und QR-Codes bleiben gleich.
- Keine Datenbank- oder Designänderungen.

Danach Typecheck und Build prüfen.
