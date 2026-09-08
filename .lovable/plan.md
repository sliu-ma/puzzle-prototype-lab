# Etappe 1: Vom Bahnhof Heerbrugg zur Bushaltestelle Widnau, Gemeindehaus

Widnau hat keinen Bahnhof. Der erste Posten liegt physisch an der Bushaltestelle
«Widnau, Gemeindehaus». Alle Texte, die Lernende zum Bahnhof Heerbrugg schicken,
werden angepasst. Die eingegebene Lösung «Genf → Widnau, Gemeindehaus» muss
akzeptiert werden. Die drei Routen werden so ergänzt, dass sie wirklich bis zur
Bushaltestelle Widnau, Gemeindehaus führen (Zug/Flug-Auto-Route via Heerbrugg
+ Bus).

## 1. Text anpassen (`src/routes/etappe-1.tsx`)

Alle «Bahnhof Heerbrugg» / «Bahnhof»-Bezeichnungen ersetzen durch
«Bushaltestelle Widnau, Gemeindehaus» bzw. «Bushaltestelle»:

- **head meta**: Titel `Etappe 1, Bushaltestelle Widnau | Majas Mission …`;
  Description «An der Bushaltestelle liegt Jakobs altes Reiseticket …».
- **QRGate**: Titel «Etappe 1, QR-Code an der Bushaltestelle scannen»;
  Beschreibung «Scanne den QR-Code, der an der Bushaltestelle Widnau, Gemeindehaus
  für dich hinterlegt ist.»
- **Header h1**: `Etappe 1 · Bushaltestelle`.
- **Brief-Karte**:
  - Kicker `Notiz 01, Bushaltestelle Widnau, Gemeindehaus · Wartebank`.
  - Fliesstext: «An der Bushaltestelle Widnau, Gemeindehaus findet Maja auf der
    Wartebank ein Couvert mit Jakobs alten Reiseunterlagen und einem Zettel.»
  - Zitat von Jakob bleibt unverändert.
- **Verbindung identifiziert** (Kopf): `Genf › Widnau, Gemeindehaus`.
- **Hinweis-Auflösung** (HINTS_003[2]): «Ziel: Widnau, Gemeindehaus
  (Bushaltestelle). Die nachhaltigste Route ist der Zug bis Heerbrugg, dann mit
  dem Bus 305 zur Bushaltestelle Widnau, Gemeindehaus …».
- **Footer**: `ETAPPE 1 · BUSHALTESTELLE WIDNAU`.
- Übergang zu Etappe 2 («Bahnticket»-Zitat) bleibt, da es sich auf Jakobs altes
  Ticket als Objekt bezieht.

## 2. Lösung akzeptieren (`src/lib/mobility-data.ts`)

`VALID_ZIEL` um die neuen Varianten ergänzen, bestehende Einträge behalten:
```ts
export const VALID_ZIEL = [
  "widnau",
  "widnau sg",
  "9443 widnau",
  "widnau gemeindehaus",
  "gemeindehaus",
  "gemeindehaus widnau",
  "bushaltestelle widnau",
  "heerbrugg",            // Zug-Terminus, weiterhin gültig
  "bahnhof heerbrugg",
];
```
`VALID_START` bleibt unverändert (Genf).

## 3. Routen bis zur Bushaltestelle ergänzen (`src/lib/mobility-data.ts`)

Die drei `RouteOption`-Einträge werden so ergänzt, dass die Verbindung wirklich
bei der Bushaltestelle Widnau, Gemeindehaus endet. Der finalmajor-Stop ist
`WIDNAU` mit Label «Widnau, Gemeindehaus».

### a) Zug-Route (`id: "zug"`)
- `beschreibung`: «Genève → Zürich HB mit IC 1, weiter mit IC 3 nach Sargans
  und mit IR 13 nach Heerbrugg, dann mit dem Bus 305 zur Bushaltestelle Widnau,
  Gemeindehaus. Eine Verbindung, ein Ticket.»
- Neuer finaler Leg (Transfer/Bus): `iconKey: "bus"`, `note: "Bus 305 → Widnau,
  Gemeindehaus"`, `duration: "6 Min."`
- `IR13_POLY` um `WIDNAU` erweitern: `[SARGANS, BUCHS, ALTSTAETTEN, HEERBRUGG, WIDNAU]`.
- `stops`: letzten Eintrag «Heerbrugg» (major) belassen, dahinter
  `{ pos: WIDNAU, label: "Widnau, Gemeindehaus", major: true }` anhängen.

### b) Zug+Flug+Zug-Route (`id: "zug-flug-zug"`)
- `beschreibung`: «… dann mit IR 13 weiter nach Heerbrugg und mit dem Bus zur
  Bushaltestelle Widnau, Gemeindehaus. Klingt schnell, ist es kaum.»
- Neuer finaler Leg analog (Bus 305).
- `IR13_FLUG_POLY` um `WIDNAU` erweitern.
- `stops`: final `Widnau, Gemeindehaus` anhängen.

### c) Auto-Route (`id: "auto"`)
- `legs[0].to`: «Widnau, Gemeindehaus».
- `beschreibung`: «… bis zur Bushaltestelle Widnau, Gemeindehaus.»
- `stops`: Label «Widnau» → «Widnau, Gemeindehaus».

## 4. Bus-Icon ergänzen (`src/components/case-file/RouteDetail.tsx`)

- `Leg["iconKey"]` um `"bus"` erweitern.
- `LegIcon`: `if (k === "bus") return <Bus className={className} />`
  mit `Bus` aus `lucide-react` importieren.
- Kopfzeile `Genève › Heerbrugg` → `Genève › Widnau, Gemeindehaus`.

(`RouteCards.tsx` nutzt nur `iconKeys` der Route, nicht einzelne Legs – keine
Änderung nötig; Bus bleibt dort nicht als Hauptmodus sichtbar.)

## 5. Begleitende Stellen

- `src/lib/progress.ts`: Kommentar `1 = Etappe 1 (Bahnhof)` → `(Bushaltestelle)`;
  `STAGES[0].ort` «Bahnhof» → «Bushaltestelle».
- `src/components/teacher/MessagePanel.tsx`: Platzhalter «Treffpunkt um 16:00
  bei der Bushaltestelle Widnau, Gemeindehaus».
- `src/routes/index.tsx` bleibt (generelle Widnau-Angabe).

## 6. Prüfung

- `bunx tsgo --noEmit` ohne Fehler.
- Build OK (`/tmp/observability/build-errors.log`).
- Preview: Etappe 1 zeigt durchgehend «Bushaltestelle Widnau, Gemeindehaus»,
  Eingabe «Genf» / «Widnau Gemeindehaus» wird akzeptiert, die drei Routen
  enden auf der Karte bei Widnau, Gemeindehaus.

Keine Datenbank-, Punkte- oder Zugriffsregeländerungen. Physische QR-Codes vor
Ort bleiben unverändert.
