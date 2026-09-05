# Redesign Startscreen: «Tactile Noir Dossier»

Der Einstiegsscreen (vor Team-Beitritt) wird vom aktuellen hellen Akten-Cover in die gewählte Noir-Dossier-Richtung überführt: dunkler Schreibtisch-Hintergrund, warmes Dossier-Papier mit echter Tiefe, Stempel mit Tinten-Charakter, Code-Eingabe wie ein beschriftetes Aktenfeld.

## Was sich ändert (nur Landing-Ansicht, kein Funktionsumfang)

1. **Hintergrund & Bühne**
   - Hintergrund der Landing-Ansicht wird dunkel (warmes Schwarz-Braun aus der bestehenden Ink-Familie, als neues Token `--noir` in `src/styles.css`), mit einem weichen, warmen Lichtschein (Radial-Glow) hinter der Akte.
   - Die Akte bekommt einen starken, seitlichen Tiefenschatten und eine leichte Rotation (-1°); darunter zwei versetzte Papierschichten (bestehendes Stapelprinzip, abgedunkelt).
   - Dekorativer «Ordner-Reiter» an der rechten Kartenkante.

2. **Die Aktenkarte**
   - Papierfarbton etwas wärmer/dunkler (`#dccbb0`-Richtung als neues Token `--dossier`), Papierfaser-Textur als dezentes CSS-Overlay (lokal generiertes Rauschen, keine externe URL).
   - Oben links: «Fallnummer»-Zeile in Special Elite mit feiner Linie darunter (ersetzt den «Vertraulich · Widnau»-Tab auf der Landing-Ansicht; Datum/Ort-Zeile bleibt als Metadaten).
   - «Eilig»-Stempel: kräftiger (dickerer Rahmen, `mix-blend-multiply`, leichte Deckkraft-Variation für Tinten-Look), Position oben rechts, rotiert.

3. **Typografie & Titel**
   - Titel «Grossvaters letzte Spur.» in Lora bold, der Punkt in Stempelrot; darunter kursiver Untertitel «Ein geheimnisvolles Vermächtnis …»-Ton, bestehender Text «Ein Bildungs-Escape-Room. Fünf Etappen, ein Hearing.» bleibt.
   - Fliesstext/UI-Schrift wird auf **Nunito Sans** umgestellt (Font-Link in `src/routes/__root.tsx`, Token `--font-sans`); Special Elite bleibt für Stempel/Labels.

4. **Code-Eingabe (`StartForm`)**
   - Label «Zugangscode für das Team eingeben:» in Special Elite.
   - Eingabefeld ohne Kasten: transparent mit 2-px-Unterstrich in Tintenfarbe, grosse Schreibmaschinen-Schrift mit weitem Tracking, Platzhalter `_ _ _ _ _ _`; Fokus verstärkt den Strich (Ring in Stempelrot bleibt für Accessibility).
   - Button: tintenschwarz mit dossier-farbenem Text, uppercase, gesperrt, Label «Akten öffnen»; aktiver Zustand senkt sich leicht (Stempel-Druck-Gefühl).
   - Teamname/Mitglieder-Felder und Code-Prüf-Logik bleiben unverändert, nur restylt.

5. **Footer**
   - «Widnau · v3 · Linearer Ablauf» bleibt, in gedämpftem Ton auf dem dunklen Hintergrund.

## Nicht im Umfang
- Übersicht nach Beitritt (ProgressPanel, Etappenpfad), Intro/Briefing, Etappen-Seiten und Lehrerbereich bleiben optisch wie bisher.
- Keine Änderung an Logik, Routen, Supabase oder Texten ausser den genannten Labels.

## Technische Umsetzung
- `src/styles.css`: neue Tokens `--noir`, `--dossier`, Glow-/Schatten-Utilities, Papier-Textur-Utility; `--font-sans` auf Nunito Sans.
- `src/routes/__root.tsx`: Google-Fonts-Link um Nunito Sans ergänzen.
- `src/routes/index.tsx`: Landing-Branch (`screen === "landing"`) neu strukturiert gemäss Referenz-Prototyp; Loading-State farblich angepasst.
- `src/components/case-file/StartForm.tsx`: Unterstrich-Eingabe + Noir-Button.
- Mobile-first (393 px), Desktop zentriert mit max-width; reduzierte Bewegung respektiert.

## Verifikation
- Playwright-Screenshots der Landing-Ansicht (393×828 und Desktop), Code-Eingabe-Fokus prüfen, Build-Log fehlerfrei.
