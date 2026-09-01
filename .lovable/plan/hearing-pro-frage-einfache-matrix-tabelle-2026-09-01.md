# Hearing pro Frage: einfache Matrix-Tabelle

## Ziel
Die Sektion **„Hearing pro Frage"** im Auswertungs-Panel (`src/components/teacher/ReportPanel.tsx`) wird durch **eine einzige, einfache Matrix-Tabelle** ersetzt: Zeilen = Teams, Spalten = die 10 Hearing-Fragen (F1–F10), Zellen = richtig (✓) / falsch (✗). Keine Balkendiagramme, keine Pop-ups, keine Prozent-Statistik-Blöcke mehr an dieser Stelle.

## Was ersetzt wird
Aktuell (Zeilen ~1066–1123) zeigt die Sektion:
1. Einen `BarRow`-Balken pro Frage = Anteil falsch im 1. Versuch.
2. Eine Liste von `ClickRow`-Einträgen, die je das `QuestionReportDialog`-Popup öffnen (Fehlerquote, Pro-Gruppe-Auflistung mit Versuchen).

Beides wird entfernt und durch eine einzige Tabelle ersetzt.

## Neue Darstellung
Eine horizontalt scrollbare Tabelle (mobile-first, viele Spalten):

```
Team          F1  F2  F3  F4  F5  F6  F7  F8  F9  F10
Team-01       ✓   ✗   ✓   ✓   –   ✓   ✓   ✗   ✓   ✓
Team-02       ✓   ✓   ✗   ✓   ✓   ✓   ✓   ✓   ✗   ✓
...
Richtig       4   3   4   5   4   5   5   3   4   5
```

- **Kopfzeile:** `Team` + `F1`…`F10`, darunter als kleinere zweite Zeile die Kurzlabels aus `QUESTION_LABEL` (z. B. „Mobilität · Kosten pro km") — gekürzt/abgeschnitten, nur zur Orientierung.
- **Zellen:** gewertet wird der **letzte Versuch** (`a.last`).
  - `✓` = richtig → Farbe `text-primary` (grün).
  - `✗` = falsch → Farbe `text-stamp` (rot), fett.
  - `–` = keine Antwort → `text-muted-foreground`.
  - Optional: ein kleines `·2` hochgestellt, falls >1 Versuch nötig war (zweiter Versuch). Diskret, nicht dominant.
- **Fusszeile „Richtig":** pro Frage die Anzahl Teams, die am Ende richtig lagen (`teamsAnswered - lastWrong`).
- **Horizontal scrollbar** (`overflow-x-auto`), erste Spalte (Teamname) sticky (`sticky left-0 bg-card`), damit man beim Scrollen den Bezug behält.
- Kein Klick, kein Pop-up in dieser Sektion mehr.

## Code-Änderungen (nur `ReportPanel.tsx`)
1. **Neue Komponente `HearingMatrix`** im selben File: baut aus `teams` + `teamAnswers(t)` die Tabelle auf. Nutzt die bestehende `QUESTION_LABEL`-Map und `nameOf` (für Anonymisierung).
2. **Sektion ersetzen:** der Block `Section title="Hearing pro Frage"` (~1066–1117) wird auf den Aufruf `<HearingMatrix teams={teams} nameOf={nameOf} />` reduziert; das `<QuestionReportDialog .../>` (~1119–1123) fällt weg.
3. **Aufräumen:** `QuestionReportDialog`, der `ClickRow`-Listenteil für Fragen, das `BarRow`-Diagramm in dieser Sektion und die `openQuestion`-State-Zeile (~809) werden entfernt, sofern nirgends sonst referenziert. `analyseQuestions` / `hardestQuestion` bleiben **nicht** für diese Sektion gebraucht — entfernen, falls sonst ungenutzt (CSV-Export nutzt `questions` weiterhin, also `analyseQuestions` + `questions`-Variable behalten; nur `hardestQuestion` und die Sektionsnutzung fallen).
4. `BarRow` und `ClickRow` werden in anderen Sektionen (Etappen) weiter verwendet — **nicht** löschen.

## Nicht berührt
- Team-Popup (`TeamReportDialog`) behält seine eigene Hearing-Liste mit Versuchsverlauf — das ist die Detailansicht pro Team und bleibt.
- CSV-Exporte (`exportTeamCsv`, `exportEventCsv`) bleiben unverändert.
- Etappen-Vergleich, Klasse-gesamt-Kacheln, Team-Liste: unverändert.

## Verifikation
- `tsgo` Typecheck ohne Fehler.
- Build OK (`build-errors.log`).
- Im Preview (`/lehrer/CODE` → Auswertung-Tab) Tabelle sichtbar, horizontal scrollbar, sticky Team-Spalte, ✓/✗ korrekt.
