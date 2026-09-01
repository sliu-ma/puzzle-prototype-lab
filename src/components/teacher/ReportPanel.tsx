import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useRoundReport, fmtTime, type ReportTeam } from "./LobbyPanel";
import { COL_NAME } from "./ProgressMatrix";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { BADGES } from "@/lib/badges";

const STAGES = [1, 2, 3, 4, 5];

type Stats = {
  n: number;
  avg: number | null;
  med: number | null;
  min: number | null;
  max: number | null;
  sum: number;
};

function stats(values: number[]): Stats {
  if (values.length === 0) {
    return { n: 0, avg: null, med: null, min: null, max: null, sum: 0 };
  }
  const s = [...values].sort((a, b) => a - b);
  const sum = s.reduce((acc, v) => acc + v, 0);
  const mid = Math.floor(s.length / 2);
  const med = s.length % 2 === 1 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
  return {
    n: s.length,
    avg: Math.round((sum / s.length) * 10) / 10,
    med: Math.round(med * 10) / 10,
    min: s[0]!,
    max: s[s.length - 1]!,
    sum,
  };
}

const fmt = (v: number | null, unit = "") =>
  v === null ? "–" : `${v}${unit ? ` ${unit}` : ""}`;

type StageAnalysis = {
  stage: number;
  puzzle: Stats;
  travel: Stats;
  solvedBy: number;
  withHint: number;
  withSolution: number;
  verdict: string;
};

function analyseStage(teams: ReportTeam[], stage: number): StageAnalysis {
  const solved = teams
    .map((t) => t.stages.find((s) => s.stage === stage))
    .filter((s): s is NonNullable<typeof s> => !!s);
  const puzzle = stats(solved.map((s) => s.minutes));
  const travel = stats(
    solved.map((s) => s.betweenMin).filter((m): m is number => typeof m === "number"),
  );
  const withHint = solved.filter((s) => s.hintLevel >= 1).length;
  const withSolution = solved.filter((s) => s.hintLevel === 3).length;
  const n = solved.length;

  let verdict = "zu wenig Daten";
  if (n > 0) {
    const shareSolution = withSolution / n;
    const shareHint = withHint / n;
    const med = puzzle.med ?? 0;
    if (shareSolution >= 0.5) {
      verdict = "zu schwer – die Hälfte brauchte die Auflösung";
    } else if (shareHint >= 0.6 || med >= 15) {
      verdict = "schwierig – viel Unterstützung nötig";
    } else if (med <= 4 && shareHint === 0) {
      verdict = "zu leicht – schnell und ohne Hinweise gelöst";
    } else {
      verdict = "passend";
    }
  }
  return { stage, puzzle, travel, solvedBy: n, withHint, withSolution, verdict };
}

type Try = { attempt: number; correct: boolean };
type TeamAnswer = {
  question: number;
  tries: Try[];
  first: boolean;
  last: boolean;
};

/**
 * Alle Hearing-Antworten eines Teams, pro Frage nach Versuch geordnet.
 * Altrunden ohne Versuchsnummer werden als erster Versuch behandelt.
 */
function teamAnswers(t: ReportTeam): TeamAnswer[] {
  const src: Try[] & { question?: number }[] = [];
  const raw =
    t.hearingAttempts.length > 0
      ? t.hearingAttempts
      : t.events
          .filter((e) => e.type === "hearing_answer")
          .map((e) => ({
            question: e.question ?? 0,
            correct: e.correct === true,
            attempt: e.attempt ?? 1,
          }));
  void src;
  const map = new Map<number, Try[]>();
  for (const a of raw) {
    const list = map.get(a.question) ?? [];
    list.push({ attempt: a.attempt, correct: a.correct });
    map.set(a.question, list);
  }
  return [...map.entries()]
    .map(([question, tries]) => {
      const sorted = [...tries].sort((a, b) => a.attempt - b.attempt);
      return {
        question,
        tries: sorted,
        first: sorted[0]!.correct,
        last: sorted[sorted.length - 1]!.correct,
      };
    })
    .sort((a, b) => a.question - b.question);
}

type QuestionAnalysis = {
  question: number;
  /** Teams mit mindestens einer Antwort auf diese Frage. */
  teamsAnswered: number;
  /** Teams, die im ersten Versuch falsch lagen. */
  firstWrong: number;
  /** Teams, die auch im letzten Versuch falsch lagen. */
  lastWrong: number;
  /** Alle Antworten über alle Versuche. */
  answers: number;
  wrong: number;
};

/** Hearing-Fehler pro Frage über alle Teams und Versuche. */
function analyseQuestions(teams: ReportTeam[]): QuestionAnalysis[] {
  const map = new Map<number, QuestionAnalysis>();
  for (const t of teams) {
    for (const a of teamAnswers(t)) {
      const cur =
        map.get(a.question) ??
        ({
          question: a.question,
          teamsAnswered: 0,
          firstWrong: 0,
          lastWrong: 0,
          answers: 0,
          wrong: 0,
        } satisfies QuestionAnalysis);
      map.set(a.question, {
        question: a.question,
        teamsAnswered: cur.teamsAnswered + 1,
        firstWrong: cur.firstWrong + (a.first ? 0 : 1),
        lastWrong: cur.lastWrong + (a.last ? 0 : 1),
        answers: cur.answers + a.tries.length,
        wrong: cur.wrong + a.tries.filter((x) => !x.correct).length,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.question - b.question);
}


function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-sm border border-border bg-card p-2.5">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-mono-typed mt-1 text-xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Kurzlabels der zehn Hearing-Fragen für die Diagramm-Achse. */
const QUESTION_LABEL: Record<number, string> = {
  0: "Mobilität · Kosten pro km",
  1: "Mobilität · kurze Autofahrten",
  2: "Konsum · Labels zuordnen",
  3: "Konsum · Saisongemüse",
  4: "Biodiversität · Ursachen",
  5: "Biodiversität · Rote Liste",
  6: "Wohnen · 1 °C weniger",
  7: "Wohnen · Waschmaschine",
  8: "Energie · erneuerbar?",
  9: "Energie · Anteil im Mix",
};

/** Legenden-Punkt für die Diagramme. */
function LegendDot({ className, children }: { className: string; children: string }) {
  return (
    <span className="font-mono-typed flex items-center gap-1 text-[10px] text-muted-foreground">
      <span aria-hidden className={cn("h-2 w-2 rounded-full", className)} />
      {children}
    </span>
  );
}

/**
 * Horizontaler Balken mit Beschriftung links und Wert rechts. Optional ein
 * zweites Segment (gestapelt) und eine Spannweite als dünne Linie dahinter.
 */
function BarRow({
  label,
  sub,
  primary,
  secondary = 0,
  max,
  value,
  spread,
  highlight,
}: {
  label: React.ReactNode;
  sub?: React.ReactNode;
  primary: number;
  secondary?: number;
  max: number;
  value: string;
  spread?: { min: number; max: number } | null;
  highlight?: boolean;
}) {
  const scale = (v: number) => `${Math.min(100, (v / Math.max(1, max)) * 100)}%`;
  return (
    <li className="py-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate font-serif text-[13px] font-semibold">
          {label}
        </span>
        <span
          className={cn(
            "font-mono-typed shrink-0 text-[11px] font-bold tabular-nums",
            highlight && "text-stamp",
          )}
        >
          {value}
        </span>
      </div>
      <div className="relative mt-1 h-3 w-full rounded-full bg-muted">
        {spread && spread.max > spread.min && (
          <span
            aria-hidden
            className="absolute top-1/2 h-px -translate-y-1/2 bg-foreground/25"
            style={{
              left: scale(spread.min),
              width: `calc(${scale(spread.max)} - ${scale(spread.min)})`,
            }}
          />
        )}
        <div aria-hidden className="absolute inset-0 flex overflow-hidden rounded-full">
          <span
            className={cn("h-full", highlight ? "bg-stamp" : "bg-primary")}
            style={{ width: scale(primary) }}
          />
          {secondary > 0 && (
            <span
              className="h-full bg-primary/30"
              style={{ width: scale(secondary) }}
            />
          )}
        </div>
      </div>
      {sub && <p className="mt-1 text-[10px] text-muted-foreground">{sub}</p>}
    </li>
  );
}

/** Abzeichen als Bild-Kachel, nicht erreichte ausgegraut. */
function BadgeTile({
  title,
  imageUrl,
  earned,
  caption,
}: {
  title: string;
  imageUrl: string;
  earned: boolean;
  caption?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-sm border border-border bg-card p-2 text-center",
        !earned && "opacity-40 grayscale",
      )}
    >
      <img src={imageUrl} alt="" aria-hidden className="h-12 w-12" />
      <p className="font-serif text-[10px] font-semibold leading-tight">{title}</p>
      {caption && (
        <p className="font-mono-typed text-[9px] tabular-nums text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  );
}


function csvDownload(name: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/** Fällt die Gruppe auf? Auflösung genutzt oder deutlich über dem Median. */
function isFlagged(t: ReportTeam, medianPuzzle: Map<number, number | null>): boolean {
  return t.stages.some((s) => {
    const med = medianPuzzle.get(s.stage) ?? null;
    return s.hintLevel === 3 || (med !== null && med > 0 && s.minutes >= med * 2);
  });
}

/** Eine kompakte Zeile pro Gruppe – Details erst im Popup. */
function TeamRow({
  t,
  name,
  flagged,
  onOpen,
}: {
  t: ReportTeam;
  name: string;
  flagged: boolean;
  onOpen: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-12 w-full items-center gap-2 rounded-sm border border-border bg-card px-3 py-2 text-left transition-colors hover:bg-secondary/60"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            {flagged && (
              <AlertTriangle aria-hidden className="h-3 w-3 shrink-0 text-stamp" />
            )}
            <span className="truncate font-serif text-sm font-semibold">{name}</span>
          </span>
          <span className="font-mono-typed mt-0.5 block truncate text-[11px] text-muted-foreground">
            {t.stagesSolved}/5 Etappen ·{" "}
            {t.totalMin === null ? "noch am Spielen" : `${t.totalMin} min`} ·{" "}
            {t.hintsUsed} Hinweise
          </span>
          {t.badges.length > 0 && (
            <span className="mt-1 flex items-center gap-0.5">
              {BADGES.filter((b) => t.badges.includes(b.id))
                .slice(0, 3)
                .map((b) => (
                  <img
                    key={b.id}
                    src={b.imageUrl}
                    alt=""
                    aria-hidden
                    className="h-5 w-5"
                  />
                ))}
              {t.badges.length > 3 && (
                <span className="font-mono-typed text-[10px] text-muted-foreground">
                  +{t.badges.length - 3}
                </span>
              )}
            </span>
          )}
        </span>

        <span className="font-mono-typed shrink-0 text-sm font-bold tabular-nums">
          {t.points}
        </span>
        <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    </li>
  );
}

/** Detail-Popup: alle Zahlen einer Gruppe an einem Ort. */
function TeamReportDialog({
  team,
  name,
  showMembers,
  medianPuzzle,
  onClose,
}: {
  team: ReportTeam | null;
  name: string;
  showMembers: boolean;
  medianPuzzle: Map<number, number | null>;
  onClose: () => void;
}) {
  const t = team;
  const puzzle = t ? t.stages.reduce((s, x) => s + x.minutes, 0) : 0;
  const travel = t ? t.stages.reduce((s, x) => s + (x.betweenMin ?? 0), 0) : 0;
  const attempts =
    t && t.hearingAttempts.length
      ? Math.max(...t.hearingAttempts.map((a) => a.attempt))
      : 0;
  const wrongQuestions = t
    ? [
        ...new Set(
          t.hearingAttempts.filter((a) => !a.correct).map((a) => a.question + 1),
        ),
      ].sort((a, b) => a - b)
    : [];

  return (
    <Dialog open={t !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        {t && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-base">{name}</DialogTitle>
            </DialogHeader>

            {showMembers && t.members.length > 0 && (
              <p className="text-xs text-muted-foreground">{t.members.join(", ")}</p>
            )}

            <div className="font-mono-typed flex items-center justify-between gap-2 rounded-sm border border-border bg-secondary/50 px-2.5 py-2 text-[11px]">
              <span>
                {t.finishedAt
                  ? `Fertig ${fmtTime(t.finishedAt)}`
                  : `${t.stagesSolved}/5 Etappen · nicht abgeschlossen`}
              </span>
              <span className="text-sm font-bold tabular-nums">{t.points} Pkt</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Metric label="Gesamt" value={fmt(t.totalMin, "min")} />
              <Metric label="Rätsel" value={`${puzzle} min`} />
              <Metric
                label="Dazwischen"
                value={travel > 0 ? `${travel} min` : "–"}
                hint={
                  puzzle + travel > 0
                    ? `${Math.round((travel / (puzzle + travel)) * 100)} % der Zeit`
                    : undefined
                }
              />
            </div>

            <div>
              <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                Etappen
              </p>
              <ul className="mt-1 divide-y divide-border rounded-sm border border-border">
                {STAGES.map((stage) => {
                  const s = t.stages.find((x) => x.stage === stage);
                  const med = medianPuzzle.get(stage) ?? null;
                  const diff = s && med !== null ? Math.round(s.minutes - med) : null;
                  return (
                    <li
                      key={stage}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 text-[11px]",
                        !s && "text-muted-foreground/60",
                      )}
                    >
                      <span className="font-mono-typed w-6 shrink-0 font-bold">
                        E{stage}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-serif">
                        {COL_NAME[stage]}
                      </span>
                      <span className="font-mono-typed shrink-0 tabular-nums text-muted-foreground">
                        {s
                          ? `${s.betweenMin === null ? "–" : `${s.betweenMin}′`} Weg · ${s.minutes}′ Rätsel`
                          : "offen"}
                      </span>
                      <span
                        className={cn(
                          "font-mono-typed w-12 shrink-0 text-right tabular-nums",
                          diff !== null && diff > 0 ? "text-stamp" : "text-muted-foreground",
                        )}
                      >
                        {diff === null ? "" : diff === 0 ? "±0" : diff > 0 ? `+${diff}′` : `${diff}′`}
                      </span>
                      <span
                        className={cn(
                          "font-mono-typed w-6 shrink-0 text-right",
                          s?.hintLevel === 3 && "font-bold text-stamp",
                        )}
                      >
                        {s && s.hintLevel > 0 ? `H${s.hintLevel}` : "–"}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Rechte Spalte: Abweichung der Rätselzeit vom Klassenmedian.
              </p>
            </div>

            <div className="rounded-sm border border-border p-2.5">
              <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                Hearing
              </p>
              <p className="font-mono-typed mt-1 text-[11px]">
                {t.hearingCorrect}✓ / {t.hearingWrong}✗
                {attempts > 0 && ` · ${attempts} Versuch${attempts === 1 ? "" : "e"}`}
              </p>
              {wrongQuestions.length > 0 && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Falsch beantwortet: F{wrongQuestions.join(", F")}
                </p>
              )}
            </div>

            <div>
              <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                Abzeichen ({t.badges.length} von {BADGES.length})
              </p>
              <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                {BADGES.map((b) => (
                  <BadgeTile
                    key={b.id}
                    title={b.title}
                    imageUrl={b.imageUrl}
                    earned={t.badges.includes(b.id)}
                  />
                ))}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Ausgegraut = nicht erreicht.
              </p>
            </div>


            <p className="font-mono-typed text-[10px] text-muted-foreground">
              Beigetreten {fmtTime(t.joinedAt)}
              {t.finishedAt && ` · fertig ${fmtTime(t.finishedAt)}`}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Aufklappbarer Abschnitt – Details stören die Übersicht nicht. */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Collapsible className="mt-5">
      <CollapsibleTrigger className="group flex min-h-12 w-full items-center justify-between gap-2 rounded-sm border border-border bg-card px-3 py-2 text-left">
        <span className="font-serif text-base font-bold">{title}</span>
        <ChevronDown
          aria-hidden
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function ReportPanel({
  password,
  code,
  budgetMin,
}: {
  password: string;
  code: string;
  budgetMin: number;
}) {
  const { report, loading, updatedAt } = useRoundReport(password, code, 20_000);
  const [anon, setAnon] = useState(true);
  const [openTeam, setOpenTeam] = useState<string | null>(null);

  const teams = [...(report?.teams ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name, "de-CH"),
  );

  // Pseudonyme für die Weiterverarbeitung: Personendaten bleiben draussen.
  const alias = new Map<string, string>();
  teams.forEach((t, i) => alias.set(t.teamId, `Team-${String(i + 1).padStart(2, "0")}`));
  const nameOf = (t: ReportTeam) => (anon ? (alias.get(t.teamId) ?? t.name) : t.name);
  const membersOf = (t: ReportTeam) => (anon ? "" : t.members.join(" / "));

  const finished = teams.filter((t) => t.finishedAt !== null);
  const points = stats(teams.map((t) => t.points));
  const totals = stats(
    teams.map((t) => t.totalMin).filter((m): m is number => typeof m === "number"),
  );
  const hints = stats(teams.map((t) => t.hintsUsed));

  // Rätselzeit gegen Zeit zwischen den Rätseln: wie viel Zeit ging ausserhalb
  // der Posten weg (Weg, Notizen, Pausen).
  const puzzleTotals = teams.map((t) => t.stages.reduce((s, x) => s + x.minutes, 0));
  const travelTotals = teams.map((t) =>
    t.stages.reduce((s, x) => s + (x.betweenMin ?? 0), 0),
  );
  const puzzleSum = stats(puzzleTotals.filter((v) => v > 0));
  const travelSum = stats(travelTotals.filter((v) => v > 0));
  const travelShare =
    puzzleSum.sum + travelSum.sum > 0
      ? Math.round((travelSum.sum / (puzzleSum.sum + travelSum.sum)) * 100)
      : null;

  const analyses = STAGES.map((s) => analyseStage(teams, s));
  const withData = analyses.filter((a) => a.solvedBy > 0);
  // Gemeinsame Skala für alle Etappen-Balken: Rätselzeit plus Weg.
  const stageMax = Math.max(
    1,
    ...analyses.map(
      (a) => (a.puzzle.med ?? 0) + (a.travel.n > 0 ? (a.travel.med ?? 0) : 0),
    ),
  );

  const hardest = [...withData].sort((a, b) => (b.puzzle.med ?? 0) - (a.puzzle.med ?? 0))[0];
  const easiest = [...withData].sort((a, b) => (a.puzzle.med ?? 0) - (b.puzzle.med ?? 0))[0];
  const questions = analyseQuestions(teams);
  


  const hasTravelData = travelSum.n > 0;

  // Mediane pro Etappe für den Vergleich im Team-Popup.
  const medianPuzzle = new Map<number, number | null>(
    analyses.map((a) => [a.stage, a.puzzle.med]),
  );
  const teamsByPoints = [...teams].sort(
    (a, b) => b.points - a.points || a.name.localeCompare(b.name, "de-CH"),
  );

  /** Übersicht pro Team – eine Zeile je Gruppe. */
  const exportTeamCsv = () => {
    const head = [
      "Team",
      "Mitglieder",
      "Punkte",
      "Etappen_geloest",
      "Hinweise_total",
      "Gesamtzeit_min",
      "Raetselzeit_total_min",
      "Zeit_zwischen_Raetseln_total_min",
      ...STAGES.flatMap((s) => [
        `E${s}_raetsel_min`,
        `E${s}_weg_min`,
        `E${s}_hinweisstufe`,
      ]),
      "Abzeichen_anzahl",
      "Abzeichen",
      "Hearing_richtig",
      "Hearing_falsch",
      "Hearing_versuche",
      "Beigetreten",
      "Fertig",
    ];
    const rows = teams.map((t) => {
      const attempts = t.hearingAttempts.length
        ? Math.max(...t.hearingAttempts.map((a) => a.attempt))
        : 0;
      return [
        nameOf(t),
        membersOf(t),
        t.points,
        t.stagesSolved,
        t.hintsUsed,
        t.totalMin ?? "",
        t.stages.reduce((s, x) => s + x.minutes, 0),
        t.stages.reduce((s, x) => s + (x.betweenMin ?? 0), 0),
        ...STAGES.flatMap((s) => {
          const st = t.stages.find((x) => x.stage === s);
          return [st?.minutes ?? "", st?.betweenMin ?? "", st?.hintLevel ?? ""];
        }),
        t.badges.length,
        anon ? "" : t.badges.join(" / "),
        t.hearingCorrect,
        t.hearingWrong,
        attempts,
        fmtTime(t.joinedAt),
        t.finishedAt ? fmtTime(t.finishedAt) : "",
      ];
    });
    const stageSummary = [
      [],
      ["Etappe", "Name", "geloest_von", "Median_raetsel_min", "Min", "Max", "Median_weg_min", "mit_Hinweis", "mit_Aufloesung", "Einschaetzung"],
      ...analyses.map((a) => [
        `E${a.stage}`,
        COL_NAME[a.stage] ?? "",
        a.solvedBy,
        a.puzzle.med ?? "",
        a.puzzle.min ?? "",
        a.puzzle.max ?? "",
        a.travel.med ?? "",
        a.withHint,
        a.withSolution,
        a.verdict,
      ]),
      [],
      ["Hearing_Frage", "Antworten", "falsch", "Fehlerquote_%"],
      ...questions.map((q) => [
        `F${q.question + 1}`,
        q.answers,
        q.wrong,
        q.answers === 0 ? "" : Math.round((q.wrong / q.answers) * 100),
      ]),
      [],
      ["Runde", code, "Budget_min", budgetMin, "Teams", teams.length, "fertig", finished.length],
    ];
    csvDownload(`auswertung-teams-${code}.csv`, [head, ...rows, ...stageSummary]);
  };

  /** Langformat: eine Zeile pro Ereignis – Rohdaten für SPSS, R oder Pivot. */
  const exportEventCsv = () => {
    const head = [
      "Team",
      "Zeitstempel",
      "Sekunde_seit_Rundenstart",
      "Ereignis",
      "Etappe",
      "Hinweisstufe",
      "Frage",
      "Richtig",
      "Versuch",
      "Abzeichen",
      "Dauer_sek",
    ];
    const startMs = report?.startedAt ? Date.parse(report.startedAt) : null;
    const rows = teams.flatMap((t) =>
      t.events.map((e) => {
        const ms = Date.parse(e.at);
        return [
          nameOf(t),
          e.at,
          startMs === null || !Number.isFinite(ms)
            ? ""
            : Math.max(0, Math.round((ms - startMs) / 1000)),
          e.type,
          e.stage ?? "",
          e.level ?? "",
          e.question === null ? "" : e.question + 1,
          e.correct === null ? "" : e.correct ? "1" : "0",
          e.attempt ?? "",
          e.badgeId ?? "",
          e.durationSec ?? "",
        ];
      }),
    );
    csvDownload(`auswertung-ereignisse-${code}.csv`, [head, ...rows]);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>
          {teams.length} Teams · {finished.length} fertig · Budget {budgetMin} min
          {updatedAt !== null &&
            ` · Stand ${new Date(updatedAt).toLocaleTimeString("de-CH", {
              hour: "2-digit",
              minute: "2-digit",
            })}`}
        </span>
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
      </div>

      <h3 className="mt-3 font-serif text-lg font-bold">Klasse gesamt</h3>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric
          label="Punkte"
          value={fmt(points.med)}
          hint={`Median · Ø ${fmt(points.avg)}`}
        />
        <Metric
          label="Gesamtzeit"
          value={fmt(totals.med, "min")}
          hint={
            totals.n === 0
              ? "noch niemand fertig"
              : `Median · ${totals.min}–${totals.max} min`
          }
        />
        <Metric label="Hinweise" value={fmt(hints.med)} hint={`Median · Ø ${fmt(hints.avg)}`} />
      </div>

      {/* Punkte pro Team als Balken – ein Blick zeigt Spitze und Feld. */}
      {teams.length > 0 && (
        <div className="mt-3 rounded-sm border border-border bg-card p-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-serif text-sm font-bold">Punkte pro Team</p>
            <span className="font-mono-typed text-[10px] text-muted-foreground">
              Median {fmt(points.med)} Pkt
            </span>
          </div>
          <ul className="mt-1 divide-y divide-border/60">
            {teamsByPoints.map((t) => (
              <BarRow
                key={t.teamId}
                label={t.name}
                primary={t.points}
                max={Math.max(1, points.max ?? 1)}
                value={`${t.points} Pkt`}
                sub={`${t.stagesSolved}/5 Etappen · ${t.hintsUsed} Hinweise`}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Zeitaufteilung: wie viel Zeit ging an den Posten weg, wie viel dazwischen. */}
      {puzzleSum.sum + travelSum.sum > 0 && (
        <div className="mt-2 rounded-sm border border-border bg-card p-3">
          <p className="font-serif text-sm font-bold">Zeitaufteilung der Klasse</p>
          <div className="mt-2 flex h-5 w-full overflow-hidden rounded-full bg-muted">
            <span
              aria-hidden
              className="h-full bg-primary"
              style={{
                width: `${Math.round(
                  (puzzleSum.sum / (puzzleSum.sum + travelSum.sum)) * 100,
                )}%`,
              }}
            />
            <span aria-hidden className="h-full flex-1 bg-primary/30" />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <LegendDot className="bg-primary">
              {`Rätselzeit ${100 - (travelShare ?? 0)} % · Median ${fmt(puzzleSum.med, "min")}`}
            </LegendDot>
            <LegendDot className="bg-primary/30">
              {hasTravelData
                ? `Zeit dazwischen (Weg, Pause) ${travelShare ?? 0} % · Median ${fmt(travelSum.med, "min")}`
                : "Zeit dazwischen – erst ab neuer Runde erfasst"}
            </LegendDot>
          </div>
        </div>
      )}


      <h3 className="mt-5 font-serif text-lg font-bold">Pro Team</h3>
      <ul className="mt-2 space-y-1.5">
        {teams.length === 0 && (
          <li className="rounded-sm border border-dashed border-border p-3 text-sm text-muted-foreground">
            Noch keine Daten.
          </li>
        )}
        {teamsByPoints.map((t) => (
          <TeamRow
            key={t.teamId}
            t={t}
            name={t.name}
            flagged={isFlagged(t, medianPuzzle)}
            onOpen={() => setOpenTeam(t.teamId)}
          />
        ))}
      </ul>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        Tippe auf eine Gruppe für Zeiten pro Etappe, Hearing und Abzeichen.
      </p>

      <TeamReportDialog
        team={teams.find((t) => t.teamId === openTeam) ?? null}
        name={teams.find((t) => t.teamId === openTeam)?.name ?? ""}
        showMembers
        medianPuzzle={medianPuzzle}
        onClose={() => setOpenTeam(null)}
      />

      <Section title="Etappen im Vergleich">
        <div className="mt-2 rounded-sm border border-border bg-card p-3">
          <p className="text-[11px] text-muted-foreground">
            Balkenlänge = Minuten (Median der Klasse). Der Balken zeigt zuerst die
            Zeit am Rätsel, dann den Weg dorthin.
          </p>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            <LegendDot className="bg-primary">Rätselzeit</LegendDot>
            <LegendDot className="bg-primary/30">Weg zur Etappe</LegendDot>
            <LegendDot className="bg-foreground/25">
              Spannweite schnellste–langsamste Gruppe
            </LegendDot>
          </div>
          <ul className="mt-2 divide-y divide-border/60">
            {analyses.map((a) => {
              const p = a.puzzle.med ?? 0;
              const tr = a.travel.n > 0 ? (a.travel.med ?? 0) : 0;
              const hard = a.stage === hardest?.stage && withData.length > 1;
              return (
                <BarRow
                  key={a.stage}
                  label={`E${a.stage} · ${COL_NAME[a.stage]}`}
                  primary={p}
                  secondary={tr}
                  max={stageMax}
                  highlight={hard}
                  spread={
                    a.puzzle.n > 1
                      ? { min: a.puzzle.min ?? 0, max: a.puzzle.max ?? 0 }
                      : null
                  }
                  value={
                    a.solvedBy === 0
                      ? "–"
                      : tr > 0
                        ? `${p} min + ${tr} min Weg`
                        : `${p} min`
                  }
                  sub={
                    <>
                      {a.solvedBy}/{teams.length} gelöst · {a.withHint} mit Hinweis
                      {a.withSolution > 0 && ` · ${a.withSolution} mit Auflösung`}
                      {" · "}
                      <span className={cn(a.verdict !== "passend" && "text-stamp")}>
                        {a.verdict}
                      </span>
                    </>
                  }
                />
              );
            })}
          </ul>
          {hardest && easiest && hardest.stage !== easiest.stage && (
            <p className="mt-2 text-xs text-muted-foreground">
              Zäheste Etappe: E{hardest.stage} ({COL_NAME[hardest.stage]}) mit Median{" "}
              {hardest.puzzle.med} min · schnellste: E{easiest.stage} (
              {COL_NAME[easiest.stage]}) mit Median {easiest.puzzle.med} min
            </p>
          )}
        </div>
      </Section>

      <Section title="Hearing pro Frage">
        {questions.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Noch keine Hearing-Antworten erfasst.
          </p>
        ) : (
          <div className="mt-2 rounded-sm border border-border bg-card p-3">
            <p className="text-[11px] text-muted-foreground">
              Balkenlänge = Anteil falscher Antworten, absteigend sortiert.
            </p>
            <ul className="mt-2 divide-y divide-border/60">
              {[...questions]
                .filter((q) => q.answers > 0)
                .sort((a, b) => b.wrong / b.answers - a.wrong / a.answers)
                .map((q) => {
                  const share = Math.round((q.wrong / q.answers) * 100);
                  return (
                    <BarRow
                      key={q.question}
                      label={`F${q.question + 1} · ${QUESTION_LABEL[q.question] ?? "Frage"}`}
                      primary={share}
                      max={100}
                      highlight={share >= 50}
                      value={`${share} %`}
                      sub={`${q.wrong} von ${q.answers} Antworten falsch`}
                    />
                  );
                })}
            </ul>
          </div>
        )}
      </Section>

      <Section title="Abzeichen der Klasse">
        <div className="mt-2 rounded-sm border border-border bg-card p-3">
          <p className="text-[11px] text-muted-foreground">
            Wie viele Gruppen haben das jeweilige Abzeichen geholt?
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {BADGES.map((b) => {
              const n = teams.filter((t) => t.badges.includes(b.id)).length;
              return (
                <BadgeTile
                  key={b.id}
                  title={b.title}
                  imageUrl={b.imageUrl}
                  earned={n > 0}
                  caption={`${n}/${teams.length}`}
                />
              );
            })}
          </div>
          <ul className="mt-2 divide-y divide-border/60">
            {BADGES.map((b) => {
              const n = teams.filter((t) => t.badges.includes(b.id)).length;
              return (
                <BarRow
                  key={b.id}
                  label={b.title}
                  primary={n}
                  max={Math.max(1, teams.length)}
                  value={`${n}/${teams.length}`}
                  sub={b.criteria.replace("{budget}", String(budgetMin))}
                />
              );
            })}
          </ul>
        </div>
      </Section>


      <label className="mt-4 flex items-start gap-2 rounded-sm border border-border bg-card p-2.5 text-xs">
        <input
          type="checkbox"
          checked={anon}
          onChange={(e) => setAnon(e.target.checked)}
          className="mt-0.5 h-4 w-4"
        />
        <span>
          <span className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Export ohne Namen
          </span>
          <span className="text-muted-foreground">
            Teamnamen werden zu Team-01, Team-02 … und die Mitgliedernamen bleiben leer.
            Für eine Masterarbeit in der Regel Voraussetzung.
          </span>
        </span>
      </label>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={exportTeamCsv}
          disabled={teams.length === 0}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm border border-border px-4 font-serif font-semibold disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Übersicht pro Team (CSV)
        </button>
        <button
          type="button"
          onClick={exportEventCsv}
          disabled={teams.length === 0}
          className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm border border-border px-4 font-serif font-semibold disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Rohdaten pro Ereignis (CSV)
        </button>
      </div>
      <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
        Die Rohdaten enthalten eine Zeile pro Ereignis mit Sekunde seit Rundenstart –
        das Langformat für Pivot-Tabellen, SPSS oder R.
      </p>
    </div>
  );
}
