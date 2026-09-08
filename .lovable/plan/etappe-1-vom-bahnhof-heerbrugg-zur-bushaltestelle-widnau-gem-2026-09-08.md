# Etappe 1: Vom Bahnhof Heerbrugg zur Bushaltestelle Widnau, Gemeindehaus

Widnau hat keinen Bahnhof. Der erste Posten liegt physisch an der Bushaltestelle
«Widnau, Gemeindehaus». Alle Texte, die Lernende zum Bahnhof Heerbrugg schicken,
werden angepasst. Die eingegebene Lösung «Genf → Widnau, Gemeindehaus» muss
akzeptiert werden.

Die drei Routen bleiben inhaltlich unverändert: ihr Endpunkt ist weiterhin
Heerbrugg (Zug-Terminus), kein zusätzlicher Bus-Leg und kein Bus-Icon.

## 1. Text anpassen (`src/routes/etappe-1.tsx`)

Alle «Bahnhof Heerbrugg» / «Bahnhof»-Bezeichnungen ersetzen durch
«Bushaltestelle Widnau, Gemeindehaus» bzw. «Bushaltestelle»:

- **head meta**: Titel `Etappe 1, Bushaltestelle Widnau | Majas Mission …`;
  Description «An der Bushaltestelle liegt Jakobs altes Reiseticket …».
- **QRGate**: Titel «Etappe 1, QR-Code an der Bushaltestelle scannen»;
  Beschreibung «Scanne den QR-Code, der an der Bushaltestelle Widnau,
  Gemeindehaus für dich hinterlegt ist.»
- **Header h1**: `Etappe 1 · Bushaltestelle`.
- **Brief-Karte**:
  - Kicker `Notiz 01, Bushaltestelle Widnau, Gemeindehaus · Wartebank`.
  - Fliesstext: «An der Bushaltestelle Widnau, Gemeindehaus findet Maja auf der
    Wartebank ein Couvert mit Jakobs alten Reiseunterlagen und einem Zettel.»
  - Zitat von Jakob bleibt unverändert.
- **Verbindung identifiziert** (Kopf): `Genf › Widnau, Gemeindehaus`.
- **Hinweis-Auflösung** (HINTS_003[2]): «Start: Genf, Ziel: Widnau, Gemeindehaus
  (Bushaltestelle). Die nachhaltigste Route ist der Zug (IC 1 → IC 3 → IR 13 bis
  Heerbrugg) mit ca. 3 kg CO₂ pro Person …».
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
  "heerbrugg sg",
  "bahnhof heerbrugg",
];
```
`VALID_START` bleibt unverändert (Genf). Eingabe «Widnau Gemeindehaus» wird
normalisiert (Kleinschreibung, Sonderzeichen entfernt) und trifft
`widnau gemeindehaus`.

## 3. Begleitende Stellen

- `src/lib/progress.ts`: Kommentar `1 = Etappe 1 (Bahnhof)` → `(Bushaltestelle)`;
  `STAGES[0].ort` «Bahnhof» → «Bushaltestelle».
- `src/components/teacher/MessagePanel.tsx`: Platzhalter «Treffpunkt um 16:00
  bei der Bushaltestelle Widnau, Gemeindehaus».
- `src/routes/index.tsx` bleibt (generelle Widnau-Angabe).
- `src/components/case-file/RouteDetail.tsx` Kopfzeile «Genève › Heerbrugg»
  bleibt (die Route endet weiter in Heerbrugg).

## 4. Prüfung

- `bunx tsgo --noEmit` ohne Fehler.
- Build OK (`/tmp/observability/build-errors.log`).
- Preview: Etappe 1 zeigt durchgehend «Bushaltestelle Widnau, Gemeindehaus»;
  Eingabe «Genf» / «Widnau Gemeindehaus» wird akzeptiert.

Keine Datenbank-, Punkte- oder Zugriffsregeländerungen. Physische QR-Codes vor
Ort bleiben unverändert.
