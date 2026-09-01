# Vorschläge zur Spielverbesserung

Basierend auf Durchsicht aller Etappen, des Finals, der Punkte-/Badge-Logik, des Timers und der Styles. Konkrete Schwachstellen, geordnet nach Wirkung. Du kannst alle umsetzen oder eine Auswahl treffen.

## 1. Etappe-3-Code «123» ist zu leicht zu erraten (höchste Priorität)

**Problem:** Das ganze Biodiversitäts-Rätsel (Tiere sortieren, bedrohte Arten identifizieren, Zahlen im Gedicht lesen) mündet darin, den Code `123` in das CodeLock einzutippen (`src/routes/etappe-3.tsx:50`, `EXPECTED_CODE = "123"`). Das ist die trivialste Zahlfolge überhaupt — Schülerinnen und Schüler können sie erraten, ohne das Rätsel zu lösen, und überspringen damit die gesamte Etappe.

**Vorschlag:** Code durch eine weniger offensichtliche, aber aus dem Rätsel ableitbare Folge ersetzen (z. B. `246` oder `427`), die nur Sinn ergibt, wenn man die bedrohte Tierkarte umdreht. Hinweis- und Auflösungstexte entsprechend anpassen.

## 2. PWA / Offline-Fähigkeit für den Aussen-Einsatz

**Problem:** Das Spiel wird draussen auf dem Handy gespielt, an Bahnhöfen, im Wald, am Kraftwerk — Orte mit schlechtem Mobilfunk. Aktuell gibt es keinen Service Worker und kein Web-App-Manifest: ohne Netz lädt die App nach Schliessen des Browsers nicht mehr zuverlässig, und sie ist nicht «zum Home-Bildschirm hinzufügbar».

**Vorschlag:** 
- `public/manifest.webmanifest` mit Name, Icons (144/512), Theme-Farbe (Stamp-Rot), Start-URL.
- `<link rel="manifest">` in `__root.tsx` head.
- Service Worker (vorgefertigtes Cache-First für gebündelte Assets + Offline-Fallback-Seite) via `vite-plugin-pwa` oder einem kleinen Hand-SW unter `public/sw.js`.
- So wird die App nach erstem Aufruf offline-fähig und installierbar — wichtig für Schul-iPads/-Handys im Feld.

## 3. `lang="en"` → `lang="de"` (Barrierefreiheit & SEO)

**Problem:** In `src/routes/__root.tsx:76` steht `<html lang="en">`, das gesamte Spiel ist aber auf Deutsch. Screenreader stellen sich auf englische Aussprache ein, Suchmaschinen ordnen falsch ein.

**Vorschlag:** `lang="de"` (oder `lang="de-CH"`).

## 4. Markenkonsistenz: «Grossvaters letzte Spur» vs. «Majas Mission»

**Problem:** Die Startseite trägt die Schlagzeile «Grossvaters letzte Spur» (`src/routes/index.tsx:140`), während Titel, Metadaten, Footer und Lehreransicht durchgehend «Majas Mission» nennen. Für Aussenstehende wirkt das wie zwei verschiedene Spiele.

**Vorschlag:** Entweder «Majas Mission» als alleinigen Markennamen beibehalten und den Cover-Untertitel konsistent halten (z. B. Titel «Majas Mission», Untertitel «Grossvaters letzte Spur»), oder umgekehrt — aber bewusst und überall gleich.

## 5. Fehlende OG-Metadaten auf den Etappen-Routen

**Problem:** `index.tsx` und die fünf Etappen-Routen haben zwar `<title>` und `description`, aber keine `og:title`/`og:description`/`og:image`/`twitter:card`. Wird ein Etappen-Link geteilt (z. B. im Schul-Chat), fehlt die Vorschau. `abschluss.tsx` und `lehrer.index.tsx` haben diese bereits.

**Vorschlag:** Pro Etappe und `index.tsx` die fehlenden OG-/Twitter-Tags ergänzen, analog zu `abschluss.tsx`.

---

## Was ich **nicht** ändern würde

- **Etappen 2–5 in Widnau verankern:** Du hast bewusst entschieden, diese ortsneutral zu lassen — sie funktionieren so. Kein Re-Proposal.
- **Punkte-/Badge-/Timer-Logik:** Durchdacht und ausbalanciert; kein Eingriff nötig.
- **Storyline / Jakob:** Konsistent und stimmig umgesetzt.

## Technische Details

- Änderung 1: reine Text/Konstanten-Ersätze in `etappe-3.tsx`.
- Änderung 2: neue Dateien `public/manifest.webmanifest`, ggf. `public/sw.js`, plus `<link>` in `__root.tsx`; ggf. `vite-plugin-pwa` als Abhängigkeit.
- Änderung 3: ein Zeichen in `__root.tsx`.
- Änderung 4: Textanpassung in `index.tsx`.
- Änderung 5: Ergänzung von `meta`-Einträgen in `index.tsx` und fünf Etappen-Dateien.

Keine Änderungen an Punkte-, Badge-, Timer- oder Datenbanklogik.
