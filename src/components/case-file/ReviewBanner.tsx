import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";

export function ReviewBanner({ stage }: { stage: number }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-stamp/40 bg-stamp/10 px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <Eye className="h-4 w-4 shrink-0 text-stamp" />
        <div className="min-w-0">
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
            Rückblick · Etappe {stage}
          </p>
          <p className="text-sm text-foreground/80">
            Dies ist eure gespeicherte Lösung. Interaktionen sind deaktiviert.
          </p>
        </div>
      </div>
      <Link
        to="/"
        className="rounded-sm border border-border bg-card px-3 py-1.5 font-mono-typed text-[11px] uppercase tracking-wider hover:bg-secondary"
      >
        ← Übersicht
      </Link>
    </div>
  );
}
