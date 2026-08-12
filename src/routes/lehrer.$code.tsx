import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Trash2,
  Unlock,
} from "lucide-react";
import {
  teacherListRounds,
  teacherSetRoundStatus,
  teacherStartRound,
  teacherUpdateRound,
  teacherDeleteRound,
} from "@/lib/rounds.functions";
import {
  clearTeacherPassword,
  getTeacherPassword,
  setTeacherPassword,
  STATUS_LABEL,
} from "@/lib/teacher-session";
import { LobbyPanel } from "@/components/teacher/LobbyPanel";
import { LiveBoard } from "@/components/teacher/LiveBoard";
import { ReportPanel } from "@/components/teacher/ReportPanel";
import type { RoundItem } from "./lehrer.index";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lehrer/$code")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Runde führen, Lobby, Live und Auswertung" },
      {
        name: "description",
        content:
          "Eine Klassenrunde von der Vorbereitung über die Lobby und den gemeinsamen Start bis zur Auswertung führen.",
      },
      { property: "og:title", content: "Runde führen, Lobby, Live und Auswertung" },
      {
        property: "og:description",
        content: "Teams prüfen, gemeinsam starten und die Kennzahlen der Klasse ansehen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RoundPage,
});

const inputBase =
  "w-full min-h-[48px] rounded-sm border border-border bg-paper px-3 py-3 text-[16px] focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/25";

type Step = "prepare" | "lobby" | "live" | "report";

const STEPS: [Step, string][] = [
  ["prepare", "Vorbereiten"],
  ["lobby", "Lobby"],
  ["live", "Live"],
  ["report", "Auswertung"],
];

function RoundPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [pwInput, setPwInput] = useState("");
  const [round, setRound] = useState<RoundItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<Step | null>(null);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState(90);

  const load = useCallback(
    async (pw: string) => {
      const list = (await teacherListRounds({
        data: { password: pw },
      })) as unknown as RoundItem[];
      const found = list.find((r) => r.code === code);
      if (!found) throw new Error("Diese Runde gibt es nicht mehr.");
      setRound(found);
      setTitle(found.title);
      setBudget(found.budget_min);
      return found;
    },
    [code],
  );

  useEffect(() => {
    const pw = getTeacherPassword();
    if (!pw) return;
    setPassword(pw);
    load(pw).catch((err) =>
      setError(err instanceof Error ? err.message : "Laden fehlgeschlagen."),
    );
  }, [load]);

  // Schritt folgt dem Rundenstatus, bleibt aber manuell wechselbar.
  useEffect(() => {
    if (!round || step !== null) return;
    setStep(
      round.status === "running" ? "live" : round.status === "closed" ? "report" : "lobby",
    );
  }, [round, step]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await load(pwInput);
      setTeacherPassword(pwInput);
      setPassword(pwInput);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await load(password);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aktion fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  if (!password || !round) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <Link
          to="/lehrer"
          className="font-mono-typed flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Alle Runden
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-bold">Runde {code}</h1>
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
            value={pwInput}
            onChange={(e) => {
              setPwInput(e.target.value);
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
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 font-serif font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Anmelden
          </button>
        </form>
      </main>
    );
  }

  const inLobby = round.status === "lobby";
  const copy = () => {
    void navigator.clipboard?.writeText(round.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/lehrer"
          className="font-mono-typed flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Alle Runden
        </Link>
        <button
          type="button"
          onClick={() => {
            clearTeacherPassword();
            void navigate({ to: "/lehrer" });
          }}
          className="flex min-h-[40px] items-center gap-1.5 rounded-sm border border-border px-3 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground hover:border-stamp hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Abmelden
        </button>
      </div>


      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copy}
          aria-label="Rundencode kopieren"
          className="font-mono-typed flex items-center gap-2 rounded-sm bg-secondary px-3 py-2 text-2xl font-bold tracking-[0.25em]"
        >
          {round.code}
          {copied ? (
            <Check className="h-4 w-4 text-stamp" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-serif text-2xl font-bold">{round.title}</h1>
          <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            {STATUS_LABEL[round.status] ?? round.status} · {round.teamCount} Teams ·{" "}
            {round.budget_min} min
          </p>
        </div>
      </div>

      <nav className="mt-5 grid grid-cols-4 gap-1.5">
        {STEPS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setStep(key)}
            className={cn(
              "min-h-[44px] rounded-sm border border-border px-1 font-mono-typed text-[10px] uppercase tracking-wider",
              step === key && "border-stamp bg-stamp/10 text-stamp",
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      {error && (
        <p className="mt-3 rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {step === "prepare" && (
        <section className="mt-4 space-y-3">
          {!inLobby && (
            <p className="rounded-sm border border-dashed border-border p-3 text-sm text-muted-foreground">
              Die Runde ist gestartet. Titel und Zeitbudget lassen sich nur vor dem Start
              ändern.
            </p>
          )}

          {inLobby && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm border border-border font-serif font-semibold"
            >
              <Pencil className="h-4 w-4" />
              Titel und Zeitbudget bearbeiten
            </button>
          )}

          {inLobby && editing && (
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
              className="space-y-2 rounded-sm border border-border bg-secondary/40 p-3"
            >
              <label className="font-mono-typed block text-[10px] uppercase tracking-wider text-muted-foreground">
                Titel
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn(inputBase, "font-serif")}
              />
              <label className="font-mono-typed block text-[10px] uppercase tracking-wider text-muted-foreground">
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
                Das Budget steuert auch die Zwischenrufe von Maja („noch 15 Minuten“) und
                die Punkteberechnung.
              </p>
              <button
                type="submit"
                disabled={busy}
                className="min-h-[48px] w-full rounded-sm bg-primary px-4 font-serif font-semibold text-primary-foreground disabled:opacity-60"
              >
                Speichern
              </button>
            </form>
          )}

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
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm border border-border font-serif font-semibold"
          >
            {round.status === "closed" ? (
              <>
                <Unlock className="h-4 w-4" /> Runde wieder öffnen
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> Runde abschliessen
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
              void (async () => {
                setBusy(true);
                try {
                  await teacherDeleteRound({ data: { password, code: round.code } });
                  void navigate({ to: "/lehrer" });
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen.");
                  setBusy(false);
                }
              })();
            }}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm border border-border font-serif font-semibold text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Runde löschen
          </button>
        </section>
      )}

      {step === "lobby" && (
        <LobbyPanel
          password={password}
          code={round.code}
          status={round.status}
          busy={busy}
          onStart={() => {
            void run(async () => {
              await teacherStartRound({ data: { password, code: round.code } });
              setStep("live");
            });
          }}
        />
      )}
      {step === "live" && (
        <>
          <div className="mt-4 rounded-sm border border-border bg-secondary/40 p-3">
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              Zeit nachgeben · aktuell {round.budget_min} min
            </p>
            <div className="mt-2 flex gap-2">
              {[5, 10].map((plus) => (
                <button
                  key={plus}
                  type="button"
                  disabled={busy || round.budget_min + plus > 240}
                  onClick={() =>
                    void run(() =>
                      teacherUpdateRound({
                        data: {
                          password,
                          code: round.code,
                          budgetMin: round.budget_min + plus,
                        },
                      }),
                    )
                  }
                  className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-sm bg-primary px-3 font-serif font-semibold text-primary-foreground disabled:opacity-60"
                >
                  <TimerReset className="h-4 w-4" />+{plus} Minuten
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Alle Gruppen erhalten innert Sekunden ein Pop-up mit der neuen Restzeit.
            </p>
          </div>
          <LiveBoard
            password={password}
            code={round.code}
            budgetMin={round.budget_min}
            startedAt={round.started_at}
          />
        </>
      )}
      {step === "report" && (
        <ReportPanel password={password} code={round.code} budgetMin={round.budget_min} />
      )}
    </main>
  );
}
