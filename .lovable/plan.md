# Plan: Storyline-Überarbeitung (Opa Jakob)

Alle Story-/Rahmentexte werden umgeschrieben. **Rätsel-Mechaniken bleiben unverändert.**

## Kernänderungen

- **Elvira (Grosstante) → Jakob (Grossvater, Förster, verstorben).** Ein Fremder überbringt den Brief.
- **Maja: 15 Jahre alt** (statt 17), kurz vor Lehrbeginn.
- **Introscreen:** Rückblende auf die Lichtung (Maja 5-jährig, Versprechen an Jakob), dann Rückkehr Jahre später, Absperrbänder, Fremder mit Brief.
- **Outroscreen:** Gemeinderats-Zitate (Schmid, Brunner, Lindenmann, Gemeindepräsident) → Abstimmung **vertagt** (nicht endgültig abgelehnt). Danach: „Wenige Monate später starb Jakob." Maja geht nochmal zur Lichtung.
- **Neue Nebenfigur Etappe 2:** Frau Berger (alte Freundin von Jakob).
- **Marlene Vogt** (Etappe 5) bleibt.
- **Übergänge (bisher „Umschlag N")** werden zu passenden Objekten: Couvert am Bahnhofschalter, Bon mit Handschrift, Notizbuch beim Forsthaus, Zeichnung + Zettel im Haus, Schlüsselkarte im Sicherungskasten.

## Zu überarbeitende Dateien

1. **`src/components/case-file/IntroScreen.tsx`**
   – Neue 3-Screen-Sequenz: (1) Rückblende Lichtung, (2) Personen (Maja 15, Opa Jakob †), (3) Ankunft in Speicher, Brief vom Fremden.
2. **`src/components/case-file/OutroScreen.tsx`**
   – Gemeinderats-Dialog, Vertagung, Jakobs Tod, Lichtungs-Szene.
3. **`src/routes/etappe-1.tsx`** – Bahnhof-Museum, Couvert mit Zug-/Flug-/Vignette-Tickets, Jakobs Zettel.
4. **`src/routes/etappe-2.tsx`** – Frau-Berger-Dialog, leerer Korb, Bon mit Handschrift zur Waldlichtung.
5. **`src/routes/etappe-3.tsx`** – Absperrbänder, Jakobs Notizbuch beim Forsthaus, gefährdete Arten.
6. **`src/routes/etappe-4.tsx`** – Kiste mit Rechnungen, Zeichnung des Hauses, Zettel, Schlüsselkarte im Sicherungskasten.
7. **`src/routes/etappe-5.tsx`** – Marlene-Vogt-Szene neu formuliert (bereits nah dran, kleinere Textkorrekturen), Übergang zum Hearing mit letztem Ordner.
8. **`src/routes/finale.tsx`** – Gemeindesaal-Intro mit Präsident + Ratsmitglied Schmid, Maja legt Unterlagen vor. Ending-Zitate im OutroScreen.
9. **`src/lib/progress.ts`** – Ortsbezeichnungen in `STAGES` leicht anpassen (z. B. „Bahnhof-Museum", „Jakobs altes Haus"). Ortsname bleibt **Speicher**.
10. **`EnvelopeDialog`-Aufrufe** in Intro und allen Etappen: neue `etappeLabel`/`ort`-Texte (Couvert, Bon, Notizbuch, Zettel, Schlüsselkarte) statt generisch „Umschlag N".

## Was NICHT geändert wird

- Rätsel-Logik, Antworten, Codes, Punkte, Zeiten
- Bilder / Assets / Komponenten-Struktur
- Global-Timer, Hint-System, Persist/Review-Mode
- Ortsname „Speicher" (der neue Draft schreibt „Grünwald", ich behalte Speicher, da global etabliert — bitte melden, falls doch umzubenennen)

## Offener Klärungspunkt

Ortsname: **Speicher** beibehalten (aktueller Stand) oder auf **Grünwald** zurück? Ich schlage Speicher vor.
