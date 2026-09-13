/**
 * Druckliste der QR-Codes einer Runde.
 *
 * Pro Posten wird für jede Station ein Code erzeugt. Stehen mehrere Wege an
 * derselben Station, reicht dort ein einziger Ausdruck.
 */
import { useEffect, useRef, useState } from "react";
import { ImageDown, Printer } from "lucide-react";
import QRCode from "qrcode";
import JSZip from "jszip";
import { toPng } from "html-to-image";
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

const PAGE_SIZE = 2;

export function QRPrintList({
  pathCount,
  branches,
}: {
  pathCount: number;
  branches: Branches | null;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [saving, setSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Rendert jede ganze Karte (Text + QR-Code) als PNG und packt alle in ein ZIP.
  const savePng = async () => {
    setSaving(true);
    try {
      const zip = new JSZip();
      const cards = printRef.current?.querySelectorAll<HTMLElement>(".print-qr-card") ?? [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const node = cards[i];
        if (!node) continue;
        const dataUrl = await toPng(node, {
          pixelRatio: 3,
          backgroundColor: "#FDFBF4",
          cacheBust: true,
        });
        const base64 = dataUrl.split(",")[1];
        const name = `etappe-${String(it.stage).padStart(2, "0")}-${STAGE_LABELS[it.stage]
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}-weg-${it.letters.join("")}.png`;
        zip.file(name, base64, { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "majas-mission-qr-karten.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            className="min-h-[44px] rounded-sm font-serif font-semibold"
          >
            <Printer className="h-4 w-4" />
            Als PDF drucken
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving || items.length === 0}
            onClick={() => void savePng()}
            className="min-h-[44px] rounded-sm font-serif font-semibold"
          >
            <ImageDown className="h-4 w-4" />
            {saving ? "Erstelle ZIP…" : "Als ZIP speichern"}
          </Button>
        </div>
      </div>

      {/* Nur dieser Bereich landet auf dem Papier (siehe @media print in styles.css). */}
      <div ref={printRef} className="print-area mt-3 space-y-3">
        {Array.from({ length: Math.ceil(items.length / PAGE_SIZE) }, (_, page) => (
          <div key={page} className="print-qr-page grid gap-3">
            {items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((it) => {
              // Karte mit genau einem Weg bekommt dessen Farbe. Ein geteilter
              // Code (mehrere Wege an derselben Station) bleibt neutral, damit
              // keine Weg-Farbe falsch dominiert.
              const accent = it.letters.length === 1 ? PATH_COLOR[it.letters[0]] : undefined;
              return (
              <div
                key={`${it.stage}-${it.token}`}
                className="print-qr-card grid grid-cols-[minmax(0,1fr)_minmax(180px,0.9fr)] items-center gap-5 rounded-sm border bg-card p-5"
                style={accent ? { borderColor: accent } : undefined}
              >
                <div className="print-qr-copy min-w-0 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className="font-mono-typed text-[11px] font-bold uppercase tracking-wider"
                      style={accent ? { color: accent } : undefined}
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
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
