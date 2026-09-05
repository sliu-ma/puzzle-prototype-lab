# Backup-Öffnung nur durch die Lehrperson

Heute steht das Eingabefeld für die Zeichenfolge immer offen, und die Zeichenfolge ist für alle Gruppen dieselbe. Sie kann also weitergeschickt werden, ohne dass jemand vor Ort ist. Das wird ersetzt: Das Öffnen ohne Kamera gibt es nur noch, wenn du es für eine bestimmte Gruppe und eine bestimmte Etappe freigibst.

## So wird es sich anfühlen

Für die Gruppe:
- Auf dem Sperrbildschirm einer Etappe steht nur noch die Kamera-Schaltfläche. Kein Eingabefeld, keine Zeichenfolge.
- Klappt die Kamera nicht, tippt die Gruppe auf «Kamera geht nicht – Lehrperson fragen». Damit wird nur eine Meldung an dein Dashboard geschickt (wie der bestehende Hilfe-Knopf), plus der Hinweis: «Warte auf die Freigabe der Lehrperson.»
- Sobald du freigibst, öffnet sich die Etappe auf dem Gerät von selbst (das Gerät fragt im Hintergrund nach). Bei schlechtem Netz kann die Gruppe stattdessen die vierstellige Zahl eintippen, die du ihr nennst.

Für dich im Lehrer-Dashboard:
- In der Live-Übersicht hat jede Gruppe eine Schaltfläche «Etappe freigeben». Du wählst die Etappe und bestätigst.
- Danach siehst du eine vierstellige Zahl, die 20 Minuten gilt, nur für diese Gruppe und diese Etappe, und nach einmaliger Nutzung verfällt. Anfragen von Gruppen («Kamera geht nicht») erscheinen wie Hilferufe markiert.

Damit ist die Abkürzung wertlos, wenn niemand vor Ort ist: Du gibst sie einzeln frei, sie gilt nur kurz, nur für eine Gruppe und nur für eine Etappe.

## Technische Umsetzung

Datenbank (eine Migration):
- Neue Tabelle `public.stage_unlocks`: `team_id`, `stage`, `code` (4 Stellen), `expires_at`, `used_at`, Zeitstempel; RLS aktiv, keine Policies (Zugriff nur über SECURITY-DEFINER-Funktionen), Grants für `service_role`.
- `teacher_grant_unlock(p_password_hash, p_code, p_team_id, p_stage)` – erzeugt/erneuert die Freigabe und gibt den Code zurück (Ablauf 20 Min).
- `team_unlock_status(p_team_id, p_token_hash)` – gibt offene Freigaben (Etappen) des eigenen Teams zurück.
- `team_unlock_redeem(p_team_id, p_token_hash, p_stage, p_code)` – prüft Code, Etappe, Ablauf und Einmalnutzung, setzt `used_at`, gibt Erfolg zurück.
- `round_state` zusätzlich um `unlockedStages` für das anfragende Team erweitern.

Serverfunktionen in `src/lib/rounds.functions.ts`:
- `teacherGrantUnlock` (mit bestehender Login-Bremse `loginBucket`/`assertLoginAllowed`), `redeemStageUnlock`, und `unlockedStages` aus `getRoundState` durchreichen.

Client:
- `src/components/case-file/QRGate.tsx`: Eingabefeld und Klartext-Zeichenfolge entfernen. Neuer Zustand «Freigabe angefragt» mit Polling (`getRoundState`, ca. 10 s) – enthält die Antwort die eigene Etappe, wird wie ein erfolgreicher Scan behandelt (gleicher `localStorage`-Hash, `recordStageScan(stage)`). Zusätzlich ein Feld für die vierstellige Zahl, das `redeemStageUnlock` aufruft. Ohne Runden-Session (Test ohne Klassenrunde) bleibt nur die Kamera.
- Anfrage «Kamera geht nicht» nutzt das bestehende `help_requested`-Ereignis mit passender Notiz.
- `src/components/teacher/ProgressMatrix.tsx` (Detail-Popup pro Gruppe): Schaltfläche «Etappe freigeben» mit Etappenwahl und Anzeige des erzeugten Codes.
