# Einleitung neu: Vorgeschichte-Video + Brief von Jakob

## Ablauf neu

Klassenrunde:
```text
Lobby  ->  Lehrperson startet das Video (Beamer, ca. 1 Min)
       ->  Video zu Ende  ->  Runde startet automatisch
       ->  Countdown 3-2-1 (Handys)
       ->  Briefing: Ankunft im Wald -> Umschlag -> Brief -> So spielt ihr
       ->  Umschlag 1 / Etappe 1
```
Auf `/lehrer/<code>` steht im Schritt «Lobby» das Video (`Vorgeschichte.mp4`, 61 s) gross über dem Startknopf. Sobald es zu Ende ist, wird die Runde automatisch gestartet – auf allen Handys läuft der 3-2-1-Countdown. Der Startknopf bleibt als manuelle Alternative (falls du das Video überspringst oder es nicht abspielt), und es gibt einen Schalter «Nach dem Video automatisch starten», damit du das Verhalten notfalls ausschalten kannst.

Einzelspieler-Code (ohne Klassenrunde): das gleiche Video wird als erste Briefing-Karte auf dem Handy eingebettet; nach dem Videoende geht es automatisch zur nächsten Karte, «Überspringen» bleibt möglich.


## Neues Briefing (Handy, 4 Karten)

1. **(nur Einzelspieler)** Video «Die Vorgeschichte» – Poster, Play, Untertitel-Hinweis.
2. **Zurück in Grünwald** – kurze Ankunftsszene, in Häppchen statt Textwand: Weg durch den Wald, der Felsen, dann als eigenes «Schild»-Element gestaltet:
   `GEPLANTES GASKRAFTWERK · Rodungsarbeiten beginnen nach Genehmigung.`
   Danach: Forsthaus, Schritte, der Freund des Grossvaters übergibt den Umschlag (Zitat als Sprechblase).
3. **Der Brief** – Antipp-Umschlag, der sich öffnet und den Brief zeigt (Handschrift-Optik, bestehendes Papier-Design). Volltext nach deiner Vorgabe, Schluss «Dein Opa Jakob». Kernsätze hervorgehoben: heute Abend entscheidet der Gemeinderat, fang beim alten Bahnhof an, unser Versprechen.
4. **So spielt ihr** – bestehende Regel-Karte (QR scannen, Rätsel lösen, Tipps nach 3/6/9 Min, Zeit bis zum Hearing), jetzt als letzte Karte direkt vor «Ermittlung starten».

Entfällt: die Karte «Wer ist wer?» mit den Personen-Karten (Maja / Jakob).

Am Schluss wie bisher der Umschlag-Dialog «Umschlag 1 · Alter Bahnhof», «Überspringen» bleibt.

## Angenehm für die Klasse

- Kurze Absätze, ein Gedanke pro Zeile, grosse Tippflächen (min. 48 px), Fortschrittspunkte bleiben.
- Das Schild und der Brief sind eigene visuelle Objekte, nicht Fliesstext – man liest wenig, sieht viel.
- Jede Karte hat max. ~120 Wörter; nichts scrollt mehr als eine Handyhöhe plus ein Stück.
- Wiedererkennung zum Ende: der Felsen und «Versprochen» tauchen im Ending wieder auf.

## Technisch

- `src/components/case-file/IntroScreen.tsx`: Personen-Schritt und `PersonCard`/`Persona` entfernen; Schritte dynamisch (3 bzw. 4 mit Video); neue Story-Karten + Umschlag-Aufklapper; Regelkarte an den Schluss.
- Video als Lovable-Asset (`src/assets/vorgeschichte.mp4.asset.json` aus der hochgeladenen Datei), Binary bleibt aus dem Repo.
- Neu `src/lib/story.ts`: Briefing-Texte + Video-Referenz, damit Lehrerseite und Handy die gleiche Quelle nutzen.
- Neu `src/components/case-file/PrologueVideo.tsx`: `<video controls playsInline preload="metadata">` mit `onEnded`-Callback.
- `src/components/teacher/LobbyPanel.tsx`: Video-Block im Lobby-Schritt über dem Startknopf; `onEnded` ruft die bestehende Start-Funktion (`teacherStartRound`) genau einmal auf, geschützt gegen Doppelstart und nur wenn der Status noch `lobby` ist. Auto-Start-Schalter im lokalen State.
- Erkennung Einzelspieler: keine Runden-Session (`round-client`), dann Video-Karte im Briefing zeigen; `onEnded` schaltet eine Karte weiter.
- Keine Änderungen an Punkten, Badges, Timer, Countdown-Logik oder Datenbank.

