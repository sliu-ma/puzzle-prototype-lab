## Ziel
Ungenutzte Assets und toten Code aus dem Projekt entfernen, ohne das Spielverhalten zu verändern.

## 1. Ungenutzte CDN-Assets löschen
Diese `.asset.json`-Pointer werden nirgends im Code referenziert. Löschung via `lovable-assets delete --file <pointer>` (entfernt CDN-Objekt + Pointer):

- Doppelte Wurzel-Dateien (Duplikate der Versionen unter `src/assets/produkte/`):
  - `kuerbis.webp.asset.json`
  - `rhabarber.webp.asset.json`
  - `rosenkohl.png.asset.json`
  - `spargel.webp.asset.json`
  - `zwetschge.jxl.asset.json` (alte JXL-Version, ersetzt durch `zwetschge.jpg`)
- Alte Energieetiketten-Buchstaben (nicht mehr verwendet):
  - `src/assets/label-a.png` … `label-g.png` (7 Dateien)
- `src/assets/produkte/orange.webp.asset.json`

## 2. Ungenutzte Binärdatei im Repo
- `src/assets/house-bg.jpg` (1,5 MB) wird nirgends importiert → löschen.
- `src/assets/coin.png` und `src/assets/trophy.png` werden in `EnergyGame.tsx` verwendet, bleiben. Optional könnten sie zusätzlich auf das CDN ausgelagert werden (spart ~180 KB im Repo) – sage Bescheid, wenn gewünscht.

## 3. Toter Code
- `src/components/case-file/EvidenceModal.tsx` wird von keiner Datei importiert → löschen.

## 4. Ungenutzte UI-Bibliothek (optional, größter Effekt)
Von 46 shadcn-Komponenten unter `src/components/ui/` wird nur `dialog.tsx` (plus dessen interne Abhängigkeiten) genutzt. Die übrigen 45 Dateien sind ungenutzt. Sie landen zwar nicht im Build-Output (Tree-Shaking), machen die Codebasis aber unübersichtlich.

Vorschlag: entfernen, aber nur nach deiner Bestätigung – falls du später Komponenten wie Button/Card verwenden willst, kann man sie jederzeit wieder hinzufügen.

## 5. Verifikation
- `bun run build` muss fehlerfrei durchlaufen.
- Kurzer Preview-Check der Etappen 2 (Produktbilder), 4 (Energie-Spiel) und Finale (Badges).

## Technische Details
Prüfung erfolgte per Referenz-Scan über `src/`, `public/` und `index.html` auf jeden Asset-Basenamen; Assets mit null Treffern gelten als ungenutzt. Assets, die nur in ihrer eigenen Pointer-Datei vorkommen, sind entsprechend nicht referenziert.
