# Leaderboard: Design aufräumen

## Ziel

Ruhige, klare Rangliste. Nur was zählt: eigener Rang, eigene Punkte, wer wo steht und ob ein Team noch unterwegs oder fertig ist.

## Was wegfällt

- Fortschrittsbalken hinter jeder Zeile (die farbige Füllung nach Punkteanteil).
- Zeile „Rückstand auf Platz 1“ und „Spitze: Team X · … Punkte“.
- Doppelte Runden-Infozeile am Listenende (Runde/Code steht schon im Titel); der „Aktualisieren“-Knopf wandert kompakt neben den Listentitel.

## Was bleibt / neu

- **Kopf (eigenes Team):** Teamname, gross „Rang 3 von 7“, darunter die eigenen Punkte. Sonst nichts.
- **Statusangabe statt Balken:** pro Zeile ein kleines Kennzeichen — „fertig“ (Häkchen) oder „unterwegs“ (Punkt/Uhr), gespeist aus dem bereits vorhandenen Abschluss-Zeitstempel des Teams. Das eigene Team nutzt den lokalen Abschlussstand.
- **Zeilenaufbau:** Rang · Teamname (eigene Zeile mit „ihr“ markiert und hervorgehoben) · Status · Punkte. Gleichmässige Zeilenhöhe, dünne Trennlinien statt Kästchen-Rahmen um jede Zeile, Top-3 nur durch Rangziffer betont.
- **Titel:** „Rangliste · Runde <Code>“ bzw. „Einzellauf“; ohne Rundencode bleibt der kurze Hinweis, dass man allein spielt.
- **Aufschlüsselung „Meine Punkte“** bleibt unverändert (aufklappbar).
- Outro-Variante: gleiche Struktur, kompaktere Abstände.

## Technisch

- Nur `src/components/case-file/Leaderboard.tsx` wird angepasst; keine Logik-, Score- oder Datenbankänderungen.
- `finished` aus `getRoundLeaderboard` in den Row-Typ übernehmen (Feld liegt serverseitig schon vor), für das eigene Team aus dem lokalen Abschlussstatus ergänzen.
- Alle Farben über bestehende Tokens (`stamp`, `muted-foreground`, `border`, `card`); keine harten Farbwerte.
