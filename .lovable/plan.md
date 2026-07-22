Ergänze die beiden Karten im Fachlichen Input von Etappe 4 mit einer passenden Grafik – analog zum Stil der bestehenden Charts (Mobilität, Konsum, Biodiversität).

## Karte 2 · „Kleine Veränderungen, grosse Wirkung"
Neue Grafik `AlltagsTippsGrid` mit drei Zeilen (jeweils Icon + Aktion + eingesparte Energie/Wirkung als kleiner Balken):
- Wäsche aufhängen statt trocknen (Icon: Shirt / Wind)
- Mit Deckel kochen (Icon: CookingPot)
- Wohnraum max. 20 °C heizen (Icon: Thermometer)

Layout: gestempelte Karte im „Paper-Deep"-Stil, Icons in kleinen Rahmen, jede Zeile mit kurzem Erspar-Hinweis (z. B. „bis –70 %", „bis –30 %", „–6 % pro °C"). Passt zur bestehenden Ästhetik der anderen Input-Cards.

## Karte 3 · „Energie sparen bedeutet Geld sparen"
Neue Grafik `SparPotenzialChart`: visueller Vergleich zweier Haushalte als Stapel/Balken.
- Balken „Ohne Massnahmen": z. B. CHF 2 400.– /Jahr Energiekosten
- Balken „Mit einfachen Massnahmen": z. B. CHF 1 800.– /Jahr
- Deutlich hervorgehobene Differenz „−CHF 600.– /Jahr" mit Franken-Icon

Layout: zwei horizontale Balken übereinander, farblich abgesetzt (Warm vs. Sparen), darunter Highlight-Zeile mit Ersparnis. Rahmen und Typografie wie in `MobilityCharts`/`ConsumptionCharts`.

## Umsetzung (technisch)
- Neue Datei `src/components/case-file/WohnenCharts.tsx` mit den Exports `AlltagsTippsGrid` und `SparPotenzialChart`.
- Nutzung nur `lucide-react`-Icons und Tailwind-Utility-Klassen mit Design-Tokens (`stamp`, `paper-deep`, `border`) – keine neuen Assets/Bilder.
- In `src/routes/etappe-4.tsx` beide Karten im `InputCarousel` um `visual: <AlltagsTippsGrid />` bzw. `visual: <SparPotenzialChart />` erweitern.
- Keine Änderung an Texten, Logik oder anderen Etappen.
