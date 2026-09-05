# Neuer Abschnitt «Nachrichten» im Lehrer-Dashboard

Alles Kommunikative bekommt einen eigenen Reiter: was du den Gruppen geschrieben hast und was die Gruppen bei dir gemeldet haben – mit genug Kontext, damit du sofort weisst, wo eine Gruppe steht.

## Was du sehen wirst

Neuer Reiter «Nachrichten» neben Vorbereiten, Lobby, Live und Auswertung.

Oben: Schreiben (wie bisher) – Zielgruppe wählen, Text, Senden, darunter die Liste des Gesendeten mit Uhrzeit, Empfänger und «gelesen 3/5».

Darunter: **Meldungen der Gruppen**, neueste zuerst. Jede Meldung zeigt
- Gruppenname und Uhrzeit («vor 4 Min»),
- den Text der Gruppe, falls sie einen geschrieben hat,
- den Spielstand im Klartext: z. B. «Etappe 3 · Widnauer Riet · am Rätsel seit 12 Min» oder «unterwegs zu Etappe 4 seit 7 Min»,
- ob schon Hinweise genutzt wurden («Hinweis 2 genutzt», «Auflösung genutzt») und wie viele Etappen gelöst sind,
- eine Schaltfläche «Antworten», die das Schreibfeld oben mit dieser Gruppe als Empfänger vorbereitet, und «Erledigt», die die Meldung ausgraut.

Der Ton ist bewusst ruhig: Über der Liste steht «Meldungen sind kein Notfall – die Gruppen warten auf eine Antwort, nicht zwingend auf deinen Besuch.» Auch der Text im Hilfe-Knopf der Gruppen wird entsprechend angepasst, damit klar ist, dass eine Antwort per Nachricht kommt und ein Besuch nur auf Absprache erfolgt.

Die Liste aktualisiert sich alle 15 Sekunden. Neue, noch nicht erledigte Meldungen sind farblich markiert; der Reiter «Nachrichten» zeigt die Anzahl offener Meldungen als Zähler.

## Technische Umsetzung

- `src/routes/lehrer.$code.tsx`: neuer Step `messages` in `STEPS`; der bestehende `useRoundReport`-Abruf (bisher nur für Lesebestätigungen im Live-Schritt) läuft auch in diesem Schritt und liefert `teams` inkl. `helpRequests`, `currentStage`, `phase`, `phaseSince`, `hintsByStage`, `stages`. `MessagePanel` wandert vom Live-Schritt in den neuen Reiter (im Live-Schritt bleibt nur ein kurzer Hinweis mit Link auf den Reiter).
- Neue Komponente `src/components/teacher/HelpFeed.tsx`: baut aus `report.teams` eine flache, nach Zeit sortierte Liste aller `helpRequests`; Kontextzeile über die bestehenden Helfer aus `ProgressMatrix.tsx` (`COL_LABEL`, Phase/Minuten-Logik aus `assessTeams`) – dafür `COL_LABEL` und `assessTeams` weiterverwenden statt Logik zu duplizieren.
- «Erledigt» wird lokal im `localStorage` gespeichert (Schlüssel `mm.teacher.help.done`, Liste von Ereignis-IDs) – keine Datenbankänderung nötig.
- `MessagePanel` erhält optionale Props `initialTarget` und einen Callback, damit «Antworten» die Zielgruppe vorwählt; Zustand hebt in den neuen Reiter (gemeinsame Eltern-Komponente).
- Text im Hilfe-Dialog `src/components/case-file/HelpButton.tsx` anpassen: Antwort kommt als Nachricht, Besuch nur nach Absprache.
