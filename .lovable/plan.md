## Ziel

Die „Gelöst!"-Animation nach jeder Etappe zeigt zusätzlich, wo das Team im Gesamtverlauf steht (welche Etappe gerade gelöst wurde und wie viele noch offen sind), damit die Schülerinnen und Schüler den Fortschritt auch ohne Rückkehr zur Übersicht sehen.

## Änderungen

### 1. `src/components/case-file/SuccessBurst.tsx`
- `SuccessBurstProps` und `useSuccessBurst` um optionalen Parameter `stageNr?: number` (1–5) erweitern.
- Unter dem grünen Haken/Label einen kompakten Fortschrittsblock einblenden, wenn `stageNr` gesetzt ist:
  - Zeile „Etappe {n} von 5 gelöst" (Serif).
  - Fünf Punkte/Badges in einer Reihe: Etappen 1..n grün (mit Häkchen bei ≤ n, Highlight/Pulse bei = n), Etappen n+1..5 neutral (grau, gepunktetes Border).
  - Kleiner Sekundär-Text: bei n < 5 „Noch {5-n} Etappen bis zum Hearing", bei n = 5 „Alle Etappen gelöst, Hearing bereit".
- Sanfte Einblend-Animation der Punkte (staggered, respektiert `prefers-reduced-motion`).
- Duration leicht anheben (z. B. 2600 ms Default) wenn `stageNr` gesetzt, damit der Fortschritt lesbar bleibt; sonst 2000 ms wie bisher.

### 2. Etappen-Routen `src/routes/etappe-1.tsx` … `etappe-5.tsx`
- Aufruf anpassen: `useSuccessBurst({ stageNr: N })` bzw. äquivalente Signatur, sodass jede Etappe ihre Nummer mitgibt.
- Keine Änderung an `completeStage` oder Navigationslogik.

### 3. `src/routes/finale.tsx`
- Keine Änderung am Success-Verhalten (Finale nutzt andere Outro-Sequenz mit Badge-Showcase).

## Technische Details

- Neue Signatur (rückwärtskompatibel):
  ```ts
  useSuccessBurst(opts?: { stageNr?: number; duration?: number })
  ```
  Alt-Aufrufe ohne Argument verhalten sich wie zuvor.
- Fortschrittspunkte nutzen bestehende Tokens (`emerald-600`, `border-border`, `bg-secondary`, `text-muted-foreground`), keine neuen Farben.
- Mobile-first: Punkte klein genug für 393 px Viewport (~ 28 px), Zeile bricht nicht um.
- `prefers-reduced-motion`: Punkt-Stagger deaktiviert.

## Nicht enthalten

- Kein globaler Progress-Bar außerhalb der Animation.
- Keine Änderung am Envelope-Dialog oder an der Übersicht.
