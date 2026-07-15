In `src/components/case-file/GruenerMarkt.tsx` (Komponente `ProduktKarte`) die Label-Badges vergrössern:

- `h-5 w-5` → `h-7 w-7` (mobile), `sm:h-[22px] sm:w-[22px]` → `sm:h-8 sm:w-8`
- Padding leicht anpassen (`p-0.5` → `p-1`), damit das Logo im runden Badge weiterhin gut sitzt
- Fallback-Text-Chip bleibt unverändert

Keine weiteren Änderungen.