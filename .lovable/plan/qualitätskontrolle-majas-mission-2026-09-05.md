# Qualitätskontrolle «Majas Mission»

Geprüft: Spielablauf und Eingaben, Lehreransicht, Feldtauglichkeit, Datenhaltung, Sicherheit. Unten alle Funde nach Schweregrad, jeweils mit Ort, Erklärung und Vorschlag. Am Ende ein Vorschlag, in welcher Reihenfolge ich es beheben würde.

## Kritisch

**K1 – Abkürzungs-Code schaltet alles frei, für alle sichtbar**
Der Code `KRXZMVBQ` gilt alle sechs Etappen sofort als gelöst. Er steht im Klartext im ausgelieferten Programm (`src/routes/index.tsx`, `src/components/case-file/StartForm.tsx`) und ist von jedem Handy aus auffindbar. Damit ist die Kernmechanik des Spiels umgehbar.
→ Vorschlag: Abkürzung nur noch mit dem Lehrer-Passwort über die Lehreransicht, nicht mehr über die Startseite; den festen Code entfernen.

**K3 – Fortschritt hängt nur am Gerät**
Gelöste Etappen liegen ausschliesslich lokal auf dem Handy (`src/lib/progress.ts`). Leerer Akku, defektes oder getauschtes Gerät bedeutet Neuanfang bei Etappe 1 – die Punkte liegen zwar auf dem Server, werden aber nie zurückgeholt. Beim Neu-Anmelden entsteht zudem eine zweite Gruppe mit gleichem Namen.
→ Vorschlag: Fortschritt aus den bereits gespeicherten Server-Ereignissen wiederherstellen, wenn eine Gruppe mit ihrem Code zurückkehrt; Wiedereinstieg über den bestehenden Gruppen-Zugang statt Neuanmeldung.

**K4 – Punkte können im Funkloch dauerhaft liegen bleiben**
Die Warteschlange für noch nicht übertragene Ereignisse existiert nur im Arbeitsspeicher (`src/lib/round-client.ts`). Nach einem Neuladen wird sie erst wieder angestossen, wenn ein *neues* Ereignis entsteht. Löst eine Gruppe die letzte Aufgabe ohne Netz und schliesst dann die Seite, kommen diese Punkte nie an.
→ Vorschlag: Beim App-Start immer einmal alles Gespeicherte nachschicken; beim Abschluss ebenfalls den vollständigen Stand senden, nicht nur die offene Warteschlange.

**K5 – Lehrer-Zugang ohne Bremse bei Rateversuchen**
Ein einziges gemeinsames Passwort schützt alle Runden. Es gibt keine Begrenzung der Fehlversuche (`assert_teacher` in der Datenbank), also ist systematisches Durchprobieren möglich. Das Dashboard zeigt Gruppen- und Mitgliedernamen und erlaubt Löschen.
→ Vorschlag: Fehlversuche pro Gerät/Zeitfenster begrenzen und Wartezeit einführen, Vergleich zeitkonstant machen, Passwort nur für die Sitzung merken und langes Passwort setzen.

## Mittel

**M1 – Technische Diagnosedaten für Schülerinnen und Schüler sichtbar**
Der Scanner zeigt auf Knopfdruck Fehlerspuren, Browserkennung und interne Hinweise («Lovable Builder blockiert die Kamera») – für Jugendliche im Feld unbrauchbar und verwirrend (`QRGate.tsx`).
→ Vorschlag: nur eine klare Handlungsanweisung anzeigen; Technikdetails entfernen oder hinter einen Lehrer-Zugang legen.

**M2 – Einkaufskorb gibt kein nutzbares Feedback**
Es wird intern genau berechnet, welche Zutaten fehlen bzw. welche Produkte schlecht abschneiden, angezeigt wird aber nur «Die Kasse springt nicht an» (`GruenerMarkt.tsx`).
→ Vorschlag: gestufte Rückmeldung ohne Lösung zu verraten, z. B. «Es fehlt noch eine Zutat» / «Ein Produkt passt nicht zur Saison».

**M3 – Doppelte Gruppen (Geisterteams)**
Wird der Beitritts-Link erneut geöffnet, führt er wieder ins Anmeldeformular, obwohl die Gruppe bereits angemeldet ist – ein zweiter Beitritt mit leicht anderem Namen erzeugt eine zusätzliche Gruppe (`src/routes/index.tsx`, `StartForm.tsx`).
→ Vorschlag: Ist eine Anmeldung vorhanden, direkt ins Wartezimmer führen statt das Formular zeigen.

**M4 – Kein Hilfe-Knopf für Gruppen**
Hilfebedarf erkennt die Lehrperson nur indirekt über Zeitschwellen und genutzte Tipps (`ProgressMatrix.tsx`). Eine Gruppe, die im Feld feststeckt, kann sich nicht melden.
→ Vorschlag: Knopf «Wir brauchen Hilfe» mit Freitext, in der Lehreransicht rot hervorgehoben; wird als Ereignis geloggt und ist exportierbar.

**M5 – Nachrichten ohne Zustellnachweis**
Die Lehrperson sieht nicht, ob eine Nachricht angekommen ist; Latenz rund zehn Sekunden, kein Wiederholversuch (`MessagePanel.tsx`).
→ Vorschlag: Bestätigung durch die Gruppe («Verstanden») zurückmelden und im Dashboard anzeigen.

**M6 – Veraltete Zahlen im Dashboard**
Bei anhaltender Störung bleibt die Anzeige stehen; der Hinweis kommt erst nach zwei Fehlversuchen, die Restzeit läuft weiter, als wäre alles in Ordnung (`LobbyPanel.tsx`, `LiveBoard.tsx`).
→ Vorschlag: Zeitstempel «Stand von HH:MM» einblenden und die Restzeit bei fehlender Verbindung sichtbar als geschätzt markieren.

## Gering

- **G1 – Doppelte Zeit-abgelaufen-Anzeige:** Auf Etappenseiten können gleichzeitig ein Pop-up und eine Vollbildsperre erscheinen (`GlobalTimer.tsx`, `StageGate.tsx`). Einen der beiden Wege verwenden.
- **G3 – Wartezimmer ohne Ausweg:** Bei dauerhaftem Verbindungsfehler bleibt nur der Hinweis, kein Weg zurück zur Startseite (`src/routes/lobby.tsx`).
- **G4 – Kein Vorschaubild für geteilte Links:** Der Beitritts-Link im Klassenchat erscheint ohne Bild.
- **G5 – Waagrechtes Scrollen der Etappenleiste** ist ohne Hinweis leicht zu übersehen.

## Was in Ordnung ist

Reihenfolge der Posten ist gegen Direktaufruf per Adresse gesichert; keine toten Links oder Schaltflächen ohne Funktion gefunden; Punkte werden doppelt gezählt-sicher übertragen (jedes Ereignis genau einmal); gleichzeitiges Bearbeiten desselben Postens durch mehrere Gruppen ist problemlos, da jede Gruppe ihren eigenen Stand hat; Gruppenname pro Runde eindeutig; Uhr läuft auf allen Geräten synchron über den Server; Übertragung durchgehend verschlüsselt; Datenbanktabellen sind direkt nicht zugänglich, Zugriff nur über geprüfte Funktionen; Standortdaten werden gar nicht erhoben (datenschutzfreundlich, GPS-Ausfall daher kein Thema); Zeitstempel pro Posten und Gruppe werden geloggt und sind als Tabellen exportierbar.

## Vorgeschlagene Reihenfolge

1. Feldtauglichkeit: K2, K4, K3 – das entscheidet, ob eine Lektion bei Störungen rettbar ist.
2. Spielintegrität und Zugang: K1, K5.
3. Betreuung: M4, M5, M6, M3.
4. Verständlichkeit: M1, M2, dann G1–G5.

Sag mir, ob ich alles in dieser Reihenfolge umsetzen soll oder nur einzelne Punkte.