# Etappe 1: Weitere Haltestellen und Genf-Varianten akzeptieren

Die Lösung des ersten Rätsels soll grosszügiger akzeptiert werden: neu auch die
Haltestellen «Widnau, Post» und «Widnau, Schlatt», und alle gängigen Schreibweisen
von Genf.

## Änderung (`src/lib/mobility-data.ts`)

Nur die beiden Konstanten `VALID_ZIEL` und `VALID_START` werden erweitert.
Die Normalisierung in `src/routes/etappe-1.tsx` (Kleinschreibung, Akzente und
Sonderzeichen entfernt, «Genève» wird zu «geneve») bleibt unverändert.

`VALID_ZIEL` (bestehende Einträge bleiben), ergänzt um:

```ts
"widnau post",
"post widnau",
"post",
"widnau schlatt",
"schlatt widnau",
"schlatt",
"bushaltestelle widnau post",
"bushaltestelle widnau schlatt",
```

`VALID_START` (heute: genf, geneve, genève, geneva, gva), ergänzt um:

```ts
"genf cornavin",
"geneve cornavin",
"genève cornavin",
"cornavin",
"geneva cornavin",
```

Hinweis: «genève» und «genève cornavin» werden durch die Normalisierung zu
«geneve» / «geneve cornavin» und sind damit doppelt abgesichert.

## Prüfung

- `bunx tsgo --noEmit` ohne Fehler, Build OK.
- Preview: Etappe 1 akzeptiert «Genève» + «Widnau, Post», «Genf» + «Widnau Schlatt»
  sowie die bestehenden Eingaben («Widnau Gemeindehaus», «Heerbrugg»).

Keine Text-, QR-Code- oder Datenbankänderungen.
