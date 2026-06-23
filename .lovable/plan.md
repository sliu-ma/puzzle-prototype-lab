# Finale: Hearing im Gemeindesaal

Ein dialogisches Abschluss-Szenario, in dem Maya vor dem Gemeinderat von Grünwald die vier Fachkommissionen mit Argumenten aus den Akten 001–005 überzeugen muss.

## Konzept

Ein neues "Finale" das erst freigeschaltet wird, wenn alle 5 Akten gelöst sind (Check via `localStorage`: `akte-001-unlocked` … `akte-005-unlocked`). Solange Akten fehlen, sieht die/der Spieler*in welche noch offen sind und kann nicht starten — das motiviert den Fachinhalt wirklich durchzuarbeiten.

Das Finale ist als Dialog inszeniert: Sprechblasen, Namen + Rollen der Gemeinderät*innen, Mayas Antwort-Optionen wie Repliken in einem Theaterstück — nicht wie ein Quiz.

## Struktur

### Neue Route `/finale`
- Eintritts-Story-Text (Maya, Elvira, Marlene betreten den Saal — wie im Briefing).
- Button „Bitte um das Wort" → startet die Befragung.
- Gate: wenn nicht alle 5 Akten gelöst → Hinweis-Karte „Du brauchst die Beweise aus allen Akten" mit Liste, welche noch offen sind, und Links zurück.

### Dialog-Komponente `Hearing.tsx`
Vier Sequenzen, eine pro Gemeinderat. Jede Sequenz:
1. Avatar-Plättchen + Name + Ressort (z.B. „Herr Rüegg · Bau & Finanzen").
2. Frage in Sprechblase (links).
3. Drei Antwort-Optionen als Karten — Maya „spricht" sie.
4. Bei **falsch**: Reaktion des Gemeinderats („Das überzeugt mich nicht…") + sanfter Hinweis auf die zugehörige Akte (z.B. „Schau noch einmal in Akte 004 — Energieeinsparung pro Haushalt"). Spieler*in kann es nochmal versuchen. Kein „Game Over".
5. Bei **richtig**: zustimmende Reaktion, Stempel „ÜBERZEUGT" wird gesetzt, Fortschritts­leiste füllt sich, nächste Frage.

Nach allen vier richtigen Antworten → Auflösungs-Story + „Happy End"-Karte + Button zurück zur Übersicht.

### Inhalt der 4 Fragen
Wörtlich vom User übernommen (Fragen 1–4, Optionen A/B/C, jeweilige Richtig-Markierung), zugeordnete Bezugs-Akte als Hinweis-Text bei Fehlversuch.

## Implementierung (technisch)

### Neue Dateien
- `src/lib/finale-data.ts`: Array `councilQuestions` mit `{ id, council: { name, role, ressort }, question, options: [{ id, text, correct }], wrongHint, akteRef }`. Plus Story-Texte (Intro, Outro).
- `src/components/case-file/Hearing.tsx`: State-Maschine (aktuelle Frage, Versuche, abgeschlossen). Rendert Dialog-UI mit Sprechblasen.
- `src/components/case-file/CouncilAvatar.tsx`: Kleines Initialen-Plättchen mit Rollenfarbe (Bau=erde, Umwelt=grün, Verkehr=blau, Präsident=stamp-rot). Keine generierten Bilder — bleibt im Paper-Look.
- `src/routes/finale.tsx`: Gate + Intro + `<Hearing />` + Outro.

### Anpassungen
- `src/routes/index.tsx`: Neue Karte/Button „Finale: Das Hearing" (zunächst gesperrt-Look bis alle Akten erledigt; checkt nur clientseitig in `useEffect`).
- Optional: kleines Fortschritts-Widget auf der Startseite („3 / 5 Akten gelöst").

### Design
- Konsequent im bestehenden Paper-Stil (PaperCard, Stamp, font-serif für Sprache, font-mono-typed für Meta).
- Sprechblasen: leicht rotiertes Karten-Rechteck mit „Tail" via CSS `clip-path` oder einfach ein Dreieck-Pseudo-Element.
- Bei Fehlversuch: Stempel „PRÜFE NOCHMAL" in stamp-rot, kurze Animation.
- Bei Erfolg: Stempel „ÜBERZEUGT" in dunklem Grün/Tinte.

### Persistenz
- `localStorage["finale-completed"]` nach Erfolg — damit die Auflösung erhalten bleibt.
- Pro Frage `attempts` nur im React-State (kein dauerhafter Fehlerspeicher — Lernprozess, nicht Strafe).

## Pädagogisches Prinzip
- **Kein Highscore, keine Zeit, keine Strafen.** Falsche Antworten führen zu einem Dialog-Hinweis, der die zugehörige Akte benennt — die/der Spieler*in kann zwischen Tabs wechseln, in den Akten nachschauen und zurückkehren.
- **Argumente verändern etwas:** die Outro-Sequenz macht spürbar, dass die Fachargumente die Entscheidung der Gemeinde gekippt haben — der Bau wird abgesagt.

## Offen / zu bestätigen
1. Sollen die Namen der Gemeinderät*innen frei erfunden sein, oder gibst du Namen vor?
2. Sollen falsche Antworten gar nicht zählen (beliebig oft versuchen) oder nach z.B. 3 Fehlversuchen die Akte automatisch verlinken?
3. Soll das Finale auf der Startseite gesperrt erscheinen bis alle Akten erledigt sind, oder immer sichtbar mit Gate auf der Finale-Seite selbst?
