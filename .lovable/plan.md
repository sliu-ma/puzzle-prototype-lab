# Letzter Posten: Hearing am Gemeindehaus Widnau (nicht in der Schule)

Der Hearing-QR-Code hängt am Gemeindehaus Widnau, nicht im Schulzimmer.
Nur die QR-Gate-Texte in `src/routes/finale.tsx` nennen noch «Schulzimmer»
und werden auf «Gemeindehaus Widnau» umgestellt. Alle «Gemeindesaal»-Nennungen
bleiben unverändert — der Saal liegt im Gemeindehaus, die Ortsangabe
«Gemeindesaal Widnau» (Zeile 542) stimmt bereits.

## 1. QR-Gate-Texte anpassen (`src/routes/finale.tsx`)

- **Zeile 41** Kommentar: `hängt im Schulzimmer` → `hängt am Gemeindehaus Widnau`
- **Zeile 51** QRGate-Titel: `Hearing, QR-Code im Schulzimmer scannen` →
  `Hearing, QR-Code am Gemeindehaus scannen`
- **Zeile 52** QRGate-Beschreibung: `Scanne den QR-Code im Schulzimmer, …` →
  `Scanne den QR-Code am Gemeindehaus Widnau, um die Fragerunde des Gemeinderats zu öffnen.`

## 2. Keine weiteren Änderungen

- `src/lib/progress.ts` Zeile 59 `ort: "Gemeindesaal"` bleibt (Saal im
  Gemeindehaus, Widnau bereits in `finale.tsx` Zeile 542 genannt).
- `src/routes/finale.tsx` Zeile 542 `Gemeindesaal Widnau` bleibt.
- Intro-Sequenz (Zeilen 2388, 2438) «Im Gemeindesaal» bleibt.
- `src/routes/etappe-5.tsx` Zeile 261 «Finale · Hearing im Gemeindesaal» bleibt.
- `src/components/case-file/GlobalTimer.tsx` Zeile 50 «Im Gemeindesaal» bleibt.
- Die «Schule»-Verweise in `rounds.server.ts` und `ProgressMatrix.tsx`
  beziehen sich auf den Rundenstartpunkt der Klasse, nicht auf den
  Hearing-Ort — sie bleiben unverändert.
- Keine Datenbank-, Punkte-, Token- oder QR-Code-Änderungen.

## 3. Prüfung

- `bunx tsgo --noEmit` ohne Fehler.
- Build OK (`/tmp/observability/build-errors.log`).
- Preview: Hearing-QR-Gate zeigt «am Gemeindehaus Widnau» statt «im Schulzimmer».
