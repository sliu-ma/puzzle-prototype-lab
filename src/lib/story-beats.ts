// Story-Panels für die Comic-Einleitung jeder Etappe.
// Jede Etappe: 2–3 Panels mit Szenentext + kurzem Maja-Kommentar.

export type StoryBeat = {
  scene: string;        // erzählender Off-Text
  maja?: string;        // Sprechblase Maja (max. 1 Satz)
  badge?: string;       // kleine Mono-Beschriftung oben (Ort/Zeit)
};

export type StoryArc = {
  ort: string;
  thema: string;
  accent: string;       // Tailwind-Farbklasse für Header-Akzent
  emoji: string;
  beats: StoryBeat[];
};

export const STORY: Record<string, StoryArc> = {
  // Etappe 1 – Mobilität (Bahnhof)
  mobilitaet: {
    ort: "Bahnhof Grünwald",
    thema: "Mobilität",
    accent: "from-sky-100 to-paper",
    emoji: "🚉",
    beats: [
      {
        badge: "14:48 · Bahnhofperron",
        scene:
          "In Elviras Mantel klemmt ein zerknittertes Bahnticket. Genf, gestern Morgen.",
        maja: "Genf? Was wollte sie ausgerechnet dort?",
      },
      {
        badge: "Im Etui",
        scene:
          "Daneben drei Routen, säuberlich aufgezeichnet. Eine davon hat sie genommen.",
        maja: "Eine ist die richtige — die nachhaltigste.",
      },
    ],
  },

  // Etappe 2 – Konsum (Dorfladen)
  konsum: {
    ort: "Dorfladen Berger",
    thema: "Konsum",
    accent: "from-amber-100 to-paper",
    emoji: "🛒",
    beats: [
      {
        badge: "15:32 · Holztresen",
        scene:
          "Frau Berger schiebt einen gepackten Korb über den Tresen. „Den hat deine Tante so für dich zurückgelegt.“",
        maja: "Da stimmt was nicht — sie hätte nie diese Eier gekauft.",
      },
      {
        badge: "Im Korb",
        scene:
          "Zwischen den Produkten Elviras Rezept für Erdbeer-Törtchen. Daneben eine Notiz: „Erkennst du die zwei Fehler?“",
        maja: "Zwei Produkte — und ich weiss schon, welche.",
      },
    ],
  },

  // Etappe 3 – Biodiversität (Wald)
  biodiversitaet: {
    ort: "Wald-Lichtung",
    thema: "Biodiversität",
    accent: "from-emerald-100 to-paper",
    emoji: "🐦",
    beats: [
      {
        badge: "16:14 · Beobachtungsposten",
        scene:
          "Auf dem morschen Holztisch ein Stapel Polaroids — Tiere, die Elvira hier gesehen hat.",
        maja: "Manche dieser Arten sehe ich nie mehr.",
      },
      {
        badge: "Rückseite",
        scene:
          "Auf der Rückseite des Stapels ein Gedicht. Zahlen sind in den Wörtern versteckt.",
        maja: "Wenn ich die Gefährdeten umdrehe … wird's lesbar.",
      },
    ],
  },

  // Etappe 4 – Wohnen (Haus)
  wohnen: {
    ort: "Elviras Haus",
    thema: "Wohnen",
    accent: "from-orange-100 to-paper",
    emoji: "🏠",
    beats: [
      {
        badge: "17:01 · Küchentisch",
        scene:
          "Stromrechnungen, Heizpläne, Fensterprospekte — und ein Notizzettel: „Bring das Haus auf Kurs.“",
        maja: "Mit dem Budget bleibt mir nicht viel Spielraum.",
      },
      {
        badge: "Erinnerung",
        scene:
          "Elvira pflegte zu sagen: „Die billigste Kilowattstunde ist die, die du nie verbrauchst.“",
        maja: "Also: zuerst dämmen, dann erneuern.",
      },
    ],
  },

  // Etappe 5 – Energie (Wasserkraftwerk)
  energie: {
    ort: "Altes Wasserkraftwerk",
    thema: "Energie",
    accent: "from-blue-100 to-paper",
    emoji: "⚡",
    beats: [
      {
        badge: "17:53 · Maschinenhaus",
        scene:
          "Im stillgelegten Schaltraum liegt das Gas-Gutachten von Helvetia Energie auf der Werkbank.",
        maja: "Die Zahlen sehen sauber aus — sind sie's auch?",
      },
      {
        badge: "Daneben",
        scene:
          "Elviras Rotstift, ein Lineal, ein Stapel Vergleichswerte vom BAFU. Sie hat schon angefangen zu prüfen.",
        maja: "Drei Stunden bis 19:00. Ich muss die Fehler finden.",
      },
    ],
  },
};
