# Fixes A, C, F und G umsetzen

Ausgewählt aus dem Befund: Hinweis-Schlüssel, Zeitbudget, Texte, Touch-Ziele. Fix B (Hearing bei Zeitablauf), D (Reset/Runde) und E (Cheat-Code) bleiben bewusst offen.

## Fix A — Hinweis-Speicher richtig zuordnen

Etappe 1 schreibt heute in den Speicher von Etappe 3, Etappe 3 in den von Etappe 2. Das wird korrigiert:

- `src/routes/etappe-1.tsx` (Zeile 434): `storageKey` → `akte-001-hints-start`
- `src/routes/etappe-3.tsx` (Zeile 348): `storageKey` → `akte-003-hints-start`

Damit stimmen wieder: Hinweis-Timer pro Etappe (3/6/9 Minuten), Punktabzug pro Etappe, die Anzeige „x Hinweise“ in der Übersicht und das Badge „Solo-Spurensicherung“ (wird künftig nur noch bei echt hinweisfreier Lösung vergeben). Laufende Spiele starten bei diesen zwei Etappen mit frischem Hinweis-Timer — kein Datenverlust an Punkten oder Badges.

## Fix C — Zeitbudget überall respektieren

Die Lehrperson kann 15–240 Minuten setzen. Heute sind an drei Stellen 90 Minuten hart codiert:

- `src/components/case-file/StartTimerOverlay.tsx`: Countdown startet beim tatsächlichen Budget statt fix 90:00, und der Satz nennt die reale Minutenzahl.
- `src/components/case-file/IntroScreen.tsx` (Brief-Dialog): „In 90 Minuten entscheidet der Gemeinderat“ → dynamische Minutenzahl.
- `src/lib/score-events.ts`: Punkteberechnung nutzt das Budget der Runde statt der Konstante `SCORE_BUDGET_MIN` (Budget wird lokal aus dem gespeicherten Rundenwert gelesen, um Ring-Importe zu vermeiden; Standard bleibt 90).

## Fix F — Texte und Metadaten

- `src/routes/__root.tsx`: Titel „Wo ist Maya?“ → „Speicher, Majas Ermittlung“; englische Vorlagen-Beschreibungen und das Platzhalter-Vorschaubild entfernen; `lang="en"` → `lang="de-CH"`.
- `src/components/case-file/HintSystem.tsx`: „Mayas Hinweise“ → „Majas Hinweise“, „Schließen“ → „Schliessen“, `aria-label` „Tipp-System“ → „Hinweis-System“, „Alle Tipps freigeschaltet“ → „Alle Hinweise freigeschaltet“.
- Einheitlich „Hinweis“ statt „Tipp“: Labels „Tipp 1/Tipp 2“ → „Hinweis 1/Hinweis 2“ in `HintSystem.tsx` (Standardhinweise und Zeitleiste) sowie in `etappe-1.tsx` bis `etappe-5.tsx`. „Auflösung“ bleibt als dritte Stufe.
- `src/components/case-file/GruenerMarkt.tsx`: „Warenkorb schließen“ → „schliessen“; `BadgeToast.tsx`-Kommentar „schließt“ → „schliesst“.

## Fix G — Touch-Ziele und Überlauf

- `src/routes/index.tsx`: Menü-Icon-Button von 36 px auf 44 px (`h-11 w-11`).
- Weitere Icon-Buttons unter 44 px in `HintSystem.tsx` und `GruenerMarkt.tsx` auf mindestens 44 px anheben (Schliessen-Buttons mit grösserer Trefffläche, Optik unverändert).
- Schritt-Leisten der Etappen: bestehende horizontale Scrollfläche beibehalten, aber sicherstellen, dass keine Beschriftung aus dem Rahmen läuft.

Keine Änderungen an Punkteformeln, Badge-Kriterien, Storyline-Inhalten oder der Datenbank.
