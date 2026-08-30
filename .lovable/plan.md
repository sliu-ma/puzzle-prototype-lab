# Mobilitätsposten auf Widnau umstellen

Etappe 1 spielt neu in Widnau (Bahnhof Heerbrugg als Ankunftsort). Die drei Routen erhalten die neuen Verbindungen, die Karte neue Halte und Koordinaten, und alle Texte mit "Speicher" werden ersetzt.

## Neue Verbindungen

Zug (nachhaltigste Route)
- Genève ab 07:35, Gl. 4, IC 1 → Halte wie bisher bis Zürich HB, an 10:28, Gl. 33
- Umsteigen in Zürich (10 Min.)
- Zürich HB ab 10:38, Gl. 13, IC 3 → Sargans an 11:32, Gl. 13
- Umsteigen in Sargans (3 Min.)
- Sargans ab 11:35, Gl. 6, IR 13 → Buchs SG, Altstätten SG → Heerbrugg an 12:06, Gl. 1
- Gesamt: 4h 31min

Zug + Flug + Zug
- Genève → Genève-Aéroport, Flug GVA → ZRH wie bisher
- Zürich Flughafen ab 11:23, Gl. 1, IR 13 → Winterthur, Wil SG, Uzwil, Flawil, Gossau SG, St. Gallen, Rorschach, St. Margrethen SG → Heerbrugg an 12:53, Gl. 1
- Gesamt: 4h 19min

Auto
- Ziel: Gässelistrasse 2, 9443 Widnau, via A1 Lausanne – Bern – Zürich – St. Gallen – Widnau
- Distanz/Dauer/Preis werden auf die längere Strecke angepasst (ca. 400 km, ca. 4h 25min, ca. CHF 295, CO₂ ca. 100 kg)

## Karte und Koordinaten

Neue Halte mit den gelieferten Koordinaten: Sargans, Buchs SG, Altstätten SG, Heerbrugg, Rorschach, St. Margrethen SG. Die alte S21-Strecke St. Gallen → Speicher entfällt vollständig; der letzte Kartenpunkt ist Heerbrugg, plus ein Zielpunkt Widnau (Gässelistrasse) für die Autoroute.

Annahme: Widnau/Gässelistrasse 2 wird mit ca. 47.4053, 9.6386 gesetzt (aus der Adresse abgeleitet). Falls du exakte Koordinaten hast, setze ich sie ein.

## Zielort-Eingabe

Die Zielprüfung akzeptiert neu sowohl "Widnau" als auch "Heerbrugg" (inkl. Varianten wie "Widnau SG", "Bahnhof Heerbrugg", "Heerbrugg SG").

## Textliche Anpassungen

- Etappe 1: Seitentitel, QR-Gate-Text, Notizkopf ("Bahnhof Heerbrugg"), Routenzeile "Genf › Widnau", Auflösungstext im Hinweis 3 (IC 1 → IC 3 → IR 13)
- Routendetail-Kopf: "Genève › Heerbrugg"
- Übersicht (Startseite): Ortszeile, Adresszeile und Versionszeile auf Widnau
- Finale: "Gemeindesaal Widnau"

## Technische Details

- `src/lib/mobility-data.ts`: S21-Konstanten entfernen, neue Koordinaten (SARGANS, BUCHS, ALTSTAETTEN, HEERBRUGG, RORSCHACH, ST_MARGRETHEN, WIDNAU), IC1-Halte bis Zürich HB kürzen, neue Legs/Polylines/Stops für alle drei Routen, `VALID_ZIEL` erweitern, OSRM-Punkte für Auto auf Widnau
- `src/routes/etappe-1.tsx`, `src/components/case-file/RouteDetail.tsx`, `src/routes/index.tsx`, `src/routes/finale.tsx`: Textersetzungen
- Rätsellogik, Punkte, Badges und Hinweistimer bleiben unverändert
