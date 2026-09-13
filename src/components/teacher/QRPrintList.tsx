/**
 * Druckliste der QR-Codes einer Runde.
 *
 * Pro Posten wird für jede Station ein Code erzeugt. Stehen mehrere Wege an
 * derselben Station, reicht dort ein einziger Ausdruck.
 */
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  PATH_COLOR,
  STAGE_IDS,
  STAGE_LABELS,
  stationCodes,
  totalCodeCount,
  type Branches,
  type Letter,
} from "@/lib/variants";

type Item = {
  stage: number;
  letters: Letter[];
  token: string;
  dataUrl: string;
};

const PAGE_SIZE = 3;

export function QRPrintList({
  pathCount,
  branches,
}: {
  pathCount: number;
  branches: Branches | null;
}) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const out: Item[] = [];
      for (const stage of STAGE_IDS) {
        for (const st of stationCodes(stage, branches, pathCount)) {
          const dataUrl = await QRCode.toDataURL(st.token, {
            width: 420,
            margin: 1,
          });
          out.push({ stage, letters: st.letters, token: st.token, dataUrl });
        }
      }
      if (alive) setItems(out);
    })();
    return () => {
      alive = false;
    };
  }, [pathCount, branches]);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <p className="text-sm text-muted-foreground">
          {totalCodeCount(branches, pathCount)} QR-Codes für diese Runde
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.print()}
          className="min-h-[44px] rounded-sm font-serif font-semibold"
        >
          <Printer className="h-4 w-4" />
          Drucken
        </Button>
      </div>

      {/* Nur dieser Bereich landet auf dem Papier (siehe @media print in styles.css). */}
      <div className="print-area mt-3 space-y-3">
        {Array.from({ length: Math.ceil(items.length / PAGE_SIZE) }, (_, page) => (
          <div key={page} className="print-qr-page grid gap-3">
            {items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((it) => (
              <div
                key={`${it.stage}-${it.token}`}
                className="print-qr-card grid grid-cols-[minmax(0,1fr)_minmax(180px,0.9fr)] items-center gap-5 rounded-sm border bg-card p-5"
                style={{
                  borderColor: PATH_COLOR[it.letters[0] ?? "A"],
                }}
              >
                <div className="print-qr-copy min-w-0 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="font-mono-typed text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: PATH_COLOR[it.letters[0] ?? "A"] }}
                    >
                      Etappe {String(it.stage).padStart(2, "0")} · {STAGE_LABELS[it.stage]}
                    </p>
                    <div className="flex gap-1" aria-label={`Weg ${it.letters.join(", ")}`}>
                      {it.letters.map((letter) => (
                        <span
                          key={letter}
                          className="font-mono-typed flex h-6 min-w-6 items-center justify-center rounded-sm px-1 text-[11px] font-bold text-primary-foreground"
                          style={{ backgroundColor: PATH_COLOR[letter] }}
                        >
                          {letter}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h4 className="mt-3 font-serif text-2xl font-bold leading-tight">
                    Ihr habt das Siegel gefunden!
                  </h4>
                  <p className="mt-2 font-serif text-sm leading-relaxed text-foreground/85">
                    Scannt den QR-Code über die Webseite, um das digitale Siegel zu öffnen.
                    Danach wartet euer nächstes Rätsel auf euch!
                  </p>
                </div>
                <div className="print-qr-code border-2 border-foreground/55 bg-background p-2">
                  <img
                    src={it.dataUrl}
                    alt={`QR-Code ${STAGE_LABELS[it.stage]} für Weg ${it.letters.join(", ")}`}
                    className="mx-auto aspect-square w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
