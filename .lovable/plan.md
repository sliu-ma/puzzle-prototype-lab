## Problem

In `ImportabhaengigkeitChart` (Karte 3 im Energie-Karussell) werden Import (70 %) und Inland (30 %) als zwei separate Balken dargestellt. Da beide Anteile Teile derselben Gesamtmenge (100 %) sind, ist das visuell irreführend — zwei einzelne Balken suggerieren zwei getrennte Messgrössen.

## Lösung

Die zwei separaten Balken werden durch **einen einzigen gestapelten Balken (100 % Gesamtbreite)** ersetzt, in dem die Anteile Import und Inland nebeneinander liegen. So wird sofort ersichtlich, dass es sich um die Aufteilung einer einzigen Gesamtmenge handelt.

### Neue Darstellung

```text
Energiebedarf Schweiz · Herkunft

┌───────────────────────────────────┬──────────┐
│   Import 70 %  (rosé)             │ Inland 30% (grün) │
└───────────────────────────────────┴──────────┘

 [Ship] Import 70 %      [MapPin] Inland 30 %
```

- Ein einzelner Balken mit voller Breite, innen aufgeteilt in einen rosé Bereich (70 %) und einen grünen Bereich (30 %).
- Prozentzahlen wenn möglich direkt im Balken (bzw. bei sehr schmalem Segment darunter in der Legende).
- Darunter eine kompakte Legende mit den bestehenden Icons `Ship` (Import) und `MapPin` (Inland) samt Prozentwerten — analog zur Legendenzeile in `CO2VergleichChart`.

### Betroffene Datei

- `src/components/case-file/EnergietraegerCharts.tsx` — nur die Funktion `ImportabhaengigkeitChart` (Zeilen ~142–193). Werte (70 / 30), Titel und Icons bleiben unverändert; nur die visuelle Struktur wird von zwei Balken zu einem gestapelten Balken + Legende umgebaut.

Andere Karten (`CO2VergleichChart`, `AnteilErneuerbarChart`) und Etappe 5 selbst werden nicht angefasst.
