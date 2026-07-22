## Ziel
Faktenkarte "Konsum" (Etappe 2, Step "input") mit drei neuen Karten überarbeiten. Nur visuelle/inhaltliche Anpassung der Lernkarten — Rätsel, Rezept, Produktdaten bleiben unverändert.

## Karten (ersetzen die aktuellen drei Karten in `src/routes/etappe-2.tsx`)

**Karte 1 · Regional & saisonal einkaufen**
- Text: „Regionale und saisonale Lebensmittel haben kürzere Transportwege und kürzere Lagerzeiten als importierte Ware. Im [Jahreszeit] sind zum Beispiel folgende Lebensmittel saisonal: [Beispiele]."
- Jahreszeit dynamisch nach aktuellem Datum (Winter Dez–Feb, Frühling Mär–Mai, Sommer Jun–Aug, Herbst Sep–Nov).
- Visual: zwei kleine Produktbilder nebeneinander (Bildunterschriften darunter), passend zur Saison:
  - Winter → Rosenkohl, Orange
  - Frühling → Spargel, Rhabarber
  - Sommer → Erdbeere (CH), Gurke (CH)
  - Herbst → Kürbis, Zwetschge

**Karte 2 · Food-Waste vermeiden**
- Text: „Pro Person werden in der Schweiz jährlich rund 90 kg Lebensmittel weggeworfen — weil zu viel eingekauft wird oder das Haltbarkeitsdatum abläuft. Im Schnitt wirft jeder Schweizer Haushalt somit Lebensmittel im Wert von über CHF 600.– weg."
- Visual (neue Komponente `FoodWasteChart` in `src/components/case-file/ConsumptionCharts.tsx`): SVG-Grafik mit zwei nebeneinander stehenden Balken/Kacheln:
  - „90 kg pro Person / Jahr" (grosse Zahl, Icon `Trash2`)
  - „> CHF 600.– pro Haushalt" (grosse Zahl, Icon `Banknote`)
  - Papier-Stil (border-stamp/40, bg-paper-deep/30), stimmig mit `MobilityCharts.tsx`.

**Karte 3 · Auf die Verpackung achten**
- Text: „Labels auf Verpackungen zeigen besondere Eigenschaften eines Produkts — zum Beispiel gute Qualität, faire Herstellung oder Umweltschutz. Auf der Plattform labelinfo.ch findest du die wichtigsten Informationen zu allen Labels."
- Visual: drei Label-Logos in einer Reihe mit je einer Ein-Zeilen-Erklärung darunter:
  - **Suisse Garantie** — „Rohstoffe und Verarbeitung zu 100 % aus der Schweiz."
  - **IP-Suisse** — „Schweizer Landwirtschaft mit erhöhten Anforderungen an Umwelt und Tierwohl (Marienkäfer-Standard)."
  - **Bio** — „Anbau ohne synthetische Pestizide und Kunstdünger, artgerechte Tierhaltung."
- Logos aus bestehenden Assets (`suisse-garantie`, `ip-suisse`, `bio`) via `SIEGEL` aus `@/lib/maya-data`.

## Assets (neu, aus User-Uploads → Lovable Assets)
- `src/assets/produkte/orange.webp.asset.json`
- `src/assets/produkte/rosenkohl.png.asset.json`
- `src/assets/produkte/spargel.webp.asset.json`
- `src/assets/produkte/rhabarber.webp.asset.json`
- `src/assets/produkte/kuerbis.webp.asset.json`
- `src/assets/produkte/zwetschge.png.asset.json` (aus `zwetschge.png.jxl`, `--filename zwetschge.jxl`)
- Erdbeere Sommer: bestehendes `erdbeeren-ch.webp` wiederverwenden (statt hochgeladenes `erdbeere.png.avif`, das nur eine Referenz ist)
- Gurke Sommer: bestehendes `gurke-ch.webp` wiederverwenden
- Keine Änderungen an bestehenden Produkt-Assets.

## Neue/geänderte Dateien
- **Neu** `src/components/case-file/ConsumptionCharts.tsx`: exportiert `SaisonProdukte` (aktuelle Saison + zwei Bilder) und `FoodWasteChart`.
- **Bearbeitet** `src/routes/etappe-2.tsx`: `cards={[...]}` an `InputCarousel` neu befüllen, `title` z. B. „Nachhaltig einkaufen — worauf es ankommt", `intro` leicht anpassen; `visual`-Props setzen.
- **Bearbeitet** `src/lib/maya-data.ts` nicht nötig (Rätseldaten unverändert).

## Nicht im Scope
- Kein Umbau von `InputCarousel` (unterstützt `visual` bereits).
- Keine Änderungen an Rätsel/Hints/Timer.
- Keine automatische Auswahl anderer Saison-Beispiele als der spezifizierten Paare.