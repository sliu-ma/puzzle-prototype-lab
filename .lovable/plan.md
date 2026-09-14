# Etappe 5: Besserer Titel für Energie-Fachinput

## Änderung
In `src/routes/etappe-5.tsx` (Zeile 232) den `title` des `InputCarousel` von `"Wie Energie wirkt"` zu `"Worauf Energie ankommt"` ändern.

Der Titel passt zur Intro-Zeile «an ihnen entscheidet sich, was im Hearing zählt» und klingt wie die Nachbar-Titel («Nachhaltig einkaufen, worauf es ankommt», «Warum Vielfalt zählt»).

## Keine Änderung an
- Intro-Text, Karten, Charts, Header/Footer, Rätsel-Logik

## Prüfung
- Typecheck `bunx tsgo --noEmit`
- Build-Log `/tmp/observability/build-errors.log`
