## Ziel

Etappe 4 (Wohnen) bekommt das neue Haus, neue Räume (Wäscheraum statt Garage/Heizkeller), neue Zahlen aus `Energieposten.pdf` und spricht ab jetzt von **Energiesparpunkten (ESP)** statt kWh. Die Kernbotschaft: **einfache Verhaltensänderungen bringen ohne Kosten schon viel**.

## 1. Neues Haus-Asset

- Upload `wohnenraetsel.png` per `lovable-assets create` → `src/assets/haus.png.asset.json`.
- `EnergyGame.tsx`: `houseBg`-Import auf neues Asset umstellen.
- Bildabmessungen des neuen PNGs ermitteln und `IMG_W`/`IMG_H` in `energy-data.ts` entsprechend anpassen (Koordinaten aus der PDF beziehen sich auf dieses Bild).

## 2. `src/lib/energy-data.ts` neu aufbauen

Räume neu: **Schlafzimmer, Bad, Wäscheraum, Wohnzimmer, Küche** (Garage & Heizkeller entfallen; Heizung wandert ins Schlafzimmer als "Wärmepumpe / Raumtemperatur").

Neue Geräte + Optionen (Werte 1:1 aus PDF, `energy` heisst jetzt ESP):

- **Fernseher** (Schlafzimmer): Alter LCD 0/0, LED E-Klasse 700/50, D-Klasse 1000/90
- **Heizung / Raumtemperatur** (Schlafzimmer): 22° 0/0, 20° 0/740, 18° 0/1480
- **Dusche** (Bad): 10 Min 0/0, 5 Min 0/820, Sparbrause 30/1150
- **Tumbler** (Wäscheraum): Alt 0/0, A+++ 700/350, Aufhängen 0/550
- **Waschmaschine** (Wäscheraum): 40–60° 0/0, Eco-Programm 0/340, Neue Maschine 1700/390
- **Staubsauger** (Wäscheraum): Alt 0/0, Neu 100/45, Sehr effizient 200/70
- **Lampe** (Wohnzimmer): Halogen 0/0, Sparlampe 30/300, LED 60/350
- **Geschirrspüler** (Küche): Normal 0/0, Eco 0/150, Von Hand 0/**−90** (schlechte Option)
- **Ofen** (Küche): Alt 0/0, Umluft A 0/20, Umluft A+++ 700/70
- **Kühlschrank** (Küche): Alt 0/0, 5→7 °C 0/90, Neues Gerät 1000/320
- **Herd** (Küche) — **neu: 3 Untergruppen** in einem Modal, jede mit eigener Auswahl:
  - *Kochen im Topf*: ohne Deckel 0/0, mit Deckel 0/120
  - *Kochgeschirr*: zu klein 0/0, korrekte Pfannengrösse 0/100
  - *Herdplatte*: Gusseisen 0/0, Glaskeramik 300/50, Induktion 750/100

### Typänderung

`EnergyDevice.options` wird optional; neu:
```ts
type OptionGroup = { id: string; label: string; options: EnergyOption[] };
type EnergyDevice = { ...; options?: EnergyOption[]; groups?: OptionGroup[] };
```
Ein Gerät hat entweder `options` (Standard) **oder** `groups` (Herd). Totals summieren beim `groups`-Fall über die gewählte Option pro Gruppe.

Negativer ESP-Wert (Handabwasch) wird zugelassen — Totals dürfen sinken.

### Budget & Ziel

- **Budget: 1'000 CHF** (statt 1'500) — zwingt zu Verhaltensfokus.
- **Ziel: 3'500 ESP.** Erreichbar praktisch nur mit Verhalten (ca. 3'670 ESP komplett gratis: 18° / kurz duschen / aufhängen / Eco-Wäsche / Eco-Spülen / Umluft / Deckel+Pfanne / Kühlschrank 7°). Kleine Zusatzkäufe (LED-Lampe 60, Sparbrause 30) polstern.
- `formatNumber` bleibt.

## 3. `EnergyGame.tsx` anpassen

- Alle Texte `kWh` → `Energiesparpunkte` (Kurzform **ESP** in HUD).
- Ziel-Banner-Text: "Ziel: mind. **3'500 ESP** sammeln, ohne das Budget zu sprengen. Tipp: Viele Punkte gibt es gratis — Gewohnheiten schlagen teure Geräte."
- HUD-Icon für ESP bleibt `Zap`; Label „Ersparnis" → „Energiesparpunkte".
- `ENERGY_TARGET = 3500`, Import `BUDGET` bleibt (nun 1'000).
- `DeviceModal`: wenn `device.groups` existiert, rendere pro Gruppe eine kleine Überschrift + Optionsliste (statt einer flachen Liste). Auswahl-State erweitern: `choices` speichert entweder `string` oder `Record<groupId,string>`.
- Fehlermeldung passt auf ESP an.
- „−X ESP" bei negativen Deltas rot einfärben.

## 4. `src/routes/etappe-4.tsx` Texte

- Zettel-Blockquote: „Heizkeller" entfernen, neue Raumliste (Schlafzimmer, Bad, Wäscheraum, Wohnzimmer, Küche).
- Notiz-Zeile: "[Hauszeichnung + Rechnungen aus der Kiste · … Uhr]" bleibt.
- Rätselkarten-Liste:
  - „5 Räumen" bleibt korrekt (jetzt Schlafzimmer/Bad/Wäscheraum/Wohnzimmer/Küche).
  - „1'500.– CHF" → **„1'000.– CHF"**.
  - „mind. 10'000 kWh" → **„mind. 3'500 Energiesparpunkte"**.
- Elvira-Zettel „Nächste Etappe": „10'000 kWh" → „3'500 Energiesparpunkte".
- Fachlicher Input-Karten leicht anpassen: „kWh" nicht mehr erwähnen; Beispiele weiter passend (Verhalten, Wärme-Hülle, Effizienzklasse). Kein grosser Umbau.
- `HINTS_004` neu:
  - Tipp 1: „Grosse Posten zuerst: Heizung/Raumtemperatur, Dusche, Wäsche. Kleine Icons wie Staubsauger bringen wenig."
  - Tipp 2: „Gewohnheiten sind gratis und stark: 18° heizen, kurz duschen, Wäsche aufhängen, Eco-Programme, Deckel auf den Topf. Das reicht fast schon für das Ziel."
  - Tipp 3 (Auflösung): „Reine Verhaltenswahl bringt ~3'670 ESP: 18° (1480) + 5-Min-Dusche (820) + Aufhängen (550) + Eco-Waschen (340) + Eco-Spülen (150) + Umluft (20) + Deckel+Pfannengrösse (220) + Kühlschrank 7° (90). Ergänze LED-Lampe (60 CHF) oder Sparbrause (30 CHF) als günstige Upgrades."

## 5. Nicht angefasst

`StageGate`, `QRGate`, Token, Route-Path, EnvelopeDialog, andere Etappen, `mobility`-/`maya`-Daten, Fortschrittslogik.

## Technische Notizen

- Negatives ESP-Total möglich (Handabwasch) → `energy` als `number` ohne Clamp; Ziel-Check `totals.energy >= 3500` bleibt korrekt.
- `groups`-Modal: initialer State setzt pro Gruppe die erste (schlechte) Option als Default, konsistent zu heute.
- Wenn die neuen PDF-Pixelkoordinaten nicht 1:1 zur Bildauflösung passen, feinjustiere `IMG_W`/`IMG_H` und einzelne Boxen visuell nach dem ersten Render.
