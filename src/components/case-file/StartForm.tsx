import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Plus, X, KeyRound, Users, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { START_CODE } from "@/lib/progress";
import { joinRound, lookupRound } from "@/lib/rounds.functions";
import { setPendingJoin } from "@/lib/round-client";
import { useNavigate } from "@tanstack/react-router";


const CHEAT_CODE = "KRXZMVBQ";
const MAX_MEMBERS = 4;


const inputBase =
  "w-full min-h-[48px] rounded-sm border border-border bg-paper px-3 py-3 text-[16px] focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/25";

function StepDots({ step }: { step: 0 | 1 }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
        TEAM REGISTRIEREN
      </p>
      <div className="flex gap-1.5">
        {[0, 1].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-6 rounded-full",
              i <= step ? "bg-stamp" : "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function StartForm({
  onStart,
  initialCode,
}: {
  onStart: (name: string, code: string, members: string[]) => void;
  /** Vorbelegter Rundencode aus dem Beitritts-Link (`/?r=CODE`). */
  initialCode?: string;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1>(0);
  const [code, setCode] = useState(initialCode ? initialCode.toUpperCase() : "");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [mode, setMode] = useState<"solo" | "round">("solo");
  const [roundTitle, setRoundTitle] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [members, setMembers] = useState<string[]>([""]);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [roundError, setRoundError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const verifyCode = useCallback(async (raw: string) => {
    const clean = raw.trim().toUpperCase();
    if (!clean) {
      setCodeError("Bitte gebt den Code ein.");
      return;
    }
    if (clean === START_CODE || clean === CHEAT_CODE) {
      setCodeError(null);
      setCode(clean);
      setMode("solo");
      setRoundTitle(null);
      setStep(1);
      return;
    }

    setChecking(true);
    try {
      const res = await lookupRound({ data: { code: clean } });
      if (!res.found) {
        setCodeError("Der Code stimmt nicht. Fragt eure Lehrperson.");
        return;
      }
      if (res.status === "closed") {
        setCodeError("Diese Runde ist geschlossen.");
        return;
      }
      setCodeError(null);
      setCode(res.code);
      setMode("round");
      setRoundTitle(res.title);
      setStep(1);
    } catch {
      setCodeError("Der Code konnte nicht geprüft werden. Versucht es nochmals.");
    } finally {
      setChecking(false);
    }
  }, []);

  // Beitritts-Link: Code direkt prüfen und bei Erfolg zum Teamnamen springen.
  const autoChecked = useRef(false);
  useEffect(() => {
    if (autoChecked.current || !initialCode) return;
    autoChecked.current = true;
    void verifyCode(initialCode);
  }, [initialCode, verifyCode]);

  const checkCode = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyCode(code);
  };


  const submitTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanMembers = members.map((m) => m.trim()).filter(Boolean);
    let ok = true;
    if (cleanName.length < 2) {
      setNameError("Bitte gebt einen Teamnamen ein (mind. 2 Zeichen).");
      ok = false;
    } else {
      setNameError(null);
    }
    if (cleanMembers.length < 1) {
      setMemberError("Tragt mindestens eine Person ein.");
      ok = false;
    } else {
      setMemberError(null);
    }
    if (!ok) return;

    const cleanCode = code.trim().toUpperCase();
    const finalMembers = cleanMembers.slice(0, MAX_MEMBERS);

    if (mode === "round") {
      setBusy(true);
      try {
        const res = await joinRound({
          data: { code: cleanCode, teamName: cleanName, members: finalMembers },
        });
        setRoundError(null);
        setPendingJoin({
          code: res.roundCode,
          title: res.roundTitle,
          teamId: res.teamId,
          token: res.token,
          teamName: cleanName,
          members: finalMembers,
          budgetMin: res.budgetMin,
        });
        void navigate({ to: "/lobby" });
      } catch (err) {
        setRoundError(
          err instanceof Error
            ? err.message
            : "Die Runde konnte nicht erreicht werden.",
        );
        setBusy(false);
      }
      return;
    }

    onStart(cleanName, cleanCode, finalMembers);
  };



  return (
    <div className="mt-8 space-y-6">
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground/90">
        <p>
          {"\n"}
        </p>
      </div>

      <div className="rounded-sm border border-border bg-secondary/50 p-4 sm:p-5">
        <StepDots step={step} />

        {step === 0 ? (
          <form onSubmit={(e) => void checkCode(e)} className="mt-4 space-y-4">
            <div className="flex items-center gap-2 font-serif text-lg font-bold">
              <KeyRound className="h-5 w-5 text-stamp" />
              Code eingeben
            </div>
            <p className="text-sm text-foreground/70">
              Den Code erhaltet ihr von eurer Lehrperson.
            </p>
            <div>
              <label
                htmlFor="start-code"
                className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Code
              </label>
              <input
                id="start-code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCodeError(null);
                }}
                placeholder="CODE"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className={cn(
                  inputBase,
                  "mt-1 text-center font-mono-typed text-2xl uppercase tracking-[0.35em]",
                  codeError && "border-destructive",
                )}
              />
              {codeError && (
                <p className="mt-2 rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                  {codeError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={checking}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 font-serif text-base font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
            >
              {checking ? "Code wird geprüft …" : "Code prüfen"}
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={(e) => void submitTeam(e)} className="mt-4 space-y-4">
            <div className="flex items-center gap-2 font-serif text-lg font-bold">
              <Users className="h-5 w-5 text-stamp" />
              Wer ermittelt?
            </div>
            <p className="flex items-center gap-1.5 font-mono-typed text-[11px] uppercase tracking-wider text-emerald-800">
              <Check className="h-3.5 w-3.5" />
              {mode === "round" && roundTitle
                ? `Runde: ${roundTitle}`
                : "Code akzeptiert"}
            </p>


            <div>
              <label
                htmlFor="team-name"
                className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Teamname
              </label>
              <input
                id="team-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError(null);
                }}
                placeholder="z. B. Spürnasen 3a"
                className={cn(
                  inputBase,
                  "mt-1 font-serif",
                  nameError && "border-destructive",
                )}
              />
              {nameError && (
                <p className="mt-2 rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                  {nameError}
                </p>
              )}
            </div>

            <div>
              <label className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                Teammitglieder (max. {MAX_MEMBERS})
              </label>
              <div className="mt-1 space-y-2">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m}
                      onChange={(e) => {
                        const next = [...members];
                        next[i] = e.target.value;
                        setMembers(next);
                        setMemberError(null);
                      }}
                      placeholder={`Person ${i + 1}`}
                      className={cn(inputBase, "font-serif")}
                    />
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setMembers(members.filter((_, j) => j !== i))
                        }
                        aria-label={`Person ${i + 1} entfernen`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {members.length < MAX_MEMBERS && (
                <button
                  type="button"
                  onClick={() => setMembers([...members, ""])}
                  className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 font-mono-typed text-[11px] uppercase tracking-wider text-stamp"
                >
                  <Plus className="h-4 w-4" /> Person hinzufügen
                </button>
              )}
              {memberError && (
                <p className="mt-2 rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                  {memberError}
                </p>
              )}
            </div>

            {roundError && (
              <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                {roundError}
              </p>
            )}


            <button
              type="submit"
              disabled={busy}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 font-serif text-base font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
            >
              {busy ? "Runde wird verbunden …" : "Ermittlung starten"}
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(0)}
              className="w-full font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Zurück zum Startcode
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
