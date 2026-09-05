import { useEffect, useState } from "react";
import { Check, MessageSquareReply, LifeBuoy } from "lucide-react";
import type { ReportTeam } from "./LobbyPanel";
import { assessTeams, COL_NAME } from "./ProgressMatrix";
import { cn } from "@/lib/utils";

const DONE_KEY = "mm.teacher.help.done";

/** IDs der als erledigt markierten Hilferufe (localStorage). */
function readDone(): Set<string> {
  try {
    const raw = window.localStorage.getItem(DONE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}
function writeDone(set: Set<string>) {
  try {
    window.localStorage.setItem(DONE_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

type HelpItem = {
  teamId: string;
  teamName: string;
  helpId: string;
  at: string;
  stage: number;
  note: string | null;
};

function relTime(iso: string): string {
  const d = Date.parse(iso);
  if (Number.isNaN(d)) return "";
  const mins = Math.round((Date.now() - d) / 60_000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `vor ${h} Std ${m} Min`;
}

type Props = {
  report: { teams: ReportTeam[]; startedAt: string | null } | null;
  password: string;
  code: string;
  /** Wählt die Zielgruppe im Schreibfeld vor. */
  onReply: (teamId: string, teamName: string) => void;
};

/** Meldungen der Gruppen: Hilferufe, sortiert, mit Spielstand-Kontext. */
export function HelpFeed({ report, onReply }: Props) {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    setDone(readDone());
  }, []);

  if (!report) {
    return (
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        Lade Meldungen …
      </p>
    );
  }

  // Status pro Team für die Kontextzeile.
  const now = Date.now();
  const statuses = assessTeams(report.teams, report.startedAt, now);
  const byTeamId = new Map(statuses.map((s) => [s.team.teamId, s]));

  // Alle Hilferufe zu einer Liste zusammenfassen, neueste zuerst.
  const items: HelpItem[] = [];
  for (const t of report.teams) {
    for (const h of t.helpRequests ?? []) {
      items.push({
        teamId: t.teamId,
        teamName: t.name,
        // Ereignis-ID ist nicht überliefert, wir bauen einen stabilen
        // Schlüssel aus Team + Zeit + Notiz.
        helpId: `${t.teamId}|${h.at}|${h.stage}|${h.note ?? ""}`,
        at: h.at,
        stage: h.stage,
        note: h.note,
      });
    }
  }
  items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  if (items.length === 0) {
    return (
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        Noch keine Meldungen von Gruppen.
      </p>
    );
  }

  const toggleDone = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeDone(next);
      return next;
    });
  };

  return (
    <ul className="space-y-2">
      {items.map((it) => {
        const st = byTeamId.get(it.teamId);
        const isDone = done.has(it.helpId);
        const stageName = COL_NAME[it.stage] ?? `Etappe ${it.stage}`;
        const context = st
          ? st.finished
            ? "Fertig"
            : `${stageName} · ${it.stage === 6 ? "Hearing" : st.phase === "puzzle" ? `am Rätsel seit ${st.minutesInPhase ?? 0} Min` : `unterwegs seit ${st.minutesInPhase ?? 0} Min`}${st.reasons.length ? ` · ${st.reasons.join(", ")}` : ""}`
          : stageName;
        const hintInfo = st?.team?.hintsByStage?.find(
          (h) => h.stage === it.stage,
        );
        return (
          <li
            key={it.helpId}
            className={cn(
              "rounded-sm border border-border bg-paper p-3",
              isDone && "opacity-50",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <LifeBuoy className="h-3.5 w-3.5 shrink-0 text-stamp" />
                <span className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                  {it.teamName} · {relTime(it.at)}
                </span>
              </div>
            </div>
            {it.note && (
              <p className="mt-1 text-sm text-foreground/80">{it.note}</p>
            )}
            <p className="mt-1 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              {context}
              {hintInfo && hintInfo.maxLevel > 0
                ? ` · Hinweis ${hintInfo.maxLevel}${hintInfo.maxLevel === 3 ? " (Auflösung)" : ""}`
                : ""}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => onReply(it.teamId, it.teamName)}
                className="flex items-center gap-1 rounded-sm border border-border px-2 py-1 font-mono-typed text-[10px] uppercase tracking-wider hover:bg-secondary"
              >
                <MessageSquareReply className="h-3 w-3" />
                Antworten
              </button>
              <button
                type="button"
                onClick={() => toggleDone(it.helpId)}
                className={cn(
                  "flex items-center gap-1 rounded-sm border border-border px-2 py-1 font-mono-typed text-[10px] uppercase tracking-wider hover:bg-secondary",
                  isDone && "text-emerald-700",
                )}
              >
                <Check className="h-3 w-3" />
                Erledigt
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
