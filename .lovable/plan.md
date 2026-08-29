# Umstellung von Speicher (AR) auf Widnau (SG)

Widnau hat keinen eigenen Bahnhof. Vorgeschlagene Standardannahmen: Etappe 1 endet am **Bahnhof Heerbrugg** (Fussweg nach Widnau), Etappe 3 spielt im **Widnauer Riet / Rheinauen**, Etappe 5 am **alten Pumpwerk am Rhein**, Dorfladen und Gemeindesaal bleiben generisch («Dorfladen Berger», «Gemeindesaal Widnau»).

## Liste der Änderungen

### 1. Reiseroute Etappe 1 (grösster Block)
`src/lib/mobility-data.ts`
- Zielkoordinate `SPEICHER` → Heerbrugg/Widnau (47.406, 9.639).
- Zwischenhalte `S21_STOPS` (Appenzeller Bahn St. Gallen → Speicher, inkl. «Schützengarten») ersetzen durch die Strecke St. Gallen → Heerbrugg (S-Bahn S3/S4 über Rorschach bzw. Rheintal) plus optional Bus nach Widnau.
- Linienbezeichnung `S21` → neue Linie (z. B. `S4`), Farben/Polylines bleiben.
- `VALID_ZIEL` von `["speicher", …]` auf `["widnau", "widnau sg", "heerbrugg"]`.
- Routenbeschreibungen, `to:`-Felder und `direction` (Autoroute «… → St. Gallen → Speicher») auf das neue Ziel umschreiben; Flugroute (Zürich → …) analog.
- Kartenmarker-Labels «Speicher» → «Widnau».

### 2. Etappe 1 (Seite)
`src/routes/etappe-1.tsx`
- Seitentitel/Meta: «Bahnhof Speicher» → «Bahnhof Heerbrugg».
- QR-Gate-Text «QR-Code am Bahnhof Speicher».
- Notizkopf «Notiz 01, Bahnhof Speicher, Bank am Gleis 1».
- Routenzeile «Genf › Speicher».
- Auflösungstext im Hinweis 3 («Start: Genf, Ziel: Speicher (AR) …»).
- Fusszeile «ETAPPE 1 · BAHNHOF SPEICHER».

### 3. Routendetail
`src/components/case-file/RouteDetail.tsx`
- Kopfzeile «Genève › Speicher».

### 4. Übersicht / Dashboard
`src/routes/index.tsx`
- «Vertraulich · Speicher», «Samstag · Uhrzeit · Speicher, Dorfstrasse 4» (neue Adresse in Widnau), Fusszeile «Speicher · v3 · Linearer Ablauf».

### 5. Finale / Hearing
`src/routes/finale.tsx`
- «Gemeindesaal Speicher» → «Gemeindesaal Widnau». Restliche Gemeindesaal-Texte bleiben.

### 6. Etappe 3 (Wald)
`src/routes/etappe-3.tsx`
- Ortsbezeichnungen «Forsthaus / Lichtung» auf den Widnauer Schauplatz anpassen (Riet/Rheinauen), inkl. Meta-Beschreibung und QR-Gate-Text.

### 7. Etappe 5 (Wasserkraftwerk)
`src/routes/etappe-5.tsx` und Verweis in `src/routes/etappe-4.tsx`
- «Altes Wasserkraftwerk» → neuer Schauplatz (Pumpwerk am Rhein) in Titel, Meta, QR-Gate, Notizkopf, Etappenlabel und Umschlag-Dialog.

### 8. Nicht betroffen
Punktesystem, Badges, Rätsel-Logik, Datenbank, Hinweis-Timer, Prolog-Video (keine Ortsnennung), `src/lib/story.ts`.

## Offene Punkte
Bestätige oder ersetze die drei Ortsannahmen (Heerbrugg, Riet, Pumpwerk) und die neue Adresse in Widnau; danach ist die Umsetzung reine Text- und Datenarbeit.
