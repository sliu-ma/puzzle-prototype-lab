## Ursache (Hypothese)

Der Lovable Builder rendert die Preview in einem `<iframe>`. Für `getUserMedia()` muss dieser iframe explizit die Permissions-Policy `allow="camera; microphone"` gesetzt haben. Ohne dieses Attribut blockiert der Browser den Zugriff **bevor** überhaupt ein Berechtigungsdialog erscheint — und wirft einen `NotAllowedError` mit Message wie *"Permissions policy violation: camera is not allowed in this document"*. Genau dieser Fehler wird von `QRGate.tsx` aktuell pauschal als „Kamera-Zugriff wurde abgelehnt" interpretiert, weshalb es so aussieht, als hätte der Nutzer verweigert.

Dass es im neuen Tab und in Production funktioniert, passt zu dieser Hypothese: dort gibt es keinen einschränkenden iframe-Parent.

Die Iframe-Policy des Builders können wir aus der App heraus **nicht ändern** — nur der Builder selbst kann `allow="camera"` am iframe setzen. Was wir tun können: den echten Fehler sichtbar machen, den Sonderfall erkennen und dem Nutzer eine sinnvolle Handlung anbieten (Preview in neuem Tab öffnen).

## Änderungen

### 1. `src/components/case-file/QRGate.tsx` — echte Fehlerdiagnose
- Vor `decodeFromVideoDevice` einen expliziten `navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })` Aufruf machen, um den rohen Fehler zu bekommen (zXing schluckt/normalisiert Fehler).
- Erkennen ob App im iframe läuft: `window.self !== window.top`.
- Feature-Check: `navigator.permissions.query({ name: "camera" })` (falls verfügbar) für zusätzlichen Kontext.
- Fehler differenziert behandeln nach `error.name`:
  - `NotAllowedError` + iframe + Message enthält „permissions policy" / „Permission denied by system" → **Builder-Block-Meldung**: „Der Lovable Builder blockiert den Kamerazugriff in dieser Vorschau. Öffne die Preview in einem neuen Tab (Button oben rechts im Builder) oder nutze die veröffentlichte Version."
  - `NotAllowedError` sonst → echte Verweigerung durch Nutzer/OS.
  - `NotFoundError` → „Keine Kamera gefunden."
  - `NotReadableError` → „Kamera wird bereits von einer anderen App verwendet."
  - `SecurityError` → „Kamera nur über HTTPS verfügbar."
  - `TypeError` → „getUserMedia in diesem Browser nicht verfügbar."
  - default → generisch mit `name`/`message`.
- Debug-Panel (aufklappbar „Technische Details") mit: `error.name`, `error.message`, `error.stack`, `isIframe`, `location.protocol`, `userAgent`, Permissions-State. Damit ist die Ursache im Builder sofort sichtbar.
- Wenn iframe-Block erkannt: zusätzlicher Button „In neuem Tab öffnen" (`window.open(location.href, "_blank")`).

### 2. Kein Reset des freigeschalteten States
Der bestehende Ablauf (Token/Storage) bleibt unverändert. Nur die Diagnose- und Fehler-Anzeige-Pfade werden erweitert.

## Verifikation
- Im Builder: erwartet Meldung „Builder blockiert Kamera" + Debug-Details mit `NotAllowedError` + „permissions policy" + `isIframe: true`.
- In neuem Tab / Published: unverändertes Verhalten, Scanner startet.
