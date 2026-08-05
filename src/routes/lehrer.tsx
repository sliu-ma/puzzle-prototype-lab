import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  KeyRound,
  Loader2,
  Plus,
  RefreshCw,
  Trophy,
  Users,
  Lock,
  Unlock,
} from "lucide-react";
import {
  teacherListRounds,
  teacherCreateRound,
  teacherSetRoundStatus,
  getRoundLeaderboard,
} from "@/lib/rounds.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lehrer")({
  head: () => ({
    meta: [
      { title: "Lehrpersonen, Runden und Rangliste" },
      {
        name: "description",
        content:
          "Runden für eine Klasse anlegen, Rundencode verteilen und die Rangliste der Gruppen live verfolgen.",
      },
      { property: "og:title", content: "Lehrpersonen, Runden und Rangliste" },
      {
        property: "og:description",
        content:
          "Runden anlegen, Rundencode verteilen und die Live-Rangliste der Gruppen verfolgen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherPage,
});

type RoundItem = {
  code: string;
  title: string;
  status: string;
  created_at: string;
  teamCount: number;
};

type Row = {
  teamId: string;
  name: string;
  points: number;
  stagesSolved: number;
  hintsUsed: number;
  finished: boolean;
};

const inputBase =
  "w-full min-h-[48px] rounded-sm border border-border bg-paper px-3 py-3 text-[16px] focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/25";

function TeacherPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const loadRounds = async (pw: string) => {
    const list = await teacherListRounds({ data: { password: pw } });
    setRounds(list as RoundItem[]);
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await loadRounds(password);
      setAuthed(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 1) return;
    setBusy(true);
    try {
      const round = await teacherCreateRound({
        data: { password, title: title.trim(), budgetMin: 90 },
      });
      setTitle("");
      await loadRounds(password);
      setSelected(round.code);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Runde konnte nicht erstellt werden.");
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (round: RoundItem) => {
    setBusy(true);
    try {
      await teacherSetRoundStatus({
        data: {
          password,
          code: round.code,
          status: round.status === "open" ? "closed" : "open",
        },
      });
      await loadRounds(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status konnte nicht geändert werden.");
    } finally {
      setBusy(false);
    }
  };

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Lehrpersonen
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Runden anlegen und die Rangliste der Gruppen verfolgen.
        </p>
        <form
          onSubmit={(e) => void login(e)}
          className="mt-6 space-y-4 rounded-sm border border-border bg-secondary/50 p-4"
        >
          <label
            htmlFor="pw"
            className="flex items-center gap-2 font-serif text-lg font-bold"
          >
            <KeyRound className="h-5 w-5 text-stamp" />
            Passwort
          </label>
          <input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            className={cn(inputBase, error && "border-destructive")}
          />
          {error && (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 font-serif text-base font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Anmelden
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <h1 className="font-serif text-3xl font-bold text-foreground">Runden</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Jede Runde hat einen Code. Die Gruppen geben ihn bei der Anmeldung ein.
      </p>

      <HealthLine />



      <form
        onSubmit={(e) => void create(e)}
        className="mt-5 flex flex-col gap-2 rounded-sm border border-border bg-secondary/50 p-3 sm:flex-row"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z. B. Klasse 4b, Dienstag"
          className={cn(inputBase, "font-serif")}
        />
        <button
          type="submit"
          disabled={busy}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-sm bg-primary px-4 font-serif font-semibold text-primary-foreground disabled:opacity-60 sm:w-48"
        >
          <Plus className="h-4 w-4" />
          Runde anlegen
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <ul className="mt-5 space-y-2">
        {rounds.length === 0 && (
          <li className="rounded-sm border border-dashed border-border p-4 text-sm text-muted-foreground">
            Noch keine Runde. Legt oben eine an.
          </li>
        )}
        {rounds.map((r) => (
          <li key={r.code} className="rounded-sm border border-border bg-card p-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono-typed rounded-sm bg-secondary px-2 py-1 text-lg font-bold tracking-[0.25em]">
                {r.code}
              </span>
              <span className="flex-1 font-serif font-semibold">{r.title}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {r.teamCount}
              </span>
              <button
                type="button"
                onClick={() => void toggleStatus(r)}
                className="flex items-center gap-1 rounded-sm border border-border px-2 py-1 font-mono-typed text-[10px] uppercase tracking-wider"
              >
                {r.status === "open" ? (
                  <>
                    <Unlock className="h-3.5 w-3.5" /> offen
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" /> zu
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelected(selected === r.code ? null : r.code)}
                className="flex items-center gap-1 rounded-sm bg-secondary px-2 py-1 font-mono-typed text-[10px] uppercase tracking-wider"
              >
                <Trophy className="h-3.5 w-3.5" />
                Rangliste
              </button>
            </div>
            {selected === r.code && <RoundBoard code={r.code} />}
          </li>
        ))}
      </ul>
    </main>
  );
}

function RoundBoard({ code }: { code: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = () => {
      setLoading(true);
      getRoundLeaderboard({ data: { code } })
        .then((res) => {
          if (alive && res.found) setRows(res.rows as Row[]);
        })
        .catch(() => undefined)
        .finally(() => alive && setLoading(false));
    };
    load();
    const iv = window.setInterval(load, 15_000);
    return () => {
      alive = false;
      window.clearInterval(iv);
    };
  }, [code]);

  const max = Math.max(1, ...rows.map((r) => r.points));

  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Live, aktualisiert alle 15 Sekunden</span>
        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
      </div>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Noch keine Gruppe angemeldet.
        </p>
      ) : (
        <ol className="mt-2 space-y-1.5">
          {rows.map((r, i) => (
            <li
              key={r.teamId}
              className="relative overflow-hidden rounded-sm border border-border bg-card/70 px-2.5 py-2"
            >
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 bg-stamp/10"
                style={{ width: `${Math.round((r.points / max) * 100)}%` }}
              />
              <div className="relative flex items-center gap-2 text-sm">
                <span className="font-mono-typed w-5 font-bold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span className="flex-1 truncate font-serif font-semibold">
                  {r.name}
                </span>
                <span className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                  {r.stagesSolved}/5 · {r.hintsUsed} Hinweise
                  {r.finished ? " · fertig" : ""}
                </span>
                <span className="font-mono-typed font-bold tabular-nums">
                  {r.points}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
