# Hearing: Zugeordnete Labels aus Liste entfernen und im Beschreibungs-Kästchen anzeigen

## Betroffen
Nur `MatchView` in `src/routes/finale.tsx` (F3, Konsum: Bio / IP-Suisse / Suisse Garantie).
Die Bucket-Aufgabe (F9 Energie) funktioniert bereits wie gewünscht (Items wandern aus dem Pool ins Kästchen und verschwinden aus der Liste).

## Aktuelles Verhalten
- Linke Spalte: alle Labels bleiben immer sichtbar; bei Paarung erscheint «→ Beschreibung» + «Lösen»-Knopf darunter.
- Rechte Spalte: Beschreibungs-Kästchen zeigen nur den Text, kein Label.

## Neues Verhalten
- **Linke Spalte:** nur noch *nicht zugeordnete* Labels anzeigen (zugeordnete aus der Liste entfernen). So kann man sie nicht versehentlich erneut zuordnen.
- **Rechte Spalte:** jedes Beschreibungs-Kästchen zeigt bei Paarung den zugeordneten Label-Chip (Icon + Name) mit kleinem «Lösen»-Knopf; das Kästchen bleibt Drop-Ziel (Ersetzen beim Drüberziehen funktioniert weiter).
- «Lösen» entfernt die Paarung und das Label erscheint wieder in der linken Liste.
- Drag & Drop, Submit, Feedback und Erkärung bleiben unverändert.

## Technische Umsetzung
- In der linken `.map` über `linksShuffled` nur Items rendern, deren `pairs[l.id]` nicht gesetzt ist.
- In der rechten `.map` über `rechtsShuffled` zusätzlich den zugeordneten Label-Chip rendern: `frage.links.find(l => pairs[l.id] === r.id)`. Mit Icon, Name und «Lösen»-Knopf (`clear`).
- `usedRight`, `clear`, Drag-Logik unverändert.

## Prüfung
- Typecheck `bunx tsgo --noEmit`
- Build-Log `/tmp/observability/build-errors.log`
- Playwright-Check: Label zieht in Kästchen, verschwindet links, «Lösen» bringt es zurück, Submit prüft alle Paare.
