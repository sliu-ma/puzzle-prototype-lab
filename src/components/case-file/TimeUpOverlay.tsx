import { AlertTriangle } from "lucide-react";
import { resetAll } from "@/lib/progress";

/**
 * Vollbild-Overlay wenn die 90 Minuten abgelaufen sind.
 * Blockiert jede Interaktion mit dem Spiel dahinter.
 */
export function TimeUpOverlay() {
  const handleReset = () => {
    resetAll();
    window.location.href = "/";
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background/98 px-6 text-center backdrop-blur-md"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="time-up-title"
    >
      <AlertTriangle className="h-16 w-16 text-destructive" />
      <h1
        id="time-up-title"
        className="font-serif text-3xl font-bold text-destructive"
      >
        Die Zeit ist leider um.
      </h1>
      <p className="max-w-sm font-serif text-lg italic leading-relaxed text-foreground/80">
        Das Hearing hat begonnen, ihr habt es nicht mehr rechtzeitig
        geschafft.
      </p>
      <p className="max-w-sm font-serif text-base text-foreground/70">
        Begebt euch zurück zur Schule.
      </p>
      <button
        onClick={handleReset}
        className="mt-4 rounded-sm bg-primary px-6 py-3 font-serif text-base font-semibold text-primary-foreground shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
      >
        Zurück zum Start & Zurücksetzen
      </button>
    </div>
  );
}
