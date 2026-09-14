# Biodiversitätsrätsel: Klarer machen, dass die Polaroids ausgeschnitten werden

## Problem
Die Notiz in Etappe 4 sagt nur «Trenne die gefährdeten von den nicht gefährdeten Arten». Die Spielenden wissen nicht, dass sie die Polaroids ausschneiden, sortieren und umdrehen müssen. Der Hauptpunkt «ausschneiden» fehlt.

## Änderungen (nur `src/routes/etappe-4.tsx`)

### 1. Notiz-Karte: Ausschneiden als klaren Auftrag
Jakobs Zitat bleibt. Direkt darunter ein kurzer, gestempelter Hinweis im Fokus:
«Schneide die acht Polaroids aus. Sortiere sie: gefährdet / nicht gefährdet. Drehe die gefährdeten um und lies die Zahlen.»

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
