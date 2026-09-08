# Reihenfolge tauschen: Wohnen vor Biodiversität

Neue Reihenfolge: 1 Mobilität, 2 Konsum, **3 Wohnen (Jakobs Haus)**, **4 Biodiversität (Wald-Lichtung)**, 5 Energie, dann Hearing.

Die gedruckten QR-Codes bleiben unverändert: die Zeichenfolge wandert mit dem Inhalt mit. Der Code beim Haus öffnet neu Etappe 3, der im Wald Etappe 4.

## Was du inhaltlich anpassen musst (Texte im Spiel)

1. **Übergang nach Etappe 2 (Konsum).** Der Ausblick am Ende von Etappe 2 zeigt heute auf die Wald-Lichtung; neu auf Jakobs Haus.
2. **Ende Wohnen → Biodiversität.** Der Abschlusstext bei Jakobs Haus verweist neu auf die Wald-Lichtung statt aufs Wasserkraftwerk.
3. **Ende Biodiversität → Energie.** Der Abschlusstext im Wald verweist neu aufs alte Wasserkraftwerk statt auf Jakobs Haus.
4. **Erzähl-Logik prüfen.** Falls in einem Text ein Gegenstand oder Hinweis aus dem Wald im Haus wieder auftaucht (oder umgekehrt), muss die Begründung getauscht werden – das ist die einzige Stelle, wo du eventuell einen Satz neu schreiben musst. Ich prüfe alle Briefing- und Abschlusstexte der beiden Etappen und melde dir jede Stelle, die inhaltlich nicht einfach umgehängt werden kann.
5. **Uhrzeiten in den Notizen.** Die eingefrorenen Uhrzeiten in den Kopfzeilen wandern mit, damit die Zeitlinie weiter aufsteigend bleibt.
6. **Wegzeiten / Laufweg.** Der Weg Konsum → Haus → Wald → Wasserkraftwerk sollte örtlich Sinn machen. Wenn die Distanz Haus → Wald deutlich länger ist, lohnt sich eine Anpassung des Zeitbudgets bzw. ein Hinweis im Briefing.
7. **Hearing.** Die zehn Fragen werden umsortiert: Fragen 5/6 Wohnen, 7/8 Biodiversität. Themenzuordnung und Auswertung passen sich mit an.
8. **Aussenmaterial (nicht im Spiel).** Deine Postenkarten/Laufblätter und die Reihenfolge der Ausdrucke musst du selber tauschen; die QR-Codes bleiben gleich.

## Was automatisch mitgeht

- Übersicht auf der Startseite (Etappenliste, Reihenfolge, Freischaltung)
- Punkte, Abzeichen und Hinweis-Zeitplan pro Etappe
- Lehrer-Dashboard: Live-Matrix, Statuszeilen, Klassenverteilung, Auswertung, Hilferuf-Kontext, CSV-Export
- Seitentitel und Suchmaschinen-Angaben der beiden Etappen

## Technische Umsetzung

- `src/routes/etappe-3.tsx` / `src/routes/etappe-4.tsx`: Inhalte tauschen. Wohnen-Inhalt (EnergyGame, Wohnen-Charts, Hinweise, Token `Wb6Vc4Hn1ZqYpMr8Js3F`) nach `etappe-3`, Biodiversität-Inhalt (Polaroids/CodeLock, Bio-Charts, Hinweise, Token `Mn7YxQ2pVe9TbR4Ks0Lh`) nach `etappe-4`. Dabei mitwandern: `StageGate stage`, `QRGate stage/title/label`, `useSuccessBurst stageNr`, `StageScoreRecap stage`, `HintSystem stage`, Kopf- und Fusszeilen-Labels, Teaser auf die Folgeetappe.
- Speicher-Schlüssel: `storageKey` und `usePersistentState`-Keys neu an die Etappennummer binden (`akte-003-unlocked` = Wohnen usw.), damit `getStageHintsUsed` (`akte-00${stage}-hints-start-revealed` in `src/lib/badges.ts`) und die Hinweiszählung stimmen. Alte Schlüssel werden nicht migriert – laufende Runden auf einem Gerät müssten neu starten.
- `src/lib/progress.ts`: `STAGES`-Einträge 3 und 4 tauschen (Ort/Thema/Route).
- `src/components/teacher/ProgressMatrix.tsx`: `COL_NAME` 3 → „Wohnen", 4 → „Biodiversität".
- `src/routes/finale.tsx`: Fragenblöcke F5–F8 umsortieren (Wohnen vor Biodiversität), `thema`-Felder bleiben inhaltlich korrekt.
- `src/components/teacher/ReportPanel.tsx`: Hearing-Fragenlabels 4–7 an die neue Fragenreihenfolge anpassen.
- `src/lib/badges.ts`: Beschreibung des Wohnen-Abzeichens auf die neue Etappennummer prüfen; Vergabelogik bleibt.
- Keine Änderungen an Datenbank, Punkteformel oder Zugriffsregeln. Bereits gespielte Runden in der Datenbank behalten die alte Bedeutung von Etappe 3/4 – die Auswertung alter Runden wäre danach falsch beschriftet.
