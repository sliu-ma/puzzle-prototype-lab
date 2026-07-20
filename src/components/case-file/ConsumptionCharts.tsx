import { Trash2, Banknote } from "lucide-react";
import orangeAsset from "@/assets/produkte/orange.webp.asset.json";
import rosenkohlAsset from "@/assets/produkte/rosenkohl.png.asset.json";
import spargelAsset from "@/assets/produkte/spargel.webp.asset.json";
import rhabarberAsset from "@/assets/produkte/rhabarber.webp.asset.json";
import kuerbisAsset from "@/assets/produkte/kuerbis.webp.asset.json";
import zwetschgeAsset from "@/assets/produkte/zwetschge.jxl.asset.json";
import erdbeereAsset from "@/assets/produkte/erdbeeren-ch.webp.asset.json";
import gurkeAsset from "@/assets/produkte/gurke-ch.webp.asset.json";
import { SIEGEL } from "@/lib/maya-data";

type Saison = "winter" | "fruehling" | "sommer" | "herbst";

const SAISON_MAP: Record<
  Saison,
  { label: string; items: { name: string; url: string }[] }
> = {
  winter: {
    label: "Winter",
    items: [
      { name: "Rosenkohl", url: rosenkohlAsset.url },
      { name: "Orange", url: orangeAsset.url },
    ],
  },
  fruehling: {
    label: "Frühling",
    items: [
      { name: "Spargel", url: spargelAsset.url },
      { name: "Rhabarber", url: rhabarberAsset.url },
    ],
  },
  sommer: {
    label: "Sommer",
    items: [
      { name: "Erdbeere", url: erdbeereAsset.url },
      { name: "Gurke", url: gurkeAsset.url },
    ],
  },
  herbst: {
    label: "Herbst",
    items: [
      { name: "Kürbis", url: kuerbisAsset.url },
      { name: "Zwetschge", url: zwetschgeAsset.url },
    ],
  },
};

function currentSeason(d = new Date()): Saison {
  const m = d.getMonth(); // 0 = Jan
  if (m === 11 || m <= 1) return "winter";
  if (m <= 4) return "fruehling";
  if (m <= 7) return "sommer";
  return "herbst";
}

export function getSaisonInfo() {
  const s = currentSeason();
  return { key: s, ...SAISON_MAP[s] };
}

export function SaisonProdukte() {
  const info = getSaisonInfo();
  return (
    <div className="rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
        Saison: {info.label}
      </p>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {info.items.map((it) => (
          <figure key={it.name} className="flex flex-col items-center gap-1.5">
            <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-sm bg-paper">
              <img
                src={it.url}
                alt={it.name}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </div>
            <figcaption className="font-serif text-sm font-semibold">
              {it.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function FoodWasteChart() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center gap-1.5 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-3 text-center">
          <Trash2 className="h-6 w-6 text-stamp" strokeWidth={2.25} />
          <div className="font-serif text-2xl font-bold leading-none">90 kg</div>
          <div className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            pro Person / Jahr
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-3 text-center">
          <Banknote className="h-6 w-6 text-stamp" strokeWidth={2.25} />
          <div className="font-serif text-2xl font-bold leading-none">&gt; 600.–</div>
          <div className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            CHF pro Haushalt / Jahr
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-3">
        <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
          Wo entsteht der Food-Waste?
        </p>
        <div className="mt-2 space-y-1.5">
          <WasteRow label="Haushalte" value={38} />
          <WasteRow label="Landwirtschaft & Verarbeitung" value={40} />
          <WasteRow label="Gastronomie & Handel" value={22} />
        </div>
        <p className="mt-2 font-mono-typed text-[10px] italic text-muted-foreground">
          Rund ein Drittel aller Lebensmittel weltweit landet im Abfall.
        </p>
      </div>
    </div>
  );
}

function WasteRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between font-mono-typed text-[11px]">
        <span>{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
        <div
          className="h-full bg-stamp/70"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function LabelUebersicht() {
  const labels: { key: keyof typeof SIEGEL; text: string }[] = [
    {
      key: "suisse-garantie",
      text: "Rohstoffe und Verarbeitung zu 100 % aus der Schweiz.",
    },
    {
      key: "ip-suisse",
      text: "Schweizer Landwirtschaft mit erhöhten Anforderungen an Umwelt und Tierwohl.",
    },
    {
      key: "bio",
      text: "Anbau ohne synthetische Pestizide, artgerechte Tierhaltung.",
    },
  ];
  return (
    <div className="space-y-2">
      {labels.map(({ key, text }) => {
        const s = SIEGEL[key];
        return (
          <div
            key={key}
            className="flex items-center gap-3 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-2"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-paper">
              {s.logoUrl ? (
                <img
                  src={s.logoUrl}
                  alt={s.label}
                  className="max-h-10 max-w-10 object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="font-mono-typed text-[10px] uppercase text-stamp">
                  {s.label}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-serif text-sm font-semibold leading-tight">
                {s.label}
              </p>
              <p className="mt-0.5 text-xs text-foreground/75">{text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
