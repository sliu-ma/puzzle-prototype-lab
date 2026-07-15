# Plan: Achievement-System mit custom Badges (Vollausbau)

14 Achievements, komplett clientseitig via `localStorage`. Freischaltung erzeugt einen Live-Toast (sonner) mit Badge-Grafik, Endanzeige als Badge-Galerie im Outro.

## Badge-Grafiken

Statt generischer Emojis erhält jedes Achievement ein eigenes illustriertes Badge — quadratisches PNG mit transparentem Hintergrund, gemeinsame Kreisrahmen-Form, konsistenter Illustrationsstil (leicht vintage, passend zum Field-Notes-Look).

Alle Badges werden via `imagegen--generate_image` (premium, transparent, 512×512) generiert und unter `src/assets/badges/` als `.png.asset.json`-Pointer abgelegt. Import über `import { url } from "@/assets/badges/xy.png.asset.json"`.

**Zeit / Effizienz**

1. **Blitzermittler:in** – Goldener Blitz durch silberne Lupe, dunkelblauer Kreis
2. **Punktlandung** – Zielscheibe rot/weiss, Pfeil im Bull's-Eye, leicht schräg
3. **Marathonläufer:in** – Ziellinien-Band + laufende Füsse, warmes Grün (Basis-Look)
4. **Sprinter:in** – Silberne Stoppuhr mit goldenen Flügeln, Zeiger ~5 Min

**Hinweise**
5. **Solo-Detektiv:in** – Dunkelbrauner Detektivhut mit grüngläsiger Lupe, Schwarz-Gold
6. **Kopf statt Karte** – Lila-rosa Gehirn mit leuchtendem warmgelben Glühfaden
7. **Genügsam** – Drei Fragezeichen (zwei durchgestrichen), mint-grün ruhig

**Etappen-spezifisch**
8. **Weltreisende:r** (E1) – Vintage-Zugticket, roter "Erste Wahl"-Stempel, leicht geneigt
9. **Grüner Daumen** (E2) – Erdbraune Hand, aus Daumen wächst Pflanze mit zwei Blättern
10. **Ornitholog:in** (E3) – Waldvogel-Silhouette auf Ast, Fernglas darunter, dunkelgrün
11. **Energiespar-Champion** (E4) – Glühbirne, Faden ersetzt durch Blatt, gelb-grün
12. **Perfect Recall** (Finale) – Schwere goldene Krone mit 10 Sternzacken

**Easter Eggs**
13. **Neugierig** – Türkis-blaues Auge mit aufgeklappter Lupe in der Iris  
14. **Zurückgeblickt** – Auto-Rückspiegel mit fünf kleinen Symbolen (Zug, Korb, Baum, Haus, Blitz), warm-braun

## Achievement-Logik

**Neue Datei `src/lib/achievements.ts**`

- Typ `AchievementId` (Union aus 14 IDs)
- Konstante `ACHIEVEMENTS: Record<AchievementId, { title, description, badgeUrl }>` — `badgeUrl` aus dem `.asset.json`-Pointer
- Funktionen:
  - `unlock(id)` – idempotent, schreibt in `localStorage` (`maya-achievements`), feuert beim ersten Freischalten einen sonner-Toast mit Badge-Bild + Titel
  - `isUnlocked(id)` / `getUnlocked()` – Lesezugriff
  - `incrementHintCount()` / `getHintCount()` – globaler Hinweis-Zähler
  - `markStageHintless(nr)` / `markProduktGeoeffnet(id)` / `markFaktenkarteGeoeffnet(id)` / `markRueckblickGeoeffnet(nr)` – Tracking-Helfer
  - Hook `useAchievements()` für reaktive Anzeige im Outro
- Wird von `resetAll()` in `progress.ts` mit erfasst (Präfix `maya-` bereits berücksichtigt)

**Tracking-Integration (kleine Änderungen)**

- `HintSystem.tsx` — `incrementHintCount()` beim Aufdecken; `markStageHintless(nr)` beim Etappen-Abschluss falls Count = 0
- `GruenerMarkt.tsx` — Fehlversuchs-Zähler → `unlock('gruener-daumen')` bei Erfolg im 1. Versuch; Detail-Öffnen → `markProduktGeoeffnet`
- `RouteCards.tsx` / Etappe 1 — Fehlversuchs-Zähler für optimale Route → `unlock('weltreisende')`
- `CodeLock.tsx` in Etappe 3 — Fehlversuchs-Zähler für 456 → `unlock('ornitholog')`
- `EnergyGame.tsx` — nach Erfolg ESP prüfen (> 4000) → `unlock('energie-champion')`
- `finale.tsx` — Quiz-Fehlversuchs-Zähler → `unlock('perfect-recall')`; bei Spielende: `unlock('marathon')`, Zeit-Vergleich für Blitz/Punktlandung, Auswertung von Hinweisen (solo/kopf/genügsam)
- Etappen-Routen im Rückblick-Modus — `markRueckblickGeoeffnet(nr)`; alle 5 → `unlock('zurueckgeblickt')`

**Live-Toast (sonner)**

```
toast.success(title, {
  description,
  icon: <img src={badgeUrl} className="h-10 w-10" />,
  duration: 5000,
})
```

**Outro-Anzeige (`OutroScreen.tsx`)**

- Neuer Abschnitt "Errungenschaften" nach Score
- Zähler: "8 / 14 Achievements"
- Grid (3 Spalten mobile, 5 desktop) mit allen 15 Badges:
  - Freigeschaltet: farbige Badge-Grafik + Titel darunter
  - Gesperrt: Badge in Graustufen mit 20% Opacity + "?" Overlay, kein Titel
- Tap/Hover auf Badge zeigt Beschreibung (kleiner Popover/Dialog)

## Ausgeschlossen

- Kein Dashboard-Trophäenschrank
- Kein Backend / kein Sync über Geräte
- Keine Tageszeit-Achievements