import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { councilQuestions, outroStory } from "@/lib/finale-data";
import { CouncilAvatar } from "./CouncilAvatar";
import { Stamp } from "./Stamp";

export function Hearing() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"right" | "wrong" | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <article className="paper-card relative rounded-sm bg-card px-6 py-10 sm:px-12 sm:py-14">
        <div className="absolute right-6 top-6">
          <Stamp rotate={-8} className="text-base">
            Fall gelöst
          </Stamp>
        </div>
        <h2 className="font-serif text-3xl font-bold sm:text-4xl">Die Auflösung</h2>
        <div className="mt-6 space-y-4 whitespace-pre-line font-serif text-[15px] leading-relaxed text-foreground/90">
          {outroStory}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 font-serif font-semibold text-primary-foreground shadow-md hover:-translate-y-0.5"
          >
            Zur Übersicht
          </Link>
        </div>
      </article>
    );
  }

  const q = councilQuestions[index];

  function choose(optionId: string) {
    if (feedback === "right") return;
    const opt = q.options.find((o) => o.id === optionId)!;
    setSelected(optionId);
    if (opt.correct) {
      setFeedback("right");
      try {
        localStorage.setItem("finale-completed", "true");
      } catch {}
    } else {
      setFeedback("wrong");
      setAttempts((a) => a + 1);
    }
  }

  function next() {
    if (index + 1 >= councilQuestions.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setFeedback(null);
    setAttempts(0);
  }

  return (
    <article className="paper-card relative rounded-sm bg-card px-6 py-10 sm:px-12 sm:py-12">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Hearing · Frage {index + 1} von {councilQuestions.length}
        </p>
        <div className="flex gap-1.5">
          {councilQuestions.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-8 rounded-full ${i < index ? "bg-primary" : i === index ? "bg-foreground/40" : "bg-border"}`}
            />
          ))}
        </div>
      </div>

      {/* Council member */}
      <div className="mt-8">
        <CouncilAvatar {...q.council} />
        <p className="mt-2 font-mono-typed text-[11px] italic text-muted-foreground">
          ({q.intro})
        </p>
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

      {/* Options */}
      <div className="mt-8 space-y-3">
        <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
          Maya antwortet
        </p>
        {q.options.map((opt) => {
          const isSelected = selected === opt.id;
          const showRight = feedback && isSelected && opt.correct;
          const showWrong = feedback === "wrong" && isSelected;
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt.id)}
              disabled={feedback === "right"}
              className={`group block w-full rounded-sm border bg-card px-5 py-4 text-left font-serif text-[15px] leading-relaxed transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70 ${
                showRight
                  ? "border-emerald-700 bg-emerald-50"
                  : showWrong
                    ? "border-stamp bg-stamp/5"
                    : "border-border"
              }`}
            >
              <span className="mr-3 font-mono-typed text-xs uppercase tracking-wider text-muted-foreground">
                {opt.id}
              </span>
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {feedback === "wrong" && (
        <div className="mt-6 rounded-sm border border-stamp/40 bg-stamp/5 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
                Das überzeugt mich nicht
              </p>
              <p className="mt-2 font-serif text-[14px] italic leading-relaxed text-foreground/85">
                {q.wrongHint}
              </p>
              <Link
                to={q.akteRef.to}
                className="mt-3 inline-flex items-center gap-2 font-mono-typed text-[11px] uppercase tracking-wider text-stamp underline"
              >
                → {q.akteRef.label} öffnen
              </Link>
              {attempts >= 2 && (
                <p className="mt-3 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                  Tipp: Nimm dir Zeit — die richtige Antwort steht in deinen Unterlagen.
                </p>
              )}
            </div>
            <Stamp rotate={6} className="text-xs">
              Prüfe nochmal
            </Stamp>
          </div>
          <button
            onClick={() => {
              setSelected(null);
              setFeedback(null);
            }}
            className="mt-4 inline-flex rounded-sm border border-border bg-card px-4 py-2 font-mono-typed text-[11px] uppercase tracking-wider hover:bg-secondary"
          >
            Noch einmal versuchen
          </button>
        </div>
      )}

      {feedback === "right" && (
        <div className="mt-6 rounded-sm border border-emerald-700/40 bg-emerald-50 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-emerald-800">
                Überzeugt
              </p>
              <p className="mt-2 font-serif text-[14px] italic leading-relaxed text-foreground/85">
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
            {index + 1 >= councilQuestions.length ? "Auflösung lesen" : "Nächste Frage"} →
          </button>
        </div>
      )}
    </article>
  );
}
