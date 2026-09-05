# Zurück zum Menü vom QR-Sperrbildschirm

Heute ist der QR-Sperrbildschirm einer Etappe vollflächig und bietet nur «Kamera starten» bzw. «Abbrechen». Wer dort landet und nicht scannen will oder kann, hat keinen Weg zurück zur Etappen-Übersicht (Menü, Route `/`).

## So wird es sich anfühlen

- Oben auf dem Sperrbildschirm steht ein kleiner Zurück-Link «← Zurück zur Übersicht». Tippt die Gruppe darauf, landet sie wieder auf der Etappen-Übersicht (Menü) – ohne die Etappe zu öffnen, ohne Punkteverlust.
- Der Link ist als `<Link to="/">` umgesetzt, also eine echte Navigation mit href (funktioniert auch mit Cmd-/Lang-Klick, ist barrierefrei).
- Kamera-Start und alles andere bleiben unverändert.

## Technische Umsetzung

In `src/components/case-file/QRGate.tsx`:

- Import `Link` from `@tanstack/react-router` ergänzen.
- Innerhalb des bestehenden `<PaperCard>`-Blocks, oberhalb der Titel-Zeile (oder direkt darüber als schmaler Link), einen Link einfügen:
  ```tsx
  <Link
    to="/"
    className="inline-flex items-center gap-1 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
  >
    ← Zurück zur Übersicht
  </Link>
  ```
- Platzierung: als erste Zeile innerhalb des `<div className="relative mx-auto max-w-xl">`, vor `<PaperCard>`, damit er ausserhalb der Karte schwebt und nicht mit dem «Gesperrt»-Stempel kollidiert.
- Keine Props-Änderung nötig; der Link ist statisch auf `/`.

Keine anderen Dateien betroffen. Keine Datenbank- oder Logikänderung – die Etappe bleibt versiegelt, bis gescannt wird.
