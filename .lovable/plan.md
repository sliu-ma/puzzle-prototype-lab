## Ziel

Die aktuellen Umschlag-Banner und -Header (aus `EnvelopeBanner.tsx`) werden entfernt. Stattdessen erscheint an genau definierten Klick-Momenten ein **Pop-up mit Illustration**, das die Schüler:innen auffordert, den physischen Umschlag zu öffnen.

## Wann erscheint das Pop-up?

| Umschlag | Auslöser (Klick) | Ort im Code |
|---|---|---|
| **1** | Nach dem Brief-Screen im Intro, beim Klick auf „Ermittlung starten" | `IntroScreen.tsx` |
| **2** | Klick auf „Etappe 2 öffnen →" am Ende von Etappe 1 **oder** Klick auf Etappe 2 in der Übersicht (Startseite) | `akte-003.tsx` + `index.tsx` |
| **3** | Klick auf „Etappe 3 öffnen →" am Ende Etappe 2 **oder** Klick auf Etappe 3 in Übersicht | `akte.tsx` + `index.tsx` |
| **4** | Klick auf „Etappe 4 öffnen →" am Ende Etappe 3 **oder** Klick auf Etappe 4 in Übersicht | `akte-002.tsx` + `index.tsx` |
| **5** | Klick auf „Etappe 5 öffnen →" am Ende Etappe 4 **oder** Klick auf Etappe 5 in Übersicht | `akte-004.tsx` + `index.tsx` |

Nach Etappe 5 → **kein** Umschlag (direkt ins Hearing).

Das Pop-up ist ein einmaliger Prompt pro Umschlag: einmal gesehen, wird per `localStorage`-Flag (`maya-envelope-N-shown`) gemerkt, damit derselbe Umschlag beim erneuten Klick (z. B. nachträglich in der Übersicht) nicht wieder aufpoppt. Ein Reset über `resetAll()` (Präfix `maya-*`) löscht die Flags wieder.

## Neue Komponente: `EnvelopeDialog.tsx`

Ersetzt `EnvelopeBanner.tsx`. Nutzt shadcn `Dialog` und zeigt:

- Großes **SVG eines Umschlags** mit der Nummer als Siegel — freundlich, spielerisch (kein Stockfoto). Zwei Varianten: geschlossen (Wachssiegel mit Nr.) und leicht geöffnete Klappe.
- Überschrift: **„Öffne jetzt Umschlag N"**
- Kurztext: „Elviras nächster Hinweis liegt bereit — nimm den Umschlag mit der Nr. N vom Tisch."
- Ort-Chip (z. B. „Dorfladen · Etappe 2")
- Button: „Alles klar →" (schließt Dialog und führt die Aktion aus, z. B. Navigation)

Ausgeliefert als:
```tsx
<EnvelopeDialog nr={2} ort="Dorfladen" open={open} onConfirm={() => navigate(...)} />
```

Plus ein Utility-Hook `useEnvelopePrompt(nr)`, das den einmaligen Anzeige-Status verwaltet und ein `trigger()` zurückgibt, mit dem sich der Klick abfangen lässt (Klick → Pop-up → nach Bestätigung Navigation ausführen).

## Änderungen pro Datei

**`src/components/case-file/EnvelopeBanner.tsx`** — löschen.

**`src/components/case-file/EnvelopeDialog.tsx`** — neu (Dialog + Inline-SVG-Grafik + Hook).

**`src/routes/akte-003.tsx`, `akte.tsx`, `akte-002.tsx`, `akte-004.tsx`**
- `EnvelopeHeader` und `EnvelopeHint` entfernen (Import + Verwendung).
- Beim „Etappe N+1 öffnen →"-Button (im Step `naechstes`): `onClick` fängt Klick ab, zeigt `EnvelopeDialog` mit passender Nr., navigiert erst nach Bestätigung. Falls Umschlag-Flag schon gesetzt → direkt navigieren.

**`src/routes/akte-005.tsx`** — nichts (kein Umschlag).

**`src/routes/index.tsx`** (Übersicht/ProgressPanel)
- Die `<Link to={s.to}>`-Einträge für die **aktuelle** Etappe (`status === "current"`) werden zu Buttons/Klick-Wrappern, die den `EnvelopeDialog` für die passende Nummer (`s.nr`) triggern, sofern das Umschlag-Flag noch nicht gesetzt ist. Nach Bestätigung → `router.navigate`.
- Etappe 1: Umschlag 1 wurde bereits im Intro gezeigt → kein Pop-up in der Übersicht für Etappe 1.

**`src/components/case-file/IntroScreen.tsx`**
- Bestehenden Inline-Chip „Umschlag 1 · Küchentisch" im Brief-Step entfernen.
- Der finale „Ermittlung starten"-Klick (Step 2 → onDone) öffnet zuerst den `EnvelopeDialog` für Umschlag 1 (Ort: „Küchentisch"). Nach Bestätigung → `markIntroSeen()` + `onDone()`.

## Persistenz

- `maya-envelope-1-shown` … `maya-envelope-5-shown` — je Umschlag ein Flag.
- Wird automatisch von `resetAll()` (Präfix `maya-*`) beim Neustart entfernt — kein zusätzlicher Code nötig.

## Bild/Grafik

Reine Inline-SVGs im Dialog (Umschlag-Silhouette, Wachssiegel-Kreis mit großer Ziffer). Keine externen Bild-Assets nötig, funktioniert offline und ist responsiv.
