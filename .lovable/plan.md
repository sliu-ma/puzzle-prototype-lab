## Ziel

In `src/routes/etappe-3.tsx` (Zeile 300) den Übergang nach „Darauf steht:" so anpassen, dass genau **zwei Zeilenumbrüche** zwischen dem Einleitungssatz und dem Zitat stehen.

## Änderung

Im `<p>` mit `whitespace-pre-line` das trailing `&nbsp;` entfernen und die Leerzeile durch **zwei echte Zeilenumbrüche** ersetzen (also eine Leerzeile zwischen den beiden Textblöcken → rendert als zwei `\n`).

Vorher:
```
Darauf steht:&nbsp;
[leere Zeile]

„Der erste Schritt …"
```

Nachher:
```
Darauf steht:
[leere Zeile]
„Der erste Schritt …"
```

Das ergibt visuell zwei Zeilenumbrüche (eine leere Zeile Abstand) nach „Darauf steht:".
