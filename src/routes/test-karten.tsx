import { createFileRoute } from "@tanstack/react-router";
import { StationCard } from "@/components/teacher/StationCard";

export const Route = createFileRoute("/test-karten")({
  component: TestCards,
});

function TestCards() {
  return (
    <div className="min-h-screen bg-paper p-4">
      <h1 className="mb-4 font-serif text-xl font-bold">Postenkarten-Vorschau</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StationCard
          station={{
            stageNr: 1,
            placeName: "SPAR Speicher",
            address: "Hauptstrasse 61, 9042 Speicher",
            lat: 47.4128439,
            lng: 9.437396,
            note: "Das Rätsel wartet beim Eingang.",
            photoUrl:
              "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/SPAR_in_Speicher.jpg/640px-SPAR_in_Speicher.jpg",
            mapUrl: null,
          }}
        />
        <StationCard
          station={{
            stageNr: 2,
            placeName: "Dorfladen Speicher",
            address: "Dorfstrasse 12, 9042 Speicher",
            lat: 47.41,
            lng: 9.44,
            note: "",
            photoUrl: null,
            mapUrl: null,
          }}
        />
      </div>
    </div>
  );
}
