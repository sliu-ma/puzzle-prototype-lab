## Ziel

Etappe 2 „Grüner Markt" bereinigen: pro Sorte nur ein Produkt, echte Saisons (inkl. Herkunftsland) und Saison-Badge nur noch im Produkt-Dialog.

## Änderungen

### 1. Duplikate entfernen (`src/lib/maya-data.ts`)
- `spargel-pe` (Peru) löschen — nur `spargel-ch` bleibt.
- `zwetschge-de` (Deutschland) löschen — nur `zwetschge-ch` bleibt.

### 2. Saisons dynamisch und korrekt setzen (`src/lib/maya-data.ts`)
Aktuell ist `saison: "in" | "out" | "ganzjahr"` fix codiert — dadurch ist z. B. Kürbis auch im Juli „in Saison". Umstellen auf datumsabhängige Berechnung:

- Neues optionales Feld `saisonMonate?: number[]` (1-basierte Monate) pro Frucht/Gemüse — bezieht sich auf die Saison **im Herkunftsland**.
- Helfer `getSaisonStatus(p, date = new Date())` liefert `"in" | "out" | "ganzjahr"` (leer/undefined = `"ganzjahr"`).
- `saison` bleibt als abgeleitetes Feld verfügbar, damit `ProduktDetailDialog` unverändert funktioniert.

Vorgesehene Saisons:

| Produkt | Monate |
|---|---|
| Erdbeeren CH | 5–9 |
| Erdbeeren ES | 12, 1, 2, 3, 4, 5, 6 |
| Zitrone IT | ganzjährig |
| Zitrone ZA | ganzjährig |
| Äpfel CH (Lagerware) | ganzjährig |
| Tomaten MA | 9, 10, 11, 12, 1, 2, 3, 4, 5, 6 |
| Gurke CH | 6–9 |
| Rosenkohl CH | 10, 11, 12, 1, 2 |
| Spargel CH | 4–6 |
| Rhabarber CH | 4–6 |
| Kürbis CH | 8–11 |
| Zwetschgen CH | 8–10 |

Bei aktuellem Datum (Juli) sind damit „in Saison": Erdbeeren CH, Gurke CH. Tomaten MA, Erdbeeren ES und die restlichen saisonalen Produkte sind „out".

### 3. Saison-Badge in Produkt-Kacheln entfernen (`src/components/case-file/GruenerMarkt.tsx`)
- Grünen „Saison"-Chip in `ProduktKarte` (um Zeile 391–395) löschen.
- Saison-Zeile im `ProduktDetailDialog` bleibt und zeigt tagesaktuell „In Saison" / „Ausserhalb Saison" / „Ganzjährig".
