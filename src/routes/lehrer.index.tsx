import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { KeyRound, Loader2, Plus } from "lucide-react";
import { teacherListRounds, teacherCreateRound } from "@/lib/rounds.functions";
import { RoundCard, type RoundItem } from "@/components/teacher/RoundCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lehrer")({
  head: () => ({
    meta: [
      { title: "Lehrpersonen, Runden, Lobby und Auswertung" },
      {
        name: "description",
        content:
          "Runden für eine Klasse anlegen, Teams in der Lobby prüfen, gemeinsam starten und die Auswertung der Gruppen verfolgen.",
      },
      { property: "og:title", content: "Lehrpersonen, Runden, Lobby und Auswertung" },
      {
        property: "og:description",
        content:
          "Runden anlegen, Teams in der Lobby verwalten, gemeinsam starten und auswerten.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherPage,
});

const inputBase =
  "w-full min-h-[48px] rounded-sm border border-border bg-paper px-3 py-3 text-[16px] focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/25";

function TeacherPage() {
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
      await teacherCreateRound({
        data: { password, title: title.trim(), budgetMin: budget },
      });
      setTitle("");
      await loadRounds(password);
      setError(null);
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
      <h1 className="font-serif text-3xl font-bold text-foreground">Runden</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Jede Runde hat einen Code. Die Gruppen melden sich damit an und warten in der
        Lobby, bis ihr startet.
      </p>

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
          <RoundCard
            key={r.code}
            round={r}
            password={password}
            onChanged={() => void loadRounds(password)}
            onError={setError}
          />
        ))}
      </ul>
    </main>
  );
}
