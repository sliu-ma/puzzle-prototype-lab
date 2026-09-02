# Erste Nachricht kommt erst nach Aktualisieren an

## Ursache

Das Nachrichten-Pop-up wird beim App-Start einmal aufgesetzt. Es liest die Rundensitzung (Code, Gruppe, Token) **genau einmal** beim Laden der Seite. Auf einem Gerät, das beim Laden noch nicht beigetreten ist, ist zu diesem Zeitpunkt keine Sitzung vorhanden – das Pop-up steigt aus und fragt danach nie mehr nach. Erst ein Neuladen der Seite (dann existiert die Sitzung) startet die Abfrage; deshalb erscheint die erste Nachricht nicht, nach dem Aktualisieren aber alle folgenden zuverlässig.

## Fix

- Die Abfrage läuft dauerhaft und liest die Rundensitzung bei **jedem** Abfragezyklus neu, statt einmalig beim Aufsetzen. Sobald eine Gruppe beitritt, greift das Pop-up ohne Neuladen.
- Zusätzlich sofort abfragen, wenn das Gerät wieder in den Vordergrund kommt (Tab-/Bildschirmwechsel) und bei einem Seitenwechsel innerhalb der App – so kommen Nachrichten spürbar schneller an, wenn das Handy zwischenzeitlich gesperrt war.
- Läuft die Runde noch nicht bzw. ist sie beendet, wird wie bisher nichts angezeigt; das beendet aber nicht mehr die Abfrage.

## Technisch

`src/components/case-file/TeacherMessageOverlay.tsx`: `getRoundSession()` in die `check()`-Funktion verschieben (kein früher `return` im Effekt), Intervall unabhängig von der Sitzung starten, `visibilitychange`-Listener mit sofortigem `check()` ergänzen, Cleanup unverändert. Keine Änderungen an Datenbank, Serverfunktionen oder Lehreransicht.
