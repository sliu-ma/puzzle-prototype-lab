# Verzweigungen pro Posten (Wege A bis D)

Jede Runde kann pro Posten festlegen, wie viele Wege es gibt. Die Gruppen werden einem Buchstaben zugeteilt und brauchen den passenden QR-Code vor Ort. Inhalt und Rätsel bleiben für alle gleich.

## Wie es sich anfühlt

**Runde erstellen**
- Neben Titel und Zeitbudget gibt es pro Posten (Mobilität, Konsum, Wohnen, Biodiversität, Energie) eine Auswahl: 1, 2, 3 oder 4 Wege.
- Standard ist 1 Weg, dann bleibt alles wie heute.
- Diese Einstellung wird beim Erstellen festgelegt und danach nicht mehr geändert.

**Lobby**
- Die Gruppen melden sich wie bisher an, zunächst ohne Buchstaben.
- Wenn alle da sind, drückt die Lehrperson **„Buchstaben zufällig verteilen"**. Die Verteilung ist zufällig und gleichmässig: bei 7 Gruppen und 3 Wegen z. B. 3x A, 2x B, 2x C.
- Jede Gruppe zeigt in der Teamliste einen grossen, farbigen Buchstaben. Zusätzlich eine Übersicht „Weg A: 3 Gruppen · Weg B: 2 · Weg C: 2", damit das richtige Material ausgegeben werden kann.
- Nochmals drücken verteilt neu (mit Rückfrage). Gruppen, die später beitreten, erhalten automatisch den Buchstaben, der am wenigsten vertreten ist.
- Der Buchstabe erscheint auch in der Live-Übersicht und in der Auswertung, damit klar ist, welche Gruppe welchen Weg gegangen ist.

**Auf dem Handy der Gruppe**
- Bei einem Posten mit mehreren Wegen steht auf der Sperrseite zusätzlich „Euer Weg: B". Nur der QR-Code mit der passenden Endung öffnet den Posten.
- Bei einem Posten mit nur einem Weg gilt weiterhin der Grund-QR-Code, ohne Buchstabe.
- Hat eine Gruppe mehr Buchstaben als ein Posten Wege hat (z. B. Gruppe D bei einem Posten mit 2 Wegen), wird sie gleichmässig auf die vorhandenen Wege verteilt (D nutzt dort Weg B).

**QR-Codes zum Ausdrucken**
- Die Endungen entstehen aus dem bestehenden Grundcode: `Tz3PqW8nXmYr5JcLs6Vk_A`, `_B`, `_C`, `_D`.
- Im Lehrerbereich gibt es pro Posten eine Liste der benötigten Zeichenfolgen inklusive QR-Bild zum Ausdrucken, passend zur eingestellten Anzahl Wege.

## Technische Umsetzung

**Migration**
- `rounds`: neue Spalte `variants jsonb not null default '{}'` (Form `{"1":3,"2":1,"3":1,"4":2,"5":1}`).
- `teams`: neue Spalte `variant text` (null = noch nicht zugeteilt).
- `teacher_create_round` erhält `p_variants jsonb` (validiert: Schlüssel 1 bis 5, Werte 1 bis 4).
- Neue Funktion `teacher_assign_variants(p_password_hash, p_code)`: verteilt Buchstaben zufällig und gleichmässig über `max(variants)` Buchstaben, gibt die Zuordnung zurück.
- `round_join`: vergibt bei laufender/offener Runde direkt den am wenigsten vertretenen Buchstaben, sobald die Runde schon verteilt wurde; gibt `variant` und `variants` zurück.
- `round_lookup`, `round_state`, `teacher_list_rounds`, `teacher_round_report` geben `variants` bzw. `variant` mit zurück.

**Frontend**
- `src/lib/variants.ts` (neu): `LETTERS`, `effectiveLetter(teamLetter, stagePathCount)` (Modulo-Zuordnung), `tokenForStage(baseToken, count, letter)`.
- `src/lib/round-client.ts`: `RoundSession` und `PendingJoin` erhalten `variant` und `variants`; Setter beim Beitritt und im Wartezimmer-Polling.
- `src/components/case-file/QRGate.tsx`: akzeptiert neben `token` die Rundenkonfiguration aus der Session und prüft gegen den erwarteten Token inkl. Endung; Anzeige „Euer Weg: X"; Fallback auf Grundcode ohne Session (Solo/Debug). `storageKey` bleibt, gespeichert wird der Hash des erwarteten Tokens.
- `src/routes/lehrer.index.tsx`: Erstellformular mit fünf Auswahlfeldern für die Wege pro Posten.
- `src/components/teacher/LobbyPanel.tsx`: Buchstaben-Badge pro Team, Verteilungsübersicht, Knopf „Buchstaben zufällig verteilen" mit `ConfirmDialog` beim Neuverteilen.
- `src/components/teacher/ProgressMatrix.tsx` und `ReportPanel.tsx`: Buchstabe in der Teamzeile bzw. im Export.
- Neue Komponente `src/components/teacher/QRPrintList.tsx`: pro Posten die benötigten Zeichenfolgen als QR-Bilder (Paket `qrcode`, bereits vorhanden), Druckansicht.
- Die Basis-Token der Etappen bleiben unverändert; sie werden zentral in `src/lib/variants.ts` referenziert, damit `QRGate` und Druckliste dieselbe Quelle nutzen.
