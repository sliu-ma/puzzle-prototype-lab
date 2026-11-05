# Markt-Kacheln: keine dunkle Umrandung, Mengenzeile mit Grundpreis

## 1. Keine dunkle Umrandung
Liegt ein Produkt im Korb, bekommt die Kachel keinen dunklen Rand mehr. Sie sieht gleich aus wie alle anderen; nur das Korb-Icon oben rechts zeigt (dunkel mit Häkchen), dass es im Korb ist.

## 2. Masseinheiten aus dem Titel, neue Mengenzeile
Titel ohne Gewicht/Volumen/Stückzahl, z. B.:
- «Zwetschgen 1kg» → «Zwetschgen»
- «Eier 4er Freiland» → «Eier Freiland»
- «Valflora Vollmilch 1L · PAST» → «Valflora Vollmilch · PAST»
- «Vanillezucker 10×8g» → «Vanillezucker»

Neue kleine Zeile unter dem Preis (grauer Text), Migros-Stil:

```text
CHF 4.50
1 kg · CHF 4.50/kg
Zwetschgen
[Labels]
```

Beispiele:
- Erdbeeren: «500 g · CHF x.xx/kg»
- Eier: «4 Stück · CHF x.xx/Stück»
- Vollrahm: «2.5 dl · CHF x.xx/l»
- Zitrone, Gurke, Kürbis: «1 Stück»
- Zimt, Vanillezucker: «35 g · CHF x.xx/100 g» (kleine Mengen pro 100 g, sonst unlesbar)

Die Zeile erscheint auch im Produkt-Pop-up und im Warenkorb.

**Fehlende Angaben:** Bei Joghurt, Backpulver und Mandeln steht heute keine Menge im Namen. Ich setze übliche Packungsgrössen ein (Joghurt 180 g, Backpulver 5×17 g, Mandeln 200 g) und markiere sie dir zur Kontrolle.

## Technisch
- `maya-data.ts`: pro Produkt neues Feld `menge: { wert, einheit: "g"|"kg"|"ml"|"dl"|"l"|"Stück" }`, Namen bereinigt.
- Hilfsfunktion `grundpreis(produkt)` in `src/lib` (rechnet auf kg/l/Stück bzw. 100 g bei < 100 g), mit kleinem Vitest für Umrechnung.
- `GruenerMarkt.tsx`: `ring`/`border-ink` bei `imKorb` entfernen; Mengenzeile in Kachel und Warenkorb. `ProduktDetailDialog.tsx`: Mengenzeile.
- Spiellogik (Zutatenprüfung) nutzt `zutat`/`id`, nicht den Namen, bleibt also unverändert; wird kurz geprüft.
