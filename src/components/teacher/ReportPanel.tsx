import { Download, RefreshCw } from "lucide-react";
import { useRoundReport, fmtTime } from "./LobbyPanel";
import { cn } from "@/lib/utils";

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
  const teams = report?.teams ?? [];

  const avg =
    teams.length > 0
      ? Math.round(teams.reduce((s, t) => s + t.points, 0) / teams.length)
      : 0;
  const hintsByStage = new Map<number, number>();
  let slowest: { stage: number; minutes: number } | null = null;
  let fastest: { stage: number; minutes: number } | null = null;
  for (const t of teams) {
    for (const s of t.stageMinutes) {
      if (!slowest || s.minutes > slowest.minutes) slowest = s;
      if (!fastest || s.minutes < fastest.minutes) fastest = s;
    }
  }
  for (const t of teams) {
    hintsByStage.set(0, (hintsByStage.get(0) ?? 0) + t.hintsUsed);
  }
  const totalHints = hintsByStage.get(0) ?? 0;

  const exportCsv = () => {
    const head = [
      "Rang",
      "Team",
      "Mitglieder",
      "Punkte",
      "Etappen",
      "Hinweise",
      "Gesamtzeit_min",
      "Abzeichen",
      "Hearing_richtig",
      "Hearing_falsch",
      "Beigetreten",
      "Fertig",
    ];
    const rows = teams.map((t, i) => [
      String(i + 1),
      t.name,
      t.members.join(" / "),
      String(t.points),
      `${t.stagesSolved}/5`,
      String(t.hintsUsed),
      t.totalMin === null ? "" : String(t.totalMin),
      String(t.badges.length),
      String(t.hearingCorrect),
      String(t.hearingWrong),
      fmtTime(t.joinedAt),
      t.finishedAt ? fmtTime(t.finishedAt) : "",
    ]);
    const csv = [head, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `auswertung-${code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>
          Ø {avg} Punkte · {totalHints} Hinweise total · Budget {budgetMin} min
        </span>
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
      </div>
      {(fastest || slowest) && (
        <p className="mt-1 text-xs text-muted-foreground">
          {fastest && `Schnellste Etappe: Nr. ${fastest.stage} in ${fastest.minutes} min`}
          {fastest && slowest && " · "}
          {slowest && `Zäheste Etappe: Nr. ${slowest.stage} mit ${slowest.minutes} min`}
        </p>
      )}

      <ul className="mt-3 space-y-2">
        {teams.length === 0 && (
          <li className="rounded-sm border border-dashed border-border p-3 text-sm text-muted-foreground">
            Noch keine Daten.
          </li>
        )}
        {teams.map((t, i) => (
          <li key={t.teamId} className="rounded-sm border border-border bg-card p-2.5">
            <div className="flex items-baseline gap-2">
              <span className="font-mono-typed w-5 font-bold tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-serif font-semibold">
                {t.name}
              </span>
              <span className="font-mono-typed font-bold tabular-nums">{t.points}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.members.join(", ") || "keine Namen"}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>{t.stagesSolved}/5 Etappen</span>
              <span>{t.hintsUsed} Hinweise</span>
              <span>{t.badges.length} Abzeichen</span>
              <span>
                Hearing {t.hearingCorrect}✓ / {t.hearingWrong}✗
              </span>
              <span>{t.totalMin === null ? "noch am Spielen" : `${t.totalMin} min`}</span>
            </div>
            {t.stageMinutes.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {t.stageMinutes.map((s) => (
                  <span
                    key={s.stage}
                    className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono-typed text-[10px]"
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
        className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-sm border border-border px-4 font-serif font-semibold disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Als CSV exportieren
      </button>
    </div>
  );
}
