# Erklärseite «So spielst du» (/anleitung)

Neue, spoilerfreie Erklärseite für Schüler:innen unter der Route `/anleitung`. Kein Eingriff in die Startseite oder bestehende Spiel-Logik — nur eine neue Route mit eigenem `head()` (SEO-Meta).

## Inhalt & Struktur (von oben nach unten)

1. **Hero** — Grosser Titel «So spielst du Majas Mission» im Field-Notes-Look: Kraftpapier-Karte mit Washi-Tape, animierter Stempel («ANLEITUNG»), leicht schwebende Papier-Elemente im Hintergrund. Kurzer Teaser-Satz, danach Scroll-Hinweis mit animiertem Pfeil.
2. **Die Geschichte in 3 Sätzen** — Maja, Grossvater Jakob, die fünf Akten und die Gemeinderatssitzung in 90 Minuten. Keine Orte, keine Rätselinhalte.
3. **«So spielst du» in 5 Schritten** — vertikale animierte Timeline (Linie zeichnet sich beim Scrollen):
   1. Team bilden & über QR/Link der Lobby beitreten
   2. Vor Ort den QR-Code scannen (Akte entsperren)
   3. Rätsel lösen — Texte genau lesen lohnt sich
   4. Hinweise nutzen: nach 3 / 6 / 9 Minuten (jederzeit wieder aufklappbar)
   5. Alle fünf Etappen lösen und rechtzeitig zum Hearing
   Jeder Schritt als Papierkarte mit Icon (Lucide) und gestempelter Nummer.
4. **Das musst du wissen** — drei Karten: 90-Minuten-Timer (läuft ab Briefing), Badges sammeln, ein Gerät pro Gruppe.
5. **FAQ (Akkordeon)** — z. B. «Was, wenn wir feststecken?», «Brauchen wir Internet?», «Können wir Hinweise nochmal ansehen?», «Was passiert bei Zeitablauf?»
6. **Abschluss-CTA** — Stempel-Karte «Bereit? Dann scanne den ersten QR-Code vor Ort.»

## Design & Animation

- Strikte Einhaltung des Field-Notes-Looks: Lora (Story/Überschriften), Special Elite (Stempel/Nummern), Inter (UI), Papier-/Kraft-/Stempelfarben aus den bestehenden Tokens in `src/styles.css`. Keine hartcodierten Farben, keine Gedankenstriche.
- Scroll-Animationen über einen kleinen `useInView`-Hook (IntersectionObserver, ohne neue Abhängigkeit): Karten faden/stanzen sich beim Sichtbarwerden ein (vorhandene Keyframes `fade-in`/`scale-in` + neue CSS-Keyframes wie `stamp-in`, `float`, Timeline-Strich via `scaleY`-Transition).
- Animierte Details: rotierender Stempel im Hero, schwebende Polaroid-/Papier-Elemente, Scroll-Pfeil mit Bounce. Alles CSS-only, mobil zuerst (Spiel läuft auf dem Handy), `prefers-reduced-motion` wird respektiert.
- Spoilerfrei: keine Ortsnamen der Posten, keine Rätselinhalte, keine Codes.

## Technisch

- Neue Datei `src/routes/anleitung.tsx` mit `createFileRoute("/anleitung")`, eigenem `head()` (Title «So spielst du — Majas Mission», description, og:title/og:description, og:type, twitter:card; kein og:image, da kein absolutes Bild).
- Kleine lokale Hilfskomponenten im selben File (StepCard, FaqItem) — keine Änderungen an bestehenden Komponenten.
- Akkordeon via bestehendem shadcn-Accordion falls vorhanden, sonst einfaches details/summary-Styling im Papierlook.
- Verifikation: `bunx tsgo --noEmit`, Build-Log prüfen, Seite mobil (Playwright, ca. 906×828) durchscrollen und Screenshots prüfen.
