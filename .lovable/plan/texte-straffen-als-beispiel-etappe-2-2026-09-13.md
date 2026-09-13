# Texte straffen als Beispiel: Etappe 2

Prinzip: Story-Atmosphäre bleibt erhalten (Frau Berger, Jakobs Zitat, der leere Korb), aber Sätze kürzer, Füllwörter weg, keine Wiederholung des Ortsnamens im Fliesstext (steht ohnehin im Kopftext der Karte).

## Beispiel Etappe 2 — Notiz-Karte «Brief»

**Heute (ca. 360 Zeichen, 2 Absätze):**

> Der Dorfladen ist eigentlich geschlossen, doch Jakobs Freundin Frau Berger lässt dich hinein. „Dein Grossvater war jede Woche hier. Er sagte: Wenn ich sehe, was die Leute kaufen, weiss ich, was schiefläuft."
>
> Frau Berger betrachtet Jakobs Einkaufsliste und stellt einen leeren Korb auf den Tresen. „Alles ist da. Aber welche Zutaten du wählst, musst du selbst entscheiden. Jakob hätte es gewusst."

**Neu (ca. 210 Zeichen, 1 Absatz + 1 Zeile):**

> Der Dorfladen ist geschlossen, doch Jakobs Freundin Frau Berger lässt dich ein. „Dein Grossvater war jede Woche hier. Wenn ich sehe, was die Leute kaufen, weiss ich, was schiefläuft."
>
> Sie stellt einen leeren Korb auf den Tresen. „Alles ist da. Welche Zutaten du wählst, musst du selbst entscheiden."

Gestrichen: «eigentlich», «hinein»→«ein», «Er sagte:» (Zitat direkt), «Frau Berger betrachtet Jakobs Einkaufsliste und», «Aber», «Jakob hätte es gewusst.» — die letzte Zeile wiederholt den Auftrag, der auf der nächsten Karte (Einkaufskorb) sowieso klar wird.

## Was nach Freigabe passiert

1. Nur `src/routes/etappe-2.tsx` wird an dieser einen Blockquote geändert (Datei `step === "brief"`).
2. Du siehst das Ergebnis in der Vorschau und entscheidest:
   - **Übernehmen für die anderen Etappen** → ich straffe Etappe 1, 3, 4, 5 und die Fach-Input-Texte nach demselben Muster.
   - **Anpassen** → ich ändere den Ton (mehr/weniger Story) bevor es weitergeht.

Keine Mechanismus-Änderungen (keine Lese-Gates, keine fetten Schlüsselwörter) in diesem Schritt — nur Textkürzung, damit du den Effekt isoliert beurteilen kannst.

## Technisches

- Einzige Datei: `src/routes/etappe-2.tsx`, Blockquote im `step === "brief"`-Block (ca. Zeile 221–225).
- Keine Änderung an Ablauf, Schritten, Rätsellogik, Punkten oder Komponenten.
- Typecheck/Build nach der Änderung.
