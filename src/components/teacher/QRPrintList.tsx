/**
 * Druckliste der QR-Codes einer Runde.
 *
 * Pro Posten wird für jede Station ein Code erzeugt. Stehen mehrere Wege an
 * derselben Station, reicht dort ein einziger Ausdruck.
 */
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import QRCode from "qrcode";
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

const PAGE_SIZE = 6;

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
        <button
          type="button"
          onClick={() => window.print()}
          className="flex min-h-[44px] items-center gap-2 rounded-sm border border-border px-3 font-serif text-sm font-semibold"
        >
          <Printer className="h-4 w-4" />
          Drucken
        </button>
      </div>

      {/* Nur dieser Bereich landet auf dem Papier (siehe @media print in styles.css). */}
      <div className="print-area mt-3 space-y-3">
        {Array.from({ length: Math.ceil(items.length / PAGE_SIZE) }, (_, page) => (
          <div key={page} className="print-qr-page grid grid-cols-2 gap-3">
            {items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((it) => (
              <div
                key={`${it.stage}-${it.token}`}
                className="print-qr-card rounded-sm border border-border bg-card p-3 text-center"
              >
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              {STAGE_LABELS[it.stage]}
            </p>
            <img
              src={it.dataUrl}
              alt={`QR-Code ${STAGE_LABELS[it.stage]} für Weg ${it.letters.join(", ")}`}
              className="mx-auto mt-2 w-full max-w-[160px]"
            />
            <div className="mt-2 flex flex-wrap justify-center gap-1">
              {it.letters.map((l) => (
                <span
                  key={l}
                  className="rounded-sm px-1.5 py-0.5 text-[11px] font-bold text-white"
                  style={{ backgroundColor: PATH_COLOR[l] }}
                >
                  {l}
                </span>
              ))}
            </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
