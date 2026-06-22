Ziel
----
Die beiden kopierten Lovable-Projekte werden als Akte 004 (Wohnen) und Akte 005 (Energie) in den bestehenden Escape-Room "Wo ist Maya?" integriert. Die Startseite, Navigation und das Akten-Stepper-Muster bleiben erhalten.

Quelle → Ziel
--------------
- "Remix of Energy Game Builder" (Haus-Energie-Upgrade-Spiel) → Akte 004 · Wohnen
- "Remix of Forest's Fading Echo" (Gutachten-Fehler-finden-Rätsel) → Akte 005 · Energie

Aktueller Stand
----------------
- Vorhanden: Akte 001 Konsum, Akte 002 Biodiversität, Akte 003 Mobilität
- Startseite kündigt bereits 5 Akten an: Konsum · Biodiv. · Mobilität · Wohnen · Energie
- Jedes Akten-Kapitel nutzt: QRGate → Sprachnachricht → Rätselkarte → Interaktives Rätsel → Fachlicher Input → Nächstes Kapitel

Geplante Schritte
-----------------

1. Assets kopieren
   - Aus "Remix of Energy Game Builder" ins aktuelle Projekt:
     - src/assets/coin.png
     - src/assets/trophy.png
     - src/assets/house-bg.jpg
   - "Remix of Forest's Fading Echo" hat keine Assets.

2. Akte 004 – Wohnen (Energy Game Builder)
   - Neue Route: src/routes/akte-004.tsx
   - Kopieren und anpassen:
     - src/components/HouseView.tsx
     - src/components/RoomModal.tsx
     - src/components/CoinBadge.tsx
     - src/lib/energyData.ts
   - GameState-Hook prüfen/kopieren (im Original unter @/lib/gameState referenziert, aber nicht auffindbar; ggf. neu erstellen oder Logik vereinfachen).
   - Framer-Motion-Abhängigkeit prüfen; falls nicht vorhanden, entweder installieren oder Animationen auf CSS-Transition reduzieren.
   - Akten-Rahmen aufbauen:
     - QRGate mit neuem Token
     - Sprachnachricht von Maya (Investor Nr. 4 – Wohnbau/Immobilien)
     - Rätselkarte mit Hinweisen
     - Energy-Game als Kernrätsel
     - Fachlicher Input zu Haushalts-Energieeffizienz
     - Teaser auf Akte 005

3. Akte 005 – Energie (Forest's Fading Echo)
   - Neue Route: src/routes/akte-005.tsx
   - Kopieren und anpassen:
     - src/routes/raetsel.energie.tsx (komplettes Gutachten-Rätsel) in die Aktenstruktur einbauen
   - Akten-Rahmen aufbauen:
     - QRGate mit neuem Token
     - Sprachnachricht von Maya (Investor Nr. 5 – Energiekonsortium)
     - Rätselkarte mit Hinweisen
     - Gutachten-Fehler-Rätsel als Kernrätsel
     - Fachlicher Input zu Energieträgern, CO₂ und Versorgungssicherheit
     - Abschluss: Mayas Entdeckung zusammenführen

4. Navigation & Startseite aktualisieren
   - src/routes/index.tsx:
     - Buttons "Akte 004 öffnen" und "Akte 005 öffnen" hinzufügen
     - Beschreibung aktualisieren (alle 5 Akten verlinkt)
   - Ggf. Akte 003Abschluss aktualisieren, damit er auf Akte 004 verweist statt "folgt bald"

5. Styling-Abgleich
   - Energy Game verwendet ein spielerisches Holz-/Gras-Design mit Fredoka/Nunito.
   - Aktuelles Projekt nutzt Aktenmappe-Papier-Look mit Serifen-Fonts.
   - Lösung: Innerhalb der Akte 004 darf das Energy-Game-Theme als "eigenes Mini-Spiel" erhalten bleiben; Rahmen (Header, Stepper, Sprachnachricht) übernehmen Aktenmappe-Stil. Alternativ komplette Angleichung an Aktenmappe vorsehen.
   - CSS-Variablen und Utility-Klassen aus den Quellprojekten übernehmen, soweit sie nicht mit dem bestehenden Design kollidieren.

6. Abhängigkeiten prüfen
   - Prüfen, ob framer-motion installiert ist. Falls nein: entweder `bun add framer-motion` oder Animationen entfernen.
   - Prüfen, ob lucide-react im Zielprojekt vorhanden ist (wird bereits genutzt).

7. Testen
   - Dev-Server Build prüfen
   - Akte 004 und 005 durchklicken: QRGate, Sprachnachricht, Rätsel, Lösung, Input, Teaser
   - Navigation von Akte 003 → Akte 004 und Startseite → alle Akten

Technische Details
-------------------
- Neue Dateien:
  - src/routes/akte-004.tsx
  - src/routes/akte-005.tsx
  - src/components/case-file/EnergyGame/
    - HouseView.tsx
    - RoomModal.tsx
    - CoinBadge.tsx
  - src/lib/energyData.ts
  - src/lib/energyGameState.ts (oder angepasste gameState.ts)
  - src/components/case-file/EnergyReports/
    - EnergyRaetsel.tsx (aus raetsel.energie.tsx)
- Kopierte Assets:
  - src/assets/coin.png
  - src/assets/trophy.png
  - src/assets/house-bg.jpg
- Geänderte Dateien:
  - src/routes/index.tsx
  - src/routes/akte-003.tsx (Teaser auf Akte 004)
  - src/styles.css (falls neue Theme-Variablen nötig)

Offene Entscheidungen
---------------------
1. Soll Akte 004 das bunte Holz-/Spiel-Design des Energy Games behalten oder komplett an den Aktenmappe-Look angeglichen werden?
2. Sollen die neuen Akten eigene QR-Tokens bekommen (wie 001–003) oder direkt ohne QR-Gate erreichbar sein?
3. Soll Mayas Erzählbogen in den Sprachnachrichten der neuen Akten fortgeführt werden (Investoren 4 + 5 des Helvetia-Energie-Konsortiums)?

Wenn du dem Plan zustimmst, starte ich die Umsetzung mit Akte 004.