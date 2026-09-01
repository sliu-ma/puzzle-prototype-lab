# Zeitbudget anpassen (4 km Velo + 5 Etappen + Finale)

## Befund

Das Standard-Zeitbudget beträgt 90 Minuten (`src/lib/progress.ts:23`, `TIMER_DURATION_MIN = 90`). Für 9.-Klässler mit 4 km Velo-Weg zwischen den QR-Standorten ist das zu knapp:

- 5 Etappen, Hinweise frei ab 3/6/9 Min → realistisch 8–12 Min pro Etappe = ~50 Min
- Finale (10-Fragen-Quiz + Zuordnen + Barometer) = ~12–15 Min
- 4 km Velo zwischen 5+ Standorten (Fahren + Orientieren + QR scannen + Abstellen) = ~25–30 Min
- Puffer (Fehler, Koordination, Übergänge) = ~10 Min
- **Total realistisch: ~95–105 Min** → 90 Min ist zu eng.

**Bug:** Die Maja-Timer-Pop-ups (`BEATS` in `src/components/case-file/GlobalTimer.tsx:29`) sind fest auf 90 Min kodiert ("Halbzeit … die Hälfte der 90 Minuten", Endspurt bei 75/80/85). Eine Lehrperson kann zwar pro Runde ein abweichendes Budget setzen (`getBudgetMin`), dann feuern die Endspurt-Pop-ups aber zu früh und der Halbzeit-Text stimmt nicht. Das konfigurierbare Budget funktioniert so nicht sauber.

## Vorschlag

1. **Standard-Budget anheben** auf 110 Minuten (`TIMER_DURATION_MIN` in `src/lib/progress.ts`). Damit sind 4 km Velo + 5 Etappen + Finale realistisch machbar, mit Luft für Fehler. Lehrer können pro Runde weiterhin ein eigenes Budget setzen.

2. **Timer-Pop-ups budget-relativ machen**, statt fest auf 90:
   - Halbzeit-Pop-up bei `budget / 2` (Text: "Halbzeit. Die Hälfte der Zeit ist weg." statt "…der 90 Minuten").
   - "Letzte 15 Minuten"-Endspurt: Pop-ups bei `budget − 15`, `budget − 10`, `budget − 5` (statt fest 75/80/85).
   - Viertelstunden-Takte (15/30/60) bleiben als frühe Orientierungspunkte, Texte leicht neutralisieren ("Eine Viertelstunde rum", "Eine halbe Stunde", "Eine Stunde").
   - So stimmen die Pop-ups für jedes Budget, nicht nur 90.

3. **StartTimerOverlay** (`src/components/case-file/StartTimerOverlay.tsx:14,43`): Default `budget` von 90 auf 110, Text "In {budget} Minuten …" greift bereits korrekt — nur den Default-Wert anpassen.

## Technische Details

- `src/lib/progress.ts`: `TIMER_DURATION_MIN` 90 → 110; Kommentare ("90 Minuten") aktualisieren.
- `src/components/case-file/GlobalTimer.tsx`: `BEATS` von festen Minuten auf relative Berechnung (`budget/2`, `budget-15` usw.) umstellen; `getBudgetMin()` statt Konstante. Halbzeit-Text generalisieren.
- `src/components/case-file/StartTimerOverlay.tsx`: Default `budget` 90 → 110.
- Keine Änderungen an Punkte-, Badge- oder Etappen-Logik; Hinweis-Taktung (3/6/9 Min pro Etappe) bleibt unverändert — sie ist pro Etappe, nicht pro Gesamtzeit.

## Optional (nur bei Bedarf)

- Lehrer-Dashboard: sichtbaren Hinweis, dass 110 Min der Default sind und für längere Velorouten mehr Zeit sinnvoll ist.
- Falls 4 km Velo *zusätzlich* zur reinen Etappen-Zeit kommen sollen, ggf. 120 Min Default.
