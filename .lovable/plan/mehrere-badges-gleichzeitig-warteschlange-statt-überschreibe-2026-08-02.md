# Mehrere Badges gleichzeitig: Warteschlange statt Überschreiben

## Problem

Wenn zwei Abzeichen fast gleichzeitig verliehen werden, zeigt die Animation nur das zuletzt gemeldete. Das erste geht in der Anzeige verloren (es bleibt gespeichert und ist später im Abzeichen-Regal sichtbar, aber die Belohnung fühlt sich weg).

## Lösung

Die Badge-Animation bekommt eine Warteschlange: Jedes verdiente Abzeichen wird nacheinander gefeiert.

- Kommen mehrere Abzeichen gleichzeitig, wird das erste gezeigt; ein kleiner Zähler („1 von 2“) macht klar, dass noch eines folgt.
- Tippen schliesst das aktuelle Abzeichen und öffnet direkt das nächste, mit neuem Konfetti.
- Erst nach dem letzten Abzeichen verschwindet das Overlay.
- Nichts wird automatisch geschlossen, das bisherige Tap-to-dismiss bleibt.

## Technisch

- `src/components/case-file/BadgeToast.tsx`:
  - State von `badge: Badge | null` auf `queue: Badge[]` umstellen; angezeigt wird `queue[0]`.
  - `badge:earned`-Handler hängt an, statt zu ersetzen (Duplikate in der Queue verhindern).
  - Dismiss (Tap/ESC) entfernt nur den vordersten Eintrag; Konfetti-Timer bei jedem Wechsel neu starten (`useEffect` auf `queue[0].id`).
  - Zähler „n von m“ nur einzeichnen, wenn mehr als ein Eintrag in der Queue liegt.
- Die Verleihungs-Logik in den Etappen bleibt unverändert; das bisherige Verschieben von Badges (Etappe 5, Etappe 2) kann bestehen bleiben, ist aber nicht mehr zwingend nötig.
