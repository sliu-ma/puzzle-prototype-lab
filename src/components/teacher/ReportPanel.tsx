import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  Info,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useRoundReport, fmtTime, type ReportTeam } from "./LobbyPanel";
import { COL_NAME } from "./ProgressMatrix";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { BADGES } from "@/lib/badges";

/**
 * Kleines „i" – tippen öffnet eine kurze Erklärung als Popover. Ersetzt die
 * fixen Erklärtexte unter den Sektionen, damit das Dashboard aufgeräumt bleibt.
 */
function InfoHint({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Erklärung: ${label}`}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <Info className="h-3.5 w-3.5" />
          <span className="sr-only">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-72 text-xs leading-relaxed">
        <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-foreground">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

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

const fmt = (v: number | null, unit = "") => (v === null ? "–" : `${v}${unit ? ` ${unit}` : ""}`);

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

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
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

/** Kleine Kennzahl-Zeile für die Detail-Popups. */

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono-typed shrink-0 font-bold tabular-nums">{value}</span>
    </div>
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
        <span className="min-w-0 truncate font-serif text-[13px] font-semibold">{label}</span>
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
            <span className="h-full bg-primary/30" style={{ width: scale(secondary) }} />
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
        <p className="font-mono-typed text-[9px] tabular-nums text-muted-foreground">{caption}</p>
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
            {flagged && <AlertTriangle aria-hidden className="h-3 w-3 shrink-0 text-stamp" />}
            <span className="truncate font-serif text-sm font-semibold">{name}</span>
          </span>
          <span className="font-mono-typed mt-0.5 block truncate text-[11px] text-muted-foreground">
            {t.stagesSolved}/5 Etappen ·{" "}
            {t.totalMin === null ? "noch am Spielen" : `${t.totalMin} min`} · {t.hintsUsed} Hinweise
          </span>
          {t.badges.length > 0 && (
            <span className="mt-1 flex items-center gap-0.5">
              {BADGES.filter((b) => t.badges.includes(b.id))
                .slice(0, 3)
                .map((b) => (
                  <img key={b.id} src={b.imageUrl} alt="" aria-hidden className="h-5 w-5" />
                ))}
              {t.badges.length > 3 && (
                <span className="font-mono-typed text-[10px] text-muted-foreground">
                  +{t.badges.length - 3}
                </span>
              )}
            </span>
          )}
        </span>

        <span className="font-mono-typed shrink-0 text-sm font-bold tabular-nums">{t.points}</span>
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
  const answers = t ? teamAnswers(t) : [];
  const attempts = answers.length
    ? Math.max(...answers.flatMap((a) => a.tries.map((x) => x.attempt)))
    : 0;

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
              <div className="flex items-center gap-1.5">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                  Etappen
                </p>
                <InfoHint label="Etappen">
                  Pro Etappe: Wegzeit (′) und reine Rätselzeit (′).
                  Rechte Spalte = Abweichung der Rätselzeit vom Klassenmedian
                  (+ = langsamer). Letzte Spalte = höchste genutzte Hinweisstufe
                  (H1–H3, H3 = Auflösung).
                </InfoHint>
              </div>
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
                      <span className="font-mono-typed w-6 shrink-0 font-bold">E{stage}</span>
                      <span className="min-w-0 flex-1 truncate font-serif">{COL_NAME[stage]}</span>
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
                        {diff === null
                          ? ""
                          : diff === 0
                            ? "±0"
                            : diff > 0
                              ? `+${diff}′`
                              : `${diff}′`}
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
            </div>

            <div className="rounded-sm border border-border p-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                    Hearing
                  </p>
                  <InfoHint label="Hearing">
                    V = Versuch. ✓ richtig, ✗ falsch. Gewertet wird der letzte
                    Versuch je Frage. Am Ende sollten alle Fragen richtig sein.
                  </InfoHint>
                </div>
                <p className="font-mono-typed text-[11px] tabular-nums">
                  {t.hearingCorrect}✓ / {t.hearingWrong}✗
                  {attempts > 0 && ` · ${attempts} Versuch${attempts === 1 ? "" : "e"}`}
                </p>
              </div>
              {answers.length === 0 ? (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Noch keine Antworten erfasst.
                </p>
              ) : (
                <>
                  <ul className="mt-1.5 divide-y divide-border/60">
                    {answers.map((a) => (
                      <li key={a.question} className="flex items-start gap-2 py-1 text-[11px]">
                        <span className="font-mono-typed w-6 shrink-0 font-bold">
                          F{a.question + 1}
                        </span>
                        <span className="min-w-0 flex-1 font-serif leading-tight">
                          {QUESTION_LABEL[a.question] ?? "Frage"}
                        </span>
                        <span
                          className={cn(
                            "font-mono-typed shrink-0 tabular-nums",
                            a.last ? "text-muted-foreground" : "font-bold text-stamp",
                          )}
                        >
                          {a.tries.map((x) => `V${x.attempt} ${x.correct ? "✓" : "✗"}`).join(" · ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                  Abzeichen ({t.badges.length} von {BADGES.length})
                </p>
                <InfoHint label="Abzeichen">
                  Ausgegraute Abzeichen wurden von dieser Gruppe nicht erreicht.
                </InfoHint>
              </div>
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
  hint,
  hintLabel,
  children,
}: {
  title: string;
  hint?: React.ReactNode;
  hintLabel?: string;
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
      <CollapsibleContent>
        {hint && (
          <div className="flex justify-end pt-1.5">
            <InfoHint label={hintLabel ?? title}>{hint}</InfoHint>
          </div>
        )}
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

/** Eine antippbare Zeile – Kopf links, Kennzahl rechts. */
function ClickRow({
  title,
  sub,
  value,
  highlight,
  onOpen,
}: {
  title: string;
  sub: string;
  value: string;
  highlight?: boolean;
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
          <span className="block truncate font-serif text-sm font-semibold">{title}</span>
          <span className="font-mono-typed mt-0.5 block truncate text-[11px] text-muted-foreground">
            {sub}
          </span>
        </span>
        <span
          className={cn(
            "font-mono-typed shrink-0 text-sm font-bold tabular-nums",
            highlight && "text-stamp",
          )}
        >
          {value}
        </span>
        <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    </li>
  );
}

/** Detail-Popup pro Etappe: Zeiten, Hinweise und alle Gruppen im Vergleich. */
function StageReportDialog({
  analysis,
  teams,
  onClose,
}: {
  analysis: StageAnalysis | null;
  teams: ReportTeam[];
  onClose: () => void;
}) {
  const a = analysis;
  const rows = a
    ? teams
        .map((t) => ({ t, s: t.stages.find((x) => x.stage === a.stage) ?? null }))
        .sort((x, y) => (x.s?.minutes ?? 9999) - (y.s?.minutes ?? 9999))
    : [];
  const hintCount = (level: number) =>
    a
      ? teams.filter((t) => t.stages.find((x) => x.stage === a.stage)?.hintLevel === level).length
      : 0;

  return (
    <Dialog open={a !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        {a && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-base">
                E{a.stage} · {COL_NAME[a.stage]}
              </DialogTitle>
            </DialogHeader>

            <div className="font-mono-typed rounded-sm border border-border bg-secondary/50 px-2.5 py-2 text-[11px]">
              {a.solvedBy} von {teams.length} Gruppen gelöst ·{" "}
              <span className={cn(a.verdict !== "passend" && "text-stamp")}>{a.verdict}</span>
            </div>

            <div className="divide-y divide-border rounded-sm border border-border px-2.5 py-1">
              <Fact label="Rätselzeit Median" value={fmt(a.puzzle.med, "min")} />
              <Fact label="Rätselzeit Ø" value={fmt(a.puzzle.avg, "min")} />
              <Fact
                label="Schnellste – langsamste"
                value={a.puzzle.n > 0 ? `${a.puzzle.min}–${a.puzzle.max} min` : "–"}
              />
              <Fact
                label="Weg zur Etappe (Median)"
                value={a.travel.n > 0 ? fmt(a.travel.med, "min") : "–"}
              />
              <Fact label="Ohne Hinweis gelöst" value={`${a.solvedBy - a.withHint}`} />
              <Fact
                label="Mit Hinweis"
                value={`${a.withHint} (H1 ${hintCount(1)} · H2 ${hintCount(2)} · Auflösung ${a.withSolution})`}
              />
            </div>

            <div>
              <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                Gruppen (nach Rätselzeit)
              </p>
              <ul className="mt-1 divide-y divide-border rounded-sm border border-border">
                {rows.map(({ t, s }) => (
                  <li
                    key={t.teamId}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-1.5 text-[11px]",
                      !s && "text-muted-foreground/60",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate font-serif">{t.name}</span>
                    <span className="font-mono-typed shrink-0 tabular-nums text-muted-foreground">
                      {s
                        ? `${s.betweenMin === null ? "–" : `${s.betweenMin}′`} Weg · ${s.minutes}′ Rätsel`
                        : "nicht gelöst"}
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
                ))}
              </ul>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Einfache Hearing-Matrix: Zeilen = Teams, Spalten = F1–F10,
 * Zellen = ✓ / ✗ (gewertet = letzter Versuch). Horizontal scrollbar,
 * Teamspalte sticky. Kein Pop-up, kein Balken.
 */
function HearingMatrix({
  teams,
  nameOf,
}: {
  teams: ReportTeam[];
  nameOf: (t: ReportTeam) => string;
}) {
  const QUESTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const rows = teams.map((t) => ({ t, answers: teamAnswers(t) }));

  // Pro Frage: wie viele Teams am Ende richtig.
  const correctCount = (q: number) =>
    rows.reduce((n, { answers }) => {
      const a = answers.find((x) => x.question === q);
      return n + (a && a.last ? 1 : 0);
    }, 0);

  if (rows.length === 0 || rows.every(({ answers }) => answers.length === 0)) {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Noch keine Hearing-Antworten erfasst.
      </p>
    );
  }

  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-end">
        <InfoHint label="Hearing-Matrix">
          ✓ richtig · ✗ falsch (gewertet = letzter Versuch) · – keine Antwort.
          Hochgestellte Zahl = nötige Versuche. Spalten F1–F10:
          {" "}
          {Object.entries(QUESTION_LABEL)
            .map(([k, v]) => `F${Number(k) + 1} ${v}`)
            .join(" · ")}
        </InfoHint>
      </div>
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-muted/40">
              <th
                scope="col"
                className="sticky left-0 z-10 bg-muted/40 px-2 py-1.5 text-left font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Team
              </th>
              {QUESTIONS.map((q) => (
                <th
                  key={q}
                  scope="col"
                  className="px-1.5 py-1 text-center font-mono-typed font-bold"
                  title={QUESTION_LABEL[q] ?? "Frage"}
                >
                  F{q + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map(({ t, answers }) => (
              <tr key={t.teamId}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-card px-2 py-1 text-left font-serif text-[11px] font-semibold"
                >
                  <span className="block max-w-[7rem] truncate">{nameOf(t)}</span>
                </th>
                {QUESTIONS.map((q) => {
                  const a = answers.find((x) => x.question === q);
                  const tries = a?.tries.length ?? 0;
                  return (
                    <td key={q} className="px-1.5 py-1 text-center">
                      {!a ? (
                        <span className="font-mono-typed text-muted-foreground">–</span>
                      ) : (
                        <span
                          className={cn(
                            "font-mono-typed font-bold",
                            a.last ? "text-primary" : "text-stamp",
                          )}
                        >
                          {a.last ? "✓" : "✗"}
                          {tries > 1 && (
                            <sup className="ml-0.5 text-[8px] font-normal text-muted-foreground">
                              {tries}
                            </sup>
                          )}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/30">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-muted/30 px-2 py-1.5 text-left font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Richtig
              </th>
              {QUESTIONS.map((q) => (
                <td
                  key={q}
                  className="px-1.5 py-1.5 text-center font-mono-typed text-[11px] font-bold tabular-nums"
                >
                  {correctCount(q)}
                  <span className="text-muted-foreground">/{rows.length}</span>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
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
  const [openStage, setOpenStage] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [sel, setSel] = useState({ teams: true, stages: true, hearing: true, events: false });
  const nothingSelected = !sel.teams && !sel.stages && !sel.hearing && !sel.events;

  

  const teams = [...(report?.teams ?? [])].sort((a, b) => a.name.localeCompare(b.name, "de-CH"));

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

  const analyses = STAGES.map((s) => analyseStage(teams, s));
  const withData = analyses.filter((a) => a.solvedBy > 0);

  const hardest = [...withData].sort((a, b) => (b.puzzle.med ?? 0) - (a.puzzle.med ?? 0))[0];
  const easiest = [...withData].sort((a, b) => (a.puzzle.med ?? 0) - (b.puzzle.med ?? 0))[0];
  const questions = analyseQuestions(teams);

  // Mediane pro Etappe für den Vergleich im Team-Popup.
  const medianPuzzle = new Map<number, number | null>(analyses.map((a) => [a.stage, a.puzzle.med]));
  const teamsByPoints = [...teams].sort(
    (a, b) => b.points - a.points || a.name.localeCompare(b.name, "de-CH"),
  );

  /** Übersicht pro Team – eine Zeile je Gruppe. */
  const buildTeamRows = (): (string | number)[][] => {
    const head = [
      "Team",
      "Mitglieder",
      "Punkte",
      "Etappen_geloest",
      "Hinweise_total",
      "Gesamtzeit_min",
      "Raetselzeit_total_min",
      "Zeit_zwischen_Raetseln_total_min",
      ...STAGES.flatMap((s) => [`E${s}_raetsel_min`, `E${s}_weg_min`, `E${s}_hinweisstufe`]),
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
    return [head, ...rows];
  };

  /** Zusammenfassung pro Etappe. */
  const buildStageRows = (): (string | number)[][] => [
    [
      "Etappe",
      "Name",
      "geloest_von",
      "Median_raetsel_min",
      "Min",
      "Max",
      "Median_weg_min",
      "mit_Hinweis",
      "mit_Aufloesung",
      "Einschaetzung",
    ],
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
  ];

  /** Hearing – eine Zeile pro Frage. */
  const buildHearingRows = (): (string | number)[][] => [
    ["Hearing_Frage", "Antworten", "falsch", "Fehlerquote_%"],
    ...questions.map((q) => [
      `F${q.question + 1}`,
      q.answers,
      q.wrong,
      q.answers === 0 ? "" : Math.round((q.wrong / q.answers) * 100),
    ]),
  ];

  /** Langformat: eine Zeile pro Ereignis – Rohdaten für SPSS, R oder Pivot. */
  const buildEventRows = (): (string | number)[][] => {
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
    return [head, ...rows];
  };

  /** Setzt die gewählten Blöcke zusammen und lädt sie herunter. */
  const runExport = () => {
    const blocks: (string | number)[][] = [];
    if (sel.teams) blocks.push(...buildTeamRows());
    if (sel.stages) blocks.push(...(blocks.length ? [[]] : []), ...buildStageRows());
    if (sel.hearing) blocks.push(...(blocks.length ? [[]] : []), ...buildHearingRows());
    if (blocks.length) {
      blocks.push(
        [],
        ["Runde", code, "Budget_min", budgetMin, "Teams", teams.length, "fertig", finished.length],
      );
      csvDownload(`auswertung-${code}.csv`, blocks);
    }
    if (sel.events) csvDownload(`auswertung-ereignisse-${code}.csv`, buildEventRows());
    setExportOpen(false);
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
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric
          label="Abgeschlossen"
          value={`${finished.length}/${teams.length}`}
          hint={
            teams.length === 0
              ? "noch keine Gruppen"
              : `${teams.length - finished.length} noch offen`
          }
        />
        <Metric label="Punkte" value={fmt(points.med)} hint={`Median · Ø ${fmt(points.avg)}`} />
        <Metric
          label="Spielzeit"
          value={fmt(totals.med, "min")}
          hint={totals.n === 0 ? "noch niemand fertig" : `Median · ${totals.min}–${totals.max} min`}
        />
        <Metric label="Hinweise" value={fmt(hints.med)} hint={`Median · Ø ${fmt(hints.avg)}`} />
      </div>

      <h3 className="mt-5 flex items-center gap-1.5 font-serif text-lg font-bold">
        Pro Team
        <InfoHint label="Pro Team">
          Tippe auf eine Gruppe für Zeiten pro Etappe, Hearing und Abzeichen.
          Das Warn-Symbol zeigt Gruppen, die deutlich über dem Klassenmedian
          liegen oder die Auflösung genutzt haben.
        </InfoHint>
      </h3>
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

      <TeamReportDialog
        team={teams.find((t) => t.teamId === openTeam) ?? null}
        name={teams.find((t) => t.teamId === openTeam)?.name ?? ""}
        showMembers
        medianPuzzle={medianPuzzle}
        onClose={() => setOpenTeam(null)}
      />

      <Section
        title="Etappen im Vergleich"
        hintLabel="Etappen im Vergleich"
        hint={
          <>
            Wert = Median der Rätselzeit. Tippe für Zeiten, Hinweise und alle
            Gruppen.
            {hardest && easiest && hardest.stage !== easiest.stage && (
              <>
                {" "}
                Zäheste Etappe: E{hardest.stage} ({COL_NAME[hardest.stage]}) ·
                schnellste: E{easiest.stage} ({COL_NAME[easiest.stage]}).
              </>
            )}
          </>
        }
      >
        <ul className="mt-2 space-y-1.5">
          {analyses.map((a) => {
            const hard = a.stage === hardest?.stage && withData.length > 1;
            return (
              <ClickRow
                key={a.stage}
                title={`E${a.stage} · ${COL_NAME[a.stage]}`}
                sub={`${a.solvedBy}/${teams.length} gelöst · ${a.withHint} mit Hinweis${
                  a.withSolution > 0 ? ` · ${a.withSolution} mit Auflösung` : ""
                } · ${a.verdict}`}
                value={a.solvedBy === 0 ? "–" : `${a.puzzle.med} min`}
                highlight={hard}
                onOpen={() => setOpenStage(a.stage)}
              />
            );
          })}
        </ul>
      </Section>

      <StageReportDialog
        analysis={analyses.find((a) => a.stage === openStage) ?? null}
        teams={teams}
        onClose={() => setOpenStage(null)}
      />

      <Section title="Hearing pro Frage">
        <HearingMatrix teams={teams} nameOf={nameOf} />
      </Section>

      <button
        type="button"
        onClick={() => setExportOpen(true)}
        disabled={teams.length === 0}
        className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm border border-border px-4 font-serif font-semibold disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Export
      </button>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Export</DialogTitle>
          </DialogHeader>

          <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            Was soll exportiert werden?
          </p>
          <div className="space-y-2">
            {(
              [
                ["teams", "Übersicht pro Team", "Eine Zeile je Gruppe: Punkte, Zeiten, Hinweise, Hearing, Abzeichen."],
                ["stages", "Etappen-Zusammenfassung", "Median-, Min- und Max-Zeiten, Hinweise, Einschätzung pro Etappe."],
                ["hearing", "Hearing pro Frage", "Antworten, falsche Antworten und Fehlerquote je Frage."],
                ["events", "Rohdaten pro Ereignis", "Langformat mit Zeitstempel – separate Datei für Pivot, SPSS oder R."],
              ] as const
            ).map(([key, title, desc]) => (
              <label
                key={key}
                className="flex items-start gap-2 rounded-sm border border-border bg-card p-2.5 text-xs"
              >
                <input
                  type="checkbox"
                  checked={sel[key]}
                  onChange={(e) => setSel((s) => ({ ...s, [key]: e.target.checked }))}
                  className="mt-0.5 h-4 w-4"
                />
                <span>
                  <span className="font-semibold">{title}</span>
                  <span className="block text-muted-foreground">{desc}</span>
                </span>
              </label>
            ))}
          </div>

          <label className="flex items-start gap-2 rounded-sm border border-border bg-card p-2.5 text-xs">
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
              </span>
            </span>
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setExportOpen(false)}
              className="min-h-[44px] flex-1 rounded-sm border border-border px-4 font-serif font-semibold"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={runExport}
              disabled={nothingSelected}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-sm bg-primary px-4 font-serif font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              CSV herunterladen
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

