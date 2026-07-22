# Hearing überarbeiten (finale.tsx)

Ziel: Alle 10 Fragen des Hearings gemäss neuer Faktenkarte ersetzen. Dabei zwei neue Antworttypen einführen und die Saisonfrage jahreszeit-adaptiv machen.

## Neue Antworttypen

Ergänze im `Frage`-Union in `src/routes/finale.tsx`:

- `slider` — Nutzer wählt Zahl auf Schieberegler; korrekt bei `|value - target| ≤ tolerance`.
  - Felder: `min`, `max`, `step`, `unit`, `zielwert`, `toleranz`.
- `either` — Zwei Bild-Optionen nebeneinander, eine ist korrekt.
  - Felder: `optionen: { id; label; image }[]`, `korrekt: string`.

Beide bekommen einen Renderer in `FrageRenderer` und ein Label in `typeLabel()`.
`bucket`-Renderer bleibt bestehen und wird für F9 weiterverwendet.

## Saison-Helfer

Kleine Utility in derselben Datei:

```ts
function currentSeason(d = new Date()): "Winter"|"Frühling"|"Sommer"|"Herbst"
```

(Monat 12,1,2 = Winter; 3–5 = Frühling; 6–8 = Sommer; 9–11 = Herbst.)

Wird zur Laufzeit für F4 verwendet, um Fragetext + akzeptierte Antworten zu bestimmen. Damit die `FRAGEN`-Konstante statisch bleibt, wird F4 als Funktion/Getter aufgebaut oder das FRAGEN-Array via `useMemo` im `FinalePage` gebildet.

## Die 10 neuen Fragen

Reihenfolge und Themen wie bisher (Mobilität, Konsum, Biodiversität, Wohnen, Energie), Ratsmitglieder bleiben.

**F1 · Mobilität · slider**
„Um wie viel Rappen pro Kilometer ist das Auto teurer als der ÖV?"
`min: 0, max: 50, step: 1, unit: "Rp./km", zielwert: 28, toleranz: 3`.  
Erklärung: Vollkosten Auto ≈ 74 Rp./km, ÖV ≈ 46 Rp./km → Differenz ca. 28 Rp./km.

**F2 · Mobilität · single**
„Wie viel Prozent aller Autofahrten in der Schweiz sind kürzer als 5 Kilometer?"
Optionen: 22 %, 32 %, 46 %, 60 %. Korrekt: 46 %.

**F3 · Konsum · match** (Drag & Drop mit Icons)
Links (mit Logos): Bio Suisse (`bioLogo`), IP-Suisse (`ipSuisseLogo`), Suisse Garantie (`suisseGarantieLogo`).
Rechts:

- Bio Suisse → „Anbau ohne synthetische Pestizide, artengerechte Tierhaltung"
- IP-Suisse → „Schweizer Landwirtschaft mit erhöhten Anforderungen an Umwelt und Tierwohl"
- Suisse Garantie → „Rohstoffe und Verarbeitung zu 100 % aus der Schweiz"

Import ergänzen: `import suisseGarantieLogo from "@/assets/labels/suisse-garantie.webp.asset.json"` (Asset existiert bereits). Demeter-Import entfernen.

**F4 · Konsum · short (saisonadaptiv)**
Fragetext: „Nenne ein Schweizer Saisongemüse oder eine Saisonfrucht im {Jahreszeit}."
Akzeptierte Antworten (normalisiert, Escape-Room-Produkte gelten als korrekt, plus gängige Ergänzungen):

- Winter: rosenkohl, apfel, äpfel, lauch, feldsalat, nüsslisalat, nuesslisalat, karotten, rande, sellerie, pastinake, chicoree, wirsing.
- Frühling: spargel, rhabarber, radieschen, spinat, lauch, nüsslisalat, nuesslisalat, bärlauch, baerlauch.
- Sommer: erdbeere, erdbeeren, gurke, tomate, tomaten, zucchini, kirsche, kirschen, aprikose, aprikosen, bohnen, salat, himbeere, himbeeren.
- Herbst: kürbis, kuerbis, zwetschge, zwetschgen, apfel, äpfel, birne, birnen, trauben, kohl, karotten, rande.

**F5 · Biodiversität · multi**
„Welche Ursachen tragen zum Rückgang der Biodiversität in der Schweiz bei?"
A) Versiegelung von Boden ✓ · B) Pestizide ✓ · C) Zu viel Regen · D) Begradigte Gewässer ✓.

**F6 · Biodiversität · single** (Text bleibt sinngemäss)
„Wie viele der untersuchten Arten in der Schweiz stehen auf der Roten Liste?"
Optionen: „Rund 1 von 20", „Rund 1 von 3", „Rund 1 von 100". Korrekt: 1 von 3.

**F7 · Wohnen · short**
„Wie viel Prozent Heizenergie spart eine Absenkung um 1 °C?"
Akzeptiert: 6, 6%, 6 prozent, ca 6, rund 6, etwa 6, ~6.
Erklärung: Faustregel ca. 6 %.

**F8 · Wohnen · either** (Bildvergleich Waschmaschinen)
Fragetext: „Welche Waschmaschine spart mehr Energie?"
Optionen:

- A: Bild `waschmaschine-klasse-a.png` (korrekt)
- E: Bild `waschmaschine-klasse-e.png`
Erklärung: Klasse A verbraucht deutlich weniger Energie als Klasse E.

**F9 · Energie · bucket** (bestehender Renderer)
„Ordne die Energiequellen ein."
Items: Sonne, Wasserkraft, Windkraft, Geothermie, Gas, Kohle.
Buckets: Erneuerbar / Nicht erneuerbar.
Solution: Sonne, Wasserkraft, Windkraft, Geothermie → erneuerbar; Gas, Kohle → nicht.

**F10 · Energie · short**
„Wie hoch ist der Anteil erneuerbarer Energien am Schweizer Energiemix (in %)?"
Akzeptiert: 28, 28%, ca 28, rund 28, etwa 28, 27, 29, ~28.
Erklärung: 2023 lag der Anteil bei rund 28 %.

## Renderer-Details

- **Slider**: `<input type="range">` + Wert-Anzeige. Button „Antwort abgeben" ruft `onResult(|val - zielwert| <= toleranz)`. Nach Antwort Slider sperren und Zielwert + Toleranz einblenden.
- **Either**: zwei grosse Karten (Bild + Label), Klick wählt aus, „Antwort abgeben" prüft. Auf Mobile Grid `grid-cols-2 gap-3`.
- **Match** (F3): Icon-Grösse leicht anpassen — aktueller Renderer nutzt `icon`-Feld bereits.
- **Short** (F4/F7/F10): Normalisierung wie bisher (lowercase, trim, Umlaute optional). Bei F4 kommt die `akzeptiert`-Liste aus dem Saison-Helper.

## Nicht ändern

- Barometer-Logik, Punktesystem, `MAX_FEHLER`, Persistenz-Keys, IntroConversation, OutroScreen, Ratsmitglied-Namen bleiben unverändert.
- Bestehende `match`- und `bucket`-Renderer werden wiederverwendet.

## Verifikation

Nach der Implementierung Build durchlaufen lassen und im Preview die 10 Fragen einmal durchklicken (jede Antwortform mindestens einmal auslösen), F4 auf aktuelle Jahreszeit prüfen.