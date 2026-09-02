# Etappe 2: Saisonales Rezept + neue Produkte

## Neue Produkte im Dorfladen

| Produkt | Menge/Preis | Herkunft | Label |
| --- | --- | --- | --- |
| Zimt gemahlen (Bio) | 35 g / CHF 1.60 | Sri Lanka | Bio + Fairtrade |
| Zimt gemahlen (M-Classic) | 32 g / CHF 0.45 | Madagaskar | kein Label |
| Zwetschgen (Bio) | CHF 4.95 | Schweiz | Bio |
| Äpfel Pink Lady | CHF 4.80 | Frankreich | kein Label |

Anpassungen an bestehenden Produkten:
- Bestehende Zwetschgen werden zur Auslandvariante (Import, kein Label, schlechtere Bewertung); die neuen Schweizer Bio-Zwetschgen sind die gute Wahl.
- Zwetschgen-Saison endet Ende September (August–September, nicht mehr Oktober) – auch in der Saison-Lernkarte des fachlichen Inputs.
- Schweizer Äpfel bleiben die gute Wahl gegenüber Pink Lady aus Frankreich.
- Neues Label „Fairtrade / Max Havelaar" wird ergänzt (Logo aus dem Upload) und erscheint auf Produktkarten und im Produkt-Popup.

## Saisonales Rezept

Das Rezept wechselt automatisch nach Monat:

```text
Mai – August      Erdbeer-Törtchen  (Frucht: Erdbeeren CH vs. Erdbeeren Spanien)
September         Zwetschgen-Wähe   (Frucht: Zwetschgen CH Bio vs. Zwetschgen Import)
Oktober – April   Apfel-Wähe        (Frucht: Äpfel CH vs. Pink Lady Frankreich)
```

Wähe-Zutatenliste (Blech 28 cm Ø), wie vom Auftrag vorgegeben:
200 g Mehl · ½ KL Salz · 70 g kalte Butter · 3 EL gemahlene Nüsse (bestehende gemahlene Mandeln) · 700 g Früchte · 1 dl Rahm · 1 Ei · 1 EL Vanillezucker · 1 EL Zucker · ½ KL Zimt

Auswahl-Paare in der Wähe: Frucht (2 Optionen), Ei (2 Optionen), Zimt (2 Optionen). Mehl, Salz, Butter, Nüsse, Rahm, Vanillezucker und Zucker haben je nur eine Option. Die Zitrone gehört nur zum Törtchen-Rezept.

Die Kasse springt an, wenn alle Zutaten des aktuellen Rezepts im Korb liegen und keine schlechte Wahl dabei ist (wie bisher, ohne Fehlerhinweis).

## Hinweise (Tippsystem)

Hinweis 2 und die Auflösung in Etappe 2 werden rezeptabhängig formuliert, damit sie zum aktuell gültigen Rezept passen (z. B. Zimt Bio/Fairtrade aus Sri Lanka statt billiger Madagaskar-Zimt, Schweizer Bio-Zwetschgen statt Import).

## Technische Umsetzung

- `src/lib/maya-data.ts`: `SiegelKey` um `fairtrade` erweitert; `zutat`-Typ um `zimt`, `nuesse`, `frucht` erweitert; vier neue Produkte; Zwetschgen-Import umgestellt; statt der festen `REZEPT`/`REZEPT_ZUTATEN_KEYS`-Konstanten eine Funktion `getAktuellesRezept(date)`, die Titel, Zutatentext, benötigte Zutaten-Keys und die gültigen Frucht-Produkte pro Monat liefert. Bestehende Exports bleiben als Wrapper erhalten, damit nichts bricht.
- Assets: die vier Produktbilder und das Fairtrade-Logo werden als Lovable-Asset-Pointer in `src/assets/produkte/` bzw. `src/assets/labels/` angelegt.
- `src/components/case-file/GruenerMarkt.tsx`: Rezeptanzeige und Prüf-Logik nutzen das aktuelle Rezept; nur Produkte mit passender `zutat` für das aktive Rezept werden als Pflicht gewertet.
- `src/components/case-file/ConsumptionCharts.tsx`: Zwetschgen-Saison auf August–September.
- `src/routes/etappe-2.tsx`: Hinweistexte rezeptabhängig.
