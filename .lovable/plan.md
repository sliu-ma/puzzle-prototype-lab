# Storyline auf Jakob umstellen (Etappen 1–5, Finale, Ending)

Schritt 1: alle Handlungstexte der Etappen sowie Finale und Ending auf die neue Fassung mit Grossvater **Jakob** statt Grosstante Elvira umschreiben. Das Briefing/Intro bleibt in diesem Schritt unverändert (folgt später).

## Was geändert wird

**Etappe 1 – Bahnhof**
- Titel: „Grossvaters altes Reiseticket“; Fundtext mit „Jakobs alten Reiseunterlagen“.
- Zettel-Zitat: „Ich habe immer das gewählt, was am wenigsten Spuren hinterlässt. Findest du heraus, welchen Weg ich nach Hause genommen habe?“
- Rätselauftrag, Fehlermeldung und Tipps: „Elvira/sie“ → „Jakob/er“ (z. B. „Rekonstruiere Jakobs Reiseroute“, „Wo hat Jakob geschlafen …“).
- Nächste Etappe: „Geh zum alten Dorfladen.“ + Ticket-Rückseite in Jakobs Handschrift.

**Etappe 2 – Einkaufsladen**
- Vorspann: „Frau Berger wartet schon.“, „Jakobs Freundin Frau Berger“, Zitat „**Dein** Grossvater war jede Woche hier. Er sagte: …“ (Grammatik korrigiert gegenüber der Vorlage).
- Korb-Absatz mit „Jakobs Einkaufsliste“ und „Jakob hätte es gewusst.“
- Tipp „Starte mit Jakobs Rezept“.
- Nächste Etappe: „Zur Waldlichtung“ + Kassenbon-Text mit „mein Notizbuch“.

**Etappe 3 – Wald**
- Aus „Elviras Beobachtungsposten“ wird Jakobs Beobachtungsbuch/Forsthaus; neuer Vorspann „Die Zeit läuft“ mit Absperrbändern, Rodungsschild und dem Auftrag, gefährdete von nicht gefährdeten Arten zu trennen (Türschloss).
- Nächste Etappe: „Zurück ins Haus“ + Holzkiste mit Strom-/Heizrechnungen und Zettel.
- QR-Gate-/Meta-Texte entsprechend angepasst.

**Etappe 4 – Wohnen**
- „Elviras Haus“ → „Jakobs Haus“ in Titel, QR-Gate, Meta-Beschreibung, Etappenlabel und Umschlag-Dialog-Texten.
- Vorspann: „Eine Zeichnung und ein knapper Zettel“ + Zitat „Nicht jede Massnahme spart gleich viel Energie …“.
- Nächste Etappe: „Zum Wasserkraftwerk“ + Schlüsselkarte/Brief aus dem Sicherungskasten, Verweis auf Marlene.

**Etappe 5 – Energie**
- Treffen mit Marlene Vogt neu gefasst: Ordner, „Jakob hat in den letzten Monaten viele Informationen gesammelt …“, drei Gutachten, Auftrag „Finde die fünf falschen Aussagen.“
- Übergang zum Hearing: „Wir haben alles was wir brauchen“ — Marlene schliesst den Ordner, gemeinsamer Aufbruch zur Gemeinderatssitzung (bisheriges Treffen mit Tante Elvira entfällt).

**Finale – Gemeinderatssitzung**
- Neue Intro-Szene: Gemeindepräsident eröffnet die Abstimmung, Maja tritt vor, skeptisches Ratsmitglied, Jakobs Notizen und ergänzte Gutachten auf dem Tisch, „Jetzt liegt es an dir.“

**Ending**
- Neue Schlussszene: Stille, zwei Ratsmitglieder, verschobene Abstimmung; danach „Ausatmen“ — Maja auf dem Felsen an der Lichtung, Specht, Jakobs Satz „Wenn wir der Natur Zeit geben, zeigt sie uns mehr, als wir erwarten.“, „Versprochen.“ Die bisherige Elvira-Dialogszene wird ersetzt.

## Technische Hinweise

- Betroffene Dateien: `src/routes/etappe-1.tsx` … `etappe-5.tsx`, `src/routes/finale.tsx`.
- Nur Text/JSX-Inhalte, Tipp-Texte, `head()`-Beschreibungen und Umschlag-Dialog-Labels; keine Änderungen an Punktesystem, Badges, Rätsel-Logik oder Datenbank.
- Sprecher-Komponenten im Finale (`SpeechBubble`) werden auf die neuen Rollen (Gemeindepräsident, Ratsmitglied, Maja) umgestellt.
- Elvira-Erwähnungen ausserhalb der Etappen (Briefing/`IntroScreen`, Dashboard `index.tsx`, `GlobalTimer`-Nachrichten, `StartForm`) bleiben in diesem Schritt bewusst unangetastet — dadurch besteht vorübergehend eine Namens-Inkonsistenz, die Schritt 2 auflöst.
