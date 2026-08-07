# Vorgeschichte: responsive Video- und Texttafeln

Ziel: Das Vollbild-Overlay der Vorgeschichte (Titeltafel, Video, Schlusstafel) soll auf Handy, iPad und Laptop gleich gut aussehen — Video so gross wie möglich, Text immer vollständig lesbar und ohne Überlauf.

## Was geändert wird

**Video**
- Video füllt künftig den verfügbaren Bereich (Breite und Höhe) und behält dabei sein Seitenverhältnis, statt nur auf 100 % Breite gesetzt zu werden. Damit verschwindet die Verzerrung und der grosse Leerraum auf breiten Bildschirmen.
- Rahmenbereich mit einem kleinen, gleichmässigen Innenabstand, damit die Steuerleiste auf dem iPad nicht am Rand klebt.

**Titel- und Schlusstafel**
- Schriftgrössen skalieren nicht mehr nur mit der Bildschirmbreite, sondern mit der kleineren Bildschirmseite. Auf einem breiten Laptop wird der Text dadurch nicht mehr so gross, dass er über den Rand läuft; auf dem Handy bleibt er gross und gut lesbar.
- Tafeln werden vertikal zentriert, mit Höhenbegrenzung und Zeilenumbruch, sodass langer Text nie abgeschnitten wird (bei Bedarf scrollbar statt überlaufend).
- Gleiche Behandlung für Datumszeile, Ortszeile und Schlusstext.

**Überspringen/Weiter-Knopf**
- Bleibt in der Ecke, erhält aber sicheren Abstand zu Notch/Safe-Area, damit er auf dem iPhone nicht überlappt.

## Technische Details

- Datei: `src/components/case-file/PrologueVideo.tsx`
  - Video: `h-full w-full object-contain` in einem Flex-Container mit Padding, statt `max-h-full w-full`.
  - Texttafeln: `clamp()`-Werte auf `vmin`-Basis (z. B. `clamp(1.5rem, 7vmin, 5rem)`) statt `vw`; Container mit `max-h-full overflow-y-auto`, `text-balance`/`break-words`.
  - Knopf: `top-[max(1rem,env(safe-area-inset-top))]`-Variante.
- Keine Änderung an Timing, Story-Texten oder Spiel-Logik.
