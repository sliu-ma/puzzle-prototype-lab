# Postenkarten-Generator im Lehrerbereich

Neuer Bereich pro Runde: `/lehrer/<code>` erhält den Schritt **Postenkarten**. Dort legt die Lehrperson für jede der fünf Etappen den Ort fest und druckt daraus die Karten, die in die Umschläge kommen.

## 1. Orte erfassen (pro Runde frei)

Für jede Etappe (1–5) ein kurzes Formular:

- Ortsname (z. B. «SPAR Speicher»), vorbelegt mit den bisherigen Namen (Bahnhof, Dorfladen, Wald-Lichtung, Jakobs Haus, Wasserkraftwerk).
- Adresse (z. B. «Hauptstrasse 61, 9042 Speicher»). Beim Speichern wird die Adresse in Koordinaten umgewandelt; gefundene Adresse wird zur Bestätigung angezeigt.
- Foto des Gebäudes hochladen (Handy-Kamera oder Datei), mit Vorschau und «Bild ersetzen».
- Optionaler Zusatzsatz, z. B. «Das Rätsel wartet beim Eingang».

Die Angaben gehören zur Runde, sind also für jedes Dorf neu setzbar und bleiben für Wiederholungen gespeichert.

## 2. Kartenlayout (A6, zwei Karten pro A5/A4-Blatt)

Jede Karte im bestehenden Akten-Look (Papier, Stempel, Schreibmaschinenschrift) enthält:

- Kopf: «Hinweis für euch!» und Stempel «Etappe 0X».
- Kurztext: «Ihr habt das Rätsel gelöst. Begebt euch zum nächsten Ort.»
- Echte Google-Kartenansicht des Ziels mit Pin.
- Foto des Gebäudes.
- Ortsname, Adresse, Zusatzsatz.
- QR-Code, der in Google Maps direkt zum Ziel führt.

Rückseite/Nummerierung so, dass sofort klar ist, in welchen Umschlag welche Karte kommt.

## 3. Drucken

Knopf «Karten drucken»: öffnet eine reine Druckansicht mit allen erfassten Karten, ohne Menü und Knöpfe, mit Schnittmarken. Über den Browser druckbar oder als PDF speicherbar. Karten ohne Adresse werden übersprungen und im Lehrerbereich als «noch offen» markiert.

## Technische Umsetzung

**Google Maps Platform**: Verbindung muss zuerst eingerichtet werden (Connector-Karte im Chat). Genutzt werden Geocoding (Adresse → Koordinaten) und die Static Maps API, beide serverseitig über das Connector-Gateway; Aufrufe passieren nur beim Speichern einer Adresse bzw. beim Rendern der Druckansicht und werden pro Ort in der Datenbank zwischengespeichert, damit keine unnötigen Abfragen entstehen.

**Datenbank (Migration)**: neue Tabelle `public.round_stations` (`round_id`, `stage_nr`, `place_name`, `address`, `lat`, `lng`, `note`, `photo_path`, `map_cache`), mit GRANTs, RLS und Zugriff ausschliesslich über SECURITY-DEFINER-Funktionen mit Lehrer-Passwort-Hash (`teacher_list_stations`, `teacher_upsert_station`, `teacher_delete_station`) – gleiches Muster wie die bestehenden `teacher_*`-Funktionen. Fotos in einen neuen Storage-Bucket `station-photos` (öffentlich lesbar, Upload über eine Server-Funktion nach Passwortprüfung).

**Frontend**:
- `src/lib/stations.functions.ts`: Server-Funktionen für Liste, Speichern (inkl. Geocoding), Foto-Upload und Static-Map-Abruf.
- `src/components/teacher/StationsPanel.tsx`: Formularliste je Etappe mit Foto-Upload und Statusanzeige.
- `src/components/teacher/StationCard.tsx`: Kartenlayout im Aktenstil, wiederverwendet in Vorschau und Druck.
- Neue Route `src/routes/lehrer.$code.karten.tsx`: Druckansicht mit `@media print`-Regeln (A6-Raster, Seitenumbrüche, keine Navigation).
- `src/routes/lehrer.$code.tsx`: fünfter Schritt «Postenkarten» plus Knopf zur Druckansicht.
- QR-Codes werden lokal erzeugt (kleine `qrcode`-Bibliothek) und zeigen auf `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`.

Am Spiel selbst (Etappen, Umschläge, Punkte) ändert sich nichts.
