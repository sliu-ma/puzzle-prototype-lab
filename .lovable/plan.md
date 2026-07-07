# Plan: Energieetiketten in natürlicher Grösse anzeigen

## Ziel
Die Energieetiketten in der Geräte-Auswahl von Etappe 4 sollen mit ihrer natürlichen Breite von 240 px dargestellt werden (nicht mehr als kleines 32 px-Icon).

## Vorgeschlagene Änderung

1. **`EnergyLabel`-Komponente anpassen**
   - Datei: `src/components/case-file/EnergyGame.tsx`
   - Die `EnergyLabel`-Hilfskomponente aktuell rendert die Etikette mit `h-8` (32 px) Höhe und `w-auto`.
   - Geplant: Breite explizit auf 240 px setzen (`w-[240px]`), Höhe automatisch (`h-auto`) → natürliche 100 %-Darstellung im Original-Seitenverhältnis.
   - Der `size`-Parameter kann entfallen oder bleibt nur für künftige Verwendung erhalten; im Options-Modal wird die grosse Variante verwendet.

2. **Option-Row-Layout prüfen**
   - Das Etikett bleibt bereits unterhalb der Beschreibung positioniert (vorherige Umsetzung).
   - Es muss sichergestellt werden, dass 240 px Breite im Modal nicht über den verfügbaren Platz hinausragt. Falls nötig, wird ein `max-w-full` ergänzt.

3. **Verifizierung**
   - TypeScript-Check (`bunx tsgo --noEmit`).
   - Visueller Check im Preview: Gerät im Haus anklicken → Etikette sollte klar lesbar in 240 px Breite erscheinen.

## Nicht im Scope
- Keine Änderung an den Etiketten-Bilddateien selbst.
- Keine Änderung an Budget, Ziel, Gerätenamen oder Energiesparpunkten.
- Keine Änderung am Verhalten des Pop-ups (bleibt nach Auswahl geschlossen).