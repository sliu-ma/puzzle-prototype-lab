export type CouncilOption = {
  id: "A" | "B" | "C";
  text: string;
  correct: boolean;
};

export type CouncilQuestion = {
  id: string;
  council: {
    name: string;
    ressort: string;
    accent: "earth" | "green" | "blue" | "stamp";
  };
  intro: string;
  question: string;
  options: CouncilOption[];
  wrongHint: string;
  rightReply: string;
  akteRef: { label: string; to: string };
};

export const introStory = `Mit rauchenden Köpfen, den korrigierten Berichten, den Stromrechnungen und Elviras Notizen im Rucksack rennen Maya, Tante Elvira und Marlene Vogt zum Gemeindesaal. Als sie die schwere Tür aufstossen, herrscht im Saal gedämpfte Stimmung. Der Gemeindepräsident steht gerade am Rednerpult und will zur finalen Abstimmung über das Gaskraftwerk „Waldlichtung" aufrufen.

Maya atmet tief durch, geht nach vorne und bittet um das Wort: „Warten Sie bitte! Wir haben die Gutachten und die Daten der Gemeinde genau analysiert. Wenn Sie uns fünf Minuten zuhören, können wir Ihnen zeigen, dass es eine viel bessere Lösung für Grünwald gibt!"

Der Gemeindepräsident schaut überrascht, aber keineswegs verärgert. „Nun gut, Maya. Wenn ihr bessere Argumente habt, hören wir sie uns an. Aber unsere Fachkommissionen werden euch kritische Fragen stellen."`;

export const outroStory = `Als Maya die letzte Frage fehlerfrei beantwortet und die echten Gutachten auf den Tisch legt, herrscht für einen Moment absolute Stille im Saal. Die Gemeinderät*innen tuscheln aufgeregt und vergleichen die Dokumente.

Schliesslich ergreift der Gemeindepräsident wieder das Wort: „Maya, Elvira, Marlene… ich muss Ihnen im Namen des gesamten Rates danken. Wir standen unter gigantischem Druck und haben uns auf fehlerhafte Zusammenfassungen verlassen. Eure Argumente sind absolut stichfest."

Er wendet sich an die Versammlung: „Ich stelle den Antrag, die Abstimmung über das Gaskraftwerk sofort abzusagen. Stattdessen investieren wir das Budget in ein Förderprogramm für Gebäudesanierungen und prüfen den Ausbau echter erneuerbarer Energie!"

Der gesamte Saal applaudiert. Der Bau des Kraftwerks ist vom Tisch — und die Waldhütte ist gerettet. Tante Elvira klopft Maya stolz auf die Schulter: „Gut kombiniert, Maya. Ohne dein Fachwissen hätten wir das heute nicht geschafft!"`;

export const councilQuestions: CouncilQuestion[] = [
  {
    id: "q1",
    council: {
      name: "Herr Rüegg",
      ressort: "Bau & Finanzen",
      accent: "earth",
    },
    intro: "räuspert sich und blättert in einem Aktenordner",
    question:
      "Maya, du behauptest, wir bräuchten das Kraftwerk gar nicht, weil wir im Dorf genug Energie sparen könnten. Ein schöner Gedanke — aber wie soll das in der Praxis funktionieren? Unsere Berechnungen zeigen ein klares Defizit.",
    options: [
      { id: "A", text: "Wir müssen einfach alle Fabriken im Dorf tageweise schliessen, um Strom zu sparen.", correct: false },
      {
        id: "B",
        text: "Durch einfache Massnahmen in den Haushalten — LED-Beleuchtung, smarte Thermostate, bessere Isolation — kann ein einziges Wohnhaus rund 8'000 kWh einsparen. Aufs Dorf hochgerechnet ist der Neubau überflüssig.",
        correct: true,
      },
      { id: "C", text: "Wenn alle Einwohner*innen im Winter die Heizung komplett ausschalten, sparen wir genug.", correct: false },
    ],
    wrongHint: "Schau noch einmal in Akte 004 nach — dort hast du konkret berechnet, wie viel kWh ein einzelnes Wohnhaus durch Sanierung einsparen kann.",
    rightReply: "Herr Rüegg nickt langsam: „Hm. 8'000 kWh pro Haus … hochgerechnet auf das Dorf — das ist tatsächlich mehr, als wir geplant hatten."",
    akteRef: { label: "Akte 004 · Wohnen", to: "/akte-004" },
  },
  {
    id: "q2",
    council: {
      name: "Frau Bircher",
      ressort: "Umwelt & Raumplanung",
      accent: "green",
    },
    intro: "schaut Maya skeptisch über die Brille hinweg an",
    question:
      "Das Gelände für das geplante Kraftwerk im Wald ist doch nur ein ungenutztes Fleckchen Erde. Warum sorgt ihr euch so sehr um diesen Standort? Dort gibt es doch kaum etwas Schützenswertes.",
    options: [
      { id: "A", text: "Der Wald ist wichtig, weil Tante Elvira dort gerne spazieren geht.", correct: false },
      { id: "B", text: "In dem Wald stehen sehr alte Bäume, die man für teures Geld verkaufen könnte.", correct: false },
      {
        id: "C",
        text: "Elviras jahrzehntelange Daten zeigen, dass dieser Wald ein hochentwickeltes Ökosystem ist. Wenn wir dort bauen, zerstören wir den Lebensraum zahlreicher gefährdeter heimischer Tierarten, die ohnehin schon unter starkem Druck stehen.",
        correct: true,
      },
    ],
    wrongHint: "Erinnere dich an Akte 002 — die Tierspuren und Beobachtungen, die Elvira über Jahre dokumentiert hat.",
    rightReply: "Frau Bircher legt den Stift weg: „Wenn Elviras Daten das wirklich belegen, müssen wir den Standort neu beurteilen."",
    akteRef: { label: "Akte 002 · Biodiversität", to: "/akte-002" },
  },
  {
    id: "q3",
    council: {
      name: "Herr Tanner",
      ressort: "Verkehr & Mobilität",
      accent: "blue",
    },
    intro: "lehnt sich nach vorne",
    question:
      "Selbst wenn das mit dem Hausstrom und dem Wald stimmt — das Kraftwerk soll doch ein Zeichen für eine moderne, zukunftsorientierte Gemeinde sein. Was hat unser alltägliches Leben im Dorf überhaupt mit der globalen Klimabilanz zu tun?",
    options: [
      {
        id: "A",
        text: "Umweltschutz fängt im Kleinen an. Wenn wir bei der Mobilität konsequent nachhaltige Transportmittel wie den Zug wählen und beim Konsum auf regionale, saisonale Produkte statt CO₂-intensive Importe setzen, senken wir den ökologischen Fussabdruck unseres Dorfes massiv.",
        correct: true,
      },
      { id: "B", text: "Das hat keinen direkten Zusammenhang, aber wir wollen ein schöneres Dorfbild ohne Fabrikgebäude.", correct: false },
      { id: "C", text: "Die Gemeinde sollte allen Einwohner*innen verbieten, Autos zu kaufen oder Fleisch zu essen.", correct: false },
    ],
    wrongHint: "Denk an Akte 001 (Konsum) und Akte 003 (Mobilität) — die Vergleiche zwischen regional/saisonal und Import bzw. Zug vs. Auto.",
    rightReply: "Herr Tanner schmunzelt: „Also doch — die Summe der vielen kleinen Entscheidungen macht den Unterschied."",
    akteRef: { label: "Akte 001 & 003 · Konsum / Mobilität", to: "/akte-003" },
  },
  {
    id: "q4",
    council: {
      name: "Gemeindepräsident Keller",
      ressort: "Vorsitz",
      accent: "stamp",
    },
    intro: "hält das Empfehlungsschreiben hoch",
    question:
      "Aber Maya — in der offiziellen Empfehlung steht schwarz auf weiss, dass das Erdgaskraftwerk die sicherste und nahezu klimaneutrale Option für uns ist. Warum sollten wir an diesem Papier zweifeln?",
    options: [
      { id: "A", text: "Weil das Planungsbüro heimlich Geld dafür bekommen hat, dieses Kraftwerk schönzureden.", correct: false },
      {
        id: "B",
        text: "Weil sich unter Zeitdruck fünf schwere sachliche Fehler in dieses Empfehlungsschreiben eingeschlichen haben! Verglichen mit den echten Gutachten ist Erdgas ein fossiler Energieträger und die Klimabilanz wurde falsch dargestellt.",
        correct: true,
      },
      { id: "C", text: "Weil das Papier alt ist und wir stattdessen lieber ein Kohlekraftwerk bauen sollten.", correct: false },
    ],
    wrongHint: "In Akte 005 hast du das Gutachten Wort für Wort geprüft und genau fünf falsche Behauptungen markiert.",
    rightReply: "Der Gemeindepräsident wird blass: „Fünf Fehler … das ändert alles."",
    akteRef: { label: "Akte 005 · Energie / Gutachten", to: "/akte-005" },
  },
];

export const akten = [
  { key: "akte-001-unlocked", label: "Akte 001 · Konsum", to: "/akte" },
  { key: "akte-002-unlocked", label: "Akte 002 · Biodiversität", to: "/akte-002" },
  { key: "akte-003-unlocked", label: "Akte 003 · Mobilität", to: "/akte-003" },
  { key: "akte-004-unlocked", label: "Akte 004 · Wohnen", to: "/akte-004" },
  { key: "akte-005-unlocked", label: "Akte 005 · Energie", to: "/akte-005" },
] as const;
