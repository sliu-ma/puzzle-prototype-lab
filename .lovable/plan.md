## Ziel

Im Grünen Markt (Akte 001) werden Produkte anklickbar. Ein Klick auf Bild/Karte öffnet ein Detail-Popup mit Foto, Label-Logos, Herkunft/Zutaten und einem 5-stufigen Nachhaltigkeitsbarometer. Die Übersicht zeigt – wo verfügbar – echte Produktbilder statt Emojis. Der „+ In den Korb"-Button bleibt unten auf der Karte und wird nicht durch das Popup ausgelöst.

## Assets

Hochgeladene Bilder werden als Lovable-Assets registriert (CDN-Pointer in `src/assets/*.asset.json`), damit keine Binaries im Repo liegen:

- Produktfotos: Erdbeeren CH, Erdbeeren ES, Zitrone (Demeter), Mehl (M-Classic), Vollrahm (Valflora)
- Label-Logos: Migros Bio, IP-Suisse, Demeter

Produkte ohne Bild behalten vorerst das Emoji als Fallback (User liefert später nach). Die Zitrone wird zusätzlich mit Demeter-Label markiert.

## Datenmodell (`src/lib/maya-data.ts`)

`Produkt` wird erweitert:

- `bildUrl?: string` — optionales Produktfoto (Asset-Import). Fällt zurück auf `emoji`.
- `siegel` bekommt strukturierten Typ: `Array<{ key: "bio-suisse" | "ip-suisse" | "demeter" | "migros-bio" | "fairtrade" | "bio-import"; label: string }>` damit Logos sauber zugeordnet werden.
- Neues Feld `nachhaltigkeit`:
  ```ts
  {
    regional: 1–5,
    saisonal: 1–5,
    verpackung: 1–5,
    label: 1–5,
    erklaerung: string  // 1–2 Sätze, warum diese Bewertung
  }
  ```
  Gesamtwert wird aus dem Durchschnitt berechnet.

Bestehende `bewertung` (gut/schlecht/neutral) und `problemHinweis` bleiben — sie steuern weiterhin die Rätsel-Logik beim Bezahlen.

## Neue Komponente: `ProduktDetailDialog.tsx`

Auf Basis von `@/components/ui/dialog`. Layout (gemäß User-Vorgabe):

1. **Bild** — großes Produktfoto auf paper-Hintergrund, Fallback Emoji-XXL
2. **Label-Logos** — horizontale Reihe von Logo-Chips (nur vorhandene Labels), darunter Saison-Badge falls relevant
3. **Herkunft & Zutaten** — Block mit Herkunft, Preis, ggf. „Für Rezept: <Zutat>"
4. **Nachhaltigkeitsbarometer** — 4 Sub-Kategorien als horizontale Balken (5 Punkte / gefüllt-leer), darüber Gesamtscore (große Zahl + Punkt-Skala), darunter Erklärungstext

Stil bleibt im Krimi-Dossier-Look (paper, ink, font-serif/mono-typed). Keine Emojis in Buttons/Labels — nur als Bild-Fallback.

## Änderungen `GruenerMarkt.tsx`

- `ProduktKarte`: Bild-Bereich wird `<button>` der das Dialog öffnet (`onOpenDetail`). Der vorhandene „+ In den Korb"-Button bleibt separat unten.
- State `detailProdukt: Produkt | null` im Parent, übergeben an `ProduktDetailDialog`.
- Wo `bildUrl` vorhanden: `<img>` rendern (object-contain, aspect-square), sonst Emoji wie bisher.
- Siegel-Chips zeigen weiterhin Textlabel in der Karte; im Dialog erscheinen die Logos.

## Dateien

- `src/lib/maya-data.ts` — Schema erweitern, Bilder/Logos importieren, alle Produkte mit `nachhaltigkeit`-Werten und (wo vorhanden) `bildUrl` befüllen, Zitrone zusätzlich `demeter`-Label.
- `src/assets/*.asset.json` — neue Pointer für 5 Produktbilder + 3 Label-Logos (via `lovable-assets create` aus `/mnt/user-uploads/`).
- `src/components/case-file/ProduktDetailDialog.tsx` — neue Komponente.
- `src/components/case-file/GruenerMarkt.tsx` — Karte klickbar machen, Dialog einbinden, Bild-Rendering.

## Technische Hinweise

- `.jxl`-Dateien werden über lovable-assets (CDN) ausgeliefert; das umgeht Browser-Kompatibilität nicht. Falls JXL im Browser nicht lädt, konvertiere ich die beiden betroffenen Bilder (Mehl, Vollrahm) zu `.jpg` vor dem Upload.
- Dialog stoppt Klick-Propagation, damit der Korb-Button auf der Karte unabhängig bleibt.
- Rätsel-Logik (Pruefen-Button) bleibt unverändert.
