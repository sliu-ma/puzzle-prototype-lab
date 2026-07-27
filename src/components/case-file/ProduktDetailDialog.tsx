import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SIEGEL, getSaisonStatus, getEffektiveNachhaltigkeit, type Produkt } from "@/lib/maya-data";
import { cn } from "@/lib/utils";

interface ProduktDetailDialogProps {
  produkt: Produkt | null;
  onOpenChange: (open: boolean) => void;
}


function Dots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-2.5 w-2.5 rounded-full border",
            i < value ? "border-ink bg-ink" : "border-border bg-paper",
          )}
        />
      ))}
    </div>
  );
}

function scoreLabel(avg: number) {
  if (avg >= 4.2) return "Sehr nachhaltig";
  if (avg >= 3.2) return "Solide Wahl";
  if (avg >= 2.2) return "Mit Vorbehalt";
  return "Problematisch";
}

export function ProduktDetailDialog({ produkt, onOpenChange }: ProduktDetailDialogProps) {
  const open = !!produkt;
  if (!produkt) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const n = produkt.nachhaltigkeit;
  const avg = (n.regional + n.saisonal + n.verpackung + n.label) / 4;
  const score = Math.round(avg * 10) / 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md gap-0 overflow-y-auto rounded-sm border-border bg-paper p-0">
        <DialogTitle className="sr-only">{produkt.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Produktdetails und Nachhaltigkeitsbewertung
        </DialogDescription>

        {/* 1. Bild */}
        <div className="flex items-center justify-center border-b border-border bg-white p-6">
          {produkt.bildUrl ? (
            <img
              src={produkt.bildUrl}
              alt={produkt.name}
              className="h-44 w-auto object-contain"
            />
          ) : (
            <span className="text-7xl" aria-hidden>
              {produkt.emoji}
            </span>
          )}
        </div>

        {/* Titel */}
        <div className="border-b border-border bg-paper px-5 py-3">
          <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
            Produkt-Dossier
          </p>
          <h3 className="font-serif text-xl font-bold leading-tight">{produkt.name}</h3>
        </div>

        {/* 2. Label-Logos */}
        {produkt.siegel.length > 0 && (
          <div className="border-b border-border bg-paper-deep/20 px-5 py-3">
            <p className="mb-2 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              Labels & Standards
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {produkt.siegel.map((key) => {
                const s = SIEGEL[key];
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 rounded-sm border border-border bg-white px-2 py-1.5"
                  >
                    {s.logoUrl ? (
                      <img
                        src={s.logoUrl}
                        alt={s.label}
                        className="h-7 w-7 object-contain"
                      />
                    ) : null}
                    <span className="font-mono-typed text-xs">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Herkunft / Zutaten */}
        <div className="space-y-2 border-b border-border px-5 py-3 text-sm">
          <p className="mb-1 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            Herkunft & Details
          </p>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Herkunft</span>
            <span className="text-right font-medium">{produkt.herkunft}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Preis</span>
            <span className="font-mono-typed font-medium">CHF {produkt.preis.toFixed(2)}</span>
          </div>
          {produkt.kategorie === "fruechte-gemuese" && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Saison</span>
              <span className="font-medium">
                {(() => {
                  const s = getSaisonStatus(produkt);
                  return s === "in"
                    ? "In Saison"
                    : s === "out"
                      ? "Ausserhalb Saison"
                      : "Ganzjährig";
                })()}
              </span>
            </div>
          )}
        </div>

        {/* 4. Nachhaltigkeitsbarometer */}
        <div className="px-5 py-4">
          <p className="mb-3 font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
            Nachhaltigkeits-Barometer
          </p>

          <div className="mb-4 flex items-end justify-between gap-3 rounded-sm border border-border bg-paper-deep/30 px-3 py-2.5">
            <div>
              <p className="font-serif text-3xl font-bold leading-none">
                {score.toFixed(1)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">/ 5</span>
              </p>
              <p className="mt-1 font-mono-typed text-[11px] uppercase tracking-wider">
                {scoreLabel(avg)}
              </p>
            </div>
            <Dots value={Math.round(avg)} />
          </div>




          <p className="mt-4 border-t border-dashed border-border pt-3 text-xs leading-relaxed text-foreground/80">
            {n.erklaerung}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
