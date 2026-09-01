import { useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Flag,
  Footprints,
  QrCode,
  Search,
} from "lucide-react";
import type { ReportTeam } from "./LobbyPanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
            ? team.currentStage === 6
              ? `${minutesInPhase} min am Hearing – Mühe mit den Fragen`
              : `${minutesInPhase} min am Rätsel ${COL_LABEL[team.currentStage]} – Mühe mit der Aufgabe`
            : team.currentStage === 1
              ? `${minutesInPhase} min unterwegs von der Schule zu Posten 1 – noch nicht angekommen`
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
      travelDoneMin: team.travelDoneMin ?? null,
    };
  });
}

/** Klartext-Status einer Gruppe – das Einzige, was in der Liste steht. */
function statusLabel(s: TeamStatus): string {
  if (s.finished) {
    return s.team.totalMin === null ? "Fertig" : `Fertig · ${s.team.totalMin} min`;
  }
  const min = s.minutesInPhase;
  const seit = min === null ? "" : ` · seit ${min} min`;
  if (s.currentStage === 6) return `Am Hearing${seit}`;
  if (s.phase === "puzzle") return `Am Rätsel ${COL_LABEL[s.currentStage]}${seit}`;
  if (s.currentStage === 1) return `Unterwegs von der Schule zu Posten 1${seit}`;
  return `Unterwegs zu ${COL_LABEL[s.currentStage]}${seit}`;
}

function fmtMin(v: number | null | undefined) {
  return v === null || v === undefined ? "–" : `${v} min`;
}

/** Eine Zeile pro Gruppe: nur ein Status, farbig wenn es hakt. */
function TeamRow({ s, onOpen }: { s: TeamStatus; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex min-h-12 w-full items-center gap-2 rounded-sm border px-3 py-2 text-left transition-colors",
        s.severity === "alarm"
          ? "border-stamp bg-stamp/10 animate-pulse"
          : s.severity === "warn"
            ? "border-stamp/50 bg-stamp/5"
            : "border-border bg-card/70 hover:bg-secondary/60",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-serif text-sm font-semibold">
          {s.finished && <Flag aria-hidden className="h-3 w-3 text-stamp" />}
          <span className="truncate">{s.team.name}</span>
        </span>
        <span
          className={cn(
            "font-mono-typed mt-0.5 flex items-center gap-1 text-[11px]",
            s.severity === "ok" ? "text-muted-foreground" : "font-bold text-stamp",
          )}
        >
          {!s.finished &&
            (s.phase === "puzzle" ? (
              <Search aria-hidden className="h-3 w-3 shrink-0" />
            ) : (
              <Footprints aria-hidden className="h-3 w-3 shrink-0" />
            ))}
          <span className="truncate">{statusLabel(s)}</span>
        </span>
      </span>
      <span className="font-mono-typed shrink-0 text-sm font-bold tabular-nums">
        {s.team.points}
      </span>
      <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

/** Detail-Popup: alle Zeiten, Hinweise und Punkte einer Gruppe. */
function TeamDetailDialog({
  status,
  onClose,
}: {
  status: TeamStatus | null;
  onClose: () => void;
}) {
  const s = status;
  return (
    <Dialog open={s !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        {s && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-base">{s.team.name}</DialogTitle>
            </DialogHeader>

            <div className="font-mono-typed flex items-center justify-between gap-2 rounded-sm border border-border bg-secondary/50 px-2.5 py-2 text-[11px]">
              <span className={cn(s.severity !== "ok" && "font-bold text-stamp")}>
                {statusLabel(s)}
              </span>
              <span className="text-sm font-bold tabular-nums">{s.team.points} Pkt</span>
            </div>

            {s.reasons.length > 0 && (
              <p className="font-mono-typed flex items-start gap-1.5 text-[11px] text-stamp">
                <AlertTriangle aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />
                <span>{s.reasons.join(" · ")}</span>
              </p>
            )}

            {!s.finished && (
              <div className="rounded-sm border border-border p-2.5">
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                  Aktueller Abschnitt · {COL_NAME[s.currentStage]}
                </p>
                <div className="font-mono-typed mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Footprints aria-hidden className="h-3 w-3" />
                    Weg{" "}
                    {fmtMin(s.phase === "puzzle" ? s.travelDoneMin : s.minutesInPhase)}
                  </span>
                  {s.currentStage !== 6 && (
                    <span
                      className={cn(
                        "flex items-center gap-1",
                        s.phase === "puzzle" ? "text-primary" : "text-muted-foreground/50",
                      )}
                    >
                      <QrCode aria-hidden className="h-3.5 w-3.5" />
                      {s.phase === "puzzle" ? "gescannt" : "noch kein Scan"}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Search aria-hidden className="h-3 w-3" />
                    Rätsel {fmtMin(s.phase === "puzzle" ? s.minutesInPhase : null)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                Verlauf
              </p>
              <ul className="mt-1 divide-y divide-border rounded-sm border border-border">
                {MATRIX_COLS.map((stage) => {
                  const solved = s.team.stages.find((x) => x.stage === stage);
                  const hint = s.team.hintsByStage.find((h) => h.stage === stage);
                  const done = Boolean(solved) || (stage === 6 && s.finished);
                  const active = !s.finished && stage === s.currentStage;
                  return (
                    <li
                      key={stage}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 text-[11px]",
                        !done && !active && "text-muted-foreground/60",
                        active && "bg-secondary/50",
                      )}
                    >
                      <span className="font-mono-typed w-9 shrink-0 font-bold">
                        {COL_LABEL[stage]}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-serif">
                        {COL_NAME[stage]}
                      </span>
                      <span className="font-mono-typed shrink-0 tabular-nums text-muted-foreground">
                        {solved
                          ? `${solved.betweenMin === null ? "–" : `${solved.betweenMin}′`} Weg · ${solved.minutes}′ Rätsel`
                          : done
                            ? "gelöst"
                            : active
                              ? "läuft"
                              : "offen"}
                      </span>
                      <span className="font-mono-typed w-10 shrink-0 text-right tabular-nums">
                        {hint && hint.maxLevel > 0 ? `H${hint.maxLevel}` : "–"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="font-mono-typed text-[10px] text-muted-foreground">
              Beigetreten{" "}
              {new Date(s.team.joinedAt).toLocaleTimeString("de-CH", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {s.team.finishedAt &&
                ` · fertig ${new Date(s.team.finishedAt).toLocaleTimeString("de-CH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
              {s.team.totalMin !== null && ` · Gesamtdauer ${s.team.totalMin} min`}
              {` · ${s.team.hintsUsed} Hinweise`}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const SEV_ORDER: Record<Severity, number> = { alarm: 0, warn: 1, ok: 2 };

/**
 * Live-Übersicht: eine Statuszeile pro Gruppe, Details erst im Popup.
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
  const [openTeam, setOpenTeam] = useState<string | null>(null);

  const statuses = assessTeams(teams, startedAt, now).sort(
    (a, b) =>
      SEV_ORDER[a.severity] - SEV_ORDER[b.severity] ||
      b.currentStage - a.currentStage ||
      a.team.name.localeCompare(b.team.name, "de-CH"),
  );

  const distribution = MATRIX_COLS.map((stage) => ({
    stage,
    count: statuses.filter((s) => !s.finished && s.currentStage === stage).length,
  }));
  const finishedCount = statuses.filter((s) => s.finished).length;
  const maxCount = Math.max(1, ...distribution.map((d) => d.count), finishedCount);
  const troubleCount = statuses.filter((s) => s.severity !== "ok").length;

  if (teams.length === 0) {
    return <p className="mt-2 text-sm text-muted-foreground">Noch keine Gruppe unterwegs.</p>;
  }

  return (
    <div className="mt-3">
      {troubleCount > 0 && (
        <p className="font-mono-typed flex items-center gap-1.5 rounded-sm border border-stamp/50 bg-stamp/5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stamp">
          <AlertTriangle aria-hidden className="h-3.5 w-3.5" />
          {troubleCount} {troubleCount === 1 ? "Gruppe braucht" : "Gruppen brauchen"} evtl. Hilfe
        </p>
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

      {/* Statusliste */}
      <div className="mt-4 space-y-1.5">
        {statuses.map((s) => (
          <TeamRow
            key={s.team.teamId}
            s={s}
            onOpen={() => setOpenTeam(s.team.teamId)}
          />
        ))}
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        Tippe auf eine Gruppe für Zeiten pro Etappe. Gelb ab {PUZZLE_WARN_MIN} min am
        Rätsel bzw. {TRAVEL_WARN_MIN} min unterwegs, rot ab {PUZZLE_ALARM_MIN} bzw.{" "}
        {TRAVEL_ALARM_MIN} min.
      </p>

      <TeamDetailDialog
        status={statuses.find((s) => s.team.teamId === openTeam) ?? null}
        onClose={() => setOpenTeam(null)}
      />
    </div>
  );
}
