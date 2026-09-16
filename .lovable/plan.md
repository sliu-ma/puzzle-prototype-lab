# Weg zum Hearing klarer machen: Adresse + Mini-Karte

Die Schülerinnen und Schüler wissen nach Etappe 5 nicht klar genug, dass sie
physisch zum **Gemeindehaus Widnau, Neugasse 4, 9443 Widnau** müssen, um dort den
QR-Code für das Hearing zu scannen. Aktuell steht die Adresse nirgends; nur
«Gemeindesaal Widnau» und im QR-Gate «am Gemeindehaus Widnau».

## Was die Gruppen künftig sehen

An den zwei Wendepunkten, an denen das Hearing das nächste Ziel ist, erscheint
ein klarer Hinweisblock:

- **Adresse:** «Gemeindehaus Widnau · Neugasse 4 · 9443 Widnau»
- **Mini-Karte:** kleine OpenStreetMap-Karte (Leaflet) mit Marker auf dem
  Gemeindehaus, Tap/Click öffnet ein Popup mit der Adresse.
- **Route-Button:** «Route in Google Maps öffnen» öffnet auf dem Handy die
  Google-Maps-Suche nach «Gemeindehaus Widnau, Neugasse 4, 9443 Widnau».

Die zwei Stellen:

1. **Etappe-5-Schlusskarte** (`src/routes/etappe-5.tsx`, Schritt `naechstes`):
   unterhalb des Marlene-Zitats, vor dem «Hearing starten»-Button.
2. **Übersicht** (`src/routes/index.tsx`): unterhalb der Finale-`NextStepCard`,
   sobald `currentStage >= 6` und nicht fertig/Zeit abgelaufen.

Das QR-Gate auf `/finale` bleibt unverändert («am Gemeindehaus Widnau»).

## Technische Umsetzung

### Neue Komponente `src/components/case-file/HearingLocationHint.tsx`

- Leaflet-Karte via dynamischem Import (wie `RouteMap.tsx`), OpenStreetMap-Tiles,
  kein API-Key nötig (funktioniert auf Custom-Domain `majasmission.ch`).
- Fixer Marker auf das Gemeindehaus Widnau, Popup mit Adresse.
- `viewport={"width":1280,"height":1800}`-freundlich: Karte ca. 240×160 px,
  mobil vollbreit.
- Button `Route in Google Maps öffnen` →
  `https://www.google.com/maps/search/?api=1&query=Gemeindehaus%20Widnau%20Neugasse%204%209443`
  (öffnet in neuer Registerkarte).
- `<ClientOnly>`-Wrapper oder `useHydrated`, damit SSR nicht bricht (Leaflet
  greift auf `window` zu) — analog zu `RouteMap.tsx`.

### Koordinaten

Gemeindehaus Widnau, Neugasse 4: ca. **47.4117, 9.6415** (aus der Adresse
abgeleitet). Falls du exakte Koordinaten hast, setze ich sie ein. Die Karte
reicht mit Zoom 16, ein paar Meter Abweichung sind für das Auffinden egal.

### Einbau

- `src/routes/etappe-5.tsx` (Schritt `naechstes`, ~Zeile 274 vor dem
  Button-Block): `<HearingLocationHint />` einfügen.
- `src/routes/index.tsx` (im Finale-`NextStepCard`-Block, ~Zeile 402–410):
  `<HearingLocationHint />` einfügen, nur wenn `currentStage >= 6`.

### Keine Änderungen

- Keine Datenbank-, Punkte-, Token- oder QR-Code-Änderungen.
- QR-Gate-Texte in `finale.tsx` bleiben.
- `STAGES`-Ort «Gemeindesaal» bleibt (Übersichtsliste); der neue Hinweis ergänzt
  nur die physische Adresse.
- Rätsellogik, Badges, Timer, Hörgerklaus unberührt.

## Prüfung

- `bunx tsgo --noEmit` ohne Fehler.
- Build OK (`/tmp/observability/build-errors.log`).
- Preview: Etappe-5-Schluss und Übersicht zeigen Adresse + Mini-Karte +
  Route-Button; Karte lädt auf Mobilgerät, Route-Button öffnet Google Maps.
