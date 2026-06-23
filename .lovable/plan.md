# Plan: Hearing dialogischer machen & "Klick-bis-richtig" verhindern

## Ziel
Das Finale soll sich wie ein echtes Streitgespräch anfühlen — nicht wie ein Multiple-Choice-Test. Schülerinnen und Schüler sollen ihre Antwort **begründen** statt erraten.

---

## A) Mechaniken gegen das blinde Durchklicken

Mehrere kleine Hürden, die in Kombination Trial-and-Error wertlos machen:

1. **Zwei-Stufen-Antwort (Behauptung + Beleg)**
   Statt einer Auswahl wählt Maya zuerst eine **These** (3 Optionen) und danach den passenden **Beleg/Wert** (3 Optionen, z. B. „≈ 8'000 kWh pro Haus", „≈ 800 kWh", „≈ 80'000 kWh"). Nur die korrekte Kombination zählt — es gibt also 9 Pfade statt 3.

2. **Belegkarten aus den Akten**
   Unter jeder Frage erscheinen 4–6 "Beweisstücke" (Mini-Karten mit Zahl/Zitat aus den Akten). Maya muss **vor** der Antwort 1–2 davon als Argument an die Antwort anheften (Drag oder Klick). Falsche/irrelevante Belege → Ratsmitglied kontert konkret.

3. **Verbrauchte Versuche haben Konsequenz (weich, nicht Game-Over)**
   - 1. Falschversuch: Ratsmitglied stellt eine **Rückfrage** ("Und woran machen Sie das fest?") — die Optionen werden **gemischt und umformuliert**, sodass Position/Buchstabe nicht hilft.
   - 2. Falschversuch: Akte-Hinweis erscheint, Optionen werden **wieder gemischt**.
   - 3. Falschversuch: Die offensichtlich falscheste Option wird **entfernt**, dafür muss Maya zusätzlich den passenden Beleg wählen.
   - Es gibt **keine "richtig"-Markierung am Button** mehr — die Bestätigung kommt nur über die Ratsreaktion.

4. **Cooldown zwischen Klicks** (300–600 ms) verhindert reines Rapid-Clicking; visuell als „Der Rat überlegt …".

5. **Bestätigungsschritt**
   Nach Auswahl steht die Antwort als Zitat im Saal („Sie sagen also: …"). Maya muss **„Das ist mein Argument" bestätigen**. Erst dann fällt die Wertung. Das bremst impulsives Klicken und macht die Aussage bewusst.

6. **Score sichtbar, aber nicht blockierend**
   Oben rechts: „Überzeugungskraft" als Balken, der pro Fehlversuch sinkt. Am Ende entscheidet er über die **Schluss-Variante** (siehe E), nicht über Bestehen.

---

## B) Mehr Dialog statt Q&A

- **Mehrstufige Gesprächsrunden pro Ratsmitglied** (statt eine Frage):
  1. Eröffnungsfrage
  2. Mayas Antwort → Ratsmitglied **reagiert** (zustimmend, skeptisch, fordernd)
  3. **Konterfrage** ("Aber was ist mit …?") — zweite Auswahl, baut auf der ersten auf
  4. Abschluss-Statement des Ratsmitglieds

- **Zwischenrufe aus dem Saal**: kleine kursive Einwürfe von Elvira, Marlene oder anonymen Bürger\*innen zwischen den Antworten („Marlene flüstert: ‚Vergiss die Stromrechnung nicht!'") — geben Hinweise im Rollenspiel statt im Tutorial-Ton.

- **Mayas innerer Monolog**: vor jeder Antwort ein kurzer kursiver Gedanke („*Ich erinnere mich an Elviras Notizbuch …*") — verankert die Antwort narrativ.

- **Personalisierte Reaktionen pro Option**: jede falsche Option bekommt eine **eigene** Konterreplik des Ratsmitglieds (nicht ein generisches „falsch"), die fachlich erklärt, warum sie nicht trägt.

---

## C) Aktivere Antwortformate (rotierend, nicht jedes Mal MC)

Pro Ratsmitglied ein anderes Format, damit es nie nach Schema F geht:

| Runde | Format | Beispiel |
|---|---|---|
| Herr Rüegg (Zahlen) | **Zahlenschloss** | Maya stellt die kWh-Einsparung mit 3 Reglern/Ziffern ein (aus Akte 004). |
| Frau Bircher (Bio) | **Beweis-Sortierung** | 5 Beobachtungen aus Akte 002 in „relevant / irrelevant" sortieren; nur korrekte Auswahl überzeugt. |
| Herr Tanner (Mobilität/Konsum) | **Vergleichs-Waage** | Zwei Produkte/Verkehrsmittel auf eine Waage ziehen; CO₂-Werte aus Akte 001/003 müssen stimmen. |
| Präsident Keller (Gutachten) | **Fehler markieren** | Im Text des Empfehlungsschreibens müssen die 5 Fehlstellen angeklickt werden (aus Akte 005). |

Die letzte Runde wird so zur echten **Beweisführung** — kein Buchstabe zum Anklicken mehr.

---

## D) Technische Umsetzung

Datei-Änderungen:

- **`src/lib/finale-data.ts`** erweitern:
  - `CouncilQuestion` → `CouncilRound` mit `steps: Step[]` (Frage → Beleg → Konter).
  - Neue Typen: `ClaimStep`, `EvidenceStep`, `NumberLockStep`, `SortStep`, `BalanceStep`, `MarkErrorsStep`.
  - Pro Option: `counter: string` (individuelle Ratsreaktion).
  - Pro Runde: `interjections: string[]` (Saal-Zwischenrufe).

- **`src/components/case-file/Hearing.tsx`** umbauen:
  - State-Machine: `step`, `attempts`, `confirmedClaim`, `evidencePicked`, `conviction`.
  - Antwort-Optionen bei jedem Versuch **neu mischen** (Fisher-Yates) und Buchstaben neu vergeben.
  - Bestätigungsschritt vor Wertung.
  - Cooldown via `useState<boolean>` + `setTimeout`.
  - „Überzeugungskraft"-Balken.

- **Neue Mini-Komponenten** (`src/components/case-file/hearing/`):
  - `ClaimChooser.tsx`, `EvidencePicker.tsx`, `NumberLock.tsx` (CodeLock recyceln), `EvidenceSort.tsx`, `Balance.tsx`, `MarkErrorsText.tsx`, `SaalInterjection.tsx`.

- **`src/routes/finale.tsx`** unverändert (Gate bleibt).

---

## E) Drei mögliche Schluss-Varianten

Abhängig von `conviction` am Ende:

- **Voll überzeugt** (0–1 Fehler): Antrag wird einstimmig angenommen.
- **Knapp überzeugt** (2–4 Fehler): Antrag geht mit knapper Mehrheit durch, Präsident bittet um Nachprüfung.
- **Nicht überzeugend** (5+ Fehler): Vertagung — Maya darf erneut antreten (Hearing zurücksetzen). Kein Verlieren, aber Verantwortung.

Das gibt dem Score Bedeutung **ohne** Bestehensschwelle.

---

## Offene Fragen vor Implementierung

1. **Umfang**: Alle vier Mechaniken (A1–A5) gleichzeitig, oder fürs Erste nur **Bestätigungsschritt + gemischte Optionen + individuelle Konter + Score-Balken** (ohne Drag/Sort/Mark-Errors)?
2. **Format-Vielfalt (C)**: Soll jede Runde ein eigenes Mini-Spiel bekommen, oder reicht durchgängig „Behauptung + Beleg" (B-Variante einheitlich)?
3. **Schluss-Varianten (E)**: drei Enden umsetzen oder ein Ende mit variabler Lobrede?
