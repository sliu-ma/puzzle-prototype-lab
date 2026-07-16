## Ziel
Kurze, einheitliche Erfolgsanimation, sobald ein Rätsel richtig gelöst wird — bevor der Umschlag zur nächsten Etappe erscheint.

## Konzept
Wiederverwendbare Komponente `SuccessBurst` (ca. 1.2s) als Vollbild-Overlay:
- Zentraler grüner Haken/Stempel, der einstempelt (scale + leichte Rotation)
- Sanft pulsierender Ring um den Stempel
- Kurzer Text: „Gelöst!"
- Weicher Fade-out, dann Callback → bestehender Umschlag-Dialog öffnet

**Kein Konfetti.** Ruhiger, aktenhafter Look — passend zum bestehenden Papier/Stempel-Stil.

Technisch: reines CSS/Tailwind + SVG-Haken, keine neue Dependency. Respektiert `prefers-reduced-motion` (nur Fade, verkürzt).

## Integration
Neue Datei: `src/components/case-file/SuccessBurst.tsx`

Eingebunden am Erfolgszeitpunkt jedes Rätsels (kurz bevor der bestehende Weiter-/Umschlag-Flow triggert):
- `CodeLock.tsx` (Etappe 3) — bei korrektem Code
- `GruenerMarkt.tsx` (Etappe 2) — bei erfolgreicher Kassenprüfung
- Mobilitäts-Erfolgspfad (Etappe 1)
- `EnergyGame.tsx` (Etappe 4) — bei Erreichen ≥ 10'000 ESP
- `GutachtenRaetsel.tsx` (Etappe 5) — bei korrekter Zuordnung
- Finale-Hearing bleibt unverändert — dort läuft schon der Outro-Screen

Ablauf pro Rätsel:
```text
Lösung korrekt → SuccessBurst (1.2s) → bestehende Erfolgs-Card / EnvelopeDialog
```

## Technische Details
- `SuccessBurst({ show, onDone, label? })` — `fixed inset-0 z-[90]`, `pointer-events-none`, damit nichts blockiert wird.
- Keyframes: `stamp-in` (scale 0.3→1 + rotate -8°→0), `ring-pulse`, `burst-fade`.
- Farben aus bestehenden Tokens (`emerald-700`, `paper`, `ink`).
- Timing über `setTimeout(onDone, 1200)`.
- `prefers-reduced-motion: reduce` → nur Haken + Fade, ~500ms.

## Out of scope
- Kein Konfetti, kein Sound, keine Vibration.
- Keine Änderung an Timer, Hinweisen, Punktzahl.
- Outro-Screen am Ende bleibt unverändert.
