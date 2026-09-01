import { useState } from "react";
import { Download, RefreshCw, ShieldCheck } from "lucide-react";
import { useRoundReport, fmtTime, type ReportTeam } from "./LobbyPanel";
import { COL_NAME } from "./ProgressMatrix";
import { cn } from "@/lib/utils";

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
const pct = (part: number, whole: number) =>
  whole === 0 ? "–" : `${Math.round((part / whole) * 100)} %`;

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
    solved.map((s) => s.travelMin).filter((m): m is number => typeof m === "number"),
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

type QuestionAnalysis = { question: number; answers: number; wrong: number };

/**
 * Hearing-Fehler pro Frage über alle Teams und Versuche. Bevorzugt werden die
 * Einzelversuche; bei älteren Runden ohne diese Daten greift die Auswertung
 * auf die verbuchten Antworten des bestandenen Versuchs zurück.
 */
function analyseQuestions(teams: ReportTeam[]): QuestionAnalysis[] {
  const map = new Map<number, { answers: number; wrong: number }>();
  for (const t of teams) {
    const src =
      t.hearingAttempts.length > 0
        ? t.hearingAttempts
        : t.events
            .filter((e) => e.type === "hearing_answer")
            .map((e) => ({ question: e.question ?? 0, correct: e.correct === true }));
    for (const a of src) {
      const cur = map.get(a.question) ?? { answers: 0, wrong: 0 };
      map.set(a.question, {
        answers: cur.answers + 1,
        wrong: cur.wrong + (a.correct ? 0 : 1),
      });
    }
  }
  return [...map.entries()]
    .map(([question, v]) => ({ question, ...v }))
    .sort((a, b) => a.question - b.question);
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

  // Rätselzeit gegen Wegzeit: die Kernfrage „wie viel Zeit ging unterwegs weg".
  const puzzleTotals = teams.map((t) => t.stages.reduce((s, x) => s + x.minutes, 0));
  const travelTotals = teams.map((t) =>
    t.stages.reduce((s, x) => s + (x.travelMin ?? 0), 0),
  );
  const puzzleSum = stats(puzzleTotals.filter((v) => v > 0));
  const travelSum = stats(travelTotals.filter((v) => v > 0));
  const travelShare =
    puzzleSum.sum + travelSum.sum > 0
      ? Math.round((travelSum.sum / (puzzleSum.sum + travelSum.sum)) * 100)
      : null;

  const analyses = STAGES.map((s) => analyseStage(teams, s));
  const withData = analyses.filter((a) => a.solvedBy > 0);
  const hardest = [...withData].sort((a, b) => (b.puzzle.med ?? 0) - (a.puzzle.med ?? 0))[0];
  const easiest = [...withData].sort((a, b) => (a.puzzle.med ?? 0) - (b.puzzle.med ?? 0))[0];
  const questions = analyseQuestions(teams);
  const worstQuestion = [...questions]
    .filter((q) => q.answers > 0)
    .sort((a, b) => b.wrong / b.answers - a.wrong / a.answers)[0];

  const hasTravelData = travelSum.n > 0;

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
      "Wegzeit_total_min",
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
        t.stages.reduce((s, x) => s + (x.travelMin ?? 0), 0),
        ...STAGES.flatMap((s) => {
          const st = t.stages.find((x) => x.stage === s);
          return [st?.minutes ?? "", st?.travelMin ?? "", st?.hintLevel ?? ""];
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
        <Metric
          label="Rätselzeit"
          value={fmt(puzzleSum.med, "min")}
          hint="Median, Summe aller Etappen"
        />
        <Metric
          label="Wegzeit"
          value={hasTravelData ? fmt(travelSum.med, "min") : "–"}
          hint={hasTravelData ? "Median, Summe aller Wege" : "erst ab neuer Runde"}
        />
        <Metric
          label="Anteil Weg"
          value={travelShare === null ? "–" : `${travelShare} %`}
          hint="der erfassten Spielzeit"
        />
      </div>
      {!hasTravelData && (
        <p className="mt-2 text-xs text-muted-foreground">
          Wegzeiten werden ab der nächsten gespielten Runde erhoben: sie ergeben sich aus
          dem QR-Scan am Posten. Für bereits gespielte Runden lassen sie sich nicht
          rückwirkend berechnen.
        </p>
      )}

      <h3 className="mt-5 font-serif text-lg font-bold">Etappen im Vergleich</h3>
      <ul className="mt-2 space-y-2">
        {analyses.map((a) => (
          <li key={a.stage} className="rounded-sm border border-border bg-card p-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-serif font-semibold">
                E{a.stage} · {COL_NAME[a.stage]}
              </span>
              <span className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                {a.solvedBy}/{teams.length} gelöst
              </span>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 font-mono-typed text-[11px] tabular-nums sm:grid-cols-4">
              <span>
                <span className="text-muted-foreground">Rätsel </span>
                {fmt(a.puzzle.med, "min")}
              </span>
              <span className="text-muted-foreground">
                {a.puzzle.n > 0 ? `${a.puzzle.min}–${a.puzzle.max} min` : "–"}
              </span>
              <span>
                <span className="text-muted-foreground">Weg </span>
                {a.travel.n > 0 ? fmt(a.travel.med, "min") : "–"}
              </span>
              <span>
                <span className="text-muted-foreground">Hinweis </span>
                {pct(a.withHint, a.solvedBy)}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                aria-hidden
                className="h-full bg-primary/70"
                style={{
                  width: `${Math.min(
                    100,
                    ((a.puzzle.med ?? 0) / Math.max(1, hardest?.puzzle.med ?? 1)) * 100,
                  )}%`,
                }}
              />
            </div>
            <p className="mt-1.5 text-xs">
              <span className="font-semibold">{a.verdict}</span>
              {a.withSolution > 0 && (
                <span className="text-muted-foreground">
                  {" "}
                  · {a.withSolution}× Auflösung
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
      {hardest && easiest && hardest.stage !== easiest.stage && (
        <p className="mt-2 text-xs text-muted-foreground">
          Zäheste Etappe: E{hardest.stage} ({COL_NAME[hardest.stage]}) mit Median{" "}
          {hardest.puzzle.med} min · schnellste: E{easiest.stage} (
          {COL_NAME[easiest.stage]}) mit Median {easiest.puzzle.med} min
        </p>
      )}

      <h3 className="mt-5 font-serif text-lg font-bold">Hearing pro Frage</h3>
      {questions.length === 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Noch keine Hearing-Antworten erfasst.
        </p>
      ) : (
        <>
          <ul className="mt-2 space-y-1">
            {questions.map((q) => {
              const share = q.answers === 0 ? 0 : q.wrong / q.answers;
              return (
                <li key={q.question} className="flex items-center gap-2">
                  <span className="font-mono-typed w-8 text-[10px] uppercase text-muted-foreground">
                    F{q.question + 1}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      aria-hidden
                      className={cn("h-full", share >= 0.5 ? "bg-stamp" : "bg-primary/60")}
                      style={{ width: `${Math.round(share * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono-typed w-20 text-right text-[10px] tabular-nums text-muted-foreground">
                    {q.wrong}/{q.answers} falsch
                  </span>
                </li>
              );
            })}
          </ul>
          {worstQuestion && worstQuestion.wrong > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Schwerste Frage: F{worstQuestion.question + 1} mit{" "}
              {pct(worstQuestion.wrong, worstQuestion.answers)} Fehlern.
            </p>
          )}
        </>
      )}

      <h3 className="mt-5 font-serif text-lg font-bold">Pro Team</h3>
      <ul className="mt-2 space-y-2">
        {teams.length === 0 && (
          <li className="rounded-sm border border-dashed border-border p-3 text-sm text-muted-foreground">
            Noch keine Daten.
          </li>
        )}
        {teams.map((t) => {
          const puzzle = t.stages.reduce((s, x) => s + x.minutes, 0);
          const travel = t.stages.reduce((s, x) => s + (x.travelMin ?? 0), 0);
          return (
            <li key={t.teamId} className="rounded-sm border border-border bg-card p-2.5">
              <div className="flex items-baseline gap-2">
                <span className="min-w-0 flex-1 truncate font-serif font-semibold">
                  {t.name}
                </span>
                <span className="font-mono-typed font-bold tabular-nums">{t.points}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.members.join(", ") || "keine Namen"}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>{t.totalMin === null ? "noch am Spielen" : `${t.totalMin} min total`}</span>
                <span>{puzzle} min Rätsel</span>
                {travel > 0 && <span>{travel} min Weg</span>}
                <span>{t.hintsUsed} Hinweise</span>
                <span>{t.badges.length} Abzeichen</span>
                <span>
                  Hearing {t.hearingCorrect}✓ / {t.hearingWrong}✗
                </span>
              </div>
              {t.stages.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {t.stages.map((s) => (
                    <span
                      key={s.stage}
                      className={cn(
                        "font-mono-typed rounded-sm px-1.5 py-0.5 text-[10px]",
                        s.hintLevel === 3 ? "bg-stamp/15 text-stamp" : "bg-secondary",
                      )}
                    >
                      E{s.stage}: {s.minutes}′
                      {s.travelMin !== null && ` (+${s.travelMin}′ Weg)`}
                      {s.hintLevel > 0 && ` · H${s.hintLevel}`}
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

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
