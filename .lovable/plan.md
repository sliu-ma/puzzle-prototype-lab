# Lehrerdashboard: übersichtlicher auf dem Handy

Ziel: Das Dashboard auf einem 390 px breiten Handy so aufräumen, dass du im Feld mit einer Hand alles Wichtige siehst — ohne Quetschtext, ohne seitliches Schieben.

## Was sich ändert

**1. Kopfbereich kompakter und immer erreichbar**
- Rundencode, Titel und Status rutschen in eine schlanke Zeile; der grosse Code bleibt antippbar zum Kopieren, wird aber kleiner.
- Kopfzeile plus Reiter bleiben beim Scrollen oben stehen, damit du jederzeit zwischen Live, Nachrichten und Auswertung wechseln kannst.

**2. Reiter lesbar machen**
- Fünf Reiter nebeneinander sind auf dem Handy zu eng ("Nachrichten", "Auswertung" werden gequetscht). Neu: waagrecht scrollbare Reiterleiste mit ausreichend grossen Tippflächen, aktiver Reiter unterlegt, Melde-Zähler bleibt sichtbar.

**3. Live-Ansicht auf das Wesentliche**
- Zuoberst nur: wer braucht evtl. Hilfe, wie viele neue Meldungen, Restzeit.
- Das Balkendiagramm "Wo steht die Klasse" (aktuell 8 Spalten auf 390 px, Beschriftungen unlesbar) wird zu einer kompakteren Darstellung mit lesbaren Kurzlabels und Zahl in der Säule.
- "Zeit nachgeben" wandert in einen einklappbaren Block, damit die Gruppenliste sofort sichtbar ist.

**4. Gruppenzeilen**
- Eine Zeile pro Gruppe: Name (abgeschnitten statt umbrechend), Etappe, Zeit, Warnfarbe. Details weiterhin im Popup.
- Popups nutzen die volle Handyhöhe mit eigenem Scrollbereich, damit keine Schaltfläche ausserhalb des Bildschirms liegt.

**5. Auswertung**
- Die breite Tabelle (Hearing) bekommt eine Handy-Variante als Kartenliste statt seitlichem Schieben.
- Kennzahlen-Kacheln: 2 Spalten auf dem Handy, 4 ab Tablet.
- Export-Schaltflächen untereinander mit voller Breite.

**6. Nachrichten**
- Eingabefeld, Zielwahl und Senden untereinander in voller Breite; Verlauf und Hilferufe als klar getrennte Blöcke mit Zeitangabe rechts.

Inhalte, Logik, Punkteberechnung und Datenbank bleiben unverändert — es geht rein um Darstellung.

## Technische Notizen

- Betroffen: `src/routes/lehrer.$code.tsx` (Kopf, Reiterleiste, Live-Block), `src/components/teacher/ProgressMatrix.tsx` (Verteilung, TeamRow, TeamDetailDialog), `src/components/teacher/ReportPanel.tsx` (Tabelle → Kartenliste unter `sm`, Kachel-Grids, Export), `MessagePanel.tsx`, `HelpFeed.tsx`, `LiveBoard.tsx`.
- Muster: `grid-cols-[minmax(0,1fr)_auto]` auf Mobile → `sm:flex`, `min-w-0` + `truncate` auf Textcontainern, `shrink-0` auf Icons, Tippflächen ≥ 44 px, Schrift ≥ 11 px statt 9/10 px bei wichtigen Labels.
- Reiterleiste: `flex overflow-x-auto` mit `snap-x`, `sticky top-0` inkl. Hintergrund und `z`-Index; `max-w-2xl` Container bleibt.
- Dialoge: `max-h-[85svh]` + `overflow-y-auto` im Inhaltsbereich.
- Keine Änderungen an Serverfunktionen oder Migrationen.
