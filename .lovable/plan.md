# Plan: Vollständige Read-me als DOCX

Eine neue Datei `Maya_README_Tokens_v2.docx` unter `/mnt/documents/` erzeugen. Strukturierte Übersicht über alle fünf Akten — als Spickzettel für dich (nicht für die Spielenden).

## Aufbau pro Akte

Jede Akte erhält einen eigenen Abschnitt mit vier Blöcken:

1. **Beschreibung** — Worum geht es, was tut die*der Spielende?
2. **QR-Token** — Klartext, der im QR-Code stehen muss, plus Storage-Key
3. **Lösung** — Was ist die richtige Antwort / Code / Auswahl?
4. **Tipps** — Die drei zeitgesteuerten Hinweise (3 / 6 / 9 Min), wie sie im Spiel erscheinen

## Inhalte (Quellen verifiziert im Code)

```text
Akte 001 — Wo ist Maya? (Grüner Markt)
  Token:   CpZk0z9RaQkL22gtiWoR        Storage: akte-001-unlocked
  Lösung:  Erdbeeren ES + Import-Eier raus → CH-Erdbeeren (IP-Suisse) + CH-Bio-Freiland-Eier rein
  Tipps:   1) Warenkorb-Herkunft prüfen  2) Saisonal/regional vs. Import  3) Auflösung

Akte 002 — Biodiversität (Polaroid-Rätsel)
  Token:   Mn7YxQ2pVe9TbR4Ks0Lh        Storage: akte-002-unlocked
  Lösung:  Code 3579 (gefährdete Tiere aufsteigend:
           Feldhase 3, Wiedehopf 5, Geburtshelferkröte 7, Apollofalter 9)
  Tipps:   1) Tiere sortieren (4 gefährdet) 2) Karten umdrehen 3) Auflösung

Akte 003 — Mobilität (Routen-Vergleich)
  Token:   Tz3PqW8nXmYr5JcLs6Vk        Storage: akte-003-unlocked
  Lösung:  Start: Genf — Ziel: Speicher (AR)
           Nachhaltigste Route: direkter Zug (IC 1 → S21), ca. 4 kg CO₂/Person
  Tipps:   1) Hinweise nochmals lesen 2) CO₂ + realer Aufwand 3) Auflösung

Akte 004 — Wohnen (Energie-Spiel Show-Villa)
  Token:   Wb6Vc4Hn1ZqYpMr8Js3F        Storage: akte-004-unlocked
  Lösung:  Mind. 8 000 kWh/Jahr sparen, ohne 1 500 CHF Budget zu sprengen
           (Auswahl von Massnahmen pro Raum — Mehrere Kombinationen möglich)
  Tipps:   (keine zeitgesteuerten Tipps definiert — Ziele oben dienen als Anker)

Akte 005 — Energie (Gutachten-Fact-Check)
  Token:   Eg9LkRq2VhYbP4Mn7TcW        Storage: akte-005-unlocked
  Lösung:  Genau 5 falsche Aussagen markieren (f1–f5):
           f1: "Erdgas 95 g CO₂/kWh, nahezu klimaneutral"   (real ≈ 400)
           f2: "Steinkohle 78 % Wirkungsgrad, besser als erneuerbar"
           f3: "Kohle ist erneuerbare Brückentechnologie"
           f4: "PV-Volllaststunden auf 250 h/Jahr korrigiert" (real ~1 000)
           f5: "Versorgungssicherheit mit PV+Speicher nicht möglich"
  Tipps:   (keine zeitgesteuerten Tipps definiert)
```

Zusätzlich vorne eine kurze **Übersichtstabelle** (Akte · Thema · Token · Lösung in einer Zeile) als schneller Spickzettel.

## Technisches

- Erzeugen mit `docx` (Node, bereits in Skill-Doku beschrieben).
- A4, 1″ Ränder, Arial 12 pt, H1/H2 fett, Bullet-Listen über `LevelFormat.BULLET`.
- Tokens in Monospace-ähnlichem Stil (fett) damit sie beim Kopieren auffallen.
- Datei: `/mnt/documents/Maya_README_Tokens_v2.docx` (Original bleibt erhalten).
- Nach Erzeugung: validieren und als `<presentation-artifact>` einbetten.

## Offene Frage

Soll die alte `Maya_README_Tokens.docx` gelöscht werden, oder beide nebeneinander stehen lassen? Standardmäßig: **beide behalten**, neue Version klar als v2.
