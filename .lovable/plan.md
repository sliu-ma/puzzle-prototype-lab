## Änderung 1 — Frisches Spiel bei „Ermittlungen starten"

Auslöser ist der Submit-Button des Startformulars auf `/` (`StartForm` in `src/routes/index.tsx`).

Vor `registerTeam(name, code)` wird `resetAll()` aufgerufen — der komplette `localStorage` des Spiels wird gelöscht, bevor Teamname, Startzeit etc. neu gesetzt werden.

Damit `resetAll()` wirklich **alles** entfernt (aktuell nur eine Whitelist), wird es in `src/lib/progress.ts` auf Präfix-Löschung umgestellt: alle `localStorage`-Keys mit Präfix `maya-*` oder `akte-*` werden entfernt. Danach das gewohnte `maya-progress`-Event.

Das deckt automatisch ab: `akte-00X-unlocked`, `akte-00X-hints-start`, `akte-00X-hints-start-revealed`, das Intro-Popup-Flag, alle Umschlag-Flags, `maya-team-*`, `maya-current-stage`, `maya-start-ts`, `maya-timer-shown`, `maya-intro-seen`, `maya-clock-*`.

Der bestehende „Spiel zurücksetzen"-Button (unten in der Fortschrittsansicht) nutzt weiterhin dieselbe Funktion — bleibt also ebenfalls sauber.

Ergebnis: jeder Druck auf „Ermittlung starten →" garantiert ein frisches Spiel — Intro-Story, QR-Gates, Hint-Timer, Popup und Umschläge starten neu, egal was vorher im Browser lag.

## Änderung 2 — „Umschlag"-Metapher (genau 5 Umschläge)

Ziel: Schüler:innen sollen klar erkennen, dass Elviras Hinweise in **Umschlägen** stecken, die sie am Ende jedes Rätsels öffnen.

Zählung:
- **Umschlag 1** — Küchentisch, im Intro (Brief).
- **Umschlag 2** — am Ende Etappe 1 (Bahnhof → Dorfladen).
- **Umschlag 3** — am Ende Etappe 2 (Dorfladen → Wald).
- **Umschlag 4** — am Ende Etappe 3 (Wald → Elviras Haus).
- **Umschlag 5** — am Ende Etappe 4 (Haus → Wasserkraftwerk).
- **Kein Umschlag** am Ende von Etappe 5; sie führt direkt ins Hearing.

### Umschlag 1 — `IntroScreen.tsx`, Step „Brief"

Über der Brief-Karte einen sichtbaren Umschlag-Header: `Mail`-Icon + „Umschlag 1 · Küchentisch". Ein Hinweiszeile darunter: „Am Ende jedes Rätsels findest du den nächsten Umschlag — insgesamt 5 Stück."

### Umschläge 2–5 — Akten 1–4 im Step `naechstes`

In `src/routes/akte-003.tsx`, `akte.tsx`, `akte-002.tsx`, `akte-004.tsx` den `PaperCard` im Step `naechstes` als Umschlag stilisieren:
- Header oben: `MailOpen`-Icon + „Umschlag N · <Ort>" (N = 2, 3, 4, 5).
- Kurzer Zusatztext: „Elviras nächster Hinweis — Ort der Etappe [+ Zusatzmaterial, wenn vorhanden]".
- Zusätzlich am **Ende des vorhergehenden Steps** (dort wo bisher „Zur nächsten Etappe →" steht) ein deutliches Hinweisbanner mit `Mail`-Icon: „📩 Jetzt Umschlag N öffnen" direkt am Weiter-Button, damit der Klick als Umschlag-Öffnen erkennbar ist.

### Etappe 5 — `akte-005.tsx`

Kein Umschlag-Styling im Übergang zum Hearing. Der `naechstes`-Step bleibt wie bisher, wird aber sprachlich zum „Weg ins Hearing" (statt Umschlag): kurze Formulierung wie „Zeit für das Hearing — alle Beweise liegen auf dem Tisch."

Keine neue Logik/State — nur Präsentation. `naechstes`-Step bleibt Teil des bestehenden Ablaufs, `completeStage` und Navigation unverändert.

## Änderung 3 — Intro-Popup: nach 3 Min echter Verweildauer, einmalig für die gesamte Sitzung

Aktuell in `HintSystem.tsx` an `INTRO_STORAGE_KEY = "akte-003-hints-start"` gebunden — d. h. wenn Rätsel 1 in unter 3 Minuten gelöst wird, kommt das Popup nie.

Neu:
- Intro-Popup an **kein bestimmtes Rätsel** binden. Trigger: sobald in **irgendeiner** aktiven `HintSystem`-Instanz `elapsedMin >= 3` und Tipp 1 noch nicht aufgedeckt.
- Globales `localStorage`-Flag `maya-hints-intro-shown` (statt akte-spezifisch). Einmal gesetzt → nie wieder in dieser Sitzung.
- Wird durch `resetAll()` (Änderung 1, Präfix `maya-*`) beim nächsten Spielstart wieder gelöscht.

Effekt: Löst ein Team Rätsel 1 in 2 Minuten → kein Popup. Bleibt es dann in Rätsel 2 länger als 3 Minuten → Popup erscheint dort. Erscheint es einmal, kommt es nie wieder.

## Technische Details

Dateien:
- `src/lib/progress.ts` — `resetAll()` auf Präfix-Löschung umstellen.
- `src/routes/index.tsx` — `StartForm.onStart` ruft `resetAll()` vor `registerTeam(...)` auf.
- `src/components/case-file/HintSystem.tsx` — `INTRO_STORAGE_KEY`/`INTRO_FLAG_KEY` entfernen, Bedingung im Effect vereinfachen (`elapsedMin >= 3 && !revealed.has(0) && !localStorage.getItem("maya-hints-intro-shown")`). Beim Dismiss globales Flag setzen.
- `src/components/case-file/IntroScreen.tsx` — Umschlag-1-Header in Step „Brief" + Hinweiszeile („5 Umschläge insgesamt").
- `src/routes/akte-003.tsx`, `akte.tsx`, `akte-002.tsx`, `akte-004.tsx` — Step `naechstes` als Umschlag 2–5 stilisieren; im vorhergehenden Step Banner „Jetzt Umschlag N öffnen".
- `src/routes/akte-005.tsx` — `naechstes`-Step als Hearing-Übergang formulieren, ohne Umschlag-Metapher.

Keine Änderungen an Datenmodell, Hint-Storage, QR-Logik oder Ablaufsteuerung.
