import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { teacherListStations } from "@/lib/stations.functions";
import { StationCard, type StationCardData } from "@/components/teacher/StationCard";
import { getTeacherPassword } from "@/lib/teacher-session";

export const Route = createFileRoute("/lehrer/$code/karten")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Postenkarten drucken" },
      {
        name: "description",
        content: "Alle Postenkarten für eine Klassenrunde auf einmal drucken.",
      },
      { property: "og:title", content: "Postenkarten drucken" },
      {
        property: "og:description",
        content: "Alle Postenkarten für eine Klassenrunde auf einmal drucken.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrintCardsPage,
});

function PrintCardsPage() {
  const { code } = Route.useParams();
  const [password, setPassword] = useState("");
  const [stations, setStations] = useState<StationCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pw = getTeacherPassword();
    if (!pw) {
      setError("Bitte im Lehrerbereich einloggen.");
      setLoading(false);
      return;
    }
    setPassword(pw);
    teacherListStations({ data: { password: pw, code } })
      .then((rows) => {
        // Sicherstellen, dass alle 5 Etappen vorhanden sind.
        const all = [1, 2, 3, 4, 5].map((nr) => {
          const found = rows.find((r) => r.stageNr === nr);
          return {
            stageNr: nr,
            placeName: found?.placeName ?? "",
            address: found?.address ?? "",
            lat: found?.lat ?? null,
            lng: found?.lng ?? null,
            note: found?.note ?? "",
            photoUrl: found?.photoUrl ?? null,
            mapUrl: found?.mapUrl ?? null,
          };
        });
        setStations(all);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Fehler beim Laden."))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-6xl p-4">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <Link
              to="/lehrer/$code"
              params={{ code }}
              className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 text-sm font-semibold hover:border-stamp"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zur Runde
            </Link>
            <h1 className="font-serif text-xl font-bold">Postenkarten</h1>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-sm bg-primary px-4 py-2 font-serif text-sm font-semibold text-primary-foreground"
          >
            <Printer className="h-4 w-4" />
            Drucken
          </button>
        </header>

        {loading && <p className="text-sm text-muted-foreground print:hidden">Karten werden geladen…</p>}
        {error && (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive print:hidden">
            {error}
          </p>
        )}

        {!loading && !error && stations.some((s) => !s.address.trim()) && (
          <p className="mb-4 rounded-sm border border-dashed border-border p-3 text-sm text-muted-foreground print:hidden">
            Einige Karten sind noch nicht vollständig. Adresse fehlt bei Etappe{" "}
            {stations.filter((s) => !s.address.trim()).map((s) => s.stageNr).join(", ")}.
          </p>
        )}

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-2 print:gap-4">
          {stations.map((station) => (
            <StationCard key={station.stageNr} station={station} />
          ))}
        </section>

        <footer className="mt-8 text-center text-xs text-muted-foreground print:hidden">
          <p>Die QR-Codes führen zu OpenStreetMap-Routen für die jeweiligen Orte.</p>
          <p className="mt-1">
            Druck-Tipp: In den Druckdialog kannst du „Hintergrundgrafiken“ aktivieren, damit die Papier-Optik
            sichtbar bleibt.
          </p>
        </footer>
      </div>
    </div>
  );
}
