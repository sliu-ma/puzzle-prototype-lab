export type CouncilOption = {
  /** Stable internal id — NOT shown to the user. Display letter is assigned after shuffling. */
  key: string;
  text: string;
  correct: boolean;
  /** Individual reaction from the council member to this specific option. */
  counter: string;
};

export type CouncilQuestion = {
  id: string;
  council: {
    name: string;
    ressort: string;
    accent: "earth" | "green" | "blue" | "stamp";
  };
  /** Stage direction shown in parentheses. */
  intro: string;
  /** Maya's inner monologue right before answering. */
  innerThought: string;
  question: string;
  /** Whispered interjection from Elvira / Marlene / the audience — shown only as a small hint after the first wrong attempt. */
  interjection: string;
  options: CouncilOption[];
  wrongHint: string;
  rightReply: string;
  akteRef: { label: string; to: string };
};

export const introStory = `Mit rauchenden Köpfen, den korrigierten Berichten, den Stromrechnungen und Elviras Notizen im Rucksack rennen Maya, Tante Elvira und Marlene Vogt zum Gemeindesaal. Als sie die schwere Tür aufstossen, herrscht im Saal gedämpfte Stimmung. Der Gemeindepräsident steht gerade am Rednerpult und will zur finalen Abstimmung über das Gaskraftwerk „Waldlichtung" aufrufen.

Maya atmet tief durch, geht nach vorne und bittet um das Wort: „Warten Sie bitte! Wir haben die Gutachten und die Daten der Gemeinde genau analysiert. Wenn Sie uns fünf Minuten zuhören, können wir Ihnen zeigen, dass es eine viel bessere Lösung für Grünwald gibt!"

Der Gemeindepräsident schaut überrascht, aber keineswegs verärgert. „Nun gut, Maya. Wenn ihr bessere Argumente habt, hören wir sie uns an. Aber unsere Fachkommissionen werden euch kritische Fragen stellen."`;

/** Three outro variants based on Maya's conviction score. */
export const outroByConviction = {
  strong: `Als Maya die letzte Frage beantwortet und die echten Gutachten auf den Tisch legt, herrscht für einen Moment absolute Stille im Saal. Dann brandet Applaus auf. Der Gemeindepräsident nickt anerkennend:

„Maya, Elvira, Marlene — eure Argumentation war lückenlos. Im Namen des gesamten Rates: danke. Ich stelle den Antrag, die Abstimmung über das Gaskraftwerk sofort abzusagen. Stattdessen investieren wir das Budget in ein Förderprogramm für Gebäudesanierungen und prüfen den Ausbau echter erneuerbarer Energie!"

Der Antrag wird einstimmig angenommen. Der Bau des Kraftwerks ist vom Tisch — und die Waldhütte ist gerettet.`,
  ok: `Maya hat die letzte Frage beantwortet. Im Saal wird getuschelt, einige Ratsmitglieder vergleichen die Gutachten Seite für Seite. Der Gemeindepräsident räuspert sich:

„Eure Argumente sitzen, auch wenn an einzelnen Stellen Rückfragen offen geblieben sind. Wir setzen die Abstimmung über das Kraftwerk aus und prüfen die Sanierungs- und Erneuerbare-Energie-Variante in einer Sondersitzung."

Mit knapper Mehrheit wird der Bau verschoben. Tante Elvira flüstert: „Reicht für heute. Den Rest holen wir uns in der Nachprüfung."`,
  weak: `Maya hat sich tapfer geschlagen, aber zu viele Antworten waren ungenau. Der Gemeindepräsident schaut ernst:

„Eure Sorge nehmen wir ernst — aber so können wir keine endgültige Entscheidung gegen das Gutachten treffen. Wir vertagen die Abstimmung um eine Woche. Bringt eure Belege noch einmal in geordneter Form, dann hören wir euch erneut an."

Kein Sieg, aber auch keine Niederlage. Maya darf erneut antreten — beim nächsten Mal mit besseren Argumenten.`,
} as const;

export const councilQuestions: CouncilQuestion[] = [
  {
    id: "q1",
    council: { name: "Herr Rüegg", ressort: "Bau & Finanzen", accent: "earth" },
    intro: "räuspert sich und blättert in einem Aktenordner",
    innerThought: "Die Zahlen aus den Stromrechnungen … was hatten wir nochmal pro Haus berechnet?",
    question:
      "Maya, du behauptest, wir bräuchten das Kraftwerk gar nicht, weil wir im Dorf genug Energie sparen könnten. Ein schöner Gedanke — aber wie soll das in der Praxis funktionieren? Unsere Berechnungen zeigen ein klares Defizit.",
    interjection: "Marlene flüstert: „Vergiss die Sanierungs-Berechnung aus den Stromrechnungen nicht!"",
    options: [
      {
        key: "shutdown",
        text: "Wir müssen einfach alle Fabriken im Dorf tageweise schliessen, um Strom zu sparen.",
        correct: false,
        counter:
          "Herr Rüegg runzelt die Stirn: „Das ist wirtschaftlich nicht tragbar — und politisch sowieso nicht. Sie müssen mir schon zeigen, wo realistisch gespart wird.",
      },
      {
        key: "renovation",
        text: "Durch einfache Massnahmen in den Haushalten — LED-Beleuchtung, smarte Thermostate, bessere Isolation — kann ein einziges Wohnhaus rund 8'000 kWh einsparen. Aufs Dorf hochgerechnet ist der Neubau überflüssig.",
        correct: true,
        counter: "Herr Rüegg nickt langsam: „Hm. 8'000 kWh pro Haus … das ist tatsächlich mehr, als wir geplant hatten.",
      },
      {
        key: "noheat",
        text: "Wenn alle Einwohner*innen im Winter die Heizung komplett ausschalten, sparen wir genug.",
        correct: false,
        counter:
          "Herr Rüegg seufzt: „Mit Erfrierungen rechnen wir hier nicht. Das ist kein Vorschlag, das ist eine Drohung. Bitte sachlich.",
      },
    ],
    wrongHint: "Schau noch einmal in Akte 004 nach — dort hast du konkret berechnet, wie viel kWh ein einzelnes Wohnhaus durch Sanierung einsparen kann.",
    rightReply: "Herr Rüegg legt den Stift weg und notiert die Zahl.",
    akteRef: { label: "Akte 004 · Wohnen", to: "/akte-004" },
  },
  {
    id: "q2",
    council: { name: "Frau Bircher", ressort: "Umwelt & Raumplanung", accent: "green" },
    intro: "schaut Maya skeptisch über die Brille hinweg an",
    innerThought: "Elviras Notizbuch … die Listen mit den Sichtungen über all die Jahre.",
    question:
      "Das Gelände für das geplante Kraftwerk im Wald ist doch nur ein ungenutztes Fleckchen Erde. Warum sorgt ihr euch so sehr um diesen Standort? Dort gibt es doch kaum etwas Schützenswertes.",
    interjection: "Tante Elvira murmelt: „Die Tagebücher liegen auf dem Tisch. Zeig sie ihr.",
    options: [
      {
        key: "personal",
        text: "Der Wald ist wichtig, weil Tante Elvira dort gerne spazieren geht.",
        correct: false,
        counter:
          "Frau Bircher zieht eine Augenbraue hoch: „Persönliche Vorlieben sind kein Planungsargument. Ich brauche Daten.",
      },
      {
        key: "wood",
        text: "In dem Wald stehen sehr alte Bäume, die man für teures Geld verkaufen könnte.",
        correct: false,
        counter:
          "Frau Bircher schüttelt den Kopf: „Das wäre genau das Gegenteil von Schutz. Das stärkt unser Argument für das Kraftwerk, nicht dagegen.",
      },
      {
        key: "biodiversity",
        text: "Elviras jahrzehntelange Daten zeigen, dass dieser Wald ein hochentwickeltes Ökosystem ist. Wenn wir dort bauen, zerstören wir den Lebensraum zahlreicher gefährdeter heimischer Tierarten, die ohnehin schon unter starkem Druck stehen.",
        correct: true,
        counter: "Frau Bircher legt den Stift weg: „Wenn Elviras Daten das wirklich belegen, müssen wir den Standort neu beurteilen.",
      },
    ],
    wrongHint: "Erinnere dich an Akte 002 — die Tierspuren und Beobachtungen, die Elvira über Jahre dokumentiert hat.",
    rightReply: "Frau Bircher zieht die Standortakte heran und beginnt zu blättern.",
    akteRef: { label: "Akte 002 · Biodiversität", to: "/akte-002" },
  },
  {
    id: "q3",
    council: { name: "Herr Tanner", ressort: "Verkehr & Mobilität", accent: "blue" },
    intro: "lehnt sich nach vorne",
    innerThought: "Erdbeeren im Januar, Zug statt Auto — die kleinen Entscheidungen summieren sich.",
    question:
      "Selbst wenn das mit dem Hausstrom und dem Wald stimmt — das Kraftwerk soll doch ein Zeichen für eine moderne, zukunftsorientierte Gemeinde sein. Was hat unser alltägliches Leben im Dorf überhaupt mit der globalen Klimabilanz zu tun?",
    interjection: "Eine Stimme aus dem Saal ruft: „Was nützt uns ein „modernes" Kraftwerk, wenn wir den Rest verschlafen?",
    options: [
      {
        key: "summe",
        text: "Umweltschutz fängt im Kleinen an. Wenn wir bei der Mobilität konsequent nachhaltige Transportmittel wie den Zug wählen und beim Konsum auf regionale, saisonale Produkte statt CO₂-intensive Importe setzen, senken wir den ökologischen Fussabdruck unseres Dorfes massiv.",
        correct: true,
        counter: "Herr Tanner schmunzelt: „Also doch — die Summe der vielen kleinen Entscheidungen macht den Unterschied.",
      },
      {
        key: "optisch",
        text: "Das hat keinen direkten Zusammenhang, aber wir wollen ein schöneres Dorfbild ohne Fabrikgebäude.",
        correct: false,
        counter:
          "Herr Tanner schüttelt den Kopf: „Ästhetik ist kein Klimaargument. Damit verlieren Sie den ganzen Saal.",
      },
      {
        key: "verbot",
        text: "Die Gemeinde sollte allen Einwohner*innen verbieten, Autos zu kaufen oder Fleisch zu essen.",
        correct: false,
        counter:
          "Herr Tanner hebt abwehrend die Hand: „Verbote gewinnen hier keine Mehrheit. Wir brauchen Belege, dass die Summe vieler kleiner Entscheidungen wirkt — nicht Diktate.",
      },
    ],
    wrongHint: "Denk an Akte 001 (Konsum) und Akte 003 (Mobilität) — die Vergleiche zwischen regional/saisonal und Import bzw. Zug vs. Auto.",
    rightReply: "Herr Tanner notiert die beiden Akten-Nummern auf seinem Block.",
    akteRef: { label: "Akte 001 & 003 · Konsum / Mobilität", to: "/akte-003" },
  },
  {
    id: "q4",
    council: { name: "Gemeindepräsident Keller", ressort: "Vorsitz", accent: "stamp" },
    intro: "hält das Empfehlungsschreiben hoch",
    innerThought: "Fünf Fehler. Ich habe sie alle markiert.",
    question:
      "Aber Maya — in der offiziellen Empfehlung steht schwarz auf weiss, dass das Erdgaskraftwerk die sicherste und nahezu klimaneutrale Option für uns ist. Warum sollten wir an diesem Papier zweifeln?",
    interjection: "Marlene legt leise das markierte Gutachten auf den Tisch.",
    options: [
      {
        key: "korruption",
        text: "Weil das Planungsbüro heimlich Geld dafür bekommen hat, dieses Kraftwerk schönzureden.",
        correct: false,
        counter:
          "Der Präsident wird streng: „Eine Korruptionsbehauptung ohne Belege ist ein eigenes Problem. Bringen Sie sachliche Fehler.",
      },
      {
        key: "fuenffehler",
        text: "Weil sich unter Zeitdruck fünf schwere sachliche Fehler in dieses Empfehlungsschreiben eingeschlichen haben! Verglichen mit den echten Gutachten ist Erdgas ein fossiler Energieträger und die Klimabilanz wurde falsch dargestellt.",
        correct: true,
        counter: "Der Gemeindepräsident wird blass: „Fünf Fehler … das ändert alles.",
      },
      {
        key: "kohle",
        text: "Weil das Papier alt ist und wir stattdessen lieber ein Kohlekraftwerk bauen sollten.",
        correct: false,
        counter:
          "Der Präsident kneift die Augen zusammen: „Kohle? Das wäre eine Verschlechterung. Damit nehmen Sie sich jede Glaubwürdigkeit.",
      },
    ],
    wrongHint: "In Akte 005 hast du das Gutachten Wort für Wort geprüft und genau fünf falsche Behauptungen markiert.",
    rightReply: "Der Präsident greift nach dem markierten Gutachten und beginnt zu lesen.",
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
