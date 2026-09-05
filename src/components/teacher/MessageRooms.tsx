import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, LifeBuoy, Megaphone, Users } from "lucide-react";
import { teacherListMessages } from "@/lib/rounds.functions";
import type { Report, ReportTeam } from "./LobbyPanel";
import { assessTeams, COL_NAME, COL_LABEL } from "./ProgressMatrix";
import { MessageComposer } from "./MessagePanel";
import { cn } from "@/lib/utils";

/** Häkchen werden pro Runde gespeichert, damit alte Runden nicht durchschlagen. */
function doneKey(code: string) {
  return `mm.teacher.help.done.${code}`;
}

/** IDs der als erledigt markierten Hilferufe (localStorage). */
function readDone(code: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(doneKey(code));
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}
function writeDone(code: string, set: Set<string>) {
  try {
    window.localStorage.setItem(doneKey(code), JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

type Sent = {
  id: string;
  teamId: string | null;
  teamName: string | null;
  body: string;
  createdAt: string;
};

type Entry =
  | { kind: "out"; id: string; at: number; body: string; msgId: string }
  | {
      kind: "help";
      id: string;
      at: number;
      body: string | null;
      stage: number;
      teamId: string;
    };

function relTime(ms: number): string {
  const mins = Math.round((Date.now() - ms) / 60_000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min`;
  const h = Math.floor(mins / 60);
  return `vor ${h} Std ${mins % 60} Min`;
}

function clock(ms: number): string {
  return new Date(ms).toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  password: string;
  code: string;
  report: Report | null;
  /** Vorausgewählter Raum (z. B. aus dem Live-Reiter). */
  initialRoom?: string | null;
};

/** Nachrichten als Chaträume: «Alle Gruppen» plus ein Raum pro Gruppe. */
export function MessageRooms({ password, code, report, initialRoom = null }: Props) {
  const [sent, setSent] = useState<Sent[]>([]);
  const [room, setRoom] = useState<string | null>(initialRoom);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => setDone(readDone(code)), [code]);
  useEffect(() => {
    if (initialRoom) setRoom(initialRoom);
  }, [initialRoom]);

  const load = useCallback(() => {
    if (!password || !code) return;
    void teacherListMessages({ data: { password, code } })
      .then(setSent)
      .catch(() => undefined);
  }, [password, code]);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 15000);
    return () => window.clearInterval(id);
  }, [load]);

  const teams: ReportTeam[] = report?.teams ?? [];

  // Status pro Gruppe für die Hintergrundinformationen beim Hilferuf.
  const statuses = useMemo(
    () => assessTeams(teams, report?.startedAt ?? null, Date.now()),
    [teams, report?.startedAt],
  );
  const statusById = useMemo(
    () => new Map(statuses.map((s) => [s.team.teamId, s])),
    [statuses],
  );

  // Verlauf je Raum, chronologisch aufsteigend.
  const threads = useMemo(() => {
    const map = new Map<string, Entry[]>();
    const push = (key: string, e: Entry) => {
      const list = map.get(key);
      if (list) list.push(e);
      else map.set(key, [e]);
    };
    map.set("all", []);
    for (const t of teams) map.set(t.teamId, []);

    for (const m of sent) {
      const key = m.teamId ?? "all";
      if (!map.has(key)) map.set(key, []);
      push(key, {
        kind: "out",
        id: `m:${m.id}`,
        msgId: m.id,
        at: Date.parse(m.createdAt),
        body: m.body,
      });
    }
    for (const t of teams) {
      for (const h of t.helpRequests ?? []) {
        push(t.teamId, {
          kind: "help",
          id: `${t.teamId}|${h.at}|${h.stage}|${h.note ?? ""}`,
          at: Date.parse(h.at),
          body: h.note,
          stage: h.stage,
          teamId: t.teamId,
        });
      }
    }
    for (const list of map.values()) list.sort((a, b) => a.at - b.at);
    return map;
  }, [sent, teams]);

  /** Offene Hilferufe eines Raums: nicht abgehakt und ohne Antwort danach. */
  const openHelp = useCallback(
    (key: string) => {
      const list = threads.get(key) ?? [];
      let count = 0;
      for (let i = 0; i < list.length; i++) {
        const e = list[i];
        if (e.kind !== "help" || done.has(e.id)) continue;
        const answered = list.some((o) => o.kind === "out" && o.at > e.at);
        if (!answered) count++;
      }
      return count;
    },
    [threads, done],
  );

  const rooms = useMemo(() => {
    const list = teams.map((t) => {
      const entries = threads.get(t.teamId) ?? [];
      const last = entries[entries.length - 1];
      return {
        key: t.teamId,
        name: t.name,
        last,
        open: openHelp(t.teamId),
      };
    });
    list.sort((a, b) => {
      if (a.open !== b.open) return b.open - a.open;
      return (b.last?.at ?? 0) - (a.last?.at ?? 0);
    });
    return list;
  }, [teams, threads, openHelp]);

  const allEntries = threads.get("all") ?? [];
  const allLast = allEntries[allEntries.length - 1];

  const toggleDone = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeDone(code, next);
      return next;
    });
  };

  // ---------- Raumliste ----------
  if (room === null) {
    return (
      <section className="mt-4 space-y-2">
        <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
          Chaträume
        </p>

        <button
          type="button"
          onClick={() => setRoom("all")}
          className="flex w-full items-start gap-2 rounded-sm border border-border bg-secondary/40 p-3 text-left"
        >
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-stamp" />
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-sm font-semibold">Alle Gruppen</span>
            <span className="block truncate text-xs text-muted-foreground">
              {allLast ? allLast.body || "Meldung" : "Noch keine Rundmeldung"}
            </span>
          </span>
          {allLast && (
            <span className="font-mono-typed shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
              {relTime(allLast.at)}
            </span>
          )}
        </button>

        {rooms.length === 0 && (
          <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            Noch keine Gruppen in dieser Runde.
          </p>
        )}

        {rooms.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRoom(r.key)}
            className={cn(
              "flex w-full items-start gap-2 rounded-sm border border-border bg-card p-3 text-left",
              r.open > 0 && "border-stamp bg-stamp/5",
            )}
          >
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="font-serif text-sm font-semibold">{r.name}</span>
                {r.open > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-stamp px-1 font-mono-typed text-[9px] text-primary-foreground">
                    {r.open}
                  </span>
                )}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {r.last
                  ? r.last.kind === "help"
                    ? `Hilferuf: ${r.last.body || COL_NAME[r.last.stage] || "ohne Text"}`
                    : r.last.body
                  : "Noch keine Nachrichten"}
              </span>
            </span>
            {r.last && (
              <span className="font-mono-typed shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                {relTime(r.last.at)}
              </span>
            )}
          </button>
        ))}
      </section>
    );
  }

  // ---------- Einzelner Raum ----------
  const isAll = room === "all";
  const team = teams.find((t) => t.teamId === room) ?? null;
  const entries = threads.get(room) ?? [];
  const st = team ? statusById.get(team.teamId) : null;

  /** Lesebestätigung einer gesendeten Nachricht. */
  const ackLabel = (msgId: string) => {
    if (isAll) {
      if (teams.length === 0) return null;
      const read = teams.filter((t) => (t.ackedMessageIds ?? []).includes(msgId)).length;
      return `gelesen ${read}/${teams.length}`;
    }
    if (!team) return null;
    return (team.ackedMessageIds ?? []).includes(msgId) ? "gelesen" : "noch nicht gelesen";
  };

  return (
    <section className="mt-4">
      <button
        type="button"
        onClick={() => setRoom(null)}
        className="font-mono-typed inline-flex min-h-[36px] items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Alle Chaträume
      </button>

      <h2 className="mt-1 flex items-center gap-2 font-serif text-lg font-semibold">
        {isAll ? (
          <>
            <Megaphone className="h-4 w-4 text-stamp" /> Alle Gruppen
          </>
        ) : (
          <>
            <Users className="h-4 w-4 text-muted-foreground" /> {team?.name ?? "Gruppe"}
          </>
        )}
      </h2>

      {!isAll && st && (
        <p className="font-mono-typed mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          {st.finished
            ? "Fertig"
            : `${COL_NAME[st.currentStage] ?? `Etappe ${st.currentStage}`} · ${
                st.phase === "puzzle"
                  ? `am Rätsel seit ${st.minutesInPhase ?? 0} Min`
                  : `unterwegs seit ${st.minutesInPhase ?? 0} Min`
              } · ${team?.stagesSolved ?? 0} Etappen gelöst`}
        </p>
      )}

      <ul className="mt-3 space-y-2">
        {entries.length === 0 && (
          <li className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            Noch keine Nachrichten in diesem Raum.
          </li>
        )}
        {entries.map((e) => {
          if (e.kind === "out") {
            const ack = ackLabel(e.msgId);
            return (
              <li key={e.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-sm border border-border bg-secondary/60 p-2.5">
                  <p className="text-sm text-foreground/90">{e.body}</p>
                  <p className="font-mono-typed mt-1 text-right text-[10px] uppercase tracking-wider text-muted-foreground">
                    {clock(e.at)}
                    {ack ? (
                      <>
                        {" · "}
                        <span className={ack === "gelesen" ? "text-emerald-700" : ""}>
                          {ack}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
              </li>
            );
          }

          const hint = team?.hintsByStage?.find((h) => h.stage === e.stage);
          const isDone = done.has(e.id);
          const answered = entries.some((o) => o.kind === "out" && o.at > e.at);
          return (
            <li key={e.id} className="flex justify-start">
              <div
                className={cn(
                  "max-w-[90%] rounded-sm border border-stamp/50 bg-paper p-2.5",
                  (isDone || answered) && "border-border opacity-60",
                )}
              >
                <p className="font-mono-typed flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-stamp">
                  <LifeBuoy className="h-3 w-3" /> Hilferuf · {clock(e.at)}
                </p>
                {e.body && <p className="mt-1 text-sm text-foreground/90">{e.body}</p>}
                <p className="font-mono-typed mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {COL_LABEL[e.stage] ?? `Etappe ${e.stage}`}
                  {st && !st.finished
                    ? ` · ${
                        st.phase === "puzzle"
                          ? `am Rätsel seit ${st.minutesInPhase ?? 0} Min`
                          : `unterwegs seit ${st.minutesInPhase ?? 0} Min`
                      }`
                    : ""}
                  {hint && hint.maxLevel > 0
                    ? ` · Hinweis ${hint.maxLevel}${hint.maxLevel === 3 ? " (Auflösung)" : ""}`
                    : " · noch keine Hinweise"}
                  {team ? ` · ${team.stagesSolved} Etappen gelöst` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => toggleDone(e.id)}
                  className={cn(
                    "font-mono-typed mt-2 flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-[10px] uppercase tracking-wider",
                    isDone && "text-emerald-700",
                  )}
                >
                  <Check className="h-3 w-3" />
                  {isDone ? "Erledigt" : "Als erledigt markieren"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <MessageComposer
        password={password}
        code={code}
        teamId={isAll ? null : room}
        onSent={load}
      />
    </section>
  );
}
