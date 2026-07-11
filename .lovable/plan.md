## Ziel
Die drei "Fachlicher Input"-Karten in jeder Etappe (1–5) werden zu einem swipebaren Kartenstapel/Karussell, das für Mobile optimiert ist. Der Weiter-Button erscheint erst auf der letzten (dritten) Karte. Ein sichtbarer Hinweis macht den Swipe klar.

## Umsetzung

### 1. Neue Komponente `src/components/case-file/InputCarousel.tsx`
- Props: `title`, `kicker`, `intro`, `cards: { title, body, hint }[]`, `onBack`, `onNext`, `nextLabel` (z. B. `"Weiter zu Etappe 2 →"`).
- **Mobile-first Karussell** (immer, auf allen Breiten – die App ist für Mobile gemacht):
  - Horizontaler Scroll-Container mit `snap-x snap-mandatory`, jede Karte `w-[85vw] max-w-[380px] snap-center shrink-0`.
  - Beobachtung des aktiven Index via `IntersectionObserver` auf den Karten-Wrappern (Threshold 0.6).
  - Zusätzlich Touch/Pfeil-Steuerung: kleine Pfeil-Buttons links/rechts (nur bei ≥sm sichtbar) + Klick auf Dots scrollt zur Karte.
- **Swipe-Hinweis** (deutlich, aber nicht störend):
  - Unter der aktiven Karte: Dots-Indikator `● ○ ○` + Textzeile `"Karte 1 von 3 · nach links wischen"` mit animiertem Pfeil-Icon (`ChevronRight` mit dezenter Wischanimation via Tailwind `animate-pulse` + Translation).
  - Beim ersten Aufruf (kein `localStorage`-Flag `maya-input-swipe-hint`) einmalig ein größerer schwebender Hinweis `👉 Wische zur nächsten Karte` über die rechte Kartenkante, verschwindet beim ersten Scroll oder nach 4 s.
  - Rechter Rand des Containers zeigt einen "Peek" der nächsten Karte (~10 vw sichtbar), damit intuitiv klar ist, dass mehr kommt.
- **Fortschritts-/Weiter-Logik**:
  - `nextEnabled = activeIndex === cards.length - 1`.
  - Vorher: Button-Slot zeigt statt Weiter-Button eine kleine Anzeige `"Noch {n} Karten · weiterwischen"`.
  - Auf der letzten Karte: der primäre `nextLabel`-Button erscheint (gleiche Position wie heute unten rechts) plus `← Zurück` links.
- Optik bleibt konsistent zum Field-Notes-Look (`PaperCard`-Stil, `border-dashed`, `font-mono-typed`-Kicker).

### 2. Einbindung in die fünf Etappen-Routen
Nur die Sektion `step === "input"` wird ersetzt. Der Karten-Content (Titel, Body, Hint) wird 1:1 an die neue Komponente übergeben. Betroffen:
- `src/routes/etappe-1.tsx` (Nachhaltige Mobilität, "Weiter zu Etappe 2 →")
- `src/routes/etappe-2.tsx` (3 Lernkarten, "Weiter zu Etappe 3 →")
- `src/routes/etappe-3.tsx` (Biodiversität, "Weiter zu Etappe 4 →")
- `src/routes/etappe-4.tsx` (Wohnen & Energie, "Weiter zu Etappe 5 →")
- `src/routes/etappe-5.tsx` (Energieträger, "Weiter zum Finale →" – Label prüfen)

Kein anderer Etappen-Code (Rätsellogik, Persistenz, Hints) wird angefasst.

### 3. Persistenz
- `activeIndex` wird nicht global persistiert – Karten sind rein informativ, Weiter-Zustand hängt am bestehenden Step-Modell.
- `maya-input-swipe-hint` (bool) im `localStorage`, damit der große Hinweis nur beim allerersten Mal erscheint. Wird von `resetAll` in `src/lib/progress.ts` mitgelöscht (Prefix `maya-*` ist bereits abgedeckt).

## Technisches

- CSS-Snap statt JS-Drag – robust, ohne zusätzliche Library.
- IntersectionObserver liegt in `useEffect`; Referenzen via `useRef<HTMLDivElement[]>`.
- Kein neuer npm-Import nötig; Icons aus vorhandenem `lucide-react` (`ChevronRight`, `ChevronLeft`).

## Ergebnis
- Auf Mobile: eine Karte pro "Blick", flüssiges Swipen, klarer Fortschritts- und Swipe-Hinweis, Weiter-Button erst auf Karte 3.
- Fünf Etappen erhalten das Verhalten identisch, ohne Rätsel- oder Fortschrittslogik zu ändern.
