# Wege-Zuteilung reparieren und QR-Druck auf die Codes beschränken

## Was ich in der aktuellen Runde sehe

Runde `NBZBK` hat 4 Wege und eine Verzweigungs-Einstellung, ist aber bereits gestartet. Die einzige angemeldete Gruppe («Spürnasen») hat noch keinen Buchstaben, und sie hat sich erst nach dem Start angemeldet. Der Knopf «Wege zufällig verteilen» steht heute nur im Wartezimmer, also vor dem Start. Nach dem Start gibt es keine Möglichkeit mehr, Wege zu vergeben, und wer später dazukommt, bleibt ohne Buchstaben.

Beim Drucken gibt es bisher überhaupt keine Druck-Regeln. Darum schickt der Knopf «Drucken» die komplette Lehrerseite mit Reitern, Matrix und Bedienelementen an den Drucker.

## Was ich ändere

**Zuteilung**
- Der Bereich «Wege und Material» inklusive Verteil-Knopf, Diagramm und Druckliste ist auch während der laufenden Runde erreichbar, nicht nur im Wartezimmer.
- Gruppen, die sich nach dem Verteilen anmelden, erhalten automatisch den Weg mit den wenigsten Gruppen.
- Pro Gruppe lässt sich der Buchstabe zusätzlich von Hand ändern, falls vor Ort umgestellt werden muss.
- Klare Rückmeldung nach dem Verteilen («7 von 7 Gruppen haben einen Weg») und eine verständliche Fehlermeldung, falls es scheitert.

**Druck**
- «Drucken» gibt nur noch die QR-Blätter aus: pro Station ein Blatt mit Posten, Wegbuchstaben und Code, saubere Seitenumbrüche, weisser Hintergrund.
- Alles andere auf der Seite wird beim Drucken ausgeblendet.

## Technische Umsetzung

- `src/components/teacher/LobbyPanel.tsx`: Wege-Abschnitt aus der Wartezimmer-Bedingung lösen, sodass er auch bei `status === "running"` gerendert wird (im Lobby- und Live-Schritt), plus Buchstaben-Auswahl je Team.
- `src/routes/lehrer.$code.tsx`: den Wege-Abschnitt im Live-Schritt einbinden.
- Neue Serverfunktion `teacherSetTeamVariant` in `src/lib/rounds.functions.ts` und passende SQL-Funktion `teacher_set_team_variant(p_password_hash, p_team_id, p_variant)` (Validierung gegen `path_count` der Runde).
- Migration von `round_join`: ist in der Runde bereits mindestens ein `variant` gesetzt, bekommt das neue Team den am wenigsten vergebenen Buchstaben aus `path_count`.
- `src/components/teacher/QRPrintList.tsx`: Druckliste in einen Container `data-print-area` legen; in `src/styles.css` einen `@media print`-Block ergänzen, der alles ausser diesem Container versteckt (`body > * { display: none }`-Muster über eine `printing`-Klasse am `html`-Element), Kacheln mit `break-inside: avoid` und Rasterbreite für A4 setzt.
- Keine Änderungen an Tokens, Punkteformel oder physischen QR-Codes.
