# Wege A bis D mit Verzweigungen pro Posten

Jede Runde kann frei festlegen, wie sich die vier Wege A bis D über die Posten verteilen. Pro Posten gibt es eine oder mehrere Stationen, und an einer Station kann ein einziger QR-Code mehrere Wege abdecken. Inhalt und Rätsel bleiben für alle gleich; es ändert sich nur, welcher QR-Code welche Gruppe vor Ort öffnet.

## Verzweigungs-Modell (gemäss Skizze)

Es gibt immer die vier Wege A, B, C und D. Die Lehrperson legt pro Posten fest, wie viele Stationen dieser hat (1 bis 4) und welche Wege gemeinsam an einer Station sind. Beispiele:

- **Alle gemeinsam** (ABCD): 1 Station, 1 QR-Code, jeder Weg akzeptiert. Das ist der heutige Zustand.
- **Zwei Stationen** (AB | CD): A und B scannen denselben Code, C und D einen anderen. Es muss nicht pro Weg ein Code aufgehängt werden.
- **Drei Stationen** (A | B | CD): A und B einzeln, C und D teilen sich einen Code.
- **Vier Stationen** (A | B | C | D): jeder Weg hat einen eigenen QR-Code.

So entstehen Verläufe wie in der Skizze: Start gemeinsam, dann AB | CD, dann A | B | CD, dann wieder gemeinsam, Finale gemeinsam.

## Wie es sich anfühlt

**Runde erstellen**
- Neben Titel und Zeitbudget gibt es pro Posten eine kleine Verzweigungs-Einstellung: Anzahl Stationen (1 bis 4) und pro Weg ein Auswahlfeld „Station 1 bis n". Voreinstellung: alle Wege gemeinsam (1 Station).
- Diese Einstellung wird beim Erstellen festgelegt und danach nicht mehr geändert.

**Lobby**
- Die Gruppen melden sich wie bisher an, zunächst ohne Buchstaben.
- Wenn alle da sind, drückt die Lehrperson **„Wege zufällig verteilen"**. Die Verteilung ist zufällig und gleichmässig: bei 7 Gruppen z. B. 2x A, 2x B, 2x C, 1x D.
- Jede Gruppe zeigt in der Teamliste einen grossen, farbigen Buchstaben, dazu eine Übersicht „Weg A: 2 Gruppen · B: 2 · C: 2 · D: 1", damit das richtige Material ausgegeben werden kann.
- Nochmals drücken verteilt neu (mit Rückfrage). Gruppen, die später beitreten, erhalten automatisch den Weg, der am wenigsten vertreten ist.

**Auf dem Handy der Gruppe**
- Auf jeder Sperrseite steht „Euer Weg: B" (bzw. „Euer Weg: B (Station 2)", wenn mehrere Stationen existieren). Nur der QR-Code der eigenen Station öffnet den Posten; der Code einer anderen Station wird mit einer klaren Meldung abgelehnt.
- Hat ein Posten nur eine Station, bleibt es beim Grund-QR-Code ohne Endung.

**Nachverfolgung für die Lehrperson**
- Im Lehrerbereich gibt es eine **Weg-Übersicht**: pro Posten eine Zeile mit den Stationen und den Gruppen darauf, etwa „Posten 2 · Station 1 (AB): Adler, Füchse · Station 2 (CD): Murmeltiere". So ist jederzeit ersichtlich, welche Gruppe zu welcher Station gehen muss und welcher QR-Code dort hängt.
- Der Buchstabe erscheint zusätzlich in der Live-Übersicht und in der Auswertung, damit nachvollziehbar bleibt, welche Gruppe welchen Weg gegangen ist.

**QR-Codes zum Ausdrucken**
- Pro Station gibt es genau eine Zeichenfolge: der Grundcode des Postens plus der Weg-Endung mit dem tiefsten Buchstaben der Station. Beispiel Station AB an Mobilität: `Tz3PqW8nXmYr5JcLs6Vk_A`; Station CD: `Tz3PqW8nXmYr5JcLs6Vk_C`. Eine Station mit allen Wegen nutzt den Grundcode ohne Endung.
- Im Lehrerbereich gibt es eine Druckliste: pro Posten die benötigten QR-Bilder mit Beschriftung (Posten, Station, Wege), passend zur eingestellten Konfiguration.

## Technische Umsetzung

**Migration**
- `rounds`: neue Spalte `branches jsonb not null default '{}'` (Form `{"1":[["A","B","C","D"]], "2":[["A","B"],["C","D"]]}` – pro Posten eine Liste von Stationen, jede Station eine Liste von Wegen).
- `teams`: neue Spalte `variant text` (A bis D, null = noch nicht zugeteilt).
- `teacher_create_round` erhält `p_branches jsonb` (validiert: Schlüssel 1 bis 5, jede Station eine Teilmenge von A bis D, jeder Weg genau einmal pro Posten).
- Neue Funktion `teacher_assign_variants(p_password_hash, p_code)`: verteilt A bis D zufällig und gleichmässig, gibt die Zuordnung zurück.
- `round_join`: vergibt den am wenigsten vertretenen Buchstaben, sobald verteilt wurde; gibt `variant` und `branches` zurück.
- `round_lookup`, `round_state`, `teacher_list_rounds`, `teacher_round_report` geben `branches` bzw. `variant` mit zurück.

**Frontend**
- `src/lib/variants.ts` (neu): `LETTERS = ["A","B","C","D"]`, `stationFor(stage, letter, branches)` findet die Station des Weges, `tokenForStage(baseToken, station)` baut die Zeichenfolge (Grundcode + tiefster Buchstabe, ohne Endung bei einer Station). Die fünf Basis-Token werden hier zentral geführt, damit Sperre und Druckliste dieselbe Quelle nutzen.
- `src/lib/round-client.ts`: `RoundSession` und `PendingJoin` erhalten `variant` und `branches`.
- `src/components/case-file/QRGate.tsx`: liest Weg und Verzweigungen aus der Session, berechnet den erwarteten Code der eigenen Station, zeigt „Euer Weg: X" und lehnt Codes anderer Stationen mit „Das ist der Code einer anderen Station" ab. Ohne Session (Solo/Debug) gilt der Grundcode wie bisher.
- `src/routes/lehrer.index.tsx`: Erstellformular mit Verzweigungs-Auswahl pro Posten (Anzahl Stationen + Weg-Zuordnung).
- `src/components/teacher/LobbyPanel.tsx`: Buchstaben-Badge pro Team, Verteilungsübersicht, Knopf „Wege zufällig verteilen" mit Rückfrage beim Neuverteilen.
- Neue Komponente `src/components/teacher/BranchOverview.tsx`: Posten-Stationen-Übersicht mit Gruppenzuordnung und den dort gültigen Zeichenfolgen.
- Neue Komponente `src/components/teacher/QRPrintList.tsx`: QR-Bilder pro Station (Paket `qrcode`, bereits vorhanden) mit Druckansicht.
- `src/components/teacher/ProgressMatrix.tsx` und `ReportPanel.tsx`: Buchstabe in der Teamzeile bzw. im Export.
