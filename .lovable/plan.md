# Nachrichten an die Gruppen

Die Lehrperson kann während einer laufenden Runde eine kurze Nachricht an alle Gruppen oder an eine einzelne Gruppe schicken. Die Nachricht erscheint bei den Gruppen als Pop-up im gleichen Stil wie Majas Zeitmeldungen.

## Was die Lehrperson sieht

Im Bereich "Live" der Runde ein neues Feld "Nachricht an die Gruppen":
- Textfeld (max. 300 Zeichen) und Button "Senden".
- Auswahl der Empfänger: "Alle Gruppen" (Standard) oder eine einzelne Gruppe aus der Liste.
- Eine einzelne Gruppe lässt sich auch direkt aus dem Detail-Popup der Statuszeile anschreiben ("Nachricht an diese Gruppe").
- Darunter die zuletzt gesendeten Nachrichten mit Uhrzeit und Empfänger, damit klar ist, was schon draussen ist.

## Was die Gruppen sehen

- Innert rund 10 Sekunden erscheint ein Pop-up im Aktenstil: Absender "Nachricht der Lehrperson", der Text, Button "Verstanden".
- Jede Nachricht erscheint nur einmal pro Gerät; bereits gesehene Nachrichten werden lokal vermerkt.
- Nachrichten unterbrechen kein laufendes Rätsel-Ergebnis und setzen nichts zurück; sie überlagern nur kurz.
- Nach Rundenschluss oder Zeitablauf werden keine neuen Nachrichten mehr angezeigt.

## Technische Umsetzung

Datenbank (Migration):
- Neue Tabelle `public.round_messages` mit `id`, `round_id`, `team_id` (nullable = an alle), `body`, `created_at`; RLS aktiv, keine direkten Grants für `anon` (Zugriff nur über SECURITY-DEFINER-Funktionen), `GRANT ALL` für `service_role`.
- `teacher_send_message(p_password_hash, p_code, p_team_id, p_body)` – prüft das Lehrer-Passwort über `assert_teacher`, kürzt/validiert den Text.
- `teacher_list_messages(p_password_hash, p_code)` – letzte 20 Nachrichten für die Lehreransicht.
- `round_state` wird erweitert: liefert zusätzlich `messages` – alle Nachrichten der Runde, die an alle oder an das übergebene, per Token verifizierte Team gerichtet sind (max. 20, nur seit Rundenstart).

Server-Funktionen in `src/lib/rounds.functions.ts`:
- `teacherSendMessage`, `teacherListMessages` analog zu den bestehenden Lehrer-Funktionen (Zod-Validierung, Passwort-Hash).
- Rückgabetyp von `getRoundState` um `messages: { id, body, createdAt }[]` erweitern.

Client:
- `GlobalTimer.tsx` pollt `getRoundState` bereits alle 10 Sekunden mit Team-Kontext (heute nur mit `code`, wird um `teamId`/`token` aus der Session ergänzt). Neue Nachrichten werden an einen kleinen Store übergeben.
- Neue Komponente `src/components/case-file/TeacherMessageOverlay.tsx` (Dialog im Stil der bestehenden Zeitmeldungen), eingehängt in `src/routes/__root.tsx`. Gesehene IDs liegen im `localStorage` unter einem `maya-`-Schlüssel, damit `resetAll()` sie mitlöscht.
- Neue Komponente `src/components/teacher/MessagePanel.tsx`, eingebunden im Live-Schritt von `src/routes/lehrer.$code.tsx`; Einzelversand zusätzlich aus dem Team-Detail-Dialog in `ProgressMatrix.tsx`.
