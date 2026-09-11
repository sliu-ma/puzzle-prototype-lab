# Wege mit Verzweigungen pro Posten

Pro Runde legt die Lehrperson fest, wie viele Wege es überhaupt gibt (1 bis 4) und wie sich diese Wege an jedem Posten auf Stationen verteilen. Wo Wege zusammenlaufen, genügt ein einziger QR-Code für mehrere Wege. Inhalt und Rätsel bleiben für alle gleich; es unterscheidet sich nur, welcher QR-Code welche Gruppe öffnet.

## Verzweigungs-Modell (gemäss Skizze)

Zwei Einstellungen pro Runde:

1. **Anzahl Wege**: 1, 2, 3 oder 4 (A bis D). Bei 1 bleibt alles wie heute.
2. **Pro Posten**: wie viele Stationen es gibt und welche Wege an derselben Station sind.

Beispiel mit vier Wegen:

```text
Posten 1   Posten 2   Posten 3   Posten 4   Hearing
 ABCD       AB  CD      A  B       ABCD      ABCD
                        CD
1 QR-Code   2 Codes    3 Codes    1 Code    1 Code
```

Beispiel mit zwei Wegen: Posten 1 gemeinsam (ABCD-Prinzip, hier AB), Posten 2 getrennt A | B, Posten 3 wieder gemeinsam. Es werden nur so viele Codes aufgehängt, wie es Stationen gibt.

## Wie es sich anfühlt

**Runde erstellen, grafisch**
- Oben eine Auswahl „Anzahl Wege: 1 / 2 / 3 / 4".
- Darunter ein Diagramm im Stil Ihrer Skizze: fünf Posten plus Hearing als Spalten, die Wege als farbige Linien (A rot, B grün, C blau, D gelb), die sich zusammenführen oder trennen.
- Pro Posten ein Knopf „Stationen: 1, 2, 3, 4" und je Weg ein kleines Auswahlfeld, an welcher Station er steht. Das Diagramm aktualisiert sich sofort, so ist der ganze Ablauf auf einen Blick nachvollziehbar.
- Unter dem Diagramm die Zusammenfassung „Benötigte QR-Codes: 8" mit Aufschlüsselung pro Posten.
- Voreinstellung: 1 Weg, alle gemeinsam. Die Einstellung wird beim Erstellen festgelegt und danach nicht mehr geändert.

**Lobby**
- Die Gruppen melden sich wie bisher an, zunächst ohne Buchstaben.
- Wenn alle da sind: Knopf **„Wege zufällig verteilen"**. Zufällig, aber gleichmässig über die eingestellte Anzahl Wege (bei 7 Gruppen und 3 Wegen: 3x A, 2x B, 2x C).
- Jede Gruppe zeigt einen grossen, farbigen Buchstaben; dazu eine Übersicht „Weg A: 3 Gruppen · B: 2 · C: 2".
- Nochmals drücken verteilt neu (mit Rückfrage). Spätere Gruppen erhalten automatisch den Weg mit den wenigsten Gruppen.

**Auf dem Handy der Gruppe**
- Auf der Sperrseite steht „Euer Weg: B" (bei mehreren Stationen zusätzlich die Station). Nur der Code der eigenen Station öffnet den Posten; ein Code einer anderen Station wird mit klarer Meldung abgelehnt.
- Posten mit nur einer Station nutzen weiterhin den Grund-QR-Code ohne Endung.

**Nachvollziehbarkeit für die Lehrperson**
- Im Lehrerbereich dasselbe Diagramm nochmals, aber mit den echten Gruppen: an jeder Station stehen die Gruppennamen und die dort gültige Zeichenfolge, z. B. „Posten 2 · Station 1 (A, B): Adler, Füchse · Code `…_A`".
- Der Buchstabe erscheint zusätzlich in der Live-Übersicht und in der Auswertung.
- Druckliste: pro Station ein QR-Bild mit Beschriftung (Posten, Station, Wege), genau so viele Blätter wie Codes benötigt werden.

## Technische Umsetzung

**Migration**
- `rounds`: neue Spalten `path_count int not null default 1` (1 bis 4) und `branches jsonb not null default '{}'` in der Form `{"1":[["A","B","C","D"]], "2":[["A","B"],["C","D"]]}` – pro Posten (1 bis 5, plus `"6"` für das Hearing) eine Liste von Stationen, jede Station eine Liste von Wegen.
- `teams`: neue Spalte `variant text` (A bis D, null = noch nicht zugeteilt).
- `teacher_create_round` erhält `p_path_count int` und `p_branches jsonb`; Validierung: jeder Weg im Bereich der `path_count` kommt pro Posten genau einmal vor, Stationen nicht leer.
- Neue Funktion `teacher_assign_variants(p_password_hash, p_code)`: verteilt die Wege zufällig und gleichmässig, gibt die Zuordnung zurück.
- `round_join` vergibt den am wenigsten vertretenen Weg, sobald verteilt wurde, und gibt `variant` zurück.
- `round_lookup`, `round_state`, `teacher_list_rounds`, `teacher_round_report` geben `path_count`, `branches` bzw. `variant` mit zurück.

**Frontend**
- `src/lib/variants.ts` (neu): `LETTERS`, `STAGE_TOKENS` (die fünf bestehenden Basis-Token plus Hearing), `stationFor(stage, letter, branches)`, `tokenForStation(baseToken, station, stationCount)` – die Zeichenfolge ist der Grundcode plus Endung mit dem ersten Buchstaben der Station (`…_A`, `…_C`); bei nur einer Station bleibt der Grundcode unverändert. Eine Quelle für Sperre, Diagramm und Druckliste.
- `src/lib/round-client.ts`: `RoundSession` und `PendingJoin` erhalten `variant`, `pathCount` und `branches`.
- `src/components/case-file/QRGate.tsx`: berechnet den erwarteten Code aus Session und Posten, zeigt „Euer Weg: X", lehnt fremde Stationscodes mit eigener Meldung ab; ohne Session (Solo/Debug) gilt der Grundcode wie bisher. Gespeichert wird wie heute nur der Hash des erwarteten Codes.
- `src/components/teacher/BranchDiagram.tsx` (neu): SVG-Diagramm der Posten, Stationen und farbigen Weglinien. Zwei Modi: `editable` (Erstellformular) und `readonly` mit Gruppennamen und Codes (Lehreransicht).
- `src/routes/lehrer.index.tsx`: Erstellformular mit „Anzahl Wege" und dem editierbaren Diagramm.
- `src/components/teacher/LobbyPanel.tsx`: Weg-Badge pro Team, Verteilungsübersicht, Knopf „Wege zufällig verteilen" mit `ConfirmDialog` beim Neuverteilen.
- `src/components/teacher/QRPrintList.tsx` (neu): QR-Bilder pro Station (Paket `qrcode`, bereits vorhanden) mit Druckansicht.
- `src/components/teacher/ProgressMatrix.tsx` und `ReportPanel.tsx`: Weg-Buchstabe in der Teamzeile und im Export.
