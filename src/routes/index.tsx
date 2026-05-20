import { createFileRoute, Link } from "@tanstack/react-router";
import { Stamp } from "@/components/case-file/Stamp";

export const Route = createFileRoute("/")({
  component: CoverPage,
});

function CoverPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:py-16">
      {/* Background paper texture lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-ink) 0, var(--color-ink) 1px, transparent 1px, transparent 28px)",
        }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center">
        {/* Folder */}
        <div className="relative w-full">
          {/* Tab */}
          <div className="absolute -top-4 left-8 z-10 rounded-t-md bg-secondary px-5 py-2 font-mono-typed text-[11px] uppercase tracking-[0.2em] text-foreground/70 shadow-sm">
            Vertraulich · Akte 001
          </div>

          <article
            className="paper-card paper-card-lift relative rounded-sm bg-card px-6 py-12 sm:px-14 sm:py-16"
            style={{ transform: "rotate(-0.4deg)" }}
          >
            {/* Top right stamp */}
            <div className="absolute right-4 top-6 sm:right-10 sm:top-10">
              <Stamp rotate={12} className="text-sm">
                Akte
              </Stamp>
            </div>

            {/* Date stamp */}
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Eingang · 14. März · Klassen-Recherche
            </p>

            <h1 className="mt-6 font-serif text-5xl font-bold leading-[0.95] text-foreground sm:text-7xl">
              Wo ist
              <br />
              <span className="relative inline-block">
                Maya?
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-0 h-[6px] w-full rounded-full"
                  style={{ backgroundColor: "var(--color-stamp)", opacity: 0.85 }}
                />
              </span>
            </h1>

            <p className="mt-8 max-w-xl font-serif text-lg italic leading-relaxed text-foreground/80 sm:text-xl">
              Ein Bildungs-Escape-Room über nachhaltigen Konsum.
              <br />
              Für Klassen ab Stufe 8.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-[1.4fr_1fr]">
              <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
                <p>
                  <strong className="font-serif">Maya Brandt, 16,</strong> ist seit drei Tagen
                  verschwunden. Ihre Eltern fanden ihr Notizbuch im Garten — geöffnet, mitten in
                  einer Recherche.
                </p>
                <p>
                  Maya war einer Spur auf der Sicher. Sie glaubte, etwas gefunden zu haben, das den
                  Bau des neuen <span className="ink-underline">Gaskraftwerks am Stadtrand</span>{" "}
                  stoppen könnte.
                </p>
                <p className="font-serif italic text-foreground/70">
                  Du übernimmst ihre Akte. Lies, vergleiche, kombiniere — und finde heraus, was sie
                  entdeckt hat.
                </p>
              </div>

              <aside
                className="rounded-sm border border-border bg-secondary/50 p-4 text-sm"
                style={{ transform: "rotate(1.2deg)" }}
              >
                <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
                  Hinweis der Redaktion
                </p>
                <ul className="mt-3 space-y-1.5 text-foreground/80">
                  <li>· 1 Kapitel · ca. 20 Minuten</li>
                  <li>· Einzeln oder im Team spielbar</li>
                  <li>· Stift &amp; Zettel empfohlen</li>
                </ul>
              </aside>
            </div>

            <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:flex-wrap">
              <Link
                to="/akte"
                className="group inline-flex items-center gap-3 rounded-sm bg-primary px-7 py-3.5 font-serif text-base font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              >
                Akte 001 öffnen
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
              <Link
                to="/akte-002"
                className="group inline-flex items-center gap-3 rounded-sm border border-border bg-card px-7 py-3.5 font-serif text-base font-semibold transition-all hover:-translate-y-0.5 hover:bg-secondary"
              >
                Akte 002 öffnen
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                to="/akte-003"
                className="group inline-flex items-center gap-3 rounded-sm border border-border bg-card px-7 py-3.5 font-serif text-base font-semibold transition-all hover:-translate-y-0.5 hover:bg-secondary"
              >
                Akte 003 öffnen
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <p className="font-mono-typed text-xs uppercase tracking-[0.15em] text-muted-foreground">
                Einkauf · Biodiversität · Mobilität
              </p>
            </div>
          </article>

          {/* Paper underlay for stack effect */}
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
          Ein Lernspiel · v1
        </p>
      </div>
    </main>
  );
}
