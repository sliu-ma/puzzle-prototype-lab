## Ziel
Kapitel 5 (Altes Wasserkraftwerk) erhält dasselbe zeitgesteuerte Tippsystem wie Akten 002 und 003 — drei Hinweise, die nach 3, 6 und 9 Minuten freischalten und danach jederzeit wieder öffenbar sind.

## Änderungen in `src/routes/akte-005.tsx`

1. Import ergänzen: `HintSystem` und Typ `Hint` aus `@/components/case-file/HintSystem`.
2. `HINTS_005: Hint[]` definieren, passend zum Gutachten-Rätsel:
   - **Tipp 1 (3 min)** — „Vergleich statt Bauch": Hinweis, jedes Gutachten neben der Faktenkarte und dem Diagramm zu prüfen; genau 5 Aussagen sind zu markieren.
   - **Tipp 2 (6 min)** — „Wo Marlene stutzig wurde": Hinweis, dass die falschen Aussagen sich über alle drei Gutachten verteilen (Gas, Kohle, Solar) und meist mit Zahlen oder Grundsatzbegriffen wie „erneuerbar" spielen.
   - **Auflösung (9 min)** — Die 5 Fehler explizit auflösen: Gas — „95 g CO₂/kWh" und „keine Schutzwürdigkeit"; Kohle — „78 % Wirkungsgrad" und „erneuerbare Brückentechnologie"; Solar — „250 h/Jahr Volllaststunden".
3. `HintSystem` innerhalb `<main>` (nach dem Content-Container) einbinden — nur wenn `step === "spiel"`, analog zum Muster in Akte 002/003. `storageKey="akte-005-hints-start"`.

## Nicht angepasst
- `GutachtenRaetsel.tsx`, Storyline-Texte, andere Akten und Layout bleiben unverändert.
