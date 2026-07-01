## Adaptive Zeitangaben im Spiel

### Prinzip
- **Fixe Zeit:** Nur das Hearing-Ende = `startTs + 90 Minuten` (Deadline aus dem globalen Timer).
- **Dynamische Zeiten:** Alle narrativen Zeitstempel innerhalb der Akten (Briefe, Notizen, "Noch X Stunden bis...", Voicemail-Timestamps beim Öffnen etc.) verwenden die **aktuelle Uhrzeit** beim Rendern — nicht hochgerechnet vom Start.
- **Time-Up:** Wenn 90 Minuten abgelaufen sind → Vollbild-Overlay "Die Zeit ist leider um. Begebe dich zurück zur Schule." Spielabbruch.

### Umsetzung

**1. `src/lib/progress.ts`** — neue Helfer:
- `formatClock(date)` → `"HH:MM"`
- `getNow()` → aktuelle Uhrzeit als `"HH:MM"`
- `getHearingClock()` → `startTs + 90min` als `"HH:MM"` (fix ab Registration)
- `isTimeUp()` → boolean (jetzt > startTs + 90min)

**2. `src/components/case-file/TimeUpOverlay.tsx`** (neu)
- Vollbild, nicht schließbar, dunkler Hintergrund
- Text: "Die Zeit ist leider um." + "Begebe dich zurück zur Schule."
- Verhindert Interaktion mit dem Spiel dahinter

**3. `src/components/case-file/GlobalTimer.tsx`**
- Prüft `isTimeUp()` im Interval — rendert `<TimeUpOverlay />` wenn abgelaufen
- Stoppt weitere Pop-Ups nach Ablauf

**4. Narrative Texte in Routen aktualisieren**
Ersetzt hartcodierte Uhrzeiten durch dynamische Werte:
- `akte.tsx`, `akte-002.tsx`, `akte-003.tsx`, `akte-004.tsx`, `akte-005.tsx`: Zeitstempel in Briefen/Notizen/Sprachnachrichten → `getNow()` beim Mount (einmalig via `useState(() => getNow())`, damit die Zeit beim Neurendern der Karte stabil bleibt).
- `finale.tsx`: "Noch ein paar Stunden bis 19:00" → "Noch Zeit bis **{getHearingClock()}**" (fix, weil das die echte Deadline ist).

### Offene Frage
Bei Voicemails/Briefen soll die Zeit beim **ersten Öffnen der Akte** eingefroren werden (via `localStorage` pro Akte), oder darf sie sich beim erneuten Öffnen auf die dann-aktuelle Zeit updaten? Ich würde **einfrieren pro Akte** empfehlen, damit die Erzählung konsistent bleibt.