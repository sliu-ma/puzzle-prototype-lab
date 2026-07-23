## Etappe 5 · Gutachten – Sprache vereinfachen + Mobile-Reihenfolge

**Ziel:** Texte in die einfache Sprache der Vorlage überführen (kurze Sätze, Fachbegriffe erklärt) und auf Mobilgeräten die Faktenkarte oberhalb der Aussagen zeigen.

### 1. Texte anpassen in `src/components/case-file/GutachtenRaetsel.tsx`

Alle Aussagen der drei Gutachten werden in kurze, klare Sätze mit Erklärungen zerlegt. Die fünf Fehler-IDs (`f1`–`f5`) bleiben unverändert erhalten, damit die Prüf-Logik weiter funktioniert.

**Akte A · Erdgas-Kraftwerk "Thermika Ost"**
- Technische Bewertung:
  - `f1`: "Erdgas stösst im Betrieb 95 Gramm CO₂ pro Kilowattstunde aus. Das ist fast klimaneutral."
  - Decoy: "Das Kraftwerk ist eine GuD-Anlage. GuD steht für Gas- und Dampf-Kraftwerk. Eine GuD-Anlage hat einen Wirkungsgrad von rund 60 Prozent. Der Wirkungsgrad zeigt: Wie viel von der eingesetzten Energie kommt am Ende als Strom heraus?"
  - Decoy: "Der Bau des Kraftwerks dauert höchstens 24 Monate."
- Standortbewertung:
  - Decoy: "Das Gasnetz ist in der Nähe. Eine Leitung von 2,1 Kilometer Länge verbindet das Kraftwerk mit dem Gasnetz."
  - Decoy: "Für den Bau muss Wald gerodet werden. Roden bedeutet: Der Wald wird entfernt. Insgesamt geht es um 4,2 Hektar Mischwald."
  - `f5`: "Fachleute haben den Wald untersucht und in einer Karte festgehalten (Kartierung). Ergebnis: Dieser Wald ist nicht besonders schützenswert."
- Empfehlung: "Wir empfehlen: Die Gemeinde soll den Bau des Erdgaskraftwerks «Thermika Ost» sofort beschliessen."

**Akte B · Kohle-Reservekraftwerk "Sicher & Stabil"**
- Technische Bewertung:
  - `f2`: "Moderne Steinkohlekraftwerke haben einen Wirkungsgrad von 78 Prozent. Der Wirkungsgrad zeigt: Wie viel von der eingesetzten Energie kommt am Ende als Strom heraus? Mit 78 Prozent sind Steinkohlekraftwerke besser als Anlagen für erneuerbare Energien."
  - `f3`: "Kohle ist erneuerbar. Kohle ist eine Brückentechnologie. Das bedeutet: Kohle wird nur für eine Übergangszeit genutzt, bis es eine bessere Lösung gibt."
  - Decoy: "Steinkohle stösst rund 820 Gramm CO₂ pro Kilowattstunde aus."
- Standortbewertung:
  - Decoy: "Für die Anlage braucht es eine eigene Zufahrtsstrasse. Auf dieser Strasse fahren Schwertransporte. Schwertransporte sind Lastwagen mit sehr schwerer Ladung."
  - Decoy: "Der Betrieb braucht eine Bewilligung. Diese Bewilligung richtet sich nach dem kantonalen Luftreinhaltegesetz. Das Luftreinhaltegesetz schützt die Luft vor Schadstoffen."
  - Decoy: "Der Standort liegt nicht in einer Gewässerschutzzone. Gewässerschutzzonen schützen zum Beispiel Bäche, Seen oder Grundwasser."
- Empfehlung: "Wir empfehlen: Die Gemeinde soll das Reservekraftwerk am geplanten Standort bauen."

**Akte C · Bürger-Solarpark "GrünStrom"**
- Technische Bewertung:
  - `f4`: "Photovoltaik-Anlagen im Schweizer Mittelland haben im Durchschnitt 250 Volllaststunden pro Jahr. Volllaststunden zeigen: Wie viele Stunden pro Jahr liefert die Anlage so viel Strom, wie sie maximal liefern kann?"
  - Decoy: "Im Betrieb stösst die Anlage 0 Gramm CO₂ pro Kilowattstunde aus."
  - Decoy: "Die Amortisationszeit der ganzen Anlage beträgt rund 8 Jahre. Amortisationszeit bedeutet: die Zeit, bis sich die Anlage finanziell bezahlt macht."
- Standortbewertung:
  - Decoy: "Die Anlage wird auf einer Fläche gebaut, die schon versiegelt ist. Versiegelt bedeutet: Der Boden ist bereits bebaut oder asphaltiert. Für den Bau muss also kein Wald gerodet werden."
  - Decoy: "Ein Batteriespeicher mit 12 Megawattstunden (MWh) speichert Strom. So gibt es auch dann Strom, wenn keine Sonne scheint."
  - Decoy: "Batteriespeicher halten etwa 15 bis 25 Jahre. Das nennt man die Lebensdauer des Speichers."
- Empfehlung bleibt bestehen.

### 2. Mobile-Reihenfolge: Faktenkarte zuerst

Aktuell (Zeile 282) rendert ein 2-Spalten-Grid `md:grid-cols-[1.3fr_1fr]`; auf Mobile stapeln die Blöcke in DOM-Reihenfolge (Text zuerst, dann Chart+Faktenkarte).

Änderung: Rechte Spalte (Chart + Faktenkasten) auf Mobile per `order`-Utility oberhalb der linken Spalte anzeigen, auf `md` und grösser wie bisher rechts:

```text
<div class="grid gap-4 p-4 md:grid-cols-[1.3fr_1fr]">
  <div class="order-2 md:order-1"> ... Aussagen + Empfehlung ... </div>
  <div class="order-1 md:order-2 space-y-3"> ChartFigur + Faktenkasten </div>
</div>
```

Damit erscheint auf dem Handy zuoberst die Faktenkarte (samt Chart), gefolgt von den anklickbaren Aussagen. Auf Tablet/Desktop bleibt das Layout unverändert.

### Nicht betroffen
- Fehler-IDs, Prüf-Logik, Hints (`HINTS_005`), Charts, Faktenkasten-Inhalte.
