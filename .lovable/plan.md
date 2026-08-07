# Einleitung neu: Vorgeschichte-Video + Brief von Jakob

## Ablauf neu

Klassenrunde:
```text
Lobby  ->  Lehrperson startet
       ->  Countdown 3-2-1 (Handys)
       ->  Briefing: Ankunft im Wald -> Umschlag -> Brief -> So spielt ihr
       ->  Umschlag 1 / Etappe 1
```
Das Vorgeschichte-Video zeigst du vor dem Start am Beamer: auf `/lehrer/<code>` erscheint im Schritt «Lobby» ein Video-Block mit Abspielfeld, direkt über dem Startknopf.

Einzelspieler-Code (ohne Klassenrunde): das gleiche Video wird als erste Briefing-Karte auf dem Handy eingebettet, mit «Weiter»-Knopf, der erst nach dem Video (oder per Überspringen) freigibt.

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
- Neu `src/lib/story.ts`: `PROLOGUE_VIDEO_URL` (Konstante, von dir zu füllen) und die Briefing-Texte, damit Lehrerseite und Handy die gleiche Quelle nutzen.
- Neu `src/components/case-file/PrologueVideo.tsx`: schlanker `<video controls playsInline>`-Block mit Titel und Hinweis, wenn kein Link gesetzt ist.
- `src/routes/lehrer.$code.tsx` bzw. `src/components/teacher/LobbyPanel.tsx`: Video-Block im Lobby-Schritt vor dem Startknopf.
- Erkennung Einzelspieler: kein Rundencode/Runden-Session vorhanden (`round-client`), dann Video-Karte im Briefing zeigen.
- Keine Änderungen an Punkten, Badges, Timer oder Datenbank.

Ich brauche dazu noch den Video-Link oder die Datei; bis dahin steht ein Platzhalter mit Hinweis.
