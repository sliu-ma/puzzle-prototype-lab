# Etappe 5: Grauen Hearing-Hinweistext entfernen

## Änderung
In `src/routes/etappe-5.tsx` (Zeile 275–278) den Hinweis-Absatz entfernen:

    <p className="mt-5 text-sm text-foreground/70">
      Im Hearing stellt der Rat dir zehn Fragen aus allen fünf Themen.
      Max. 3 Fehler, sonst kippt die Abstimmung.
    </p>

Der Hinweis erscheint auf der Folgeseite (Finale/Hearing) erneut, dort wo er hingehört. Die «Hearing starten»- und «Übersicht»-Buttons bleiben unverändert.

## Keine Änderung an
- Storytext, Marlene-Vogt-Label, Buttons, Hearing-Logik

## Prüfung
- Typecheck `bunx tsgo --noEmit`
- Build-Log `/tmp/observability/build-errors.log`
