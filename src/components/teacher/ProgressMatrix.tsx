import { AlertTriangle, Flag, Footprints, QrCode, Search } from "lucide-react";
import type { ReportTeam } from "./LobbyPanel";
import { cn } from "@/lib/utils";

/** Etappen plus Hearing als letzte Spalte. */
export const MATRIX_COLS = [1, 2, 3, 4, 5, 6];

export const COL_LABEL: Record<number, string> = {
  1: "E1",
  2: "E2",
  3: "E3",
  4: "E4",
  5: "E5",
  6: "HEA",
};

export const COL_NAME: Record<number, string> = {
  1: "Mobilität",
  2: "Konsum",
  3: "Biodiversität",
  4: "Energie",
  5: "Gutachten",
  6: "Hearing",
};

export type Severity = "ok" | "warn" | "alarm";

export type TeamStatus = {
  team: ReportTeam;
  /** Etappe, an der gerade gearbeitet wird (6 = Hearing). */
  currentStage: number;
  /**
   * Abschnitt: `travel` = zwischen zwei Rätseln (Posten noch nicht gescannt),
   * `puzzle` = am Rätsel (ab QR-Scan).
   */
  phase: "travel" | "puzzle";
  /** Minuten im aktuellen Abschnitt (nicht seit der Vor-Etappe). */
  minutesInPhase: number | null;
  severity: Severity;
  reasons: string[];
  finished: boolean;
  /** Abgeschlossene Wegzeit zum aktuellen Posten (bis QR-Scan). */
  travelDoneMin: number | null;
};

/** Am Rätsel (ab QR-Scan): ab hier deutet es auf Mühe mit dem Rätsel hin. */
export const PUZZLE_WARN_MIN = 10;
export const PUZZLE_ALARM_MIN = 15;
/** Zwischen den Rätseln: ab hier wurde der Posten vermutlich nicht gefunden. */
export const TRAVEL_WARN_MIN = 12;
export const TRAVEL_ALARM_MIN = 20;

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 1 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/**
 * Bewertet jedes Team: wo steht es, in welchem Abschnitt und wie lange schon.
 * Die Uhr für den Abschnitt startet einheitlich beim QR-Scan (Rätsel) bzw.
 * beim Lösen der Vor-Etappe (unterwegs) – nicht vermischt.
 */
export function assessTeams(
  teams: ReportTeam[],
  startedAt: string | null,
  now: number,
): TeamStatus[] {
  const startMs = startedAt ? Date.parse(startedAt) : null;
  const open = teams.filter((t) => t.finishedAt === null);
  const medianStage = median(open.map((t) => t.currentStage));

  return teams.map((team) => {
    const finished = team.finishedAt !== null;
    const phase = team.phase ?? "travel";
    const sinceIso = team.phaseSince;
    const sinceMs = sinceIso ? Date.parse(sinceIso) : startMs;
    const minutesInPhase =
      finished || sinceMs === null || !Number.isFinite(sinceMs)
        ? null
        : Math.max(0, Math.floor((now - sinceMs) / 60_000));

    const reasons: string[] = [];
    let severity: Severity = "ok";
    const raise = (s: Severity) => {
      if (s === "alarm" || (s === "warn" && severity === "ok")) severity = s;
    };

    if (!finished) {
      const warnAt = phase === "puzzle" ? PUZZLE_WARN_MIN : TRAVEL_WARN_MIN;
      const alarmAt = phase === "puzzle" ? PUZZLE_ALARM_MIN : TRAVEL_ALARM_MIN;
      if (minutesInPhase !== null && minutesInPhase >= warnAt) {
        reasons.push(
          phase === "puzzle"
            ? `${minutesInPhase} min am Rätsel ${COL_LABEL[team.currentStage]} – Mühe mit der Aufgabe`
            : `${minutesInPhase} min unterwegs zu ${COL_LABEL[team.currentStage]} – Posten evtl. nicht gefunden`,
        );
        raise(minutesInPhase >= alarmAt ? "alarm" : "warn");
      }

      const hintHere = team.hintsByStage.find((h) => h.stage === team.currentStage);
      if (hintHere?.maxLevel === 3) {
        reasons.push("Auflösung genutzt");
        raise("alarm");
      } else if (hintHere && hintHere.maxLevel >= 1) {
        reasons.push(`Hinweis ${hintHere.maxLevel}`);
        raise("warn");
      }

      if (medianStage !== null && team.currentStage <= medianStage - 2) {
        reasons.push("hinter der Klasse");
        raise("warn");
      }
    }

    return {
      team,
      currentStage: team.currentStage,
      phase,
      minutesInPhase,
      severity,
      reasons,
      finished,
    };
  });
}


function Cell({
  state,
  value,
  severity,
  label,
}: {
  state: "solved" | "active" | "open";
  value: string;
  severity: Severity;
  label: string;
}) {
  return (
    <div
      title={label}
      className={cn(
        "font-mono-typed flex h-7 items-center justify-center rounded-sm text-[10px] font-bold tabular-nums",
        state === "solved" && "bg-primary text-primary-foreground",
        state === "active" &&
          "border-2 border-dashed border-primary/60 bg-secondary text-foreground",
        state === "active" && severity === "warn" && "border-stamp/70 text-stamp",
        state === "active" &&
          severity === "alarm" &&
          "border-stamp bg-stamp/15 text-stamp",
        state === "open" && "bg-muted/60 text-muted-foreground",
      )}
    >
      {value}
    </div>
  );
}

/**
 * Fortschritts-Matrix: eine Zeile pro Team, eine Spalte pro Etappe.
 * Gibt auf einen Blick, wo die Klasse steht und wer feststeckt.
 */
export function ProgressMatrix({
  teams,
  startedAt,
  now,
}: {
  teams: ReportTeam[];
  startedAt: string | null;
  now: number;
}) {
  const statuses = assessTeams(teams, startedAt, now).sort(
    (a, b) =>
      b.currentStage - a.currentStage ||
      a.team.name.localeCompare(b.team.name, "de-CH"),
  );

  // Verteilung: wie viele Teams stehen bei welcher Etappe?
  const distribution = MATRIX_COLS.map((stage) => ({
    stage,
    count: statuses.filter((s) => !s.finished && s.currentStage === stage).length,
  }));
  const finishedCount = statuses.filter((s) => s.finished).length;
  const maxCount = Math.max(1, ...distribution.map((d) => d.count), finishedCount);

  const trouble = statuses.filter((s) => s.severity !== "ok");

  if (teams.length === 0) {
    return <p className="mt-2 text-sm text-muted-foreground">Noch keine Gruppe unterwegs.</p>;
  }

  return (
    <div className="mt-3">
      {trouble.length > 0 && (
        <div className="rounded-sm border border-stamp/50 bg-stamp/5 p-2.5">
          <p className="font-mono-typed flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stamp">
            <AlertTriangle className="h-3.5 w-3.5" />
            Braucht evtl. Hilfe
          </p>
          <ul className="mt-1.5 space-y-1">
            {trouble.map((s) => (
              <li key={s.team.teamId} className="text-xs">
                <span className="font-serif font-semibold">{s.team.name}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {COL_NAME[s.currentStage]} ·{" "}
                  {s.phase === "puzzle" ? "am Rätsel" : "unterwegs"} ·{" "}
                  {s.reasons.join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Klassenverteilung */}
      <p className="font-mono-typed mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        Wo steht die Klasse
      </p>
      <div className="mt-1 grid grid-cols-7 items-end gap-1">
        {distribution.map((d) => (
          <div key={d.stage} className="flex flex-col items-center gap-1">
            <span className="font-mono-typed text-[10px] font-bold tabular-nums">
              {d.count || ""}
            </span>
            <div
              aria-hidden
              className="w-full rounded-sm bg-primary/70"
              style={{ height: `${4 + (d.count / maxCount) * 40}px` }}
            />
            <span className="font-mono-typed text-[9px] uppercase text-muted-foreground">
              {COL_LABEL[d.stage]}
            </span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono-typed text-[10px] font-bold tabular-nums text-stamp">
            {finishedCount || ""}
          </span>
          <div
            aria-hidden
            className="w-full rounded-sm bg-stamp/70"
            style={{ height: `${4 + (finishedCount / maxCount) * 40}px` }}
          />
          <span className="font-mono-typed text-[9px] uppercase text-muted-foreground">
            fertig
          </span>
        </div>
      </div>

      {/* Matrix */}
      <div className="mt-4 space-y-1">
        <div className="flex items-center gap-1">
          <span className="min-w-0 flex-1" />
          {MATRIX_COLS.map((s) => (
            <span
              key={s}
              className="font-mono-typed w-7 text-center text-[9px] uppercase tracking-wide text-muted-foreground"
            >
              {COL_LABEL[s]}
            </span>
          ))}
          <span className="font-mono-typed w-10 text-right text-[9px] uppercase text-muted-foreground">
            Pkt
          </span>
        </div>

        {statuses.map((s) => (
          <div
            key={s.team.teamId}
            className={cn(
              "flex items-center gap-1 rounded-sm border px-1.5 py-1.5",
              s.severity === "alarm"
                ? "border-stamp/60 bg-stamp/5"
                : "border-border bg-card/70",
            )}
          >
            <span className="min-w-0 flex-1 truncate font-serif text-sm font-semibold">
              {s.finished && <Flag className="mr-1 inline h-3 w-3 text-stamp" />}
              {s.team.name}
            </span>
            {MATRIX_COLS.map((stage) => {
              const solved = s.team.stages.find((x) => x.stage === stage);
              const hearingDone = stage === 6 && s.finished;
              if (solved || hearingDone) {
                return (
                  <div key={stage} className="w-7">
                    <Cell
                      state="solved"
                      severity="ok"
                      value={solved ? String(solved.minutes) : "✓"}
                      label={`${COL_NAME[stage]} gelöst${
                        solved
                          ? ` in ${solved.minutes} min${
                              solved.hintLevel > 0 ? `, Hinweis ${solved.hintLevel}` : ""
                            }`
                          : ""
                      }`}
                    />
                  </div>
                );
              }
              if (stage === s.currentStage && !s.finished) {
                return (
                  <div key={stage} className="w-7">
                    <Cell
                      state="active"
                      severity={s.severity}
                      value={s.minutesInPhase === null ? "…" : String(s.minutesInPhase)}
                      label={`${COL_NAME[stage]} – ${
                        s.phase === "puzzle" ? "am Rätsel" : "unterwegs"
                      } seit ${s.minutesInPhase ?? "?"} min`}
                    />
                  </div>
                );
              }
              return (
                <div key={stage} className="w-7">
                  <Cell state="open" severity="ok" value="·" label={`${COL_NAME[stage]} offen`} />
                </div>
              );
            })}
            <span className="font-mono-typed w-10 text-right text-sm font-bold tabular-nums">
              {s.team.points}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        Zahl in der Zelle = Minuten im aktuellen Abschnitt. Dunkel ausgefüllt: gelöst.
        Gestrichelt: gerade dran – die Uhr startet beim QR-Scan (am Rätsel) bzw. beim
        Lösen der Vor-Etappe (unterwegs). Warnung ab {PUZZLE_WARN_MIN} min am Rätsel
        bzw. {TRAVEL_WARN_MIN} min unterwegs, rot ab {PUZZLE_ALARM_MIN} bzw.{" "}
        {TRAVEL_ALARM_MIN} min, bei genutzter Auflösung oder deutlich hinter der Klasse.
      </p>
    </div>
  );
}
