# Zwei neue Badges, eines ersetzt

## 1. Wohnen: „ESP-Punktemaximum“ (wohnen.svg)

- Neues Badge, verliehen in Etappe 4 (Wohnen), wenn beim Prüfen **mindestens 3'750 ESP** innerhalb des Budgets erreicht sind.
- Kriterium-Text: „Hol in der Etappe Wohnen 3'750 ESP oder mehr, ohne das Budget zu sprengen.“
- Punkte: **300** (auf Höhe der anspruchsvollen Badges).

## 2. Hearing-Wiederholung: „Zweiter Anlauf“ (secondtry.svg)

- Badge für Teams, die das Hearing wiederholen mussten und es im zweiten (oder späteren) Versuch bestehen.
- **Punkteregel neu:** Wird das Hearing nicht im ersten Versuch bestanden, gibt es **keine** Hearing-Punkte (weder plus noch minus). Nur das Badge bringt eine kleine Anerkennung von **150 Punkten**.
So lohnt sich absichtliches Durchfallen nicht, und ein Team mit perfektem zweitem Versuch steht nicht besser da als ein Team, das beim ersten Mal besteht.

## 3. „Punktlandung“ ersetzt „Auf den letzten Drücker“ (punktlandung.svg)

- Neues Bild (Bullseye), neuer Titel **„Punktlandung“**, neue Beschreibung.
- Bedingung bleibt: in den **letzten 5 Minuten** der Frist gelöst.
- Der Kriterium-Text nennt das tatsächlich eingestellte Zeitbudget der Runde (z. B. „in den letzten fünf Minuten der 75-Minuten-Frist“), nicht mehr fix 90 Minuten.

## Technisch

- Assets über `lovable-assets` als Pointer anlegen: `src/assets/badge-wohnen.svg.asset.json`, `src/assets/badge-secondtry.svg.asset.json`, `src/assets/badge-punktlandung.svg.asset.json`; `badge-letzten5.svg.asset.json` per `lovable-assets delete` entfernen.
- `src/lib/badges.ts`: zwei neue Einträge (`wohnen-max`, `zweiter-anlauf`); Eintrag `letzte-5-minuten` behält seine ID (damit bereits verliehene Badges und die Punktetabelle stimmen), erhält aber Titel/Bild/Texte der Punktlandung. `criteria` unterstützt den Platzhalter `{budget}`, der in `BadgeShelf.tsx` und `BadgeShowcase.tsx` beim Anzeigen durch `getBudgetMin()` ersetzt wird.
- `src/lib/score.ts`: `BADGE_POINTS` um `wohnen-max: 400` und `zweiter-anlauf: 150` ergänzen. In `computeScore` die Hearing-Punkte nur zählen, wenn der bestandene Versuch der erste war — dazu trägt das Ereignis `hearing_answer` das Feld `attempt`; bei `attempt > 1` ergibt `hearingPoints` 0 (Anzahl richtig/falsch bleibt für die Aufschlüsselung sichtbar).
- `src/lib/score-events.ts`: `recordHearingAnswer` schreibt `attempt` ins Ereignis.
- `src/components/case-file/EnergyGame.tsx`: beim erfolgreichen Prüfen `awardBadge("wohnen-max")`, wenn `totals.energy >= 3750`.
- `src/routes/finale.tsx`: im `status === "won"`-Effekt `awardBadge("zweiter-anlauf")`, wenn `versuch > 1`; Badge-Aufruf für die Punktlandung bleibt unverändert.
- Keine Datenbankänderungen.