# Brief zeitlos machen – Dringlichkeit kommt vom Freund

Problem: Jakob ist vor Monaten gestorben, kann den heutigen Abstimmungstermin also nicht kennen. Die Zeitangabe wandert daher vom Brief zum Freund des Grossvaters, der Maja am Forsthaus empfängt.

## Neuer Ablauf der Briefkarte

1. **Der Freund spricht (bestehende Sprechblase, erweitert)**
   „Du musst Maja sein. Ich wusste gar nicht, dass du überhaupt noch einmal zurückkommst. Ich bin ein Freund deines Grossvaters — kurz vor seinem Tod hat er mir diesen Umschlag für dich gegeben.“
   Danach, als zweite Sprechblase mit Dringlichkeits-Optik (kleiner Uhr-Icon, warmes Alarm-Rot):
   „Und du kommst gerade rechtzeitig: Heute Abend stimmt der Gemeinderat über das Gaskraftwerk ab. In **90 Minuten** beginnt die Sitzung. Was Jakob begonnen hat, kann nur noch jemand fertigmachen, der jetzt losläuft.“


2. **Brief von Jakob – zeitlos formuliert**
   - „Heute entscheidet der Gemeinderat …“ wird ersetzt durch: „Wenn du diesen Brief liest, steht die Entscheidung über das Gaskraftwerk auf der Waldlichtung an. Dafür müsste ein Teil des Waldes gerodet werden.“
   - Rest bleibt: gesammelte Fakten, unvollendete Arbeit, „vergiss nie unser Versprechen“, Unterschrift „Dein Opa Jakob“.

3. **Interaktives Element: der Countdown startet sichtbar**
   Unter dem geöffneten Brief erscheint eine kleine Karte „Sitzung beginnt in 90 Minuten“ mit dem Knopf, der bisher „Ermittlung starten“ heisst. Beim Antippen läuft eine kurze Animation (Ziffern springen von 90:00 auf die laufende Zeit), damit fühlbar wird: ab jetzt tickt die Uhr. Danach wie bisher der Umschlag-Dialog «Umschlag 1 · Alter Bahnhof».

## Konsistenz an anderen Stellen

- Warnschild auf der Ankunftskarte bleibt „ABSTIMMUNG: HEUTE ABEND“ — passt weiter, weil es ein aktuelles Schild im Wald ist.
- Keine Änderung an Etappentexten, Punkten, Badges oder Timerlogik; die 90 Minuten entsprechen dem bereits bestehenden globalen Timer.

## Technisch

- Nur `src/components/case-file/IntroScreen.tsx`: Brieftext anpassen, zweite Sprechblase des Freundes ergänzen, kleine Countdown-Karte vor dem Start-Knopf.
- Timerstart bleibt `startGame()` beim Bestätigen des Umschlags — nur die Darstellung wird ergänzt.
