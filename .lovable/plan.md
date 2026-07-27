## Ziel
Wenn ein Frucht-/Gemüseprodukt aktuell ausserhalb seiner Saison ist, soll der Nachhaltigkeits-Barometer automatisch niedriger ausfallen — ohne die statischen Werte in `maya-data.ts` zu ändern.

## Änderungen

### 1. `src/lib/maya-data.ts`
- Neuer Helfer `getEffektiveNachhaltigkeit(p, date = new Date())`:
  - Kopiert `p.nachhaltigkeit`.
  - Wenn `getSaisonStatus(p) === "out"`: `saisonal = 1` (statt statischem Wert).
  - Sonst: unverändert.
  - Ergibt automatisch einen niedrigeren Durchschnitt, wenn ausserhalb Saison gekauft.
- Wird nur für Kategorie `fruechte-gemuese` sinnvoll; für alle anderen bleibt Ergebnis identisch, daher unkritisch.

### 2. `src/components/case-file/ProduktDetailDialog.tsx`
- Statt `produkt.nachhaltigkeit` → `getEffektiveNachhaltigkeit(produkt)` verwenden für Score-Berechnung und Anzeige.
- Wenn Produkt „out" ist: kurzer erklärender Hinweis unter dem Score, z. B. „Ausserhalb der Saison gekauft — Saisonalitäts-Wertung reduziert."

### 3. Keine weiteren Anpassungen
- Produkt-Kacheln zeigen keine Nachhaltigkeit → keine Änderung nötig.
- Rezept-/Warenkorb-Logik in `GruenerMarkt.tsx` bleibt unberührt.

## Effekt heute (Juli)
- Tomaten MA (out): saisonal 1→1 (bereits 1, kein sichtbarer Effekt — okay).
- Erdbeeren ES (out): saisonal 1→1 (unverändert).
- Erdbeeren CH (in): unverändert.
- Rosenkohl / Spargel / Rhabarber / Kürbis / Zwetschgen (out im Juli): saisonal von 5 → 1, Score sinkt spürbar.
- Zitronen / Äpfel (ganzjährig) und Nicht-Frucht/Gemüse: unverändert.
