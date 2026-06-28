import { createFileRoute, Link } from "@tanstack/react-router";
import { Stamp } from "@/components/case-file/Stamp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Grünwald — Majas Ermittlung" },
      {
        name: "description",
        content:
          "Ein Bildungs-Escape-Room zur Ökologie. Maja besucht ihre Grosstante Elvira in Grünwald — und muss bis zur Gemeinderatssitzung um 19:00 Uhr ein Gaskraftwerk verhindern.",
      },
    ],
  }),
  component: CoverPage,
});

const ETAPPEN = [
  { nr: 1, to: "/akte-003", ort: "Bahnhof", thema: "Mobilität" },
  { nr: 2, to: "/akte", ort: "Dorfladen", thema: "Konsum" },
  { nr: 3, to: "/akte-002", ort: "Wald-Lichtung", thema: "Biodiversität" },
  { nr: 4, to: "/akte-004", ort: "Elviras Haus", thema: "Wohnen" },
  { nr: 5, to: "/akte-005", ort: "Wasserkraftwerk", thema: "Energie" },
] as const;

function CoverPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-ink) 0, var(--color-ink) 1px, transparent 1px, transparent 28px)",
        }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center">
        <div className="relative w-full">
          <div className="absolute -top-4 left-8 z-10 rounded-t-md bg-secondary px-5 py-2 font-mono-typed text-[11px] uppercase tracking-[0.2em] text-foreground/70 shadow-sm">
            Vertraulich · Grünwald
          </div>

          <article
            className="paper-card paper-card-lift relative rounded-sm bg-card px-6 py-12 sm:px-14 sm:py-16"
            style={{ transform: "rotate(-0.4deg)" }}
          >
            <div className="absolute right-4 top-6 sm:right-10 sm:top-10">
              <Stamp rotate={12} className="text-sm">
                Eilig
              </Stamp>
            </div>

            <p className="font-mono-typed text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Samstag · 14:12 Uhr · Grünwald, Dorfstrasse 4
            </p>

            <h1 className="mt-6 font-serif text-5xl font-bold leading-[0.95] text-foreground sm:text-7xl">
              Tante Elvira
              <br />
              <span className="relative inline-block">
                ist weg.
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-0 h-[6px] w-full rounded-full"
                  style={{ backgroundColor: "var(--color-stamp)", opacity: 0.85 }}
                />
              </span>
            </h1>

            <p className="mt-8 max-w-xl font-serif text-lg italic leading-relaxed text-foreground/80 sm:text-xl">
              Ein Bildungs-Escape-Room zur Ökologie.
              <br />
              Für Klassen ab Stufe 8.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-[1.4fr_1fr]">
              <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
                <p>
                  <strong className="font-serif">Maja, 17,</strong> kommt am Samstagmorgen
                  bei ihrer Grosstante <strong className="font-serif">Elvira</strong> in
                  Grünwald an — wie jeden Sommer. Doch das Haus ist leer. Auf dem
                  Küchentisch liegt ein Brief.
                </p>
                <p>
                  Heute Abend, um <strong>19:00 Uhr</strong>, stimmt der Gemeinderat
                  über ein neues <span className="ink-underline">Gaskraftwerk auf der
                  Waldlichtung</span> ab. Elvira sammelt seit Wochen Daten dagegen — und
                  hat eine Spur quer durchs Dorf gelegt.
                </p>
                <p className="font-serif italic text-foreground/70">
                  Du übernimmst Majas Route. Fünf Etappen, fünf Orte — Bahnhof,
                  Dorfladen, Wald, Haus, altes Wasserkraftwerk. Dann das Hearing
                  im Gemeindesaal. Du hast bis 19:00 Uhr.
                </p>
              </div>

              <aside
                className="rounded-sm border border-border bg-secondary/50 p-4 text-sm"
                style={{ transform: "rotate(1.2deg)" }}
              >
                <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
                  Brief von Tante Elvira
                </p>
                <p className="mt-3 font-serif italic leading-relaxed text-foreground/85">
                  „Maja — falls du das liest, bin ich schon unterwegs. Heute
                  Abend kippt die Abstimmung, und sie haben sich auf fehlerhafte
                  Gutachten gestützt. Ich habe an fünf Orten im Dorf etwas für
                  dich hinterlegt. <em>Folge den Hinweisen — Etappe für Etappe.
                  Wir treffen uns vor dem Gemeindesaal."</em>
                </p>
                <p className="mt-2 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  — E.
                </p>
              </aside>
            </div>

            <div className="mt-12 flex flex-col items-start gap-4">
              <Link
                to="/akte-003"
                className="group inline-flex items-center gap-3 rounded-sm bg-primary px-7 py-3.5 font-serif text-base font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                Etappe 1 starten · Bahnhof
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                {ETAPPEN.slice(1).map((e) => (
                  <Link
                    key={e.nr}
                    to={e.to}
                    className="group inline-flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 font-mono-typed text-[11px] uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:bg-secondary"
                  >
                    Etappe {e.nr} · {e.ort}
                  </Link>
                ))}
                <Link
                  to="/finale"
                  className="group inline-flex items-center gap-2 rounded-sm border border-stamp/40 bg-stamp/5 px-4 py-2 font-mono-typed text-[11px] uppercase tracking-wider text-stamp transition-all hover:-translate-y-0.5 hover:bg-stamp/10"
                >
                  Finale · Gemeindesaal
                </Link>
              </div>

              <p className="font-mono-typed text-xs uppercase tracking-[0.15em] text-muted-foreground">
                5 Etappen · Mobilität · Konsum · Biodiversität · Wohnen · Energie · + Hearing
              </p>
            </div>
          </article>

          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-sm bg-paper-deep"
            style={{ transform: "rotate(1.6deg) translate(8px, 6px)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-20 rounded-sm bg-secondary"
            style={{ transform: "rotate(-2deg) translate(-6px, 10px)" }}
          />
        </div>

        <p className="mt-16 font-mono-typed text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Ein Lernspiel · Grünwald · v2
        </p>
      </div>
    </main>
  );
}
