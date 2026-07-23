## Plan: Falschaussage in Etappe 5 verschieben

### Ziel
Die fünfte Fehler-IDs (`f5`) wird von Akte A (Wald-Schutzwürdigkeit) auf Akte C (Batterie-Lebensdauer) verschoben. Die Wald-Aussage in Akte A wird zu einer korrekten Decoy-Aussage, die den Bau des Erdgaskraftwerks weiterhin befürwortet.

### Änderungen

#### 1. `src/components/case-file/GutachtenRaetsel.tsx`

**Akte A – Standortbewertung**
- Aktuelle `E("f5", ...)`-Aussage über Wald-Kartierung und fehlende Schutzwürdigkeit wird zu einem `D(...)`-Decoy.
- Neuer korrekter Text: *„Der geplante Standort liegt in einer bereits für Gewerbezwecke ausgewiesenen Fläche."* (oder eine inhaltlich gleichwertige, den Bau befürwortende korrekte Aussage).
- Fehler-ID-Array und `MAX_MARKIERUNGEN` bleiben unverändert (weiterhin `f1`–`f5`).

**Akte C – Standortbewertung**
- Aktuelle Decoy-Aussage `D("c5", "Batteriespeicher halten etwa 15 bis 25 Jahre.")` wird zur neuen Fehleraussage `E("f5", "Batteriespeicher halten etwa 8 Jahre.")`.
- Faktencheck bleibt bestehen: in Marlenes Faktenkarte steht weiterhin `≈ 15–25 Jahre Lebensdauer`, damit die Aussage als falsch erkennbar ist.

#### 2. `src/routes/etappe-5.tsx`

**Auflösungs-Hinweis (Hint 3)**
- Text anpassen, damit die fünf Fehler korrekt beschrieben werden:
  - Gutachten A (Gas): „95 g CO₂/kWh — nahezu klimaneutral"
  - Gutachten B (Kohle): „78 % Wirkungsgrad" und „Kohle ist eine erneuerbare Brückentechnologie"
  - Gutachten C (Solar): „Volllaststunden im Schweizer Mittelland 250 h/Jahr" (real ≈ 900–1'100 h/Jahr) und „Batteriespeicher halten etwa 8 Jahre" (real ≈ 15–25 Jahre)

### Nicht betroffen
- Layout/Reihenfolge der Spalten (Diagramm / Faktenkarte / Aussagen)
- Prüf-Logik (`MAX_MARKIERUNGEN`, `alleFehlerIds`, `pruefen`)
- Charts und Faktenkasten-Struktur
- Hearing-Fragen in `src/routes/finale.tsx` (keine direkten Bezüge zu den beiden betroffenen Aussagen)

### Validierung
- Build ausführen, um TypeScript-Fehler auszuschliessen.
- Kurzer visueller Check in Etappe 5: Akte A zeigt die Wald-Aussage nicht mehr als Fehler, Akte C zeigt die 8-Jahre-Batterie-Aussage als Fehler.

### Geschätzter Aufwand
Kleine, fokussierte Änderung in 2 Dateien.