# Zwetschgen neu: Bio-Import vs. Schweizer IP-Suisse

## Ziel
Die Botschaft in Etappe 2 (Konsum) schärfen: Saisonal und regional schlägt importiert, selbst wenn die Importware Bio ist. Das hochgeladene Migros-Bild (Zwetschgen in Plastikschale) wird das neue Bild der importierten Bio-Zwetschgen.

## Änderungen

### 1. Neues Bild hochladen
- Das hochgeladene Bild wird als CDN-Asset `zwetschgen-import.webp` gespeichert (kein Binary im Code).
- Es ersetzt das bisherige Bild der Import-Zwetschgen.

### 2. Produktdaten anpassen (`src/lib/maya-data.ts`)
**Import-Zwetschgen (bleibt die schlechte Wahl):**
- Bild: neues Migros-Bild
- Siegel: neu **Bio** (statt kein Siegel)
- Herkunft: neu USA
- Hinweistext neu: Bio angebaut, aber um die halbe Welt gereist, während hier Saison ist. Plastikverpackung.
- Nachhaltigkeitsbarometer: Label steigt (Bio), regional und saisonal bleiben tief, Verpackung tief (Schale).

**Schweizer Zwetschgen (bleibt die gute Wahl):**
- Siegel: neu **IP-Suisse** (statt Bio)
- Erklärung neu: Schweizer IP-Suisse-Zwetschgen aus der Hauptsaison, kurze Wege.
- Bild und Preis bleiben.

### 3. Spieltexte anpassen (`src/routes/etappe-2.tsx`)
- Hinweis- und Auflösungstexte sprechen neu von den «Schweizer IP-Suisse-Zwetschgen» statt «Schweizer Bio-Zwetschgen»; die Begründung betont Herkunft und Saison vor Label.

## Technisch
- Keine ID-Änderungen (`zwetschge-import`, `zwetschge-bio-ch` bleiben), damit Rezept-Logik und Ersetzungen unverändert funktionieren.
- Keine Änderungen an anderen Produkten, Etappen oder der Datenbank.
- Danach Typecheck und Build prüfen.
