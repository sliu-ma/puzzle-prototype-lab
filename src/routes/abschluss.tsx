import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { FinalSummary } from "@/components/case-file/FinalSummary";
import { getTeam, isRoundClosed } from "@/lib/progress";

export const Route = createFileRoute("/abschluss")({
  head: () => ({
    meta: [
      {
        title:
          "Abschluss der Ermittlung | Majas Mission - Escape Game zu Nachhaltigkeit",
      },
      {
        name: "description",
        content:
          "Punkte, Zeit, Hinweise und Abzeichen am Ende der Runde. – Majas Mission ist ein mobiler Bildungs Escape Game zum Thema Nachhaltigkeit: Schulklassen lösen reale Rätsel zu Mobilität, Konsum, Energie & mehr",
      },
      { property: "og:title", content: "Abschluss der Ermittlung | Majas Mission" },
      {
        property: "og:description",
        content:
          "Punkte, Zeit, Hinweise und Abzeichen am Ende der Runde von Majas Mission.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AbschlussPage,
});

function AbschlussPage() {
  const [ready, setReady] = useState(false);
  const [hasTeam, setHasTeam] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    setHasTeam(!!getTeam());
    setClosed(isRoundClosed());
    setReady(true);
  }, []);

  return (
    <main className="relative min-h-screen px-3 py-8 sm:px-4 sm:py-14">
      <div className="relative mx-auto max-w-xl">
        {!ready ? (
          <p className="text-center font-mono-typed text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Lade …
          </p>
        ) : hasTeam ? (
          <FinalSummary reason={closed ? "closed" : "timeout"} />
        ) : (
          <PaperCard rotate={-0.4} tape="top">
            <Stamp rotate={8}>Kein Spielstand</Stamp>
            <h1 className="mt-2 font-serif text-3xl font-bold leading-tight">
              Noch keine Ermittlung
            </h1>
            <p className="mt-4 text-[15px] text-foreground/80">
              Es gibt auf diesem Gerät keinen laufenden Spielstand. Startet auf
              der Startseite eine neue Runde.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 hover:shadow-md"
              >
                Zur Startseite →
              </Link>
            </div>
          </PaperCard>
        )}
      </div>
    </main>
  );
}
