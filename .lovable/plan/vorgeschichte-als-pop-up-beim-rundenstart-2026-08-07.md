# Vorgeschichte als Pop-up beim Rundenstart

## Neuer Ablauf (Lehrerseite)

```text
"Runde für alle X Teams starten"
   -> Vollbild-Pop-up: Titeltafel (Datum vor einem Jahr, an einer Lichtung mitten im Wald)
   -> Video Vorgeschichte
   -> Schlusstafel (Wenige Monate später starb Jakob nach kurzer Krankheit.)
   -> Pop-up schliesst automatisch, Runde startet, Countdown läuft auf allen Handys
```

- Der Startknopf ist der einzige Auslöser: ein Klick, keine Rückfrage, kein separater Video-Block und kein Auto-Start-Schalter mehr in der Lobby.
- Das Pop-up liegt über der ganzen Seite (dunkler Hintergrund, beamerfreundlich) und schliesst sich nach der Schlusstafel von selbst.
- «Überspringen» bleibt als kleine Schaltfläche in der Ecke, damit du das Video notfalls abkürzen und trotzdem starten kannst.
- Die Runde wird genau einmal gestartet, auch wenn das Pop-up schnell geschlossen wird.

## Gestaltung der Tafeln

- Kein Standard-Fliesstext: Titel- und Schlusstafel in der Schreibmaschinen-/Serif-Optik der Akte, auf tiefdunklem Grund mit feiner Papierkörnung, dünne Linien über und unter dem Text.
- Titeltafel: Datumszeile klein in Schreibmaschinenschrift mit weiter Laufweite, darunter gross in Serif «an einer Lichtung mitten im Wald»; sanftes Einblenden und leichtes Aufziehen, dann Überblendung ins Video.
- Datum wird beim Öffnen berechnet: heutiges Datum minus ein Jahr, auf Deutsch ausgeschrieben (z. B. «7. August 2025»).
- Schlusstafel: gleiche Optik, ruhiger und langsamer eingeblendet, danach weiches Abdunkeln bevor das Pop-up schliesst.

## Technisch

- `src/lib/story.ts`: Introtext wird zur Funktion `prologueIntroDate()` (heute minus 1 Jahr, `de-CH` formatiert); Outrotext bleibt Konstante.
- `src/components/case-file/PrologueVideo.tsx`: Phasenlogik (intro -> video -> outro -> done) bleibt, wird aber als Vollbild-Overlay-Variante genutzt; Video startet automatisch nach der Titeltafel (stumm-Fallback nicht nötig, da Klick-Auslöser), Layout füllt den Bildschirm, Skip-Button, `onEnded` feuert nach der Schlusstafel.
- `src/components/teacher/LobbyPanel.tsx`: Video-Block und Auto-Start-Checkbox entfernen; Startknopf setzt lokalen State `showPrologue`, das Overlay ruft am Ende `onStart(true)`.
- `src/routes/lehrer.$code.tsx`: `confirm` beim Start entfällt.
- `src/styles.css`: Ergänzende Keyframes für Titel-/Schlusstafel (Fade, leichtes Scale, Overlay-Fade-out).
- Keine Änderungen an Countdown-Logik, Punkten, Timer oder Datenbank.
