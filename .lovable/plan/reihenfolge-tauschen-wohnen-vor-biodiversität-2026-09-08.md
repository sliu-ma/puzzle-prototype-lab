# Reihenfolge tauschen: Wohnen vor Biodiversität

Neue Reihenfolge: 1 Mobilität, 2 Konsum, **3 Wohnen (Jakobs Haus)**, **4 Biodiversität (Wald-Lichtung)**, 5 Energie, dann Hearing.

Die gedruckten QR-Codes bleiben unverändert: die Zeichenfolge wandert mit dem Inhalt mit. Der Code beim Haus öffnet neu Etappe 3, der im Wald Etappe 4.

## Konkrete Text-Anpassungen (drei Übergänge)

Die Erzählfäden hängen nur an drei Stellen an der Reihenfolge. Glücklicherweise passt die Logik sogar besser: die Holzkiste, die heute am Forsthaus die Stromrechnungen enthält, kann nach dem Tausch die **Schlüsselkarte fürs Wasserkraftwerk** enthalten, das Zahlenschloss öffnet also direkt den Weg zu Marlene.

### 1. Ende Etappe 2 (Konsum), Maja bringt die Einkäufe ins Haus

Heute: Titel „Zur Waldlichtung.", Bon-Text: „Geh zurück zur Lichtung im Wald. Dort wartet mein Notizbuch auf dich."

Neu (Vorschlag): Titel **„Zurück ins Haus."**, Text:

> Maja packt die Einkäufe in die Taschen und bringt sie zu Jakobs Haus. Kaum hat sie die Taschen in der Küche abgestellt, fällt der Strom aus. Auf dem Küchentisch liegt eine Zeichnung des Hauses und ein kurzer Zettel von Jakob:
> „Der Strom ist ausgefallen, weil das Haus zu viel auf einmal zieht. Finde heraus, welche Massnahmen am meisten Energie sparen, dann springt die Sicherung wieder an."

### 2. Ende Etappe 3 (Wohnen), neu Wegweiser zur Wald-Lichtung

Heute: Titel „Zum Wasserkraftwerk.", Text mit Schlüsselkarte im Sicherungskasten → Marlene.

Neu (Vorschlag): Titel **„Zur Wald-Lichtung."**, Text:

> Im Sicherungskasten steckt ein Zettel:
> „Beeil dich. Geh zurück zur Lichtung im Wald, dort soll gerodet werden. Beim Forsthaus liegt mein Notizbuch. Man wird dich brauchen."

Hinweistext darunter: „In Etappe 4 sortierst du die Tiere der Lichtung und knackst den Code von Jakobs Kiste."

### 3. Ende Etappe 4 (Biodiversität), Kiste enthält neu die Schlüsselkarte

Heute: Titel „Zurück ins Haus.", im Forsthaus liegt eine Holzkiste mit alten Strom- und Heizrechnungen („Im Haus wartet der nächste Hinweis").

Neu (Vorschlag): Titel **„Zum Wasserkraftwerk."**, Text:

> In der Kiste, die du gerade geöffnet hast, liegen eine Schlüsselkarte und ein Brief:
> „Du hast fast alles gefunden. Mit dieser Karte gelangst du ins alte Wasserkraftwerk. Dort wartet Marlene mit den letzten Unterlagen."

(Dieser Brief ist der heutige Text aus dem Haus, er zieht einfach um.)

Die Briefing-Texte zu Beginn der beiden Etappen (Zeichnung auf dem Küchentisch / Notizbuch beim Forsthaus) bleiben **unverändert**, sie hängen nicht von der Reihenfolge ab. Dasselbe gilt für die Rätsel und Fachinputs selbst.

## Weitere Punkte

- **Uhrzeiten in den Notizen.** Die eingefrorenen Uhrzeiten in den Kopfzeilen wandern mit, damit die Zeitlinie weiter aufsteigend bleibt.
- **Wegzeiten / Laufweg.** Der Weg Konsum → Haus → Wald → Wasserkraftwerk sollte örtlich Sinn machen. Wenn die Distanz Haus → Wald deutlich länger ist, lohnt sich eine Anpassung des Zeitbudgets bzw. ein Hinweis im Briefing.
- **Hearing.** Die zehn Fragen werden umsortiert: Fragen 5/6 Wohnen, 7/8 Biodiversität. Themenzuordnung und Auswertung passen sich mit an.
- **Aussenmaterial (nicht im Spiel).** Deine Postenkarten/Laufblätter und die Reihenfolge der Ausdrucke musst du selber tauschen; die QR-Codes bleiben gleich.

## Was automatisch mitgeht

- Übersicht auf der Startseite (Etappenliste, Reihenfolge, Freischaltung)
- Punkte, Abzeichen und Hinweis-Zeitplan pro Etappe
- Lehrer-Dashboard: Live-Matrix, Statuszeilen, Klassenverteilung, Auswertung, Hilferuf-Kontext, CSV-Export
- Seitentitel und Suchmaschinen-Angaben der beiden Etappen

## Technische Umsetzung

- `src/routes/etappe-3.tsx` / `src/routes/etappe-4.tsx`: Inhalte tauschen. Wohnen-Inhalt (EnergyGame, Wohnen-Charts, Hinweise, Token `Wb6Vc4Hn1ZqYpMr8Js3F`) nach `etappe-3`, Biodiversität-Inhalt (Polaroids/CodeLock, Bio-Charts, Hinweise, Token `Mn7YxQ2pVe9TbR4Ks0Lh`) nach `etappe-4`. Dabei mitwandern: `StageGate stage`, `QRGate stage/title/label`, `useSuccessBurst stageNr`, `StageScoreRecap stage`, `HintSystem stage`, Kopf- und Fusszeilen-Labels, Teaser auf die Folgeetappe.
- Speicher-Schlüssel: `storageKey` und `usePersistentState`-Keys neu an die Etappennummer binden (`akte-003-unlocked` = Wohnen usw.), damit `getStageHintsUsed` (`akte-00${stage}-hints-start-revealed` in `src/lib/badges.ts`) und die Hinweiszählung stimmen. Alte Schlüssel werden nicht migriert, laufende Runden auf einem Gerät müssten neu starten.
- `src/lib/progress.ts`: `STAGES`-Einträge 3 und 4 tauschen (Ort/Thema/Route).
- `src/components/teacher/ProgressMatrix.tsx`: `COL_NAME` 3 → „Wohnen", 4 → „Biodiversität".
- `src/routes/finale.tsx`: Fragenblöcke F5 bis F8 umsortieren (Wohnen vor Biodiversität), `thema`-Felder bleiben inhaltlich korrekt.
- `src/components/teacher/ReportPanel.tsx`: Hearing-Fragenlabels 4 bis 7 an die neue Fragenreihenfolge anpassen.
- `src/lib/badges.ts`: Beschreibung des Wohnen-Abzeichens auf die neue Etappennummer prüfen; Vergabelogik bleibt.
- Keine Änderungen an Datenbank, Punkteformel oder Zugriffsregeln. Bereits gespielte Runden in der Datenbank behalten die alte Bedeutung von Etappe 3/4, die Auswertung alter Runden wäre danach falsch beschriftet.
