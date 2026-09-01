# Auswertung aufräumen: kurze Teamzeile + Detail-Popup

Ziel: Die Auswertung liest sich wie die Live-Ansicht – knappe Zeilen, Details erst beim Antippen.

## Pro Team: eine Zeile statt Textblock

```text
Team Fuchs     58 Pkt · 5/5 · 72 min · 2 Hinweise      >
Team Dachs     42 Pkt · 3/5 · läuft · 6 Hinweise       >
```

- Eine antippbare Karte pro Gruppe (mind. 48 px), sortiert nach Punkten.
- Sichtbar bleiben nur: Teamname, Punkte, gelöste Etappen, Gesamtzeit (bzw. „noch am Spielen“), Hinweise.
- Mitgliedernamen, Etappen-Chips, Abzeichen- und Hearing-Zahlen verschwinden aus der Liste und leben im Popup.
- Kleiner Warnpunkt an der Zeile, wenn eine Gruppe auffällt (Auflösung genutzt oder deutlich über dem Klassenmedian).

## Detail-Popup pro Team

Dialog (auf dem Handy als Sheet), gleiche Machart wie das Live-Popup:

1. Kopf: Teamname, Mitglieder, Punkte, Status (fertig / abgebrochen bei Rundenende).
2. Kennzahlen: Gesamtzeit, Rätselzeit, Zeit dazwischen, Anteil dazwischen, Hinweise, Abzeichen.
3. Tabelle Etappe 1–5: Thema, Wegzeit, Rätselzeit, Hinweisstufe – offene Etappen gedämpft; jede Zeile mit Vergleich zum Klassenmedian (schneller / langsamer).
4. Hearing: richtig/falsch, Anzahl Versuche, falsch beantwortete Fragen.
5. Abzeichenliste.

## Kopfbereich der Auswertung straffen

- „Klasse gesamt“: von sechs auf vier Kacheln (Punkte, Gesamtzeit, Hinweise, Anteil Weg); Rätselzeit/Zwischenzeit als Zusatzzeile unter der Kachel „Anteil Weg“.
- „Etappen im Vergleich“ und „Hearing pro Frage“ bleiben inhaltlich, werden aber in aufklappbare Abschnitte gepackt (standardmässig zu, Teamliste zuerst sichtbar).
- Leerer Platzhalter-Absatz ohne Inhalt wird entfernt.
- Export-Block und Anonymisierungs-Schalter bleiben unverändert am Ende.

## Technisch

- Nur `src/components/teacher/ReportPanel.tsx`; keine Änderungen an Datenerhebung, `rounds.server.ts` oder CSV-Inhalten.
- Neue lokale Komponenten `TeamRow` und `TeamReportDialog` (auf `@/components/ui/dialog`, mobile Variante über `useIsMobile`), Zustand `useState<string | null>` für das offene Team.
- Klassenmediane pro Etappe werden aus den bereits berechneten `analyses` an das Popup übergeben.
- Aufklappbare Abschnitte über `@/components/ui/collapsible`; Farben ausschliesslich über bestehende Tokens (`stamp`, `primary`, `muted`).
