# Leaderboard neu gestalten (Gold/Silber/Bronze)

## Kopfbereich

- Nur zwei Dinge: **Teamname** und die **eigenen Punkte** (gross, tabellarisch). Kein Rang, kein Rückstand, keine Spitzen-Zeile, kein Pokal-Label.
- Ruhige Karte auf Papier-Ton, dünner Rahmen, zentriert.

## Rangliste

- **Medaillen-Kreise** für Platz 1–3 wie im Referenzbild: runde Ziffer in Gold, Silber, Bronze mit kleiner Bandspitze darunter. Ab Platz 4 nur die Ziffer in Textfarbe (eigene Zeile in Stamp-Rot).
- **Fortschrittsbalken entfällt** komplett.
- **Status nur visuell:** kleiner farbiger Punkt/Häkchen — „abgeschlossen“ (grün) vs. „noch am Spielen“ (pulsierender Bernstein-Punkt), Tooltip/Screenreader-Text mit Klartext. Datenquelle ist der schon vorhandene Abschluss-Zeitstempel (`finished` aus dem Runden-Leaderboard); für das eigene Team der lokale Abschlussstand.
- **Zeilenaufbau:** Medaille/Ziffer · Teamname (+ Marke „Ihr“ für die eigene Zeile) · Status · Punkte mit kleinem „Punkte“-Label darunter.
- Zeilen durch dünne Trennlinien getrennt, gemeinsame Umrandung um die Liste (wie im Bild); eigene Zeile hervorgehoben mit Stamp-Rahmen und leicht getöntem Hintergrund.
- Titel „Rangliste“ klein in Grossbuchstaben, „Aktualisieren“ kompakt rechts daneben. Doppelte Runden-Infozeile am Listenende entfällt; ohne Rundencode bleibt der kurze Hinweis auf den Einzellauf.

## Rest

- Aufklappbare Aufschlüsselung „Meine Punkte“ bleibt unverändert.
- Outro-Variante: gleiche Struktur, kompaktere Abstände.

## Technisch

- Nur `src/components/case-file/Leaderboard.tsx` wird angepasst; keine Logik-, Score- oder Datenbankänderungen.
- `finished` in den Row-Typ übernehmen (liegt serverseitig bereits vor).
- Neue Farbtokens für Medaillen (`--medal-gold`, `--medal-silver`, `--medal-bronze`) sowie Status (`--status-done`, `--status-active`) in `src/styles.css` ergänzen und über `@theme inline` verfügbar machen — keine harten Farbwerte im Bauteil.