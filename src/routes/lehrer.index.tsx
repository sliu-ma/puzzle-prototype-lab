import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, KeyRound, Loader2, LogOut, Plus, Users } from "lucide-react";
import { teacherListRounds, teacherCreateRound } from "@/lib/rounds.functions";
import {
  clearTeacherPassword,
  getTeacherPassword,
  setTeacherPassword,
  STATUS_LABEL,
} from "@/lib/teacher-session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lehrer/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lehrpersonen, Runden verwalten und starten | Majas Mission - Escape Game zu Nachhaltigkeit" },
      {
        name: "description",
        content:
          "Runden für eine Klasse anlegen, Rundencode verteilen und die Runde öffnen, um Lobby, Live-Rangliste und Auswertung zu sehen. – Majas Mission ist ein mobiler Bildungs Escape Game zum Thema Nachhaltigkeit: Schulklassen lösen reale Rätsel zu Mobilität, Konsum, Energie & mehr",
      },
      { property: "og:title", content: "Lehrpersonen, Runden verwalten und starten | Majas Mission - Escape Game zu Nachhaltigkeit" },
      {
        property: "og:description",
        content: "Runden für eine Klasse anlegen, Rundencode verteilen und die Runde öffnen, um Lobby, Live-Rangliste und Auswertung zu sehen. – Majas Mission ist ein mobiler Bildungs Escape Game zum Thema Nachhaltigkeit: Schulklassen lösen reale Rätsel zu Mobilität, Konsum, Energie & mehr",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherPage,
});

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
  "w-full min-h-[48px] rounded-sm border border-border bg-paper px-3 py-3 text-[16px] focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/25";

function TeacherPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState(90);

  const loadRounds = useCallback(async (pw: string) => {
    const list = await teacherListRounds({ data: { password: pw } });
    setRounds(list as unknown as RoundItem[]);
  }, []);

  useEffect(() => {
    const pw = getTeacherPassword();
    if (!pw) return;
    setPassword(pw);
    loadRounds(pw)
      .then(() => setAuthed(true))
      .catch(() => undefined);
  }, [loadRounds]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await loadRounds(password);
      setTeacherPassword(password);
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
      const res = await teacherCreateRound({
        data: { password, title: title.trim(), budgetMin: budget },
      });
      setTitle("");
      setError(null);
      const code = (res as unknown as { code?: string })?.code;
      if (code) {
        void navigate({ to: "/lehrer/$code", params: { code } });
        return;
      }
      await loadRounds(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Runde konnte nicht erstellt werden.");
    } finally {
      setBusy(false);
    }
  };

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <h1 className="font-serif text-3xl font-bold text-foreground">Lehrpersonen</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Runden anlegen, Teams in der Lobby prüfen und gemeinsam starten.
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Runden</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Jede Runde hat einen Code und eine eigene Seite: Lobby, Live und Auswertung.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            clearTeacherPassword();
            setPassword("");
            setAuthed(false);
            setRounds([]);
            setError(null);
          }}
          className="flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-sm border border-border px-3 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground hover:border-stamp hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Abmelden
        </button>
      </div>


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
        <input
          type="number"
          min={15}
          max={240}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          aria-label="Zeitbudget in Minuten"
          className={cn(inputBase, "sm:w-28")}
        />
        <button
          type="submit"
          disabled={busy}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-sm bg-primary px-4 font-serif font-semibold text-primary-foreground disabled:opacity-60 sm:w-44"
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
          <li key={r.code}>
            <Link
              to="/lehrer/$code"
              params={{ code: r.code }}
              className="flex min-h-[64px] items-center gap-3 rounded-sm border border-border bg-card px-3 py-3 hover:border-stamp"
            >
              <span className="font-mono-typed rounded-sm bg-secondary px-2.5 py-1.5 text-lg font-bold tracking-[0.2em]">
                {r.code}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-serif font-semibold">{r.title}</span>
                <span className="font-mono-typed block text-[10px] uppercase tracking-wider text-muted-foreground">
                  {STATUS_LABEL[r.status] ?? r.status} · {r.budget_min} min
                </span>
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {r.teamCount}
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
