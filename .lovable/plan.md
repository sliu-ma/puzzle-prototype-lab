## Ziel

Etappe 4 bekommt drei Verbesserungen:

1. **Energieetiketten (A–G)** als Farbpfeil-Badges an relevanten Geräteoptionen.
2. **Imaginäre Produktnamen** — **nur** für echte Haushaltsgeräte (Alt/Neu-Varianten), nicht für Verhaltens- oder Programmoptionen.
3. **Herd zweistufig**: erst 3 Untergruppen wählen, dann erst die Massnahmen anzeigen.

## 1. Energieetiketten als Assets

- 7 Uploads → `src/assets/label-a.png.asset.json` … `label-g.png.asset.json` via `lovable-assets create` aus `/mnt/user-uploads/a.png` … `g.png`.
- Kleine Inline-Komponente `EnergyLabel` in `EnergyGame.tsx`, statisches `labelMap`.

## 2. `EnergyOption` erweitern

```ts
type EnergyLabel = "A" | "B" | "C" | "D" | "E" | "F" | "G";
interface EnergyOption {
  id: string;
  label: string;            // Sach-Bezeichnung
  productName?: string;     // Fun-Name — NUR bei echten Geräten
  description: string;
  cost: number;
  energy: number;
  energyLabel?: EnergyLabel;
}
```

## 3. Fun-Namen + Etiketten — Regel

**Fun-Namen bekommen NUR echte Haushaltsgeräte** (Alt- oder Neu-Variante mit Anschaffung/Ersatz). Verhaltensoptionen, Programme, Temperatur-Einstellungen, Zubehör (Sparbrause, Deckel, Pfannengrösse) bekommen **keinen** Fun-Namen — sie behalten nur ihr sachliches Label.

**Fernseher** (alles Geräte):

- Alter LCD → *Röhrenknight 2003*, Label **F**
- LED E-Klasse → *Flimmerkiste Standard*, Label **E**
- D-Klasse → *PixelPro Eco*, Label **D**

**Tumbler** (Text „A+++" → „A"):

- Alter Tumbler → *Heissluft-Otto*, Label **F**
- Neues Gerät A → *TrockenFix A*, Label **A**
- Wäsche aufhängen → **kein** Fun-Name, **kein** Label

**Waschmaschine**:

- 40–60 °C → **kein** Fun-Name, **kein** Label (Programm)
- Eco-Programm → **kein** Fun-Name (Programm)
- Neue Waschmaschine A (Text „A" statt A+++) → *SauberStar A*, Label **A**
- Für alte Waschmaschine bleibt es beim reinen Sach-Label — sie ist zwar Gerät, aber die Option beschreibt hier das Waschprogramm der bestehenden Maschine. Kein Fun-Name.

**Staubsauger** (alles Geräte):

- Alter Staubsauger → *Turbo-Sauger 2000*, Label **F**
- Neues Gerät → *SaugMeister*, Label **C**
- Sehr effizient → *SilentVac Pro*, Label **A**

**Lampe** (alles Leuchtmittel-Geräte):

- Halogen → *Glühbirne Retro*, Label **E**
- Energiesparlampe → *Sparlicht Kompakt*, Label **B**
- LED → *LumiLED Bright*, Label **A**

**Ofen** (alles Geräte):

- Alter Backofen → *Backofen Grossmutter*, Label **E**
- Umluft A → *Backen mit Umluft*, **kein Label**
- Umluft A+++ (Text bleibt) → *EcoBake Pro*, Label **A**

**Kühlschrank**:

- Altes Gerät → *Frostbeule 1998*, Label **F**
- 5 → 7 °C → **kein** Fun-Name, **kein** Label (Temperatur-Einstellung)
- Neues Gerät A (Text „A+++" → „A") → *ArcticFresh A*, Label **A**

**Dusche** — alle Optionen sind Verhalten/Zubehör → **keine** Fun-Namen, keine Labels.

**Heizung / Raumtemperatur** — Temperatur-Einstellung → **keine** Fun-Namen, keine Labels.

**Geschirrspüler** — Programme/Verhalten → **keine** Fun-Namen, keine Labels.

**Herd-Gruppen** — Kochverhalten & Kochgeschirr → **keine** Fun-Namen. Bei Herdplatte sind Glaskeramik/Induktion technisch Geräte, aber sie stehen als Umbau-Massnahme in der Gruppe „Herdplatte" — konsistent halten und **keine** Fun-Namen vergeben. Keine Labels.

Text-Anpassungen „A+++" → „A" bei Tumbler / Waschmaschine / Kühlschrank in `label` und `description`.

## 4. Herd zweistufig im Modal

Neuer lokaler State im `DeviceModal`: `openGroup: string | null` (start: `null`).

- `openGroup === null` und `device.groups`: rendere 3 kompakte Gruppen-Tiles („Kochen im Topf", „Kochgeschirr", „Herdplatte") mit „aktuell: <currentOpt.label>" + Chevron. Klick → `openGroup = g.id`.
- `openGroup !== null`: nur die Optionen dieser Gruppe + „← Zurück zur Auswahl"-Button (setzt `openGroup` zurück).
- Beim erneuten Öffnen des Modals wieder `null`.

Nicht-Gruppen-Geräte unverändert.

## 5. `OptionRow` UI-Ergänzung

- `productName` (falls gesetzt): klein/italic unter dem `label`, `text-foreground/60`.
- `energyLabel` (falls gesetzt): Badge oben rechts in der Zahlenspalte (über Coin / ESP).

## 6. Nicht angefasst

Budget (1'000), Ziel (3'500 ESP), Koordinaten, Zahlen, andere Etappen, Route-Texte in `etappe-4.tsx`.

## Technische Notizen

- 7 Label-Assets als statisches Map importieren, kein dynamisches `import()`.
- `productName` und `energyLabel` beide optional — Optionen ohne diese Felder rendern wie heute.
- Herd-Modal-State lokal, kein globaler Umbau.