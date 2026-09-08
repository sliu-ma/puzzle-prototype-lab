# Kompletter Durchlauf testen und einen gefundenen Fehler beheben

Build und Codeprüfung laufen fehlerfrei. Beim Nachschauen ist mir aber ein echter Fehler aufgefallen, den ich zuerst beheben und dann im Durchlauf gegenprüfen würde.

## Der gefundene Fehler

Etappe 1 (Bushaltestelle) und Etappe 3 (Jakobs Haus) merken sich ihre Freischaltung unter demselben Namen. Folge im echten Einsatz:

- Die Gruppe scannt bei Etappe 3 ihren Code, danach gilt Etappe 1 wieder als versiegelt.
- Öffnet die Gruppe später Etappe 1 nochmals (Rückblick), verlangt die App erneut einen Scan, den sie vor Ort nicht mehr machen kann.

Ursache ist ein Überrest des Tauschs von Wohnen und Biodiversität: die Speichernamen sind gegenüber den Etappennummern verschoben.

## Korrektur

- Etappe 1 speichert künftig unter `akte-001-unlocked`, Etappe 3 unter `akte-003-unlocked`, Etappe 4 unter `akte-004-unlocked`, Etappe 5 unter `akte-005-unlocked`, Etappe 2 unter `akte-002-unlocked`.
- Die Codes selbst bleiben unverändert, alle physischen QR-Codes vor Ort gelten weiter.
- Ein Nebeneffekt: Geräte mit laufender Partie müssten den Code der betroffenen Etappe erneut scannen. Deshalb vor dem nächsten Einsatz umstellen, nicht mitten in einer Runde.

## Kompletter Spieldurchlauf

Ich spiele die Runde im Browser durch und melde alles Auffällige:

1. Start, Gruppenanmeldung, Vorgeschichte, Briefing, Uhr läuft.
2. Etappen 1 bis 5 der Reihe nach: Siegel öffnen, Rätsel lösen, Tipps aufrufen, Zwischenstand, Übergangstext zur nächsten Etappe.
3. Hearing im Schulzimmer: Siegel, Fragerunde, Abschluss mit Punkten und Abzeichen.
4. Lehreransicht parallel: Live-Übersicht, Nachrichtenräume, Hilferuf, Auswertung.
5. Zurücksetzen und einmal frisch starten, um Altstände auf dem Gerät zu prüfen.

Die Siegel lasse ich für den Test technisch überspringen (die Kamera steht im Test nicht zur Verfügung); die Codes selbst bleiben im Spiel unverändert.

## Technische Hinweise

- Betroffene Dateien: `src/routes/etappe-1.tsx`, `etappe-2.tsx`, `etappe-3.tsx`, `etappe-4.tsx`, `etappe-5.tsx` (nur die `storageKey`-Werte an `QRGate`).
- `RESET_PREFIXES` in `src/lib/progress.ts` deckt `akte-` bereits ab, keine Anpassung nötig.
- Testdurchlauf via Playwright gegen `localhost:8080`, Freischaltung durch Setzen des jeweiligen Hash-Werts in localStorage; keine Änderung an `ALLOW_MANUAL_ENTRY`.
- Keine Datenbank-, Punkte- oder Zugriffsregeländerungen.
