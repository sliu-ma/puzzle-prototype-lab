# Start straffen: weniger Text, gleiche Geschichte

Der Start besteht heute aus Landing (Titel + Codeformular) und Briefing mit drei bis vier Karten («Vorgeschichte», «Zurück im Wald», «Der Brief», «So spielt ihr»). Insgesamt sind das rund 1'400 Zeichen Lesestoff, bevor Etappe 1 startet – auf dem Handy sehr viel. Vorschlag: gleiche Erzählung, aber kürzer, gestaffelt und teils in Bild/Objekt statt Prosa.

## Prinzip

Was der Prolog-Film schon zeigt, muss der Text nicht wiederholen. Was zum Rätseln nötig ist, bleibt. Was erklärt, wandert dorthin, wo es gebraucht wird.

## Karte «Zurück im Wald» (heute die längste)

- Aufzählung von drei Punkten auf zwei kürzen: Rückkehr zur Lichtung + Absperrband/Schild. «Maja ist heute 15» und «Weg mitten durch den Wald» sind aus dem Prolog bereits bekannt.
- Der Absatz nach dem Schild wird ein Satz: «Ihre Lichtung soll gerodet werden.»
- Das Zitat des Freundes bleibt unverändert – es trägt die Übergabe des Umschlags.

Von etwa 480 auf etwa 220 Zeichen.

## Karte «Der Brief»

- Vier Absätze auf drei kürzen: Begrüssung, Abstimmung heute Abend (Uhrzeit bleibt, weil spielrelevant), Auftrag mit «Fang beim alten Bahnhof an».
- Der Absatz «Ich habe in den letzten Monaten Informationen gesammelt … nicht fertigstellen» wird zu einem Halbsatz im Auftragsabsatz verdichtet.
- Anrede, Schlussformel und «unser Versprechen» bleiben – das ist der emotionale Kern.

Von etwa 620 auf etwa 300 Zeichen.

## Karte «So spielt ihr»

- Der Einleitungsabsatz entfällt; die drei Icon-Punkte sagen dasselbe.
- Jeder Punkt wird auf eine Zeile gekürzt: «QR-Code scannen», «Rätsel lösen, 
- Tipps nach 3/6/9 Minuten» entfernen das wird im Rätsel auch nochmals aufgegriffen (Pop-Up beim ersten mal Tipp)
- Die Uhrzeit steht dann einmal statt dreimal.

## Landing-Karte

Der Vorspann-Absatz ist bereits leer. Der Untertitel «Ein Bildungs-Escape-Room. Fünf Etappen, ein Hearing.» bleibt als einzige Orientierung stehen.

## Ergebnis

Drei Briefing-Karten, jede in unter 20 Sekunden lesbar, gleiche Story-Beats: Lichtung bedroht, Umschlag von Jakob, Auftrag bis zum Hearing, Start am Bahnhof.

## Technisches

Reine Textänderungen in `src/components/case-file/IntroScreen.tsx` (Karten «ankunft», «brief», «regeln»). Keine Änderung an Ablauf, Schritten, Prolog-Overlay, Umschlag-Dialog oder Punktelogik.