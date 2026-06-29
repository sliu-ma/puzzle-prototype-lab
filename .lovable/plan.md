## Ziel
Verhindern, dass iOS beim Tippen in Input-Felder automatisch reinzoomt.

## Problem
Wenn `<input>` oder `<textarea>`-Elemente eine `font-size` kleiner als `16px` haben, zoomt Safari auf iOS automatisch hinein, sobald das Feld fokussiert wird. Das stört das Spiel-Erlebnis auf dem Handy.

## Lösung
In `src/styles.css` im `@layer base`-Block eine Regel hinzufügen, die für alle Formular-Eingaben eine minimale Schriftgrösse von `16px` erzwingt:

```css
@layer base {
  /* ... bestehende Regeln ... */

  input, textarea, select {
    font-size: 16px;
  }
}
```

Dadurch bleibt der Viewport stabil, wenn Spieler:innen z. B. den Teamnamen oder einen Lösungscode eingeben.

## Keine weiteren Änderungen
- Keine Meta-Tag-Anpassungen (`user-scalable=no` wird bewusst vermieden, um Zoom via Pinch weiterhin zu erlauben).
- Keine Änderungen an einzelnen Komponenten — der Fix greift global über CSS.
