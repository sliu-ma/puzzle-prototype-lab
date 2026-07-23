## Hearing: Fehlergrenze, adaptives Ende, Ratsreaktionen, Slider 0-40

### 1. Schieberegler F1 auf 0-40 Rappen (`src/routes/finale.tsx`)

- `min: 0`, `max: 40` (aktuell 0-50), `zielwert: 28`, `toleranz: 3` bleiben.
- `SliderView`: Startwert der Slider-Position auf Mitte des neuen Bereichs (20) setzen, Skala-Beschriftung ("0 Rp.", "40 Rp.") anpassen.

### 2. Fehlergrenze: max. 3 falsche Antworten

- Neue Konstante `MAX_FEHLER = 3`.
- `status` bekommt einen zusätzlichen Zustand: sobald `fehler > MAX_FEHLER` (also 4. Fehler), gilt das Hearing als **nicht bestanden**. Beantwortete Fragen bleiben sichtbar, weitere Fragen werden aber nicht mehr geblockt (Maja bekommt "nochmals eine Chance", siehe Punkt 4).
- Barometer-Logik bleibt als visuelle Anzeige, ist aber nicht mehr das Abbruchkriterium (kein "lost" durch Barometer 0). Stattdessen entscheidet ausschliesslich `fehler` vs. `MAX_FEHLER`.
- Persistenz: bestehende Keys `akte-finale-ergebnisse` / `-antworten` / `-aktuell` werden weiterverwendet, neuer Key `akte-finale-versuch` (Nummer des aktuellen Versuchs, für die Ratsreaktions-Dramaturgie).

### 3. Alternatives Ende: „Zweite Chance"

Wenn nach der letzten Frage `fehler > 3`:

- Statt `OutroScreen` erscheint eine neue Komponente `SecondChanceScreen` (in `finale.tsx`):
  - Kurze Dialog-Szene: Ratsmitglieder tauschen ratlose Blicke, Gemeindepräsident räuspert sich, Maja bekommt sichtbar noch eine Gelegenheit (2-3 Sprechblasen, Ton „amber/stamp").
  - Auflistung der falsch beantworteten Fragen (Nummer + Thema + kurze Erklärung), damit klar ist, worauf geachtet werden soll.
  - Button „Nochmals versuchen": setzt `ergebnisse`, `antworten`, `aktuell` zurück, `versuch` +1, `started` bleibt `true`. Etappe bleibt offen (kein `completeStage(6)` / `finishGame()`).
- Erst wenn Hearing mit ≤ 3 Fehlern abgeschlossen ist, läuft der bestehende Erfolgs-Flow (`completeStage(6)`, `finishGame()`, `OutroScreen`, Review).
- Review-Modus (nach Erfolg) bleibt unverändert erreichbar.

### 4. Adaptives Element: Live-Reaktion des Rats

- Neue Komponente `RatsReaktion` (oberhalb der aktuellen Frage, unter dem Fortschritts-/Barometerbalken):
  - Zeigt kurze, kontextuelle Reaktion je nach Verlauf (`correctCount`, `fehler`, `pulse`, letzte Frage/Thema).
  - Beispiele:
    - Nach richtiger Antwort: entsprechendes Ratsmitglied nickt zustimmend („Nachvollziehbar. Danke."), passend zum `thema` der Frage.
    - Nach falscher Antwort: skeptische Zwischenbemerkung („Sind Sie da sicher?"), themenspezifisch.
    - Bei 2 Fehlern: sichtbare Unruhe („Der Rat tuschelt.").
    - Bei 3 Fehlern: letzte Warnung („Ein weiterer Fehler und wir müssen abbrechen.").
    - Beim 4. Fehler: Übergang in `SecondChanceScreen` (siehe 3).
  - Beim zweiten Versuch (`versuch >= 2`) andere Reaktionslinie („Wir hören noch einmal zu.").
- Reaktionen sind kleine, animierte Sprechblasen (bestehende `SpeechBubble` wiederverwenden, `animate-fade-in`).
- Rein dramaturgisch: keine Auswirkung auf Fehlerzahl.

### 5. Anpassungen an bestehendem UI

- Fehlerzähler sichtbar machen: statt „Barometer" prominent ein kleiner Indikator „Fehler: X / 3" neben dem Barometer.
- „Barometer / lost"-Zustand aus der Rendering-Logik entfernen (kein vorzeitiger Abbruch mehr durch Barometer).
- Kein Text mit em/en-Dash (bestehende Konvention beibehalten).

### Technische Referenzen

- `src/routes/finale.tsx`
  - F1-Slider-Konfiguration: Zeilen ~164-180
  - `SliderView`: ab ~1700
  - Zustandslogik, Status, Result-Handling: ~342-425
  - Rendering-Zweige (`won` / `lost` / Review / Outro): ~466-575
  - Intro-Sequenz und `SpeechBubble`: ~2180-2287
- `src/lib/progress.ts`: `completeStage`, `finishGame` (unverändert, wird nur später aufgerufen)
