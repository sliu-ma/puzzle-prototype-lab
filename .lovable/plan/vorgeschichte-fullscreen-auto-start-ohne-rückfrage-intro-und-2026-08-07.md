# Vorgeschichte: Fullscreen, Auto-Start ohne Rückfrage, Intro- und Outro-Einblendung

## Ziel

Die Vorgeschichte läuft als kleiner Film ab: Titeltafel, Video im Vollbild, Schlusstafel – und bei aktivem Auto-Start beginnt die Runde direkt, ohne zusätzliche Rückfrage.

## Änderungen

### 1. Video im Vollbild

- `PrologueVideo` startet die Wiedergabe über die Vollbild-Funktion des Geräts (mit Fallback auf iOS-Vollbild bzw. normale Wiedergabe, wenn das Gerät kein Vollbild erlaubt).
- Ein eigener Startknopf ("Vorgeschichte abspielen") löst Vollbild und Wiedergabe gemeinsam aus, weil Browser Vollbild nur nach einer Nutzeraktion zulassen.

### 2. Keine doppelte Rückfrage beim Auto-Start

- `LobbyPanel` meldet beim Videoende, dass es sich um den automatischen Start handelt.
- Die Rundenseite fragt nur beim manuellen Klick auf den Startknopf nach ("Runde jetzt für alle starten?"); beim Auto-Start nach dem Video entfällt die Rückfrage.

### 3. Intro- und Outro-Einblendung

- Vor dem Video eine Titeltafel: «[Datum vor einem Jahr], an einer Lichtung mitten im Wald» – im Stil der Akte, kurz eingeblendet, dann Übergang ins Video.
- Nach dem Videoende eine Schlusstafel: «Wenige Monate später starb Jakob nach kurzer Krankheit.» – ruhig eingeblendet, danach läuft der Start bzw. der nächste Briefing-Schritt weiter.
- Beide Tafeln liegen in der gemeinsamen Vorgeschichte-Komponente, damit Lehreransicht (Lobby) und Einzelspieler-Briefing identisch ablaufen.
- Die Texte kommen zentral aus `src/lib/story.ts`.

## Technische Details

- `src/lib/story.ts`: neue Konstanten für Intro-/Outro-Text.
- `src/components/case-file/PrologueVideo.tsx`: Phasen-Ablauf (intro -> video -> outro -> fertig), `requestFullscreen`/`webkitEnterFullscreen`, `onEnded` feuert erst nach der Schlusstafel.
- `src/components/teacher/LobbyPanel.tsx`: `onStart(auto: boolean)`.
- `src/routes/lehrer.$code.tsx`: `confirm` nur wenn `auto === false`.
- `src/components/case-file/IntroScreen.tsx`: unveränderter Schrittwechsel, profitiert automatisch von den Tafeln.