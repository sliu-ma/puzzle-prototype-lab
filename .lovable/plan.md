## Food-Waste — Fokus auf finanziellen Vergleich

Die zwei bisherigen Kacheln (90 kg + >CHF 600.–) in `FoodWasteChart` werden durch **eine** Grafik ersetzt, die den finanziellen Verlust greifbar macht: **CHF 600.– / Jahr ≈ 1 Döner pro Woche**.

### Rechnung
- CHF 600.– ÷ 52 Wochen ≈ CHF 11.50 / Woche → etwa ein Döner
- Über ein Jahr: **~52 Döner**, die im Müll landen statt auf dem Teller

### Visuelles Konzept
Eine einzelne Karte im Papier/Stempel-Stil:

```text
┌──────────────────────────────────────────┐
│ FOOD-WASTE · FINANZIELLER VERGLEICH      │
│                                          │
│   CHF 600.–  =  🥙 × 52                  │
│                                          │
│   [Raster aus 52 Döner-Icons,            │
│    z. B. 13 Spalten × 4 Reihen]          │
│                                          │
│   ≈ 1 Döner pro Woche · ein ganzes Jahr  │
│   lang — im Wert der Lebensmittel, die   │
│   ein Haushalt jährlich wegwirft.        │
└──────────────────────────────────────────┘
```

- Links grosse Zahl **CHF 600.–**, Gleichheitszeichen, rechts **🥙 × 52** — sofort lesbar.
- Darunter ein Raster mit 52 kleinen Döner-Symbolen (lucide `Sandwich`-Icon im stamp-Farbton), damit die Menge visuell spürbar wird.
- Kurzer Untertitel in Monospace: „≈ 1 Döner pro Woche · ein ganzes Jahr lang".
- Kein zweites Panel, keine 90 kg-Kachel — der Fokus liegt allein auf dem Geldvergleich.

### Änderungen
- `FoodWasteChart` in `src/components/case-file/ConsumptionCharts.tsx` neu schreiben (Trash2/Banknote entfernen, `Sandwich` aus lucide-react verwenden).
- `src/routes/etappe-2.tsx`: Kartentext bleibt unverändert (90 kg + CHF 600.– stehen weiterhin im Fließtext); nur das Visual wechselt.

### Nicht im Scope
- Keine Änderung an anderen Karten, am Rätsel oder an den Produktdaten.
