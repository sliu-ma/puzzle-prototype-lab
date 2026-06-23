import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Stamp } from "@/components/case-file/Stamp";
import { Hearing } from "@/components/case-file/Hearing";
import { akten, introStory } from "@/lib/finale-data";

export const Route = createFileRoute("/finale")({
  component: FinalePage,
});

function FinalePage() {
  const [status, setStatus] = useState<"loading" | "locked" | "intro" | "hearing">("loading");
  const [missing, setMissing] = useState<typeof akten[number][]>([]);

  useEffect(() => {
    const m = akten.filter((a) => {
      try {
        return !localStorage.getItem(a.key);
      } catch {
        return true;
      }
    });
    setMissing(m);
    setStatus(m.length === 0 ? "intro" : "locked");
  }, []);

  return (
    <main className="relative min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            ← Übersicht
          </Link>
          <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
            Finale · Hearing im Gemeindesaal
          </p>
        </div>

        {status === "loading" && (
          <p className="font-mono-typed text-xs text-muted-foreground">Lade …</p>
        )}

        {status === "locked" && (
          <article className="paper-card relative rounded-sm bg-card px-6 py-10 sm:px-12 sm:py-14">
            <div className="absolute right-6 top-6">
              <Stamp rotate={8} className="text-base">
                Gesperrt
              </Stamp>
            </div>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">Noch nicht bereit fürs Hearing</h1>
            <p className="mt-4 max-w-xl font-serif text-[15px] leading-relaxed text-foreground/85">
              Um die kritischen Fragen des Gemeinderats fundiert beantworten zu können, brauchst du die
              Beweise und Erkenntnisse aus <strong>allen fünf Akten</strong>. Folgende Akten musst du noch
              bearbeiten:
            </p>
            <ul className="mt-6 space-y-2">
              {missing.map((a) => (
                <li key={a.key}>
                  <Link
                    to={a.to}
                    className="inline-flex items-center gap-3 rounded-sm border border-border bg-secondary/40 px-4 py-2 font-mono-typed text-xs uppercase tracking-wider hover:bg-secondary"
                  >
                    → {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        )}

        {status === "intro" && (
          <article className="paper-card relative rounded-sm bg-card px-6 py-10 sm:px-12 sm:py-14">
            <div className="absolute right-6 top-6">
              <Stamp rotate={-6} className="text-base">
                Hearing
              </Stamp>
            </div>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Gemeindesaal Grünwald · 19:42 Uhr
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">Das grosse Finale</h1>
            <div className="mt-6 space-y-4 whitespace-pre-line font-serif text-[15px] leading-relaxed text-foreground/90">
              {introStory}
            </div>
            <button
              onClick={() => setStatus("hearing")}
              className="mt-8 inline-flex items-center gap-3 rounded-sm bg-primary px-7 py-3.5 font-serif text-base font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5"
            >
              Bitte um das Wort →
            </button>
          </article>
        )}

        {status === "hearing" && <Hearing />}
      </div>
    </main>
  );
}
