# Etappe 2 (Konsum) — Produkt-Anpassungen

## 1. ProduktDetailDialog: Barometer vereinfachen
In `src/components/case-file/ProduktDetailDialog.tsx`:
- Entferne die Detail-Kategorien Regionalität, Saisonalität, Verpackung, Label & Standard (die `KAT_LABELS`-Liste mit vier Dots-Zeilen).
- Behalte den **Gesamt-Score** (Zahl /5, Label „Sehr nachhaltig" etc., grosse Dots-Anzeige).
- Behalte die Erklärung (`n.erklaerung`) unter dem Barometer.
- Der Durchschnittswert wird weiterhin aus den vier Feldern in `maya-data.ts` berechnet — keine Datenmodell-Änderung nötig.

## 2. GruenerMarkt: Label-Logos statt Text-Chips in den Kacheln
In `src/components/case-file/GruenerMarkt.tsx` (Komponente `ProduktKarte`):
- Ersetze die Text-Pills (`SIEGEL[key].label`) durch kleine Logo-Bilder (`SIEGEL[key].logoUrl`) — z. B. runde/quadratische Badges ~18–20px mit weissem Hintergrund und Border.
- Fallback auf Text, falls ein Siegel kein `logoUrl` hat.
- „Saison"-Pill bleibt als Text-Chip (kein Logo).
- Alt-Text = `SIEGEL[key].label` für Screenreader.

## Nicht verändert
- Datenmodell `maya-data.ts` (Nachhaltigkeits-Werte bleiben, werden nur nicht mehr einzeln gezeigt).
- Detail-Bereiche Bild, Labels-Sektion, Herkunft/Preis/Saison im Dialog.
- Spiellogik / Warenkorb-Prüfung.
