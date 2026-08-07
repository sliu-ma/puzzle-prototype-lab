import { Download, RefreshCw } from "lucide-react";
import { useRoundReport, fmtTime, type ReportTeam } from "./LobbyPanel";
import { cn } from "@/lib/utils";
import { stageGlyph, stageLabelA11y } from "@/lib/stage-symbols";

const STAGES = [1, 2, 3, 4, 5];

function avgOf(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
}

function stageMinutesOf(teams: ReportTeam[], stage: number): number[] {
  return teams
    .map((t) => t.stageMinutes.find((s) => s.stage === stage)?.minutes)
    .filter((m): m is number => typeof m === "number");
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-2.5">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-mono-typed mt-1 text-xl font-bold tabular-nums">{value}</p>
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
  const { report, loading } = useRoundReport(password, code, 20_000);
  const teams = [...(report?.teams ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name, "de-CH"),
  );

  const finished = teams.filter((t) => t.finishedAt !== null);
  const avgPoints = avgOf(teams.map((t) => t.points));
  const avgHints = avgOf(teams.map((t) => t.hintsUsed));
  const avgBadges = avgOf(teams.map((t) => t.badges.length));
  const avgTotal = avgOf(
    teams.map((t) => t.totalMin).filter((m): m is number => typeof m === "number"),
  );
  const avgHearingWrong = avgOf(teams.map((t) => t.hearingWrong));

  const stageAvgs = STAGES.map((stage) => ({
    stage,
    minutes: avgOf(stageMinutesOf(teams, stage)),
  }));
  const hardest = stageAvgs
    .filter((s) => s.minutes !== null)
    .sort((a, b) => (b.minutes ?? 0) - (a.minutes ?? 0))[0];
  const easiest = stageAvgs
    .filter((s) => s.minutes !== null)
    .sort((a, b) => (a.minutes ?? 0) - (b.minutes ?? 0))[0];

  const fmt = (v: number | null, unit = "") =>
    v === null ? "–" : `${v}${unit ? ` ${unit}` : ""}`;

  const exportCsv = () => {
    const head = [
      "Team",
      "Mitglieder",
      "Punkte",
      "Etappen",
      "Hinweise",
      "Gesamtzeit_min",
      ...STAGES.map((s) => `E${s}_min`),
      "Abzeichen",
      "Hearing_richtig",
      "Hearing_falsch",
      "Beigetreten",
      "Fertig",
    ];
    const rows = teams.map((t) => [
      t.name,
      t.members.join(" / "),
      String(t.points),
      `${t.stagesSolved}/5`,
      String(t.hintsUsed),
      t.totalMin === null ? "" : String(t.totalMin),
      ...STAGES.map((s) => {
        const m = t.stageMinutes.find((x) => x.stage === s)?.minutes;
        return typeof m === "number" ? String(m) : "";
      }),
      String(t.badges.length),
      String(t.hearingCorrect),
      String(t.hearingWrong),
      fmtTime(t.joinedAt),
      t.finishedAt ? fmtTime(t.finishedAt) : "",
    ]);
    const summary = [
      ["Klasse Ø", "", fmt(avgPoints), "", fmt(avgHints), fmt(avgTotal),
        ...STAGES.map((s) => {
          const m = stageAvgs.find((x) => x.stage === s)?.minutes;
          return m === null || m === undefined ? "" : String(m);
        }),
        fmt(avgBadges), "", fmt(avgHearingWrong), "", ""],
    ];
    const csv = [head, ...rows, [], ...summary]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `auswertung-${code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>
          {teams.length} Teams · {finished.length} fertig · Budget {budgetMin} min
        </span>
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
      </div>

      <h3 className="mt-3 font-serif text-lg font-bold">Klasse gesamt</h3>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric label="Ø Punkte" value={fmt(avgPoints)} />
        <Metric label="Ø Gesamtzeit" value={fmt(avgTotal, "min")} />
        <Metric label="Ø Hinweise" value={fmt(avgHints)} />
        <Metric label="Ø Abzeichen" value={fmt(avgBadges)} />
        <Metric label="Ø Hearing-Fehler" value={fmt(avgHearingWrong)} />
        <Metric label="Fertig" value={`${finished.length}/${teams.length}`} />
      </div>

      <h3 className="mt-4 font-serif text-lg font-bold">Ø Zeit pro Etappe</h3>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {stageAvgs.map((s) => (
          <div
            key={s.stage}
            className="rounded-sm border border-border bg-card p-2 text-center"
          >
            <p
              className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground"
              title={stageLabelA11y(s.stage)}
            >
              {stageGlyph(s.stage)}
            </p>
            <p className="font-mono-typed mt-0.5 font-bold tabular-nums">
              {s.minutes === null ? "–" : `${s.minutes}′`}
            </p>
          </div>
        ))}
      </div>
      {hardest && easiest && (
        <p className="mt-2 text-xs text-muted-foreground">
          Zäheste Etappe: E{hardest.stage} mit Ø {hardest.minutes} min · schnellste: E
          {easiest.stage} mit Ø {easiest.minutes} min
        </p>
      )}

      <h3 className="mt-4 font-serif text-lg font-bold">Pro Team</h3>
      <ul className="mt-2 space-y-2">
        {teams.length === 0 && (
          <li className="rounded-sm border border-dashed border-border p-3 text-sm text-muted-foreground">
            Noch keine Daten.
          </li>
        )}
        {teams.map((t) => (
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
              <span>{t.totalMin === null ? "noch am Spielen" : `${t.totalMin} min`}</span>
              <span>{t.hintsUsed} Hinweise</span>
              <span>{t.badges.length} Abzeichen</span>
              <span>
                Hearing {t.hearingCorrect}✓ / {t.hearingWrong}✗
              </span>
            </div>
            {t.stageMinutes.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {t.stageMinutes.map((s) => (
                  <span
                    key={s.stage}
                    className="font-mono-typed rounded-sm bg-secondary px-1.5 py-0.5 text-[10px]"
                  >
                    E{s.stage}: {s.minutes}′
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={exportCsv}
        disabled={teams.length === 0}
        className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm border border-border px-4 font-serif font-semibold disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Als CSV exportieren
      </button>
    </div>
  );
}
