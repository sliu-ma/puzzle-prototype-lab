# Etappe 1: Alle Haltestellen akzeptieren, Texte neutral formulieren

Die Gruppen starten an unterschiedlichen Bushaltestellen (Widnau, Gemeindehaus /
Post / Schlatt). Darum werden alle Formen dieser Haltestellen als Lösung
akzeptiert, und sämtliche Texte nennen keinen konkreten Haltestellen-Namen mehr,
sondern sprechen neutral von «deiner Bushaltestelle in Widnau».

## 1. Lösungen erweitern (`src/lib/mobility-data.ts`)

Nur die beiden Konstanten werden ergänzt; die Normalisierung in
`src/routes/etappe-1.tsx` (Kleinschreibung, Akzente/Sonderzeichen entfernt)
bleibt unverändert.

`VALID_ZIEL` (bestehende Einträge bleiben, u. a. «widnau gemeindehaus»,
«heerbrugg»), neu dazu:

```ts
"widnau post",
"post widnau",
"post",
"widnau schlatt",
"schlatt widnau",
"schlatt",
"bushaltestelle widnau post",
"bushaltestelle widnau schlatt",
```

`VALID_START` (heute: genf, geneve, genève, geneva, gva), neu dazu:

```ts
"genf cornavin",
"geneve cornavin",
"cornavin",
"geneva cornavin",
```

## 2. Texte neutral formulieren (`src/routes/etappe-1.tsx`)

- **head meta**: Titel `Etappe 1, Bushaltestelle Widnau | Majas Mission …`
  (statt «Bushaltestelle Widnau» bereits so; Description bleibt).
- **QRGate-Beschreibung**: «Scanne den QR-Code, der an deiner Bushaltestelle in
  Widnau für dich hinterlegt ist.»
- **Brief-Karte, Kicker**: `Notiz 01, Bushaltestelle Widnau · Wartebank`.
- **Verbindung identifiziert**: `Genf › Widnau` (ohne «Gemeindehaus»).
- **Hinweis-Auflösung (HINTS_003[2])**: «Start: Genf, Ziel: deine Bushaltestelle
  in Widnau. Die nachhaltigste Route ist der Zug (IC 1 → IC 3 → IR 13 bis
  Heerbrugg) mit ca. 3 kg CO₂ pro Person …» (Rest unverändert).
- Header «Etappe 1 · Bushaltestelle» und Footer «ETAPPE 1 · BUSHALTESTELLE
  WIDNAU» bleiben, sie sind bereits neutral.

## 3. Begleitende Stelle (`src/components/teacher/MessagePanel.tsx`)

- Platzhalter: «z. B. Treffpunkt um 16:00 an der Bushaltestelle Widnau».

`src/lib/progress.ts` («Bushaltestelle») ist bereits neutral und bleibt.

## 4. Prüfung

- `bunx tsgo --noEmit` ohne Fehler, Build OK.
- Preview: Etappe 1 akzeptiert «Genève» + «Widnau, Post», «Genf» + «Widnau
  Schlatt», «Genève Cornavin» + «Widnau Gemeindehaus»; alle sichtbaren Texte
  sprechen nur noch von «deiner Bushaltestelle in Widnau».

Keine QR-Code- oder Datenbankänderungen; physische Karten vor Ort bleiben gültig.
