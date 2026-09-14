# Biodiversität: Notiz-Text leicht anpassen

## Änderung
In `src/routes/etappe-4.tsx` (Zeile 217–219) den Blockquote-Text der Notiz ersetzen durch:

> „Manche dieser Tiere sind hier noch sicher, andere stehen kurz vor dem Verschwinden. **Schneide die Polaroids aus** und **trenne** die gefährdeten von den nicht gefährdeten Arten, um die Kiste zu öffnen. Die gefährdeten Tiere erzählen eine Geschichte — höre zu, was sie zu sagen haben."

Die markierten Wörter «Schneide die Polaroids aus» und «trenne» werden mit `<strong>` fett hervorgehoben.

## Keine Änderung an
- Rätsel-Logik, Code (123), Polaroids, Hinweise, Fach-Input-Karten
- Header-/Footer-Labels, Tokens, QR-Codes

## Prüfung
- Typecheck `bunx tsgo --noEmit`
- Build-Log `/tmp/observability/build-errors.log`
