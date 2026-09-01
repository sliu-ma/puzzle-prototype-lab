# Lehrerdashboard: Überblick, Support-Erkennung, Forschungsdaten

Drei Ziele: (A) grafischer Überblick, wo die Gruppen stehen, (B) erkennen, wer Mühe hat, (C) verwertbare Daten für die Masterarbeit.

## Was heute tatsächlich in der Datenbank landet

Geprüft in `score_events` (zwei bestehende Runden, `X8FDT` und `ZVQLB`):

| Ereignis | Nutzlast | vorhanden |
|---|---|---|
| `stage_solved` | `stage`, `durationSec`, `at` | ja |
| `hint_revealed` | `stage`, `level` (1–3), `at` | ja |
| `badge_earned` | `badgeId`, `at` | ja |
| `hearing_answer` | `question`, `correct`, `at` | ja, aber nur bei bestandenem Hearing |

Jedes Ereignis hat zusätzlich `created_at` auf dem Server.

**Drei Lücken, die die Masterarbeit direkt betreffen:**

1. **Wegzeit fehlt komplett.** `durationSec` misst nur die reine Rätselzeit ab dem QR-Scan (`completeStage` in `src/lib/progress.ts` nutzt `getStageScanTs`). Der Scan-Zeitstempel selbst wird ausschliesslich lokal gespeichert (`recordStageScan`) und **nie an den Server geschickt**. Damit lässt sich „viel zu viel Wegzeit" heute nicht belegen.
2. **Fehlversuche im Hearing gehen verloren.** `src/routes/finale.tsx:425-431` verbucht die Antworten erst, wenn das Hearing bestanden ist. Die Antworten eines gescheiterten Versuchs erreichen den Server nie — genau die interessanten Fehldaten fehlen.
3. **Zeitstempel werden nicht ausgeliefert.** `buildReport` (`src/lib/rounds.server.ts:176-255`) reduziert die Ereignisse auf Dauern und Zählwerte. Wann eine Etappe gelöst wurde, kommt im Frontend nicht an — deshalb ist „hängt seit 20 Minuten" aktuell nicht berechenbar.

## A. Grafischer Überblick (Live)

**Fortschritts-Matrix** als neue Hauptansicht im Live-Schritt: Zeilen = Teams, Spalten = E1–E5 + Hearing. Jede Zelle farbcodiert:

```text
Team          E1    E2    E3    E4    E5    HEARING
Adler        ████  ████  ████  ▓▓▓▓  ░░░░  ░░░░
Füchse       ████  ████  ▓▓▓▓  ░░░░  ░░░░  ░░░░
Murmeltiere  ████  ▓▓▓▓! ░░░░  ░░░░  ░░░░  ░░░░
```

- `████` gelöst (mit Minutenzahl in der Zelle)
- `▓▓▓▓` aktuell dran, `!` = Warnsignal (siehe B)
- `░░░░` noch nicht erreicht

Darunter ein **Klassen-Balken** „wo steht die Klasse": wie viele Teams sind bei welcher Etappe. Damit siehst du auf einen Blick, ob die Klasse auseinanderläuft.

**Restzeit** gross und sekundengenau oben (heute nur minutengenau und sie aktualisiert sich nur alle 8 Sekunden, weil `LiveBoard.tsx:19-23` keinen eigenen Ticker hat).

## B. Support-Erkennung: wer hat Mühe?

Drei Signale pro Team, kombiniert zu einer Ampel:

1. **Verweildauer in der aktuellen Etappe** = jetzt minus Zeitstempel der letzten gelösten Etappe. Ab 15 Minuten gelb, ab 25 Minuten rot.
2. **Hinweis-Stufe**: Stufe 3 ist die Auflösung. Wer sie zieht, kam nicht weiter — starkes Signal, heute nur als Gesamtzahl sichtbar.
3. **Rückstand zur Klasse**: mehr als eine Etappe hinter dem Median.

Rote Teams stehen oben in einer eigenen Liste „Braucht evtl. Hilfe" mit Etappe, Dauer und gezogenen Hinweisen — damit du gezielt hingehen kannst statt zu raten.

## C. Datenauswertung für die Masterarbeit

### C1. Wegzeit messbar machen (neues Ereignis)

Neues Ereignis `stage_scanned` mit `stage` und `at`, ausgelöst beim QR-Scan. Dann gilt pro Etappe:

- **Rätselzeit** = `durationSec` (wie heute)
- **Wegzeit** = `stage_scanned(n)` − `stage_solved(n−1)`

Damit ist „viel zu viel Wegzeit" mit Zahlen belegbar, getrennt pro Streckenabschnitt.

### C2. Hearing-Fehlversuche erfassen

Neues Ereignis `hearing_attempt` (`question`, `correct`, `attempt`), das bei **jedem** Versuch geschrieben wird. Die Punktelogik bleibt unverändert, weil sie weiterhin nur `hearing_answer` auswertet. So siehst du pro Frage, wie oft falsch geantwortet wurde — die Grundlage für „Frage 7 war zu schwer".

### C3. Auswertungsansicht erweitern

Heute zeigt `ReportPanel.tsx` nur Mittelwerte. Ergänzt wird pro Etappe:

- **Median, Minimum, Maximum** neben dem Mittelwert (bei kleinen Klassen ist der Median belastbarer)
- **Rätselzeit vs. Wegzeit** getrennt
- **Hinweisquote**: Anteil der Teams, die auf dieser Etappe Stufe 1 / 2 / 3 gezogen haben
- **Schwierigkeits-Einordnung** in Klartext: „E3 zu schwer — 80 % brauchten die Auflösung", „E4 zu leicht — Ø 4 min, keine Hinweise"

Pro Hearing-Frage eine Zeile mit Fehlerquote über alle Teams und Versuche.

### C4. Zwei Exporte statt einem

1. **Team-CSV** (wie heute, erweitert um Wegzeiten, Median-Vergleich, Hinweisstufen).
2. **Ereignis-CSV** neu: eine Zeile pro Ereignis mit `team`, `typ`, `etappe`, `stufe`, `richtig`, `zeitstempel`, `sekunden`. Das ist das Rohdatenformat für SPSS, R oder Excel-Pivot — ohne dieses Long-Format ist keine seriöse statistische Auswertung möglich.

Beide Exporte mit Option **„ohne Namen"**: Teilnehmendennamen sind Personendaten. Statt Klarnamen dann `Team-01`, `Team-02` — für eine Masterarbeit in der Regel Voraussetzung.

## Technische Details

**Migration (nötig):** `round_push_events` hat eine feste Typenliste (`'stage_solved','badge_earned','hint_revealed','hearing_answer'`). Neue Typen würden stillschweigend verworfen. Die Funktion wird um `'stage_scanned'` und `'hearing_attempt'` erweitert. Keine Schemaänderung an Tabellen, keine bestehenden Daten betroffen.

**Server:** `src/lib/rounds.server.ts` — `buildReport` liefert pro Etappe zusätzlich `solvedAt`, `scannedAt`, `travelMin` sowie `hintLevels`, `lastEventAt` und die Rohereignisse für den Long-Export. `computeScore` bleibt unverändert (ignoriert die neuen Typen).

**Client-Ereignisse:** `src/lib/score-events.ts` erhält `recordStageScanned` und `recordHearingAttempt`; Aufrufe in `src/lib/progress.ts` (`recordStageScan`) und `src/routes/finale.tsx`.

**Frontend:** neue Komponente `src/components/teacher/ProgressMatrix.tsx` (Matrix + Klassenbalken + Ampel); `LiveBoard.tsx` nutzt sie, plus Sekundenticker; `ReportPanel.tsx` um Median/Wegzeit/Hinweisquote/Frageanalyse und zweiten Export erweitert; `useRoundReport` setzt `loading` nur beim ersten Laden (dreht heute dauernd).

**Unverändert:** Punkteberechnung, Badges, Timer, Spielablauf der Schülerinnen und Schüler.

## Wichtig zur Datenlage

Die neuen Ereignisse werden erst ab der nächsten gespielten Runde erhoben. Die zwei bestehenden Runden liefern Wegzeit und Hearing-Fehlversuche rückwirkend nicht. Wenn du für die Masterarbeit Daten erheben willst, sollte das vor dem ersten Klassendurchgang stehen.
