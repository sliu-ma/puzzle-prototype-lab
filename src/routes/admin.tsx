import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Copy, Lock, Plus, Trash2 } from "lucide-react";
import {
  adminCreateRound,
  adminDeleteRound,
  adminListRounds,
  adminLogin,
  adminSetRoundStatus,
} from "@/lib/leaderboard.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Runden verwalten | Ermittlung Thermika Ost" },
      {
        name: "description",
        content:
          "Geschützter Bereich für Lehrpersonen: Spielrunden erstellen, Codes verteilen und Ranglisten verwalten.",
      },
      { property: "og:title", content: "Runden verwalten | Ermittlung Thermika Ost" },
      {
        property: "og:description",
        content: "Lehrpersonen erstellen hier Spielrunden und verteilen den Rundencode.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Round = {
  id: string;
  code: string;
  title: string | null;
  status: string;
  created_at: string;
  teamCount: number;
};

function AdminPage() {
  const login = useServerFn(adminLogin);
  const list = useServerFn(adminListRounds);
  const create = useServerFn(adminCreateRound);
  const setStatus = useServerFn(adminSetRoundStatus);
  const remove = useServerFn(adminDeleteRound);

  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async (pw: string) => {
    const res = await list({ data: { password: pw } });
    if (res.ok) setRounds(res.rounds as Round[]);
  };

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await login({ data: { password } });
      if (!res.ok) {
        setError("Passwort stimmt nicht.");
        return;
      }
      setAuthed(true);
      await refresh(password);
    } catch {
      setError("Anmeldung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const doCreate = async () => {
    setBusy(true);
    try {
      const res = await create({ data: { password, title } });
      if (res.ok) {
        setTitle("");
        await refresh(password);
      }
    } catch {
      setError("Runde konnte nicht erstellt werden.");
    } finally {
      setBusy(false);
    }
  };

  if (!authed) {
    return (
      <main className="min-h-screen bg-paper px-4 py-10">
        <div className="mx-auto max-w-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono-typed text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Übersicht
          </Link>
          <h1 className="mt-4 font-serif text-2xl font-bold">Lehrpersonen-Bereich</h1>
          <form
            onSubmit={doLogin}
            className="mt-5 space-y-3 rounded-sm border border-border bg-card p-4"
          >
            <label className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-sm border border-border bg-paper px-3 py-2 font-mono-typed text-sm focus:border-stamp focus:outline-none"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 font-serif text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              <Lock className="h-4 w-4" /> Anmelden
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono-typed text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Übersicht
        </Link>
        <h1 className="mt-4 font-serif text-3xl font-bold">Runden verwalten</h1>

        <div className="mt-5 space-y-2 rounded-sm border border-border bg-card p-4">
          <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
            Neue Runde
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bezeichnung, z. B. Klasse 3a"
              className="min-w-0 flex-1 rounded-sm border border-border bg-paper px-3 py-2 font-serif text-sm focus:border-stamp focus:outline-none"
            />
            <button
              type="button"
              onClick={doCreate}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2 font-serif text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> Erstellen
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <ul className="mt-6 space-y-3">
          {rounds.map((r) => (
            <li key={r.id} className="rounded-sm border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono-typed text-2xl font-bold tracking-[0.2em]">
                    {r.code}
                  </p>
                  <p className="truncate font-serif text-sm text-muted-foreground">
                    {r.title || "ohne Bezeichnung"} · {r.teamCount} Team(s) ·{" "}
                    {r.status === "open" ? "offen" : "geschlossen"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard?.writeText(r.code)}
                  aria-label="Code kopieren"
                  className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/rangliste"
                  search={{ code: r.code } as never}
                  className="rounded-sm border border-border px-3 py-1.5 font-mono-typed text-[11px] uppercase tracking-wider"
                >
                  Rangliste
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await setStatus({
                      data: {
                        password,
                        roundId: r.id,
                        status: r.status === "open" ? "closed" : "open",
                      },
                    });
                    await refresh(password);
                  }}
                  className="rounded-sm border border-border px-3 py-1.5 font-mono-typed text-[11px] uppercase tracking-wider"
                >
                  {r.status === "open" ? "Schliessen" : "Öffnen"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Runde ${r.code} samt Teams löschen?`)) return;
                    await remove({ data: { password, roundId: r.id } });
                    await refresh(password);
                  }}
                  className="inline-flex items-center gap-1 rounded-sm border border-destructive/40 px-3 py-1.5 font-mono-typed text-[11px] uppercase tracking-wider text-destructive"
                >
                  <Trash2 className="h-3 w-3" /> Löschen
                </button>
              </div>
            </li>
          ))}
        </ul>

        {rounds.length === 0 && (
          <p className="mt-6 font-serif text-sm text-muted-foreground">
            Noch keine Runden erstellt.
          </p>
        )}
      </div>
    </main>
  );
}
