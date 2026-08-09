# Befund: Bugs, Lücken und Textfehler im Spiel

Ich habe das ganze Spiel durchgesehen (Fortschritt, Punkte, Badges, Hinweise, Timer, Klassenrunden, Texte, Mobile-UI). Es gibt drei echte Bugs, mehrere Inkonsistenzen und einige Textfehler.

## Kritisch (echte Bugs)

1. **Hinweis-Speicher von Etappe 1 und 3 vertauscht.**
   Etappe 1 nutzt den Hinweis-Schlüssel von Etappe 3, Etappe 3 den von Etappe 2. Folgen: Etappe 3 übernimmt Timer und aufgedeckte Hinweise von Etappe 2 (Hinweise sind dort teils sofort offen), die Hinweis-Punktabzüge landen auf der falschen Etappe, die Anzeige „x Hinweise“ in der Übersicht ist falsch, und das Badge „Solo-Spurensicherung“ (ohne Hinweise gelöst) wird bei Etappe 1 und 3 **immer** vergeben.

2. **Zeit abgelaufen mitten im Hearing = Sackgasse.**
   Läuft die Zeit, während das Hearing läuft, blockiert das Vollbild-Overlay alles. Das Hearing kann nicht mehr abgeschlossen werden; einziger Ausweg ist ein Reset, der Punkte und Badges löscht.

3. **Zeitbudget wird nur halb beachtet.**
   Die Lehrperson kann 15–240 Minuten setzen. Das Start-Popup zeigt aber immer 90:00, der Brief sagt immer „In 90 Minuten“, und die Punkteberechnung rechnet fix mit 90 Minuten Referenz. Bei 60-Minuten-Runden ist beides falsch.

## Wichtig (inkonsistente Zustände)

4. **Reset löscht die Klassenrunden-Bindung.** Ein Reset (auch der nach Zeitablauf) entfernt die Runden-Session, obwohl die Runde serverseitig weiterläuft — Wiederbeitritt kann Doppel-Teams erzeugen.
5. **Cheat-Code KRXZMVBQ** schaltet alle Etappen frei, startet aber den Timer nie: Restzeit zeigt „–“, keine Punkte-Events, Finale gilt als „erledigt“ und ist trotzdem komplett neu spielbar. Zudem ist der Code an zwei Stellen doppelt hart codiert.
6. **Hearing-Wiederholung streicht alle Hearing-Punkte** (nur das Badge bleibt). Vermutlich Absicht — bitte bestätigen, sonst mildern (z. B. 50 %).

## Texte und Metadaten

7. **Alter Name „Maya“ und Vorlagen-Reste im Seitenkopf**: Titel „Wo ist Maya?“, englische Lovable-Beschreibung („Build interactive educational escape rooms…“), Platzhalter-Vorschaubild, sowie `lang="en"` auf einer rein deutschen Seite. Auch das Hinweis-Panel heisst „Mayas Hinweise“.
8. **„ß“ statt „ss“** in drei Bedienelementen („Schließen“, „Warenkorb schließen“) und einem Kommentar.
9. **Begriffe gemischt**: dieselbe Funktion heisst mal „Tipp“, mal „Hinweis“; „Akte“ wird sowohl für Gutachten A–C als auch in der 404-Meldung verwendet.
10. **Kleinere UI-Punkte**: Menü-Icon-Buttons sind 36 px (unter der 44-px-Touch-Empfehlung), einzelne `whitespace-nowrap`-Labels können auf sehr schmalen Handys überlaufen; Etappen und Finale haben Titel und Beschreibung, aber kein eigenes Vorschaubild.

## Vorgeschlagene Umsetzung (in dieser Reihenfolge)

- **Fix A:** Hinweis-Schlüssel korrigieren (Etappe 1 → `akte-001-…`, Etappe 3 → `akte-003-…`) und Badge-/Statistik-Lesepfad gegenprüfen. Bestehende laufende Spiele: alte Schlüssel einmalig migrieren oder ignorieren.
- **Fix B:** Bei Zeitablauf ein laufendes Hearing zu Ende spielen lassen (Overlay auf `/finale` erst nach Abschluss zeigen, mit klarem Hinweis „Zeit ist um – Punkte für Zeit entfallen“).
- **Fix C:** `getBudgetMin()` überall verwenden: Start-Popup-Countdown, Brieftext („In {Budget} Minuten“), Punkte-Referenz. Falls die fixe 90er-Referenz für Vergleichbarkeit gewollt ist, nur Anzeige-Texte anpassen.
- **Fix D:** Runden-Session vom Reset ausnehmen.
- **Fix E:** Cheat-Code: `startGame()` mitauslösen, Finale nicht als erledigt markieren, Konstante zentral exportieren.
- **Fix F:** Texte: Seitenkopf auf „Speicher, Majas Ermittlung“ mit deutscher Beschreibung, `lang="de-CH"`, „Maya“ → „Maja“, „ß“ → „ss“, durchgehend „Hinweis“ statt „Tipp“.
- **Fix G:** Touch-Ziele auf mind. 44 px, Überlauf-Labels entschärfen.

## Rückfragen

- Soll Fix 6 (Hearing-Wiederholung = 0 Punkte) so bleiben?
- Soll ich alle Fixes umsetzen oder nur die kritischen (1–3)?
