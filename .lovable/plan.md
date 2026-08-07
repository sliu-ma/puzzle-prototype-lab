# Briefing-Texte und Start-Popup überarbeiten

## 1. Szene am Forsthaus (Briefing, Karte "Der Umschlag")

Text exakt wie vorgegeben:

- Einleitung: „Am Forsthaus steht die Tür offen. Dann hört sie Schritte."
- Eine Sprechblase (Zitat-Block) mit dem vollständigen Dialog:
  „Maja! Du bist wirklich gekommen, ich wusste nicht, ob ich noch mit dir rechnen darf." Der Mann atmet erleichtert aus. „Ich bin ein Freund deines Grossvaters. Bevor er starb, hat er mir diesen Umschlag für dich gegeben."
- Der Dringlichkeits-Block (rot, mit Uhr-Icon) enthält:
  „Aber es bleibt keine Zeit. In 90 Minuten entscheidet der Gemeinderat über das Gaskraftwerk hier, auf eurer Lichtung. Du musst dich beeilen."

## 2. Jakobs Brief

Nur noch dieser Text (bisherige Doppelung wird entfernt):

```text
Liebe Maja
Unser Ort ist in Gefahr. Ich habe Hinweise gesammelt, die zeigen:
Man darf diesen Wald nicht roden. Ich konnte die Arbeit nicht mehr
zu Ende bringen. Das musst jetzt du tun. Folge meinen Spuren.
Und halte unser Versprechen.
Dein Opa Jakob
```

Der kleine „Sitzung beginnt in 90 Minuten"-Kasten unter der Karte entfällt (Info steckt jetzt im Dialog).

## 3. Neues Timer-Popup beim Start

Beim Tippen auf „Ermittlung starten" erscheint statt des Umschlag-Hinweises ein Vollbild-Popup:

- Grosse Anzeige „90:00" (Countdown-Optik, tickt sichtbar an), Titel z. B. „Die Zeit läuft".
- Kurzer Satz: In 90 Minuten entscheidet der Gemeinderat.
- Button „Los geht's" → schliesst das Popup und führt zur Übersicht.

Der Spiel-Timer startet wie bisher genau hier (Ende des Briefings).

## 4. Umschlag-Hinweis erst in der Übersicht

Der Hinweis „Umschlag 1 · Alter Bahnhof" wird nicht mehr am Ende des Briefings gezeigt, sondern erst wenn in der Übersicht Etappe 1 gestartet wird — gleiche Logik wie bei Etappen 2–5.

## Technische Umsetzung

- `src/components/case-file/IntroScreen.tsx`: Texte ersetzen; `envelope.ask(...)` in `finish()` durch neues Start-Overlay ersetzen (`startGame()` + `markIntroSeen()` weiterhin beim Bestätigen); 90-Minuten-Kasten entfernen.
- Neue Komponente `src/components/case-file/StartTimerOverlay.tsx` (Portal auf `document.body`, grosse `tabular-nums`-Zeit, Bestätigen-Button).
- `src/routes/index.tsx`: in `openStage` die Sonderbehandlung für `nr === 1` entfernen, damit der Umschlag-Dialog für Etappe 1 erscheint (nur `nr === 6` bleibt ohne Umschlag).
