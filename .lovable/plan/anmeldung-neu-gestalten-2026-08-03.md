# Anmeldung neu gestalten

Die Registrierung auf der Startseite wird von einem einzelnen Formular in einen zweistufigen, mobil-optimierten Ablauf umgebaut.

## Schritt 1: Startcode

- Grosses, eigenständiges Code-Feld (Monospace, Grossbuchstaben, zentriert), zugeschnitten auf Handy-Tastaturen.
- Kurzer Story-Teaser darüber (Maja, Brief, Gemeinderat) und Hinweis "Code von der Lehrperson".
- Button "Code prüfen": bei falschem Code Fehlermeldung im Feld, kein Weiterkommen. Der bestehende Debug-Code funktioniert weiter.
- Erst nach korrektem Code folgt Schritt 2 (mit kleinem Übergang, Schritt-Indikator 1/2 oben).

## Schritt 2: Team

- Feld "Teamname" (mind. 2 Zeichen).
- Dynamische Namensliste für Teammitglieder: startet mit einem Feld, "+ Person hinzufügen" bis maximal 4, jede Zeile mit Entfernen-Symbol.
- Mindestens 1 Mitglied ist Pflicht, sonst Hinweistext.
- "Zurück"-Link zu Schritt 1 und Hauptbutton "Ermittlung starten".

## Schritt 3: Bessere Gestaltung

- Akten-Look beibehalten (Papier, Stempel, Monospace-Labels), aber Formular als eigene, klar gerahmte Karte ohne störende Rotation auf Mobile.
- Grössere Touch-Ziele (min. 44px Höhe), volle Breite auf dem Handy, klare Fokus-Zustände.
- Schritt-Indikator und Übertitel ("Team registrieren · Schritt 1 von 2").
- Fehlermeldungen direkt beim betroffenen Feld statt gesammelt unten.

## Technische Details

- Umbau von `StartForm` in `src/routes/index.tsx` (interner Step-State), Aufteilung in kleine Unterkomponenten im gleichen Ordner (`src/components/case-file/StartForm.tsx`), damit `index.tsx` schlanker wird.
- Mitgliedernamen werden zusätzlich in localStorage gespeichert; `registerTeam` in `src/lib/progress.ts` erhält einen optionalen dritten Parameter `members: string[]` plus Getter `getTeamMembers()`. Bestehende Spielstände ohne Mitglieder bleiben gültig.
- Reset-Logik (`resetAll`) räumt den neuen Schlüssel mit auf, da er das `maya-`-Präfix nutzt.
- Der übrige Startseiten-Inhalt (Fortschrittspanel, Badges) bleibt unverändert.
