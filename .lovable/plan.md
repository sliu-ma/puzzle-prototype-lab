# Übersicht überarbeiten (Ermittlungs-Dashboard)

Ziel: Beim Öffnen der Übersicht ist auf einem Handy ohne Scrollen klar, wo das Team steht, wie viel Zeit bleibt und was der nächste Schritt ist. Dazu ein sichtbarer Motivationsteil mit Badges.

## 1. Orientierung

**Statuskopf**
- Fortschrittsbalken (0–5 Etappen) ergänzt die bestehende Zahl „3 / 5 Etappen“.
- Restzeit direkt im Kopf, farblich ruhiger Zustand, ab 15 Minuten Restzeit dringlicher Ton (Warnfarbe).
- Kopfzeile responsiv als Grid (Teamname darf umbrechen/kürzen, Zahlenblock bleibt fest).

**„Nächster Schritt“-Karte**
- Direkt unter dem Statuskopf, vor der Etappenliste: Etappen-Nummer, Ort, Thema, Hinweis auf den Umschlag und ein grosser Button „Etappe öffnen →“.
- Öffnet wie bisher den Umschlag-Dialog (bzw. bei Etappe 1 direkt die Route).
- Nach Etappe 5 zeigt die Karte das Hearing; nach dem Hearing eine Abschluss-Variante mit Link zum Ergebnis.

**Etappenliste als Dorfpfad**
- Vertikale Verbindungslinie zwischen den Etappen-Nummernkreisen, erledigte Segmente farbig gefüllt, gesperrte gestrichelt.
- Erledigte Etappen bleiben antippbar (Rückblick), gesperrte bleiben gedämpft mit Schloss.
- Aktuelle Etappe in der Liste kompakter, weil der Haupt-Call-to-Action jetzt oben steht.

## 2. Motivation

**Badge-Regal**
- Neuer Block unter der Etappenliste: alle Badges aus der Badge-Definition in einer Reihe (horizontal scrollbar auf dem Handy).
- Verdiente Badges farbig, noch offene als gedämpfte Silhouette ohne Titel-Spoiler.
- Tap auf ein Badge öffnet einen Detail-Dialog (verdient: Titel, Beschreibung, Zeitpunkt; offen: „noch nicht verdient“ plus neutraler Teaser).
- Zähler „2 von 6 Abzeichen“.

**Kennzahlen pro erledigter Etappe**
- In der Zeile einer abgeschlossenen Etappe zusätzlich: benötigte Zeit und Anzahl genutzter Hinweise, als kleine Zeile unter dem Ort.
- Zeit pro Etappe wird beim Abschluss mitgeschrieben (neuer Zeitstempel je Etappe); Hinweiszahl kommt aus der bestehenden Hinweis-Zählung. Für bereits laufende Spiele ohne Zeitstempel wird die Zeitangabe einfach weggelassen.

## 3. Handy-Feinschliff

- Alle antippbaren Zeilen mindestens 48 px hoch, grössere Schrift in den Etappentiteln.
- Sticky-Leiste am unteren Rand mit „Weiter zu Etappe n“, sobald man an der Etappenliste vorbeigescrollt ist.
- „Spiel zurücksetzen“ wandert aus der Hauptansicht in ein kleines Menü (Drei-Punkte oben rechts in der Karte) mit unveränderter Bestätigungsabfrage.
- Seitenpaddings und Karten-Rotationen auf schmalen Displays reduziert, damit nichts über den Rand ragt.

## Technische Hinweise

- Änderungen konzentrieren sich auf `src/routes/index.tsx` (Statuskopf, „Nächster Schritt“, Pfad-Liste, Sticky-CTA, Menü) plus zwei neue Präsentationskomponenten unter `src/components/case-file/`: `BadgeShelf.tsx` (Regal + Detail-Dialog) und `NextStepCard.tsx`.
- Restzeit wird aus dem vorhandenen Start-Zeitstempel und der 90-Minuten-Konstante berechnet (`src/lib/progress.ts`), keine neue Timer-Logik.
- Badges kommen aus `src/lib/badges.ts` (`BADGES`, `getEarnedBadgeRecords`, `getBadgeEarnedAt`); Hinweiszahlen aus `getStageHintsUsed`.
- Neu gespeichert wird lediglich ein Zeitstempel je abgeschlossener Etappe in `completeStage`, damit die Etappendauer angezeigt werden kann.
- Alle Farben über bestehende Design-Tokens, keine harten Farbwerte.
