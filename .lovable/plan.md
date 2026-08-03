# Ein Code statt zwei

Aktuell wird zuerst der Startcode (OEKOLOGIE / KRXZMVBQ) geprüft und danach im zweiten Schritt optional noch ein Rundencode abgefragt. Neu gibt es nur ein Code-Feld.

## Verhalten

Schritt 1 (Code eingeben):
- Code = `OEKOLOGIE` oder `KRXZMVBQ` → Einzelspiel-Modus, weiter zu Schritt 2.
- Sonst: Code wird gegen die Runden geprüft.
  - Runde gefunden und offen → Klassen-Modus, Rundentitel wird in Schritt 2 angezeigt ("Runde: Klasse 4B").
  - Runde geschlossen → Meldung "Diese Runde ist geschlossen."
  - Nichts gefunden → bestehende Meldung "Der Code stimmt nicht. Fragt eure Lehrperson."
- Während der Prüfung Ladezustand am Button.

Schritt 2 (Team):
- Nur noch Teamname und Teammitglieder, kein Rundencode-Feld mehr.
- Im Klassen-Modus wird beim Absenden das Team der Runde beigetreten (wie heute) und die Runden-Session gespeichert; Fehler (z. B. Teamname schon vergeben) erscheinen bei diesem Schritt.
- Im Einzelspiel-Modus startet die Ermittlung direkt.

## Technisch

- `StartForm.tsx`: Code-Prüfung nutzt `lookupRound` aus `src/lib/rounds.functions.ts`; Zustand `mode: "solo" | "round"` plus Rundentitel. Rundencode-Eingabe und dazugehörige States entfallen; `joinRound` wird in Schritt 2 nur im Runden-Modus aufgerufen.
- `onStart` wird weiter mit dem eingegebenen Code aufgerufen; keine Änderung an `progress.ts`, Score- oder Leaderboard-Logik.
