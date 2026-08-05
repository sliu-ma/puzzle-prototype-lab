# Leaderboard gegen fehlende Server-Bindung absichern

## Problem
Die Runden-/Leaderboard-Funktionen hängen alle am Service-Role-Zugriff. Fehlt die Umgebungs-Bindung (nach neuem Build/Deploy), scheitert jede Aktion sofort, und im Spiel sieht man nur einen unspezifischen Fehler. Genau das ist heute passiert.

## Ziel
1. Ausfälle werden sichtbar und verständlich statt still.
2. Lesende Zugriffe (Rundencode prüfen, Leaderboard anzeigen) funktionieren auch ohne Service-Role-Key.

## Umsetzung
1. **Öffentliche Lesezugriffe ohne Service-Role**
   - `lookupRound` und `getRoundLeaderboard` auf einen Supabase-Client mit dem öffentlichen Schlüssel umstellen.
   - Passende, enge Leserechte in der Datenbank ergänzen: Lesen von Runde (Code, Titel, Status, Budget) und Teams/Score-Events nur soweit fürs Leaderboard nötig.
   - Schreibende und Lehrpersonen-Funktionen (Beitreten, Punkte melden, Runden verwalten) bleiben unverändert privilegiert.
2. **Klare Fehlermeldungen**
   - Fehlt die Bindung, geben die Serverfunktionen einen erkennbaren Status zurück statt eines rohen Fehlers.
   - Im Anmeldeformular und im Leaderboard eine verständliche Meldung anzeigen („Verbindung zur Klassen-Runde momentan nicht möglich, Spiel läuft solo weiter“), damit ein Ausfall das Spiel nie blockiert.
3. **Selbsttest für Lehrpersonen**
   - Auf `/lehrer` eine kleine Statuszeile: „Datenbank erreichbar / nicht erreichbar“, damit du vor der Lektion in zwei Sekunden prüfen kannst, ob alles steht.
4. **Verifikation**
   - Rundencode-Prüfung, Beitritt, Punkte-Sync und Leaderboard in der Preview durchtesten.
   - Danach publizieren, damit die Live-Umgebung denselben Stand hat.

## Technische Hinweise
- Neue Lesepfade nutzen `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` innerhalb der Handler, mit expliziter Spaltenauswahl.
- Datenbankrechte werden per Migration ergänzt (nur SELECT, nur die fürs Leaderboard nötigen Spalten/Tabellen); Team-Tokens bleiben unlesbar.
- Kein Schlüssel wandert in den Browser-Build oder in `.env`-Dateien mit Geheimwerten.
