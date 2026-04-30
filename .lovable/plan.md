
# Wo ist Maya? — Prototyp v1

Ein Bildungs-Escape-Room auf Deutsch für 13- bis 16-Jährige. Aus deinem Mockup wird ein interaktiver Prototyp: Cover-Screen + ein voll spielbares Kapitel rund um nachhaltigen Konsum (regional, saisonal, fair).

## Story-Setup

Maya, eine junge Klimaaktivistin, ist verschwunden. Sie war einer Spur auf der Sicher: Belege, die den Bau eines neuen **Gaskraftwerks** verhindern könnten. Du übernimmst ihre Akte und arbeitest dich durch ihre Notizen, Belege und Recherchen. Kapitel 1 spielt im Supermarkt — Maya hat dort etwas entdeckt, das mit einem der Investoren des Kraftwerks zu tun hat.

## Aufbau des Prototyps

**Screen 1 — Cover / Aktenmappe**
- Field-Notes-Ästhetik aus deinem Mockup (cremefarbenes Papier, Stempel "AKTE", leicht schräge Karte, Schreibmaschinen-Akzente)
- Titel "Wo ist Maya?" mit Untertitel
- Kurzer Einstiegstext: Wer ist Maya? Was ist passiert?
- Button: **Akte öffnen →**

**Screen 2 — Ermittlertafel (Kapitel 1: Der Einkaufszettel)**
Eine "Pinnwand" mit mehreren Beweisstücken, alle anklickbar:

1. **Mayas letzte Sprachnachricht** (Text-Transkript) — Hinweis darauf, im Supermarkt gewesen zu sein
2. **Der Kassenbon** — zeigt Produkte, Herkunftsländer, Saison, Siegel
3. **Notizzettel mit Fragen** — Mayas Aufgaben für sich selbst
4. **Steckbrief regionaler/saisonaler Produkte** — Lerninhalt als "Recherche-Material"
5. **Verschlossener Umschlag** mit 4-stelligem Zahlenschloss → führt zu Kapitel 2 (Teaser)

Hybrid-Logik: Beweise 1–4 sofort einsehbar. Der Umschlag (5) öffnet sich erst, wenn der richtige Code eingegeben wird.

**Die Rätsel-Logik (eine Schleife, mehrere Lerninhalte)**

Aus dem Kassenbon und Steckbrief muss die Spielerin vier Zahlen herleiten:
- Ziffer 1: Anzahl der Produkte auf dem Bon, die **nicht** in der aktuellen Saison sind
- Ziffer 2: Anzahl der Produkte mit Herkunft **außerhalb Europas**
- Ziffer 3: Anzahl der Produkte **ohne** Bio-/Fairtrade-Siegel
- Ziffer 4: Anzahl der wirklich **regionalen** Produkte

Beispiel-Code: `3 — 2 — 4 — 1`. Die Eingabe geschieht über vier Drehräder oder Eingabefelder im Stil eines alten Zahlenschlosses.

**Feedback & Lernen**
- Falscher Code: kurzer Hinweis ("Schau dir den Bon noch einmal genau an…")
- Bei jedem Beweisstück gibt es kleine "Maya-Randnotizen", die das Lernziel (regional/saisonal/fair) erklären
- Bei richtigem Code: Umschlag öffnet sich, kurzer Cliffhanger-Text + "Kapitel 2 folgt bald" Karte

## Look & Feel

- Farbpalette aus deinem Mockup: Pergament-Creme `#faf9f5`, Tinte `#1c1810`, Stempelrot `#8a1f1f`, gedämpftes Beige `#f1e7d2`
- Typografie: Serif (Georgia/Lora) für Überschriften, Schreibmaschine (Courier/Special Elite) für Stempel und Codes, klare Sans für Fließtext
- Beweise wirken wie aufgeklebte Papierschnipsel — leichte Drehung, Schlagschatten, "Tape"-Akzente
- Sanfte Animation beim Aufdecken (leichtes Aufklappen / Hover-Hervorhebung)
- Mobile- und Desktop-tauglich; Pinnwand wird auf kleinen Screens vertikal gestapelt

## Was bewusst NICHT in v1 ist

- Kein Login / kein Konto / keine Datenbank — der Prototyp läuft komplett im Browser
- Keine Audio-Sprachnachricht (nur Transkript)
- Kein Mehrsprachigkeits-Toggle
- Kapitel 2+ nur als Teaser, nicht spielbar
- Kein Lehrkraft-Dashboard / keine Auswertung — kommt in einer späteren Version

## Technische Umsetzung

- TanStack Start, zwei Routen: `/` (Cover) und `/akte` (Ermittlertafel)
- State (welche Beweise geöffnet, Code-Eingabe) in React-Hooks, nichts persistent
- Alles statisch, keine Backend-Funktionen nötig
- Komponenten: `EvidenceCard`, `EvidenceModal`, `CodeLock`, `Stamp`, `PaperTape`

## Mögliche nächste Schritte (nach v1)

- Kapitel 2: Geldspur / Investoren-Recherche
- Kapitel 3: Energiequellen-Vergleich, finaler Code rettet Maya
- Audio-Sprachnachrichten, Timer-Modus, Klassenraum-Modus mit Code-Sharing
