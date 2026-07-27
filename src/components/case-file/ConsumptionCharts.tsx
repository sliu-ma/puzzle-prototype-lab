import { Trash2, Banknote } from "lucide-react";
import orangeAsset from "@/assets/produkte/orange.jpg.asset.json";
import rosenkohlAsset from "@/assets/produkte/rosenkohl.png.asset.json";
import spargelAsset from "@/assets/produkte/spargel.webp.asset.json";
import rhabarberAsset from "@/assets/produkte/rhabarber.webp.asset.json";
import kuerbisAsset from "@/assets/produkte/kuerbis.webp.asset.json";
import zwetschgeAsset from "@/assets/produkte/zwetschge.jpg.asset.json";
import erdbeereAsset from "@/assets/produkte/erdbeeren-ch.webp.asset.json";
import gurkeAsset from "@/assets/produkte/gurke-ch.webp.asset.json";
import { SIEGEL } from "@/lib/maya-data";

type Saison = "winter" | "fruehling" | "sommer" | "herbst";

type SaisonItem = {
  name: string;
  url: string;
  /** 1-basierte Monate, in denen das Produkt CH-Saison hat */
  months: number[];
};

const SAISON_MAP: Record<Saison, { label: string; items: SaisonItem[] }> = {
  winter: {
    label: "Winter",
    items: [
      { name: "Rosenkohl", url: rosenkohlAsset.url, months: [10, 11, 12, 1, 2] },
      { name: "Orange", url: orangeAsset.url, months: [12, 1, 2, 3] },
    ],
  },
  fruehling: {
    label: "Frühling",
    items: [
      { name: "Spargel", url: spargelAsset.url, months: [4, 5, 6] },
      { name: "Rhabarber", url: rhabarberAsset.url, months: [4, 5, 6] },
    ],
  },
  sommer: {
    label: "Sommer",
    items: [
      { name: "Erdbeere", url: erdbeereAsset.url, months: [5, 6, 7, 8, 9] },
      { name: "Gurke", url: gurkeAsset.url, months: [6, 7, 8, 9] },
    ],
  },
  herbst: {
    label: "Herbst",
    items: [
      { name: "Kürbis", url: kuerbisAsset.url, months: [9, 10, 11] },
      { name: "Zwetschgen", url: zwetschgeAsset.url, months: [8, 9, 10] },
    ],
  },
};

const MONTH_INITIALS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function currentSeason(d = new Date()): Saison {
  const m = d.getMonth();
  if (m === 11 || m <= 1) return "winter";
  if (m <= 4) return "fruehling";
  if (m <= 7) return "sommer";
  return "herbst";
}

export function getSaisonInfo() {
  const s = currentSeason();
  return { key: s, ...SAISON_MAP[s] };
}

function seasonRangeLabel(months: number[]): string {
  if (months.length === 0) return "";
  const names = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];
  // detect wrap-around (e.g. [10,11,12,1,2])
  const sorted = [...months].sort((a, b) => a - b);
  const isWrap = sorted.some((m, i) => i > 0 && m - sorted[i - 1] > 1);
  if (isWrap) {
    // find gap
    const idx = sorted.findIndex((m, i) => i > 0 && m - sorted[i - 1] > 1);
    const start = sorted[idx];
    const end = sorted[idx - 1];
    return `${names[start - 1]} – ${names[end - 1]}`;
  }
  return `${names[sorted[0] - 1]} – ${names[sorted[sorted.length - 1] - 1]}`;
}

function MonthBar({ months }: { months: number[] }) {
  const active = new Set(months);
  const currentMonth = new Date().getMonth() + 1;
  return (
    <div className="flex w-full gap-[2px]">
      {MONTH_INITIALS.map((letter, i) => {
        const m = i + 1;
        const isActive = active.has(m);
        const isNow = m === currentMonth;
        return (
          <div
            key={i}
            className={
              "flex h-4 flex-1 items-center justify-center rounded-[2px] font-mono-typed text-[8px] leading-none " +
              (isActive ? "bg-stamp text-paper" : "bg-paper text-muted-foreground/70 border border-border") +
              (isNow ? " ring-1 ring-ink" : "")
            }
            aria-hidden
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
}

export function SaisonProdukte() {
  const info = getSaisonInfo();
  return (
    <div className="rounded-sm border border-dashed border-stamp/40 bg-white p-3">
      <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Saison: {info.label}</p>
      <div className="mt-0.5 space-y-0.5">
        {info.items.map((it) => (
          <div key={it.name} className="rounded-sm bg-white p-2">
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white">
                <img src={it.url} alt={it.name} className="max-h-full max-w-full object-contain" loading="lazy" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-sm font-semibold leading-tight">{it.name}</p>
                <p className="mt-0.5 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                  CH-Saison: {seasonRangeLabel(it.months)}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <MonthBar months={it.months} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FoodWasteChart() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-3">
        <Trash2 className="h-8 w-8 shrink-0 text-stamp" strokeWidth={2.25} />
        <div className="min-w-0">
          <div className="font-serif text-2xl font-bold leading-none">90 kg</div>
          <div className="mt-1 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            Lebensmittel · pro Person / Jahr
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-sm border border-dashed border-stamp/40 bg-paper-deep/30 p-3">
        <Banknote className="h-8 w-8 shrink-0 text-stamp" strokeWidth={2.25} />
        <div className="min-w-0">
          <div className="font-serif text-2xl font-bold leading-none">&gt; CHF 600.–</div>
          <div className="mt-1 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
            Wert · pro Haushalt / Jahr
          </div>
        </div>
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
                <img src={s.logoUrl} alt={s.label} className="max-h-10 max-w-10 object-contain" loading="lazy" />
              ) : (
                <span className="font-mono-typed text-[10px] uppercase text-stamp">{s.label}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-serif text-sm font-semibold leading-tight">{s.label}</p>
              <p className="mt-0.5 text-xs text-foreground/75">{text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
