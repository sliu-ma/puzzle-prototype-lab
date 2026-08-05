# Start nur einmal möglich

## Ziel
Sobald eine Runde aus der Lobby gestartet wurde, darf der Start-Button nicht mehr auslösbar sein. Teams können weiterhin über den Rundencode beitreten, die Lobby dient dann nur noch als Teilnehmerliste.

## Änderungen
- Lobby-Panel der Lehreransicht:
  - Start-Button ist deaktiviert, wenn die Runde nicht mehr im Status "Lobby" ist (also läuft oder abgeschlossen ist).
  - Beschriftung wechselt dann zu "Runde bereits gestartet" statt "Startzeit bestätigen".
  - Hinweistext unter dem Button wechselt: nach dem Start steht dort, dass die Runde läuft, Teams weiterhin mit dem Code beitreten können und ein erneuter Start nicht nötig/möglich ist.
  - Team-Liste und Entfernen-Funktion bleiben unverändert nutzbar.

## Technisch
Nur Presentation-Logik in `src/components/teacher/LobbyPanel.tsx`: `disabled`-Bedingung um `status !== "lobby"` erweitern, Label und Hilfstext abhängig vom Status. Kein Server- oder Datenbank-Eingriff.
