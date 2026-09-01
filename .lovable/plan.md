# Lobby: Beitritt beschleunigen (Bündel A)

Nur der Beitritt wird überarbeitet. Heute tippt jede Gruppe den Rundencode von Hand ab, danach folgen Teamname und Namen. Das kostet Zeit und erzeugt Tippfehler.

## Was sich ändert

- **QR-Code und Beitritts-Link.** Im Lehrer-Tab „Lobby" erscheinen ein QR-Code und der Link `…/?r=CODE` (mit Kopierknopf). Wer den Code scannt, landet direkt bei Schritt 2 (Teamname) — der Rundencode ist bereits geprüft und eingesetzt.
- **Beitrittsansicht für die Wand.** Knopf „Beitritt anzeigen" öffnet ein Vollbild mit grossem Rundencode, grossem QR-Code und einem Live-Zähler „3 Teams angemeldet". Nur für die Anmeldung, kein Live-Stand während des Spiels.
- **Doppelte Teamnamen abfangen.** Ein Teamname kann pro Runde nur einmal vergeben werden (Gross-/Kleinschreibung egal). Sonst erscheint „Diesen Teamnamen gibt es in dieser Runde schon. Nehmt einen anderen." Damit sind im Leaderboard nicht zwei Teams „Adler" nicht unterscheidbar.

## Technische Umsetzung

- **Migration:** eindeutiger Index auf `(round_id, lower(btrim(name)))`; `round_join` prüft den Namen vorab und gibt die Meldung im Klartext zurück.
- **Beitritts-Link:** `src/routes/index.tsx` liest den Suchparameter `?r=CODE` (via `validateSearch`) und übergibt ihn an `StartForm`; `StartForm` prüft den Code beim ersten Rendern automatisch und springt bei Erfolg auf Schritt 2, bei Misserfolg auf die normale Code-Eingabe mit Fehlermeldung.
- **QR-Code:** Paket `qrcode` als Data-URL im Client erzeugt (kein zusätzlicher Netzwerkaufruf), Basis-URL aus `window.location.origin`.
- **Lehrer-Lobby:** `src/components/teacher/LobbyPanel.tsx` erhält den QR-Block mit Link-Kopierknopf und die Vollbild-Wandansicht (Portal, dunkler Hintergrund, Teamzähler aus dem bestehenden 4-Sekunden-Abruf).

Aus dem ursprünglichen Plan werden Bündel B und C nicht umgesetzt.
