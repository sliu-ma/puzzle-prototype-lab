# Runbook: Klassen-Runden und Rangliste

Kurze Anleitung für den Betrieb. Gedacht für Lehrpersonen und für die Person,
die das Projekt in Lovable betreut.

## Vor der Lektion: Smoke-Test (30 Sekunden)

1. `/lehrer` öffnen, Passwort eingeben.
2. Statuszeile prüfen: „Datenbank erreichbar. Runden und Rangliste funktionieren."
3. Eine Testrunde anlegen, den Code auf der Startseite eingeben. Erscheint der
   Rundentitel, ist alles bereit. Testrunde danach schliessen.

## Wenn die Rangliste ausfällt

Symptom: Im Spiel steht „Die Verbindung zur Klassen-Runde ist momentan nicht
möglich" oder die Statuszeile auf `/lehrer` ist rot.

Das Spiel bleibt in jedem Fall spielbar: mit dem Code `OEKOLOGIE` starten,
die Punkte werden lokal gezählt.

Ursache ist fast immer die **Server-Bindung des Supabase-Service-Role-Keys**.
Der Schlüssel liegt bewusst nicht im Code und nicht in einer `.env`-Datei mit
Geheimwerten, sondern wird beim Build in die Server-Umgebung injiziert. Wird
die Umgebung neu aufgebaut, kann die Bindung fehlen.

Vorgehen:

1. Im Lovable-Chat sagen: „Bitte die Supabase-Serverbindung neu setzen."
   (Intern: `rebind_secrets`, danach Dev-Server neu starten.)
2. Statuszeile auf `/lehrer` in der **Preview** prüfen.
3. **Wichtig:** In der veröffentlichten App wirkt die Neubindung erst nach
   erneutem **Publizieren**. Preview grün heisst nicht automatisch Live grün.
4. Nach dem Publizieren den Smoke-Test oben auf der Live-Adresse wiederholen.

## Wenn eine Meldung „zu viele Anfragen" erscheint

Es gibt eine Missbrauchsbremse pro Gerät/IP (Rangliste 60 Abfragen pro Minute,
Codeprüfung 40 pro Minute, Lehrer-Anmeldung 12 pro 5 Minuten). Eine Minute
warten genügt. Wenn eine ganze Schulklasse hinter derselben IP sitzt und die
Meldung häufig kommt, dürfen die Werte in `src/lib/rounds.server.ts`
(`rateLimit`-Aufrufe in `src/lib/rounds.functions.ts`) erhöht werden.

## Sicherheitsentscheide, die so bleiben sollen

- **Keine öffentlichen Leserechte** auf `rounds`, `teams`, `score_events`.
  Alle Zugriffe laufen über Server-Funktionen; der Browser erhält nur fertig
  berechnete Ranglisten-Zeilen.
- **Team-Tokens** werden nur als Hash gespeichert und nie an den Browser
  zurückgegeben.
- **Logs** enthalten höchstens „Schlüssel gesetzt: true/false", niemals einen
  Schlüsselwert.
- **Generierte Datei nicht anfassen:** `src/integrations/supabase/client.server.ts`
  wird automatisch erzeugt. Anpassungen gehören in den Wrapper `tryAdmin` in
  `src/lib/rounds.server.ts`.
- Der `payload` in `score_events` enthält nur Spielwerte (Etappe, Dauer,
  Badge, Hinweis-Stufe, Antwort richtig/falsch) — keine Namen, keine Lösungen.

## Passwort der Lehrpersonen

Liegt als Server-Geheimnis `ADMIN_PASSWORT`. Zum Wechseln im Lovable-Chat
sagen: „Bitte das Lehrer-Passwort neu setzen." Nach dem Wechsel Smoke-Test
wiederholen und danach publizieren.
