# Bigger product photos on the market tiles

## Current state
Each tile is a square photo area. The photo has an inner margin of about 16px left/right and 12px top/bottom, and the whole tile has another 12px margin all around. On a phone, the photo fills only about 75% of the tile width.

## What's possible (maximum)
The photo can fill the whole tile width, edge to edge, like at the Migros. That's the maximum: wider isn't possible without making the tiles themselves wider, which would mean fewer tiles per row. Taller isn't possible either without making the tiles taller.

## Proposal: photo edge to edge
- Remove the photo's inner margin.
- Let the photo run to the tile edge at the top, left and right. Price, name and labels below keep their usual margin.
- The small cart icon stays in the top right corner on top of the photo, on its white circle so it stays visible.
- Each photo is centred and scaled to fit, so nothing gets cropped. Products photographed wide (for example a long pack) fill the width but leave white space above and below.

On a phone the photo then becomes about 30% larger.

## Technical details
- `src/components/case-file/GruenerMarkt.tsx`, `ProduktKarte`: remove `px-4 py-3` from the image box; use negative margin (`-mx-3 -mt-3`, `sm:-mx-4 sm:-mt-4`) to cancel the tile padding at the top and sides, with `rounded-t-sm` and `overflow-hidden`.
- Keep `object-contain object-center` (no cropping).
- Keep the cart button `absolute` with `z-10` on top.
