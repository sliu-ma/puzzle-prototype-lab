import { Link } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";

/**
 * Fallback bei einem unerwarteten Fehler. Der Spielstand liegt lokal, deshalb
 * genügt in der Regel ein neuer Versuch.
 */
export function ErrorScreen({ reset }: { reset?: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-sm border border-border bg-card p-6 text-center shadow-lg">
        <p className="stamp-mark inline-block px-3 py-1 text-xs">Störung in der Akte</p>
        <h1 className="mt-5 font-serif text-2xl font-bold text-foreground">
          Da ist etwas schiefgelaufen
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Euer Fortschritt ist gespeichert. Versucht es nochmals – wenn es
          bleibt, meldet euch bei der Lehrperson.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              if (reset) reset();
              else window.location.reload();
            }}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2 font-mono-typed text-sm uppercase tracking-wider text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4" /> Nochmals versuchen
          </button>
          <Link
            to="/"
            className="inline-flex min-h-[48px] items-center justify-center rounded-sm border border-border px-4 py-2 font-mono-typed text-sm uppercase tracking-wider text-muted-foreground"
          >
            Zur Übersicht
          </Link>
        </div>
      </div>
    </div>
  );
}
