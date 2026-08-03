# Live-Punktesystem (lokal, ereignisbasiert)

Ziel: Ein Punktestand, der sich während des Spiels live verändert, jederzeit reproduzierbar aus gespeicherten Ereignissen berechnet wird und später ohne Umbau an eine Datenbank angebunden werden kann.

## 1. Ereignis-Log als einzige Wahrheit

Jede punkterelevante Aktion schreibt ein Ereignis in eine Liste im Browser-Speicher (Schlüssel `maya-score-events`). Der Punktestand wird nie direkt gespeichert, sondern immer aus dieser Liste berechnet. Nach einem Reload ergibt dieselbe Liste denselben Stand.

Ereignisse:

| Ereignis | Wann | Gespeicherte Daten |
| --- | --- | --- |
| `stage_solved` | in `completeStage(n)` | Etappe, Dauer in Sekunden, genutzte Hinweisstufe |
| `badge_earned` | in `awardBadge(id)` | Badge-ID |
| `hint_revealed` | beim Aufdecken eines Hinweises | Etappe, Stufe 1–3 |
| `hearing_answer` | pro Frage im Hearing | richtig/falsch, Fragen-Nummer |

Jedes Ereignis erhält Zeitstempel und eine eindeutige ID (idempotent: dasselbe Ereignis kann nicht doppelt zählen). Beim Zurücksetzen des Spiels wird die Liste mit allen `maya-`-Schlüsseln entfernt.

## 2. Punkte-Regeln

**Etappe gelöst (1–5): 600 bis 1000 Punkte**
- Basis 1000 Punkte, sinkt linear mit der Bearbeitungszeit der Etappe.
- Referenz: 90-Minuten-Budget / 5 Etappen = 18 Minuten pro Etappe (prozentual zum Budget gerechnet, damit eine spätere Änderung auf z. B. 75 Minuten automatisch mitzieht).
- Bis 40 % der Etappenzeit: volle 1000 Punkte. Danach linearer Abfall bis zur Untergrenze 600 Punkte bei 100 % und darüber.

**Hinweis-Deckel pro Etappe**
- Stufe 1 (Nudge): höchstens 90 % der Etappenpunkte.
- Stufe 2 (Tipp): höchstens 75 %.
- Stufe 3 (Lösung): höchstens 50 %.
- Es gilt die höchste genutzte Stufe dieser Etappe. Der Deckel wirkt sofort beim Aufdecken, auch bevor die Etappe gelöst ist.

**Badges**
| Badge | Punkte |
| --- | --- |
| Blitzermittlerin (< 60 min) | 500 |
| Kalter Kaffee, klarer Kopf (< 3 Hinweise) | 400 |
| Solo-Spurensicherung | 300 |
| Perfekter Wocheneinkauf | 300 |
| Nase für die richtige Spur | 300 |
| Auf den letzten Drücker | 250 |

**Hearing**
- Richtige Antwort: +100 Punkte.
- Falsche Antwort: ,50 Punkte.
- Der Gesamtstand fällt nie unter 0.

## 3. Anzeige

**Punkteanzeige neben dem Timer (alle Seiten)**
- Kleine Kachel links neben dem bestehenden Timer, gleiche Papier-Optik.
- Der Wert zählt bei jeder Änderung animiert hoch bzw. runter.
- Über der Kachel erscheint kurz ein farbiger Zuschlag: „+1000" in ruhiger Farbe, „,50" in Warnfarbe. Mehrere gleichzeitige Änderungen erscheinen nacheinander.
- Antippen öffnet eine kompakte Aufschlüsselung: Punkte pro Etappe, Badge-Punkte, Hearing-Punkte, Abzüge durch Hinweise.

Der bestehende Timer bleibt unverändert; auf schmalen Displays teilen sich Timer und Punkte eine Zeile.

## 4. Vorbereitung für die Datenbank

- Die Ereignis-Liste hat genau die Form, die später als Tabellenzeilen gespeichert werden kann (Lauf-ID, Typ, Nutzlast, Zeitstempel).
- Die Berechnung liegt in einer eigenen, reinen Funktion ohne Browser-Zugriff, damit sie später unverändert auf dem Server laufen kann.
- Ein Leaderboard über mehrere Teams folgt in einem zweiten Schritt, sobald die Ereignisse serverseitig landen. In diesem Schritt wird nur der aktuelle Lauf angezeigt.

## Technische Hinweise

- Neu: `src/lib/score-events.ts` (Ereignis-Log lesen/schreiben, `score:changed`-Event) und `src/lib/score.ts` (reine Funktion `computeScore(events, budgetMin)` mit Aufschlüsselung).
- Neu: `src/components/case-file/ScoreCounter.tsx` (Kachel, Zähl-Animation, Zuschlag-Popup, Detail-Dialog), gerendert neben `GlobalTimer` in `src/routes/__root.tsx`.
- Ereignis-Aufrufe: `completeStage` in `src/lib/progress.ts`, `awardBadge` in `src/lib/badges.ts`, Aufdecken in `src/components/case-file/HintSystem.tsx`, Antwortprüfung in `src/routes/finale.tsx`.
- Etappendauer kommt aus den bereits vorhandenen Zeitstempeln (`getStageDurationMin`/`getStageDoneTs`), das Zeitbudget aus `TIMER_DURATION_MIN`.
- Alle Farben über bestehende Design-Tokens.
