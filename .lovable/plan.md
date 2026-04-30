# Wo ist Maya? — Prototyp v1 (Update)

Ein Bildungs-Escape-Room auf Deutsch für 13–16-Jährige. Kapitel 1 ist jetzt
ein interaktiver Online-Shop ("Grüner Markt"), inspiriert von der
Base44-Referenz `konsum.base44.app`.

## Story-Setup
Maya, junge Klimaaktivistin, ist verschwunden. Sie war einer Spur auf der Sicher,
die den Bau eines neuen Gaskraftwerks verhindern könnte: Einer der Investoren
betreibt eine Supermarktkette, die mit "regional & nachhaltig" wirbt — aber
ihre eigene Online-Plattform zeigt das Gegenteil.

## Ablauf in der Akte (`/akte`)
Schritt-für-Schritt-Stepper mit fünf Stationen:

1. **Sprachnachricht** — Mayas letzte Audio-Notiz an Lin.
2. **Rätselkarte** — Rezept "Erdbeer-Törtchen" + Auftrag.
3. **Grüner Markt** — interaktiver Shop mit Kategorien, Produktkarten, Warenkorb-Sidebar.
   - Startbestand enthält **2 problematische Produkte**:
     - Erdbeeren Bio (Spanien) → ersetzen durch Erdbeeren Region Thurgau (CH)
     - Eier Bodenhaltung Import → ersetzen durch Eier Bio-Freiland Schweiz
   - "Bezahlen" prüft: keine schlechten Produkte mehr im Korb + alle Rezeptzutaten abgedeckt.
   - Falsches Bezahlen zeigt konkrete Hinweise pro Problem.
4. **Fachlicher Input** — drei Lernkarten (Saisonal · Regional · Tiergerecht & Bio).
5. **Nächstes Rätsel (Teaser)** — Cliffhanger Kapitel 2 "Die Geldspur".

## Region & Sprache
Schweiz, CHF, Schweizer Siegel (Bio Suisse, IP-Suisse). Sprache: Deutsch.

## Tech
- TanStack Start, Routen `/` und `/akte`
- React-State (Stepper, Warenkorb), nichts persistent
- Komponenten: `PaperCard`, `Stamp`, `GruenerMarkt`, `ProduktKarte` (intern)
- Daten/Logik: `src/lib/maya-data.ts`

## Was bewusst NICHT in v1 ist
- Kein Login / keine DB
- Kein Audio (nur Transkript)
- Kein Mehrsprachigkeits-Toggle
- Kapitel 2+ nur als Teaser

## Mögliche nächste Schritte
- Audio-Sprachnachricht
- Kapitel 2: Geldspur / Investoren-Recherche
- Lehrkraft-Modus mit Fortschritt
