## Ziel

Etappe 2 (Dorfladen) wird vom "Fehler-Finden"-Rätsel zum echten Einkaufsentscheid: SuS starten mit **leerem Korb**, wählen aus allen Produkten selbst aus. Feedback erst an der Kasse. Texte, Buttons und Tipps werden angepasst.

## 1. Datenschicht (`src/lib/maya-data.ts`)

- `START_WARENKORB` = `[]` (leer statt vorgepackt).
- `zitrone-za` (Südafrika) → `bewertung: "schlecht"` + `problemHinweis` (lange Wege, kein Bio), damit die Kassenprüfung sie ablehnt.
- `zitrone-it` (Bio/Demeter Italien) → `bewertung: "gut"`, `ersetzt: "zitrone-za"` (Konsistenz mit Erdbeeren/Eiern).
- Rezeptzutaten bleiben unverändert; jede benötigte Zutat hat mindestens eine "gute/neutrale" Option im Sortiment (Mehl, Zucker, Salz, Butter, Rahm, Vanillezucker: je 1 Option; Erdbeeren/Eier/Zitrone: je 2 Optionen mit nachhaltig ✓ vs. weniger nachhaltig ✗).

## 2. Kassenlogik (`src/components/case-file/GruenerMarkt.tsx`)

Die Funktion `pruefen()` erhält echtes Feedback statt stiller Blockade:

- **Fall A – leer / unvollständig:** Meldung "Hast du alle Zutaten?" (kein Erfolg).
- **Fall B – vollständig, aber `schlechte` Produkte im Korb:** Meldung "Die Kasse springt nicht an. Schau dich nochmal um." (ohne konkret zu verraten welche).
- **Fall C – vollständig + keine schlechten:** bestehender Erfolgspfad (Bon, `onErfolg`).

Feedback wird im Sticky-Cart-Bereich unter dem Bezahlen-Button als kleine, ruhige Notiz eingeblendet und verschwindet, sobald der Korb geändert wird. Kein sofortiges Feedback beim Hinzufügen einzelner Produkte.

## 3. Texte & Buttons

`**src/routes/etappe-2.tsx**`

- Header-Untertitel: „Frau Bergers Einkaufskorb" → „Frau Bergers Regale".
- Meta-Description passt (bereits leerer Korb).
- Brief-Screen: Text steht bereits auf „leerer Korb" — bleibt.
- Button „Zum Einkaufskorb →" → **„In den Laden →"**.
- „← Zurück zum Korb" → „← Zurück in den Laden".
- Weiter-Button nach Input bleibt.

`**src/routes/etappe-1.tsx**` (Rätsel 1, Mobilität)

- Button „Nächstes Rätsel" → **„Weiter zu Etappe 2 →"** (bzw. analog zum Muster der anderen Etappen). Nur Buttontext, sonst nichts.

## 4. Tipps (`src/routes/etappe-2.tsx`, `HintSystem`-Props)

Etappe 2 nutzt die Default-Hints aus `HintSystem.tsx`. Wir übergeben stattdessen etappen-spezifische Hints via Prop (bereits unterstützt) und aktualisieren Fokus:

- **Tipp 1:** Fokus „leerer Korb → welche Zutaten brauchst du überhaupt? Prüfe das Rezept."
- **Tipp 2:** Fokus **Regionalität** (nicht Saisonalität, da Sommer): „Erdbeeren gibt's im Sommer sowohl aus der Schweiz als auch aus Spanien — die Schweizer Variante hat den viel kürzeren Weg. Auch bei **Zitronen** lohnt der Blick auf die Herkunft (Italien/Bio vs. Südafrika)."
- **Tipp 3 (Auflösung):** „Wähle Schweizer Erdbeeren (IP-Suisse), Schweizer Bio-Freiland-Eier und die Bio/Demeter-Zitrone aus Italien. Ergänze Mehl, Zucker, Salz, Butter, Vollrahm und Vanillezucker."

## 5. Nicht angefasst

- QR-Token, Route, StageGate, EnvelopeDialog-Flow, Fachlicher Input, Registrierkassen-Bon-Text.
- Andere Etappen (nur `etappe-1` Buttontext).
- Bilder/Assets.

## Technische Notizen

- `pruefen()` ruft heute schon `onErfolg` nur bei Erfolg auf; wir erweitern nur den Feedback-State (`feedback: null | "leer" | "nicht-nachhaltig"`).
- Reset des Feedbacks bei jedem `hinzufuegen`/`entfernen`.
- `zitrone-za.bewertung` von "neutral" → "schlecht" ist nötig, damit die vorhandene Prüfung greift.