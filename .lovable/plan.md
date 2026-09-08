# Hearing mit QR-Siegel versiegeln

Das Hearing (Finale) wird künftig genauso geschützt wie die Etappen 1 bis 5: Es öffnet sich erst, wenn die Gruppe den QR-Code vor Ort scannt. Das Hearing findet im Schulzimmer statt, der Code hängt also dort.

## Was die Gruppen sehen

- Nach Etappe 5 führt der Weg wie bisher zum Hearing.
- Statt direkt der Fragerunde erscheint ein versiegeltes Blatt: "Hearing, QR-Code im Schulzimmer scannen" mit dem Knopf zum Kamerastart.
- Nach erfolgreichem Scan öffnet sich das Hearing und bleibt auf diesem Gerät offen, auch nach einem Neuladen.
- Ein falscher QR-Code wird abgelehnt, mit derselben Meldung wie bei den Etappen.
- Die manuelle Eingabe der Zeichenfolge bleibt wie bei den Etappen ausgeschaltet (nur als Notfall-Schalter im Code vorhanden).

## Was die Lehrperson braucht

Ein neuer QR-Code mit einer eigenen Zeichenfolge, der im Schulzimmer aufgehängt wird. Vorschlag für den Inhalt des Codes:

```text
Hq4Zn8Tv2LrYc6Wk1Pm5
```

Der Code enthält nur diese Zeichenfolge, sonst nichts, genau wie bei den Etappen. Wenn du eine andere Zeichenfolge willst, sag sie mir und ich setze sie ein.

## Technische Umsetzung

- `src/routes/finale.tsx`: Konstante `HEARING_TOKEN = "Hq4Zn8Tv2LrYc6Wk1Pm5"` ergänzen und in `FinaleGated` die `FinalePage` in `<QRGate>` einwickeln, innerhalb des bestehenden `StageGate stage={6}`:
  - `token={HEARING_TOKEN}`
  - `storageKey="hearing-unlocked"`
  - `stage={6}`
  - `title={<>Hearing, QR-Code im Schulzimmer scannen</>}`
  - `description="Das Hearing ist versiegelt. Scanne den QR-Code im Schulzimmer, um die Fragerunde des Gemeinderats zu öffnen."`
  - `label="Hearing · Versiegelt"`
- Kein Eingriff in `QRGate.tsx` nötig. `recordStageScan(6)` schreibt nur den lokalen Zeitstempel; das Auswertungsereignis bleibt auf die Etappen 1 bis 5 beschränkt, die Punkteformel und die Lehreransicht ändern sich nicht.
- Keine Datenbank-, Punkte- oder Zugriffsregeländerungen.
- `resetAll()` in `src/lib/progress.ts` löscht bereits alle Schlüssel mit den bekannten Präfixen; damit die Hearing-Sperre beim Zurücksetzen ebenfalls verschwindet, wird `hearing-unlocked` in die Aufräumliste aufgenommen.
