import { useState } from "react";
import {
  Copy,
  Check,
  Lock,
  Unlock,
  Pencil,
  Trash2,
  Users,
  Trophy,
  ClipboardList,
  DoorOpen,
} from "lucide-react";
import {
  teacherSetRoundStatus,
  teacherStartRound,
  teacherUpdateRound,
  teacherDeleteRound,
} from "@/lib/rounds.functions";
import { LobbyPanel } from "./LobbyPanel";
import { LiveBoard } from "./LiveBoard";
import { ReportPanel } from "./ReportPanel";
import { cn } from "@/lib/utils";

export type RoundItem = {
  code: string;
  title: string;
  status: string;
  created_at: string;
  teamCount: number;
  budget_min: number;
  started_at: string | null;
};

const inputBase =
  "w-full min-h-[44px] rounded-sm border border-border bg-paper px-3 py-2 text-[16px] focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/25";

const statusLabel: Record<string, string> = {
  lobby: "Lobby",
  running: "läuft",
  closed: "beendet",
};

type Tab = "lobby" | "live" | "report";

export function RoundCard({
  round,
  password,
  onChanged,
  onError,
}: {
  round: RoundItem;
  password: string;
  onChanged: () => void;
  onError: (msg: string) => void;
}) {
  const [tab, setTab] = useState<Tab | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(round.title);
  const [budget, setBudget] = useState(round.budget_min);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Aktion fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const copy = () => {
    void navigator.clipboard?.writeText(round.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <li className="rounded-sm border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="font-mono-typed flex items-center gap-2 rounded-sm bg-secondary px-2.5 py-1.5 text-xl font-bold tracking-[0.25em]"
          aria-label="Rundencode kopieren"
        >
          {round.code}
          {copied ? (
            <Check className="h-4 w-4 text-stamp" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <span className="min-w-0 flex-1 truncate font-serif font-semibold">
          {round.title}
        </span>
        <span className="font-mono-typed rounded-sm border border-border px-2 py-1 text-[10px] uppercase tracking-wider">
          {statusLabel[round.status] ?? round.status}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {round.teamCount}
        </span>
        <span className="text-xs text-muted-foreground">{round.budget_min} min</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {(
          [
            ["lobby", DoorOpen, "Lobby"],
            ["live", Trophy, "Live"],
            ["report", ClipboardList, "Auswertung"],
          ] as [Tab, typeof Trophy, string][]
        ).map(([key, Icon, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(tab === key ? null : key)}
            className={cn(
              "flex items-center gap-1 rounded-sm border border-border px-2 py-1.5 font-mono-typed text-[10px] uppercase tracking-wider",
              tab === key && "border-stamp bg-stamp/10 text-stamp",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="flex items-center gap-1 rounded-sm border border-border px-2 py-1.5 font-mono-typed text-[10px] uppercase tracking-wider"
        >
          <Pencil className="h-3.5 w-3.5" />
          Bearbeiten
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void run(() =>
              teacherSetRoundStatus({
                data: {
                  password,
                  code: round.code,
                  status: round.status === "closed" ? "lobby" : "closed",
                },
              }),
            )
          }
          className="flex items-center gap-1 rounded-sm border border-border px-2 py-1.5 font-mono-typed text-[10px] uppercase tracking-wider"
        >
          {round.status === "closed" ? (
            <>
              <Unlock className="h-3.5 w-3.5" /> Anmeldung öffnen
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" /> Anmeldung schliessen
            </>
          )}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (
              !confirm(
                `Runde ${round.code} wirklich löschen? Teams und Punkte dieser Runde werden entfernt.`,
              )
            )
              return;
            void run(() => teacherDeleteRound({ data: { password, code: round.code } }));
          }}
          className="flex items-center gap-1 rounded-sm border border-border px-2 py-1.5 font-mono-typed text-[10px] uppercase tracking-wider text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Löschen
        </button>
      </div>

      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              await teacherUpdateRound({
                data: { password, code: round.code, title, budgetMin: budget },
              });
              setEditing(false);
            });
          }}
          className="mt-3 space-y-2 rounded-sm border border-dashed border-border p-3"
        >
          <label className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            Titel
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cn(inputBase, "font-serif")}
          />
          <label className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            Zeitbudget in Minuten
          </label>
          <input
            type="number"
            min={15}
            max={240}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className={inputBase}
          />
          <p className="text-xs text-muted-foreground">
            Das Budget steuert auch die Zwischenrufe von Maja („noch 15 Minuten“) und die
            Punkteberechnung. Änderungen wirken für Teams, die danach starten; laufende
            Geräte behalten ihr bisheriges Budget bis zum Neustart.
          </p>
          <button
            type="submit"
            disabled={busy}
            className="min-h-[44px] w-full rounded-sm bg-primary px-4 font-serif font-semibold text-primary-foreground disabled:opacity-60"
          >
            Speichern
          </button>
        </form>
      )}

      {tab === "lobby" && (
        <LobbyPanel
          password={password}
          code={round.code}
          status={round.status}
          busy={busy}
          onStart={() => {
            if (!confirm("Runde jetzt für alle starten?")) return;
            void run(() => teacherStartRound({ data: { password, code: round.code } }));
          }}
        />
      )}
      {tab === "live" && (
        <LiveBoard
          password={password}
          code={round.code}
          budgetMin={round.budget_min}
          startedAt={round.started_at}
        />
      )}
      {tab === "report" && (
        <ReportPanel password={password} code={round.code} budgetMin={round.budget_min} />
      )}
    </li>
  );
}
