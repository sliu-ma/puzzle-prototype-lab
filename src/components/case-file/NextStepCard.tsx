import { ArrowRight, CheckCircle2 } from "lucide-react";

import { stageGlyph, stageLabel } from "@/lib/stage-symbols";

type Props = {
  /** Etappennummer bzw. 6 für das Hearing. */
  nr: number;
  ort: string;
  thema: string;
  /** true = Hearing im Gemeindesaal */
  isFinale?: boolean;
  /** true = alles gelöst, zeigt Abschluss-Variante */
  finished?: boolean;
  onOpen: () => void;
};

/**
 * Grosse „Nächster Schritt"-Karte, damit auf dem Handy ohne Scrollen
 * klar ist, was das Team als Nächstes tun muss.
 */
export function NextStepCard({ nr, ort, thema, isFinale, finished, onOpen }: Props) {
  if (finished) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-3 rounded-sm border-2 border-emerald-500/50 bg-emerald-500/5 px-4 py-4 text-left transition-all active:scale-[0.99]"
      >
        <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.18em] text-emerald-700">
            Fall abgeschlossen
          </p>
          <p className="font-serif text-lg font-bold leading-tight">
            Ergebnis und Abzeichen ansehen
          </p>
        </div>
        <ArrowRight aria-hidden className="h-5 w-5 shrink-0" />
      </button>
    );
  }

  return (
    <section className="rounded-sm border-2 border-stamp bg-stamp/5 p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.18em] text-stamp">
            {isFinale ? "Nächster Schritt · Hearing" : `Nächster Schritt · ${stageLabel(nr)}`}
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold leading-tight sm:text-3xl">
            {ort}
          </h2>
          <p className="font-serif text-base italic text-foreground/70">{thema}</p>
        </div>
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stamp font-mono-typed text-lg font-bold text-paper"
        >
          {stageGlyph(nr)}
        </span>
      </div>


      <button
        type="button"
        onClick={onOpen}
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3 font-serif text-base font-semibold text-primary-foreground transition-all active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-md"
      >
        {isFinale ? "Hearing starten" : `${stageLabel(nr)} öffnen`}
        <ArrowRight aria-hidden className="h-4 w-4" />
      </button>
    </section>
  );
}
