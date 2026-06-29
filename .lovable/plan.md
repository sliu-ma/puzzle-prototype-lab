# Plan: Texte-Überblick als DOCX

Erzeuge `/mnt/documents/Maya_Texte_Überblick.docx` — eine vollständige Sammlung aller im Spiel vorkommenden Texte, sortiert nach Etappe. Dient dir als Spickzettel / Druckvorlage für Lehrpersonen.

## Aufbau

**Kopf:** Titel, kurzer Hinweis ("Stand: heute", "interner Überblick").

**Pro Etappe (1 Bahnhof → 2 Dorfladen → 3 Wald → 4 Haus → 5 Wasserkraftwerk → 6 Finale) jeweils 4 Blöcke:**

1. **Story / Narrative Beats** — Briefe, Sprachnachrichten, Tagebucheinträge, Notizen von Elvira (wörtlich aus dem Code).
2. **Rätselkarte** — Aufgabenstellung an die Schüler:innen + Rätselmechanik kurz erklärt.
3. **Fachlicher Input / Fakten** — Lernkarten-Texte (z. B. Saisonal/Regional/Bio in Etappe 2, Biodiv-Fakten in Etappe 3 etc.).
4. **Übergang zur nächsten Etappe** — Auflösungstext + Hinweis auf nächsten Ort.

Für das **Finale** zusätzlich: alle 10 Fragen (Frage, Antwortoptionen, richtige Lösung, Feedback-Text der Ratsperson).

## Quellen im Code

Texte werden 1:1 extrahiert aus:
- `src/routes/akte.tsx`, `akte-002.tsx`, `akte-003.tsx`, `akte-004.tsx`, `akte-005.tsx`, `finale.tsx`
- `src/lib/maya-data.ts` (Rezept, Produkte)
- `src/lib/mobility-data.ts` (Routen)
- `src/lib/energy-data.ts` (Massnahmen)
- StoryBeat- / Hint-Inhalte aus den jeweiligen Komponenten

## Technisches

- Erzeugen mit `docx` (Node), gemäss DOCX-Skill.
- A4, Arial 11 pt, H1 pro Etappe, H2 pro Block, Zitate/Sprachnachrichten kursiv mit linkem Rand.
- Tipps und Lösungen in einem dezent grauen Kasten (Tabelle 1×1 mit Shading).
- Datei: `/mnt/documents/Maya_Texte_Überblick.docx`, danach Validierung + Vorschau pro Seite.

## Offene Frage

Soll ich auch die **drei zeitgesteuerten Tipps** (3/6/9 Min) pro Etappe mit aufnehmen, oder nur Story + Rätsel + Fakten + Übergang? Standard: **Tipps mit aufnehmen** (am Ende jedes Etappenblocks), da sie sonst nirgends gebündelt stehen.
