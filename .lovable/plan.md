## Ziel
Etappe 4 (Elviras Haus / EnergyGame) erhält dasselbe zeitgesteuerte Tippsystem wie die anderen Kapitel — drei Hinweise, die nach 3, 6 und 9 Minuten freischalten und danach jederzeit erneut öffenbar sind.

## Änderungen in `src/routes/akte-004.tsx`

1. Import ergänzen: `HintSystem` und Typ `Hint` aus `@/components/case-file/HintSystem`.
2. `HINTS_004: Hint[]` definieren, passend zum Haus-Planungs-Rätsel:
   - **Tipp 1 (3 min)** — „Wo steckt der grösste Verbrauch": Hinweis, zuerst grosse Posten wie Heizung/Warmwasser/Kühlschrank anzusehen — dort liegen die grössten Ersparnisse pro Franken.
   - **Tipp 2 (6 min)** — „Nicht jedes Upgrade lohnt sich": Verhalten (kurz duschen, Standby, 1 °C weniger heizen) kostet nichts und bringt oft mehr kWh als das teuerste Gerät. Budget im Blick behalten.
   - **Auflösung (9 min)** — Konkrete Empfehlung pro Gerät, mit der die 8'000 kWh sicher erreicht werden (günstige Verhaltensoptionen + gezielte Effizienz-Upgrades bei Heizung/Boiler, teure Neugeräte vermeiden).
3. `HintSystem` innerhalb `<main>` einbinden — nur wenn `step === "spiel"`, analog zu Akte 002/003/005. `storageKey="akte-004-hints-start"`.

## Nicht angepasst
- `EnergyGame.tsx`, Storyline-Texte, andere Akten und Layout bleiben unverändert.
