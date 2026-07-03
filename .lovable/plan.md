## Ziel

Beim ersten Rätsel (Akte 001 / „Grüner Markt") soll nach 3 Minuten — also zeitgleich mit der Freischaltung von Tipp 1 — ein einmaliges Pop-up erscheinen, das den Schüler:innen erklärt, dass es ein Hinweissystem gibt, wo sie es finden und wie es funktioniert.

## Verhalten

- Pop-up erscheint genau einmal pro Gerät (localStorage-Flag `akte-001-hints-intro-shown`).
- Trigger: sobald `elapsedMin >= 3` im `HintSystem` erreicht ist (gleicher Timer wie Tipp-Freischaltung) — also nur wenn Schüler:innen tatsächlich am ersten Rätsel dran sind.
- Nur für die erste Akte (Standard-`storageKey` `akte-001-hints-start`), nicht für die weiteren Akten.
- Wenn Tipp 1 zum Mount-Zeitpunkt schon aufgedeckt wurde (z. B. Rückkehr auf die Seite), wird das Pop-up nicht mehr gezeigt.

## Inhalt des Pop-ups

- Titel: „Du brauchst Hilfe? Maya hat Hinweise für dich."
- Text (kurz, kindgerecht):
  - Unten rechts findest du den Button **💡 Tipps**.
  - Nach **3 Minuten** kommt Tipp 1, nach **6 Minuten** Tipp 2, nach **9 Minuten** die Auflösung.
  - Du entscheidest selbst, ob du sie anschaust — klicke auf das Schloss, um einen Hinweis aufzudecken.
- Ein Button: „Alles klar" schließt das Pop-up und setzt das Flag.
- Sekundär (optional dezent): „Tipps jetzt öffnen" — schließt das Pop-up und öffnet direkt das Hinweis-Panel.

## Umsetzung

Alle Änderungen in `src/components/case-file/HintSystem.tsx`:

- Neuer State `showIntro`.
- Effect prüft nach dem Mount und in jedem Timer-Tick: wenn `storageKey === "akte-001-hints-start"`, `elapsedMin >= 3`, Tipp 1 noch nicht revealed und Flag noch nicht gesetzt → `showIntro = true`.
- Dialog per bestehender `Dialog`-Komponente aus `src/components/ui/dialog.tsx` (Design-Sprache passend zum Papier-/Stempel-Look, `font-serif` für Titel, `font-mono-typed` für Meta).
- Schließen setzt `localStorage.setItem("akte-001-hints-intro-shown", "1")` und `showIntro = false`.
- „Tipps jetzt öffnen" ruft zusätzlich `openPanel()` auf.

Keine Änderungen an anderen Dateien nötig; Storage-Format, `getTotalRevealedHints` und die Reihenfolge-Logik bleiben unverändert.
