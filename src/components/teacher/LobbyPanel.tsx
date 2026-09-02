import { useEffect, useRef, useState } from "react";
import { RefreshCw, Trash2, Play, Users } from "lucide-react";
import { PrologueOverlay } from "@/components/case-file/PrologueVideo";
import { JoinCodeCard } from "@/components/teacher/JoinCodeCard";

import { teacherRoundReport, teacherDeleteTeam } from "@/lib/rounds.functions";
import { cn } from "@/lib/utils";

/** Spiegelt `ReportStage` aus rounds.server.ts (dort nicht importierbar). */
export type ReportStage = {
  stage: number;
  minutes: number;
  betweenMin: number | null;
  hintLevel: 0 | 1 | 2 | 3;
  solvedAt: string;
};

export type ReportEvent = {
  type: string;
  at: string;
  stage: number | null;
  level: number | null;
  question: number | null;
  correct: boolean | null;
  attempt: number | null;
  badgeId: string | null;
  durationSec: number | null;
};

export type ReportTeam = {
  teamId: string;
  name: string;
  members: string[];
  joinedAt: string;
  finishedAt: string | null;
  points: number;
  stagesSolved: number;
  hintsUsed: number;
  badges: string[];
  hearingCorrect: number;
  hearingWrong: number;
  totalMin: number | null;
  stageMinutes: { stage: number; minutes: number }[];
  stages: ReportStage[];
  hintsByStage: { stage: number; maxLevel: number; count: number }[];
  currentStage: number;
  lastSolvedAt: string | null;
  phase: "travel" | "puzzle";
  phaseSince: string | null;
  currentScanAt: string | null;
  travelDoneMin: number | null;
  travelSince: string | null;
  lastEventAt: string | null;
  hearingAttempts: { question: number; correct: boolean; attempt: number }[];
  events: ReportEvent[];
};

export type Report = {
  code: string;
  title: string;
  status: string;
  budgetMin: number;
  startedAt: string | null;
  teams: ReportTeam[];
};

/** Lädt die Auswertung einer Runde und aktualisiert sie regelmässig. */
export function useRoundReport(password: string, code: string, intervalMs = 6000) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    let first = true;
    const load = () => {
      // Der Ladehinweis erscheint nur beim ersten Abruf, damit das
      // Dashboard beim Aktualisieren nicht dauernd flackert.
      if (first) setLoading(true);
      teacherRoundReport({ data: { password, code } })
        .then((res) => {
          if (alive && res.found) {
            setReport(res as Report);
            setUpdatedAt(Date.now());
          }
        })
        .catch(() => undefined)
        .finally(() => {
          if (alive && first) {
            first = false;
            setLoading(false);
          }
        });
    };
    load();
    const iv = window.setInterval(load, intervalMs);
    return () => {
      alive = false;
      window.clearInterval(iv);
    };
  }, [password, code, intervalMs, tick]);

  return { report, loading, updatedAt, reload: () => setTick((t) => t + 1) };
}


export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LobbyPanel({
  password,
  code,
  status,
  onStart,
  busy,
}: {
  password: string;
  code: string;
  status: string;
  onStart: (auto: boolean) => void;
  busy: boolean;
}) {
  const { report, loading, reload } = useRoundReport(password, code, 4000);
  const teams = report?.teams ?? [];
  const [prologueOpen, setPrologueOpen] = useState(false);
  const [removeAsk, setRemoveAsk] = useState<{ id: string; name: string } | null>(null);
  const fired = useRef(false);

  // Startknopf -> Vorgeschichte im Vollbild -> Runde genau einmal starten.
  // Das Overlay bleibt auf der Schlusstafel stehen, bis die Lehrperson weiterklickt.
  const handlePrologueFinished = () => {
    if (fired.current) return;
    fired.current = true;
    onStart(true);
  };



  const removeTeam = async (teamId: string) => {
    await teacherDeleteTeam({ data: { password, teamId } }).catch(() => undefined);
    reload();
  };

  return (
    <div className="mt-4">
      <JoinCodeCard code={code} teamCount={teams.length} />

      <div className="mt-4 flex items-center justify-between font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {teams.length} Teams angemeldet
        </span>
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
      </div>


      <ul className="mt-2 space-y-1.5">
        {teams.length === 0 && (
          <li className="rounded-sm border border-dashed border-border p-3 text-sm text-muted-foreground">
            Noch kein Team angemeldet. Rundencode verteilen.
          </li>
        )}
        {teams.map((t) => (
          <li
            key={t.teamId}
            className="flex items-center gap-2 rounded-sm border border-border bg-card px-2.5 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif font-semibold">{t.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {t.members.join(", ") || "keine Namen"} · {fmtTime(t.joinedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRemoveAsk({ id: t.teamId, name: t.name })}
              aria-label={`Team ${t.name} entfernen`}
              className="rounded-sm border border-border p-2 text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {prologueOpen && (
        <PrologueOverlay
          holdOnOutro
          onFinished={handlePrologueFinished}
          onClose={() => setPrologueOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setPrologueOpen(true)}
        disabled={busy || status !== "lobby" || teams.length === 0}
        className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 font-serif text-base font-semibold text-primary-foreground disabled:opacity-50"
      >
        <Play className="h-4 w-4" />
        {status !== "lobby"
          ? "Runde bereits gestartet"
          : `Runde für alle ${teams.length} Teams starten`}
      </button>
      <p className="mt-1 text-xs text-muted-foreground">
        {status !== "lobby"
          ? "Die Runde läuft. Teams können mit dem Rundencode weiterhin beitreten, ein erneuter Start ist nicht möglich."
          : "Zuerst läuft die Vorgeschichte im Vollbild. Danach zählen alle Geräte kurz herunter und öffnen das Briefing."}
      </p>


    </div>
  );
}
