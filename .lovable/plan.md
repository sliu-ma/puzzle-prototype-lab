# Backend-Wechsel wegen Kosten: Faktenlage und Empfehlung

## Was ich geprüft habe

Kreditverbrauch der laufenden Abrechnungsperiode (21. Juli bis 21. August 2026), insgesamt 220,29 Credits:

- Build-Mode-Nachrichten: 179,30 Credits
- Plan-Mode-Nachrichten: 39,00 Credits
- Backend (Worker-Tage): 1,99 Credits
- Backend (Worker-Requests): ~0,00 Credits

Das Backend verursacht also unter 1 Prozent deiner Kosten. Die Kosten entstehen fast vollständig durch das Bauen und Planen im Editor.

## Empfehlung

Ein Backend-Wechsel würde in deinem Fall praktisch nichts sparen. Zusätzlich gilt für dieses Projekt: Das Backend ist nach dem Aktivieren fest mit dem Projekt verbunden und lässt sich nicht abschalten oder gegen ein eigenes Konto tauschen. Unter Connectors, Lovable Cloud, Disable schaltest du es nur für *künftige* neue Projekte aus.

Wenn du trotzdem unabhängig werden willst, ist der einzige saubere Weg ein eigenes Projekt außerhalb von Lovable: Schema und Daten hier exportieren (More, Cloud, Advanced settings, Export data) und dort einspielen. Für die Kostenfrage bringt das nichts, deshalb schlage ich es nicht als Schritt vor.

## Was stattdessen wirklich Kosten senkt

1. Weniger, dafür grössere Aufträge: mehrere Änderungen in einer Nachricht bündeln statt viele kleine Nachrichten hintereinander.
2. Plan-Mode gezielt einsetzen: jede Plan-Nachricht kostet 1 Credit; für kleine, klare Änderungen direkt im Build-Mode arbeiten.
3. Visuelle Textänderungen für reine Text- und Wording-Korrekturen nutzen statt dafür eine Build-Nachricht auszugeben.
4. Grosse Features vorab einmal klar beschreiben, damit weniger Korrekturrunden nötig sind. Beim Leaderboard heisst das: Regeln, Felder und Ansichten in einem Zug festlegen.
5. Backend-Kosten sind bereits minimal. Falls sie später steigen: unter More, Cloud, Jobs prüfen, dass keine unnötig häufigen geplanten Aufgaben laufen.

## Nächster Schritt

Beim bestehenden Backend bleiben und das geplante Leaderboard darauf umsetzen, sobald du grünes Licht gibst. Der fertige Leaderboard-Plan (Runden-Code durch Admin, Team-Beitritt ohne Konto, Live-Rangliste) liegt bereit und kann unverändert gebaut werden.
