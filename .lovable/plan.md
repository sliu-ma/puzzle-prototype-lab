Die App verwendet fast überall "Etappe" (Etappe 1–5), aber `QRGate.tsx` zeigt noch hartkodiert "Akte 001 · Versiegelt".

Plan:
1. `QRGate.tsx` um ein `label`-Prop erweitern (z. B. `label="Etappe 2 · Versiegelt"`), damit jede Etappe ihre eigene Bezeichnung trägt.
2. Fallback-Texte in `QRGate.tsx` anpassen:
   - "Lade Akte …" → "Lade Etappe …"
   - "… passt nicht zur Akte" → "… passt nicht zur Etappe"
   - "… bleibt die Akte verschlossen" → "… bleibt die Etappe verschlossen"
   - Default-Titel: "QR-Code scannen, um Etappe zu öffnen"
3. Alle 5 Routen (`akte.tsx`, `akte-002.tsx` bis `akte-005.tsx`, `akte-003.tsx`) bekommen das passende `label` mitgegeben.

Am Ende ist durchgehend "Etappe" verwendet – kein gemischtes "Akte" mehr im sichtbaren UI.