# Emojis im «Grüner Markt» durch Icons ersetzen

## Was sich ändert
- **Kategorie-Reiter** (Milchprodukte & Eier, Früchte & Gemüse, Backzutaten, Weiteres): Emojis werden zu schlichten Strich-Icons (Milch, Apfel, Weizen, Einkaufstasche).
- **Warenkorb-Knopf**: 🛒 wird zum Warenkorb-Icon.
- **Warenkorb-Liste, Produktkarten und Produkt-Popup**: Wo heute ein Emoji als Platzhalter oder Mini-Bild steht, erscheint ein passendes Icon (z. B. Apfel, Kirsche, Karotte, Milch, Ei, Weizen, Nuss) in einem kleinen Papier-Kreis im Field-Notes-Stil (Kraftpapierton, Stempelfarbe).
- Produktfotos bleiben unverändert; Icons nur dort, wo bisher Emojis waren.

## Technische Details
- Icons aus `lucide-react` (Milk, Apple, Cherry, Carrot, Egg, Wheat, Nut, Citrus, Leaf, Sprout, Salad, ShoppingBasket, ShoppingCart …).
- In `src/lib/maya-data.ts` das Feld `emoji` durch `icon` (Icon-Name) ersetzen, für alle 38 Einträge (Kategorien + Produkte); Zuordnung pro Emoji (🍓→Cherry, 🍋→Citrus, 🍎→Apple, 🍅/🎃/🍑→passende Frucht/Leaf, 🥬→Salad, 🌱→Sprout, 🌰→Nut, 🥛→Milk, 🥚→Egg, 🌾→Wheat …).
- Kleine Komponente `ProduktIcon` rendert das Icon mit semantischen Farb-Tokens.
- Anpassen: `GruenerMarkt.tsx` (Zeilen 184, 216, 300, 376) und `ProduktDetailDialog.tsx` (Zeile 68). Weitere Verwendungen von `emoji` im Projekt werden mitgezogen.
