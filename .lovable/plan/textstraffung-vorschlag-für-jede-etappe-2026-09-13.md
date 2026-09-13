# Textstraffung – Vorschlag für jede Etappe

Prinzip wie bei Etappe 2: Story behalten, nur straffen. Nebenwörter und Wiederholungen streichen, die fürs Rätsel wichtigen Sätze und Zitate stehen lassen. Pro Etappe der Vorher-/Nachher-Vorschlag für die Notiz-Karte (Brief). Etappe 2 ist bereits umgesetzt und dient als Referenz.

## Etappe 1 · Bushaltestelle Widnau (Mobilität)

**Vorher** (Notiz-Karte):
> Auf der Wartebank liegt ein Couvert mit Jakobs alten Reiseunterlagen und einem Zettel. Darauf steht:
> „Ich habe immer das gewählt, was am wenigsten Spuren hinterlässt. Findest du heraus, welchen Weg ich nach Hause genommen habe?"

**Nachher:**
> Auf der Wartebank: ein Couvert mit Jakobs Reiseunterlagen und einem Zettel. Darauf steht:
> „Ich habe immer das gewählt, was am wenigsten Spuren hinterlässt. Findest du heraus, welchen Weg ich nach Hause genommen habe?"

Streichung: „alten", „Maja" (steht im Header), „und" → Doppelpunkt. Zitat bleibt unangetastet (kurz und trägt das Rätsel).

## Etappe 2 · Dorfladen Berger (Konsum) – bereits umgesetzt

Referenz: Blockquote von ~360 auf ~210 Zeichen gestrafft, Story erhalten. Keine weitere Änderung.

## Etappe 3 · Jakobs Haus (Wohnen)

**Vorher** (Notiz-Karte):
> Auf dem Küchentisch liegt eine Zeichnung des Hauses: ein Querschnitt mit allen Räumen. Daneben ein kurzer Zettel:
> „Nicht jede Massnahme spart gleich viel Energie. Finde heraus, welche am meisten bewirken."

**Nachher:**
> Auf dem Küchentisch: eine Hauszeichnung und ein kurzer Zettel.
> „Nicht jede Massnahme spart gleich viel Energie. Finde heraus, welche am meisten bewirken."

Streichung: „liegt", „ein Querschnitt mit allen Räumen" (auf der Rätselkarte sichtbar), „Daneben" → Komma. Zitat bleibt.

## Etappe 4 · Wald-Lichtung (Biodiversität)

**Vorher** (Notiz-Karte):
> Die Lichtung hat sich verändert. Zwischen den Bäumen hängen Absperrbänder. Ein Schild warnt: Rodung beginnt in Kürze. Beim Forsthaus liegt Jakobs Notizbuch. Auf der letzten Seite steht:
> „Manche dieser Tiere sind hier noch sicher, andere stehen kurz vor dem Verschwinden. Trenne die gefährdeten von den nicht gefährdeten Arten, um das Kiste zu öffnen."

**Nachher:**
> Zwischen den Bäumen hängen Absperrbänder. Rodung beginnt in Kürze. Beim Forsthaus liegt Jakobs Notizbuch, auf der letzten Seite:
> „Manche dieser Tiere sind hier noch sicher, andere stehen kurz vor dem Verschwinden. Trenne die gefährdeten von den nicht gefährdeten Arten, um das Kiste zu öffnen."

Streichung: „Die Lichtung hat sich verändert." (Dramatik schon im Intro-Video), „Ein Schild warnt:" → Aussagesatz. Zitat bleibt.

## Etappe 5 · Altes Wasserkraftwerk (Energie)

**Vorher** (Notiz-Karte):
> Im alten Wasserkraftwerk wartet Marlene Vogt. Vor ihr liegen mehrere Ordner. „Jakob hat in den letzten Monaten viele Informationen gesammelt. Ich habe seine Unterlagen ergänzt." Sie legt drei Gutachten auf den Tisch. „Der Gemeinderat entscheidet heute Abend. Leider enthalten diese Gutachten der Gemeinde mehrere Fehler. Finde die fünf falschen Aussagen. Nur so können wir rechtzeitig die vollständigen Fakten vorlegen."

**Nachher:**
> Im Wasserkraftwerk wartet Marlene Vogt, vor ihr liegen Ordner. „Jakob hat Informationen gesammelt, ich habe sie ergänzt." Sie legt drei Gutachten auf den Tisch. „Diese Gutachten enthalten fünf Fehler. Finde sie, bevor der Gemeinderat heute Abend entscheidet."

Streichung: „alten", „mehrere", „in den letzten Monaten", „seine Unterlagen" → „sie", „Leider", „der Gemeinde", „Nur so können wir rechtzeitig die vollständigen Fakten vorlegen" → implizit. Marlene, Gutachten und Deadline bleiben.

## Umfang

- 5 Etappen-Notizkarten (Etappe 2 bereits erledigt).
- Keine Änderung an Fach-Input-Karten, Zitaten, Rätseltexten oder UI-Labels.
- Pro Karte ~30–40 % weniger Zeichen, Story-Ton bleibt.

## Technische Umsetzung

- `src/routes/etappe-1.tsx` – Blockquote in step "brief" (~Zeile 230–253)
- `src/routes/etappe-3.tsx` – Blockquote in step "brief" (~Zeile 186–214)
- `src/routes/etappe-4.tsx` – Blockquote in step "brief" (~Zeile 208–222)
- `src/routes/etappe-5.tsx` – Blockquote in step "brief" (~Zeile 184–215)
- `src/routes/etappe-2.tsx` – bereits umgesetzt, keine Änderung
- Typecheck `bunx tsgo --noEmit`, Build-Check via `/tmp/observability/build-errors.log`
