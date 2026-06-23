import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { councilQuestions, outroByConviction, type CouncilOption } from "@/lib/finale-data";
import { CouncilAvatar } from "./CouncilAvatar";
import { Stamp } from "./Stamp";

const LETTERS = ["A", "B", "C", "D"];
const COOLDOWN_MS = 550;
const MAX_CONVICTION = councilQuestions.length * 3; // 3 points per round, lose 1 per wrong attempt

function shuffle<T>(arr: T[], seed: number): T[] {
  // Deterministic Fisher–Yates (mulberry32) so re-renders within an attempt stay stable.
  const out = [...arr];
  let s = seed >>> 0;
  const rand = () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type Phase = "thinking" | "choosing" | "confirming" | "feedback-wrong" | "feedback-right";

export function Hearing() {
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState(0); // wrong attempts in current round
  const [phase, setPhase] = useState<Phase>("thinking");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [lastWrongKey, setLastWrongKey] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [conviction, setConviction] = useState(MAX_CONVICTION);
  const [shuffleSeed, setShuffleSeed] = useState(() => Date.now() & 0xffff);
  const [done, setDone] = useState(false);

  const q = councilQuestions[index];

  // Re-shuffle on every new round AND after each wrong attempt — buttons move + letters change.
  const shuffledOptions = useMemo<CouncilOption[]>(
    () => shuffle(q.options, shuffleSeed + index * 1000 + attempts * 13),
    [q, shuffleSeed, index, attempts],
  );

  if (done) {
    const ratio = conviction / MAX_CONVICTION;
    const outroKey: keyof typeof outroByConviction = ratio >= 0.85 ? "strong" : ratio >= 0.5 ? "ok" : "weak";
    const outro = outroByConviction[outroKey];
    const verdict =
      outroKey === "strong" ? "Einstimmig überzeugt" : outroKey === "ok" ? "Knapp überzeugt" : "Vertagt";
    return (
      <article className="paper-card relative rounded-sm bg-card px-6 py-10 sm:px-12 sm:py-14">
        <div className="absolute right-6 top-6">
          <Stamp rotate={-8} className="text-base">
            {verdict}
          </Stamp>
        </div>
        <h2 className="font-serif text-3xl font-bold sm:text-4xl">Die Auflösung</h2>
        <p className="mt-2 font-mono-typed text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Überzeugungskraft: {conviction} / {MAX_CONVICTION}
        </p>
        <div className="mt-6 space-y-4 whitespace-pre-line font-serif text-[15px] leading-relaxed text-foreground/90">
          {outro}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 font-serif font-semibold text-primary-foreground shadow-md hover:-translate-y-0.5"
          >
            Zur Übersicht
          </Link>
          {outroKey === "weak" && (
            <button
              onClick={() => {
                // Reset everything for a retry
                setIndex(0);
                setAttempts(0);
                setPhase("thinking");
                setPendingKey(null);
                setLastWrongKey(null);
                setConviction(MAX_CONVICTION);
                setShuffleSeed(Date.now() & 0xffff);
                setDone(false);
              }}
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-6 py-3 font-serif font-semibold hover:bg-secondary"
            >
              Erneut antreten
            </button>
          )}
        </div>
      </article>
    );
  }

  function pick(key: string) {
    if (cooldown || phase === "feedback-right") return;
    setPendingKey(key);
    setPhase("confirming");
  }

  function confirm() {
    if (cooldown || pendingKey === null) return;
    const opt = q.options.find((o) => o.key === pendingKey);
    if (!opt) return;
    setCooldown(true);
    setTimeout(() => setCooldown(false), COOLDOWN_MS);
    if (opt.correct) {
      setPhase("feedback-right");
    } else {
      setLastWrongKey(pendingKey);
      setAttempts((a) => a + 1);
      setConviction((c) => Math.max(0, c - 1));
      setPhase("feedback-wrong");
    }
  }

  function retryAfterWrong() {
    setPendingKey(null);
    setPhase("choosing");
  }

  function next() {
    if (index + 1 >= councilQuestions.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setAttempts(0);
    setPhase("thinking");
    setPendingKey(null);
    setLastWrongKey(null);
  }

  const pendingOption = pendingKey ? q.options.find((o) => o.key === pendingKey) : null;
  const lastWrongOption = lastWrongKey ? q.options.find((o) => o.key === lastWrongKey) : null;
  const convictionPct = Math.round((conviction / MAX_CONVICTION) * 100);

  return (
    <article className="paper-card relative rounded-sm bg-card px-6 py-10 sm:px-12 sm:py-12">
      {/* Header: progress + conviction */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Hearing · Runde {index + 1} von {councilQuestions.length}
        </p>
        <div className="flex items-center gap-3">
          <span className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            Überzeugungskraft
          </span>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-border" aria-hidden>
            <div
              className={`h-full transition-all duration-500 ${
                convictionPct >= 70 ? "bg-emerald-700" : convictionPct >= 40 ? "bg-amber-600" : "bg-stamp"
              }`}
              style={{ width: `${convictionPct}%` }}
            />
          </div>
          <span className="font-mono-typed text-[10px] tabular-nums text-muted-foreground">{conviction}/{MAX_CONVICTION}</span>
        </div>
      </div>

      {/* Council member */}
      <div className="mt-8">
        <CouncilAvatar {...q.council} />
        <p className="mt-2 font-mono-typed text-[11px] italic text-muted-foreground">({q.intro})</p>
      </div>

      {/* Speech bubble */}
      <div
        className="relative mt-5 rounded-md border border-border bg-secondary/40 px-5 py-4 font-serif text-[15px] leading-relaxed text-foreground/90 shadow-sm"
        style={{ transform: "rotate(-0.3deg)" }}
      >
        <span
          aria-hidden
          className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 border-b border-r border-border bg-secondary/40"
        />
        „{q.question}"
      </div>

      {/* Phase: thinking — Maya's inner monologue, then commit to answer */}
      {phase === "thinking" && (
        <div className="mt-7 rounded-sm border border-dashed border-border bg-paper/40 px-5 py-4">
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Maya denkt nach …
          </p>
          <p className="mt-2 font-serif text-[15px] italic leading-relaxed text-foreground/80">
            „{q.innerThought}"
          </p>
          <button
            onClick={() => setPhase("choosing")}
            className="mt-4 inline-flex items-center gap-2 rounded-sm bg-foreground px-5 py-2.5 font-serif font-semibold text-background hover:-translate-y-0.5"
          >
            Antwort formulieren →
          </button>
        </div>
      )}

      {/* Phase: choosing — options */}
      {(phase === "choosing" || phase === "feedback-wrong") && (
        <div className="mt-8 space-y-3">
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
            Maya antwortet {attempts > 0 && <span className="ml-2 normal-case tracking-normal text-muted-foreground">(Versuch {attempts + 1})</span>}
          </p>
          {shuffledOptions.map((opt, i) => {
            const isLastWrong = phase === "feedback-wrong" && opt.key === lastWrongKey;
            return (
              <button
                key={opt.key}
                onClick={() => phase === "choosing" && pick(opt.key)}
                disabled={phase !== "choosing" || cooldown}
                className={`group block w-full rounded-sm border bg-card px-5 py-4 text-left font-serif text-[15px] leading-relaxed transition-all focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed ${
                  phase === "choosing" ? "hover:-translate-y-0.5 hover:shadow-md" : "opacity-60"
                } ${isLastWrong ? "border-stamp bg-stamp/5 opacity-100" : "border-border"}`}
              >
                <span className="mr-3 font-mono-typed text-xs uppercase tracking-wider text-muted-foreground">
                  {LETTERS[i]}
                </span>
                {opt.text}
              </button>
            );
          })}

          {/* Wrong-attempt feedback (individual counter from the council member) */}
          {phase === "feedback-wrong" && lastWrongOption && (
            <div className="mt-6 rounded-sm border border-stamp/40 bg-stamp/5 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
                    {q.council.name} entgegnet
                  </p>
                  <p className="mt-2 font-serif text-[14px] italic leading-relaxed text-foreground/85">
                    {lastWrongOption.counter}
                  </p>

                  {attempts >= 1 && (
                    <p className="mt-3 font-serif text-[13px] italic leading-relaxed text-foreground/70">
                      {q.interjection}
                    </p>
                  )}

                  {attempts >= 2 && (
                    <>
                      <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Hinweis aus den Akten
                      </p>
                      <p className="mt-1 font-serif text-[13px] leading-relaxed text-foreground/80">
                        {q.wrongHint}
                      </p>
                      <Link
                        to={q.akteRef.to}
                        className="mt-2 inline-flex items-center gap-2 font-mono-typed text-[11px] uppercase tracking-wider text-stamp underline"
                      >
                        → {q.akteRef.label} öffnen
                      </Link>
                    </>
                  )}
                </div>
                <Stamp rotate={6} className="text-xs">
                  Prüfe nochmal
                </Stamp>
              </div>
              <button
                onClick={retryAfterWrong}
                className="mt-4 inline-flex rounded-sm border border-border bg-card px-4 py-2 font-mono-typed text-[11px] uppercase tracking-wider hover:bg-secondary"
              >
                Neu formulieren
              </button>
              <p className="mt-2 font-mono-typed text-[10px] text-muted-foreground">
                (Die Antwortoptionen werden neu sortiert — also wirklich lesen.)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Phase: confirming — Maya must own the statement before it is judged */}
      {phase === "confirming" && pendingOption && (
        <div className="mt-8 rounded-sm border-2 border-foreground/30 bg-paper/60 px-5 py-5">
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Du sagst also vor dem Rat:
          </p>
          <p className="mt-3 font-serif text-[16px] italic leading-relaxed text-foreground">
            „{pendingOption.text}"
          </p>
          <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            Bist du sicher? Diese Aussage steht im Protokoll.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={confirm}
              disabled={cooldown}
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif font-semibold text-primary-foreground shadow-md hover:-translate-y-0.5 disabled:opacity-60"
            >
              {cooldown ? "Der Rat überlegt …" : "Das ist mein Argument"}
            </button>
            <button
              onClick={() => {
                setPendingKey(null);
                setPhase("choosing");
              }}
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-5 py-2.5 font-serif font-semibold hover:bg-secondary"
            >
              Noch einmal überlegen
            </button>
          </div>
        </div>
      )}

      {/* Phase: right answer */}
      {phase === "feedback-right" && pendingOption && (
        <div className="mt-8 rounded-sm border border-emerald-700/40 bg-emerald-50 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-emerald-800">
                {q.council.name} reagiert
              </p>
              <p className="mt-2 font-serif text-[14px] italic leading-relaxed text-foreground/85">
                {pendingOption.counter}
              </p>
              <p className="mt-3 font-serif text-[13px] leading-relaxed text-foreground/75">
                {q.rightReply}
              </p>
            </div>
            <div
              className="rounded-sm border-2 border-emerald-700 px-3 py-1 font-mono-typed text-xs uppercase tracking-wider text-emerald-800"
              style={{ transform: "rotate(-6deg)" }}
            >
              Überzeugt
            </div>
          </div>
          <button
            onClick={next}
            className="mt-4 inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif font-semibold text-primary-foreground shadow-md hover:-translate-y-0.5"
          >
            {index + 1 >= councilQuestions.length ? "Auflösung lesen" : "Nächstes Ratsmitglied"} →
          </button>
        </div>
      )}
    </article>
  );
}
