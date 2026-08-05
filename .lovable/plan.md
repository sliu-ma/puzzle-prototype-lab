# Punktevergabe und Leaderboard nachschärfen

## 1. Hinweise: Prozent statt Deckel

Heute wirkt ein genutzter Hinweis nur als Obergrenze (90 % / 75 % / 50 % von 1000). Wer langsam war, verliert dadurch gar nichts, weil die Zeitpunkte schon unter der Grenze liegen.

Neu: Die Etappenpunkte aus der Zeit werden direkt mit dem Prozentsatz des höchsten genutzten Hinweises multipliziert.

- Kein Hinweis: 100 %
- Hinweis 1: 90 %, Hinweis 2: 75 %, Hinweis 3 (Auflösung): 50 %
- Beispiel: 700 Zeitpunkte mit Hinweis 2 ergeben 525 statt heute 700.
- Der Abzug erscheint wie bisher als „Abzug durch Hinweise" in der Aufschlüsselung.

## 2. Hearing: Punkte erst beim Bestehen

Heute wird jede Hearing-Antwort sofort als Punkt-Ereignis gespeichert. Wird das Hearing wegen zu vieler Fehler wiederholt, bleiben die Punkte des ersten Versuchs stehen.

Neu:

- Antworten werden während des Hearings nur lokal im Versuch geführt, ohne Punkte.
- Erst wenn das Hearing bestanden ist, werden die Antworten des bestandenen Versuchs als Punkte verbucht (richtig +100, falsch −50).
- Bei einem Fehlversuch verfallen die Antworten vollständig; der neue Versuch startet punktemässig bei null.
- Die Punktekachel zeigt während des Hearings entsprechend noch keine Hearing-Punkte.

## 3. Zeit am Schluss einfrieren

Der Schlussbildschirm rechnet die benötigte Zeit noch gegen die aktuelle Uhrzeit. Wer später zurückkommt und nochmals nachschaut, sieht eine längere Zeit.

Neu: Es zählt der gespeicherte Abschluss-Zeitstempel; die Zeit bleibt damit für immer gleich. Nur falls kein Abschluss-Zeitstempel vorhanden ist, wird wie bisher gerechnet.

## 4. Leaderboard verständlicher

Heute steht oben gross das führende Team, was leicht als eigener Punktestand missverstanden wird.

Neu:

- Kopfbereich zeigt **immer das eigene Team**: Teamname, eigener Rang gross („Rang 3 von 7"), eigene Punkte, dazu eine kleine Zeile „Rückstand auf Platz 1: 480 Punkte" (bzw. „Ihr führt").
- Direkt darunter eine Zeile mit der aktuellen Spitze in klein: „Spitze: Team X · 3200 Punkte".
- In der Rangliste bleibt die eigene Zeile hervorgehoben und mit „ihr" markiert; sie wird bei langen Listen automatisch in den Sichtbereich gescrollt.
- Klarer Titel über der Liste: „Rangliste · Runde <Code>" bzw. „Einzellauf".
- Die Outro-Variante übernimmt denselben Kopf in kompakter Form.

## Technisch

- `src/lib/score.ts`: in `computeScore` den Hinweis-Deckel durch einen Multiplikator (`HINT_FACTOR`) ersetzen; `hintPenalty` bleibt als Differenz roh minus effektiv.
- `src/routes/finale.tsx`: `recordHearingAnswer` aus `handleResult` entfernen, Antworten des Versuchs im State halten und im `status === "won"`-Effekt gebündelt buchen; Ereignis-IDs pro Versuch (z. B. `hearing_answer:<versuch>:<frage>`) damit die Idempotenz nicht den Fehlversuch festschreibt. Zeitchip auf `getEndTs()` umstellen.
- `src/components/case-file/Leaderboard.tsx`: Kopfbereich auf „eigenes Team" umbauen, Spitzen-Zeile, Rückstandsberechnung, Scroll-in-View der eigenen Zeile; `variant="outro"` nutzt den kompakten Kopf.
- Keine Datenbankänderungen; alle Farben über bestehende Tokens.
