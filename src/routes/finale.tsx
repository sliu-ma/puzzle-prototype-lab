import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/finale")({
  component: FinalePage,
});

function FinalePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-bold">Finale</h1>
        <p className="text-muted-foreground">
          Du hast alle Akten gelöst. Herzlichen Glückwunsch!
        </p>
        <Link to="/" className="underline">Zurück zur Übersicht</Link>
      </div>
    </main>
  );
}
