/**
 * Wege (A bis D) und Verzweigungen pro Posten.
 *
 * Eine Runde legt fest, wie viele Wege es gibt (`pathCount`) und wie sich
 * diese Wege an jedem Posten auf Stationen verteilen (`branches`). Stehen
 * mehrere Wege an derselben Station, genügt dort ein einziger QR-Code.
 */

export const LETTERS = ["A", "B", "C", "D"] as const;
export type Letter = (typeof LETTERS)[number];

/** Posten 1 bis 5 plus Hearing (6). */
export const STAGE_IDS = [1, 2, 3, 4, 5, 6] as const;

export const STAGE_LABELS: Record<number, string> = {
  1: "Mobilität",
  2: "Konsum",
  3: "Wohnen",
  4: "Biodiversität",
  5: "Energie",
  6: "Hearing",
};

/**
 * Grund-Zeichenfolgen der Posten. Einzige Quelle für Sperre, Diagramm und
 * Druckliste; die physischen Codes ohne Endung bleiben damit unverändert.
 */
export const STAGE_TOKENS: Record<number, string> = {
  1: "Tz3PqW8nXmYr5JcLs6Vk",
  2: "CpZk0z9RaQkL22gtiWoR",
  3: "Wb6Vc4Hn1ZqYpMr8Js3F",
  4: "Mn7YxQ2pVe9TbR4Ks0Lh",
  5: "Eg9LkRq2VhYbP4Mn7TcW",
  6: "Hq4Zn8Tv2LrYc6Wk1Pm5",
};

/** Farben der Wege, passend zum Field-Notes-Look. */
export const PATH_COLOR: Record<Letter, string> = {
  A: "#b23a1f",
  B: "#4a8f3c",
  C: "#2f5fbf",
  D: "#d9a521",
};

/** Eine Station ist eine Liste von Wegen, die denselben QR-Code nutzen. */
export type Branches = Record<string, Letter[][]>;

/** Interne Ortsnotizen pro Station, nach Etappe und Stationsreihenfolge. */
export type StationDescriptions = Record<string, string[]>;

export function normalizeStationDescriptions(
  raw: unknown,
  branches: Branches,
  pathCount: number,
): StationDescriptions {
  const src = (raw ?? {}) as Record<string, unknown>;
  const out: StationDescriptions = {};
  for (const stage of STAGE_IDS) {
    const count = stationsFor(branches, stage, pathCount).length;
    const candidate = src[String(stage)];
    const values: unknown[] = Array.isArray(candidate) ? candidate : [];
    out[String(stage)] = Array.from({ length: count }, (_, index) =>
      typeof values[index] === "string"
        ? (values[index] as string).trim().slice(0, 160)
        : "",
    );
  }
  return out;
}

export function lettersFor(pathCount: number): Letter[] {
  const n = Math.max(1, Math.min(LETTERS.length, Math.round(pathCount || 1)));
  return LETTERS.slice(0, n) as Letter[];
}

/** Voreinstellung: alle Wege gemeinsam an einer Station pro Posten. */
export function defaultBranches(pathCount: number): Branches {
  const letters = lettersFor(pathCount);
  const out: Branches = {};
  for (const stage of STAGE_IDS) out[String(stage)] = [[...letters]];
  return out;
}

const isLetter = (v: unknown): v is Letter =>
  typeof v === "string" && (LETTERS as readonly string[]).includes(v);

/**
 * Bringt eine gespeicherte Konfiguration in eine verlässliche Form: jeder Weg
 * kommt pro Posten genau einmal vor, leere Stationen fallen weg.
 */
export function normalizeBranches(raw: unknown, pathCount: number): Branches {
  const letters = lettersFor(pathCount);
  const src = (raw ?? {}) as Record<string, unknown>;
  const out: Branches = {};
  for (const stage of STAGE_IDS) {
    const entry = src[String(stage)];
    const stations: Letter[][] = [];
    const seen = new Set<Letter>();
    if (Array.isArray(entry)) {
      for (const station of entry) {
        if (!Array.isArray(station)) continue;
        const picked = station.filter(
          (l): l is Letter => isLetter(l) && letters.includes(l) && !seen.has(l),
        );
        for (const l of picked) seen.add(l);
        if (picked.length > 0) stations.push(picked);
      }
    }
    // Nicht zugeteilte Wege landen an der ersten Station (bzw. bilden sie).
    const rest = letters.filter((l) => !seen.has(l));
    if (rest.length > 0) {
      if (stations.length === 0) stations.push(rest);
      else stations[0]!.push(...rest);
    }
    out[String(stage)] = stations.map((s) => [...s].sort());
  }
  return out;
}

export function stationsFor(
  branches: Branches | null | undefined,
  stage: number,
  pathCount: number,
): Letter[][] {
  const entry = branches?.[String(stage)];
  if (!entry || entry.length === 0) return [lettersFor(pathCount)];
  return entry;
}

/** Station eines Weges an einem Posten (null, wenn der Weg unbekannt ist). */
export function stationOf(
  branches: Branches | null | undefined,
  stage: number,
  pathCount: number,
  letter: string | null | undefined,
): { index: number; letters: Letter[] } | null {
  const stations = stationsFor(branches, stage, pathCount);
  if (!letter) return null;
  const index = stations.findIndex((s) => s.includes(letter as Letter));
  if (index < 0) return null;
  return { index, letters: stations[index]! };
}

/**
 * Zeichenfolge einer Station: Grundcode plus Endung mit dem ersten Buchstaben
 * der Station. Bei nur einer Station bleibt der Grundcode unverändert.
 */
export function tokenForStation(
  baseToken: string,
  stationLetters: Letter[],
  stationCount: number,
): string {
  if (stationCount <= 1) return baseToken;
  const first = [...stationLetters].sort()[0];
  return first ? `${baseToken}_${first}` : baseToken;
}

/** Erwartete Zeichenfolge für einen Weg an einem Posten. */
export function tokenForStage(args: {
  stage: number;
  baseToken: string;
  letter?: string | null;
  branches?: Branches | null;
  pathCount?: number | null;
}): string {
  const pathCount = args.pathCount ?? 1;
  const stations = stationsFor(args.branches, args.stage, pathCount);
  if (stations.length <= 1) return args.baseToken;
  const station = stationOf(args.branches, args.stage, pathCount, args.letter);
  if (!station) return args.baseToken;
  return tokenForStation(args.baseToken, station.letters, stations.length);
}

/** Alle an einem Posten benötigten Codes (für Druckliste und Übersicht). */
export function stationCodes(
  stage: number,
  branches: Branches | null | undefined,
  pathCount: number,
): { index: number; letters: Letter[]; token: string }[] {
  const base = STAGE_TOKENS[stage] ?? "";
  const stations = stationsFor(branches, stage, pathCount);
  return stations.map((letters, index) => ({
    index,
    letters,
    token: tokenForStation(base, letters, stations.length),
  }));
}

/** Anzahl aller Codes, die für eine Runde ausgedruckt werden müssen. */
export function totalCodeCount(
  branches: Branches | null | undefined,
  pathCount: number,
): number {
  return STAGE_IDS.reduce(
    (sum, stage) => sum + stationsFor(branches, stage, pathCount).length,
    0,
  );
}
