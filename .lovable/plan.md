## Anpassungen Tutorial in Etappe 5 (Gutachten)

**1. „? Hilfe"-Button in den Header (wie im Grünen Markt)**
- In `src/components/case-file/GutachtenRaetsel.tsx` einen Kopfbereich einführen mit Titel links (z. B. „Gutachten prüfen") und rechts einem Pill-Button „? Hilfe" im gleichen Stil wie in `GruenerMarkt.tsx` (`rounded-full border bg-paper px-2 py-1 font-mono-typed text-[10px] uppercase`).
- Den bisherigen kleinen `?`-Button neben „Prüfen →" entfernen. „Prüfen →" bleibt unverändert an seinem Platz.

**2. Schritt 2 nicht auf eine tatsächlich falsche Aussage zeigen**
- Aktuell hängt `aussageRef` an der allerersten Aussage in Gutachten A – das ist `f1` und damit eine echte Falschaussage. Der Spotlight verrät so die Lösung.
- Ref stattdessen an die zweite Aussage von Sektion 1 (`a2`, korrekt) hängen: die Bedingung `isFirst = i === 0 && ci === 0` durch `isTutorialTarget = i === 0 && ci === 1` ersetzen.

**3. Spotlight-Ausschnitt immer in der Bildschirmmitte**
- In `src/components/case-file/MarketTutorial.tsx` das bedingte `scrollIntoView` (nur wenn nicht sichtbar) durch ein unbedingtes `el.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" })` bei jedem Schrittwechsel ersetzen, gefolgt von einer Neuvermessung (bestehendes 120 ms Timeout bleibt).
- Sicherstellen, dass beim Öffnen zunächst zum Element gescrollt und danach das Rect gemessen wird, damit die Bubble relativ zum tatsächlich mittigen Ausschnitt platziert wird.

Keine weiteren Dateien betroffen, keine neuen Assets, keine Logikänderung am Rätsel selbst.