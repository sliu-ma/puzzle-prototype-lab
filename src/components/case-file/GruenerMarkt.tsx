import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  KATEGORIEN,
  PRODUKTE,
  REZEPT,
  REZEPT_ZUTATEN_KEYS,
  type Kategorie,
  type Produkt,
} from "@/lib/maya-data";

interface GruenerMarktProps {
  startWarenkorb: string[];
  onErfolg: () => void;
}

type Status = "shop" | "erfolg";

export function GruenerMarkt({ startWarenkorb, onErfolg }: GruenerMarktProps) {
  const [warenkorb, setWarenkorb] = useState<string[]>(startWarenkorb);
  const [aktiveKat, setAktiveKat] = useState<Kategorie>("fruechte-gemuese");
  const [status, setStatus] = useState<Status>("shop");
  const [cartOpen, setCartOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const produktById = useMemo(
    () => Object.fromEntries(PRODUKTE.map((p) => [p.id, p])) as Record<string, Produkt>,
    [],
  );

  const warenkorbProdukte = warenkorb.map((id) => produktById[id]).filter(Boolean);
  const total = warenkorbProdukte.reduce((s, p) => s + p.preis, 0);

  const kategorieProdukte = PRODUKTE.filter((p) => p.kategorie === aktiveKat);

  const inKorb = (id: string) => warenkorb.includes(id);

  const hinzufuegen = (id: string) => {
    if (!warenkorb.includes(id)) setWarenkorb([...warenkorb, id]);
  };
  const entfernen = (id: string) => {
    setWarenkorb(warenkorb.filter((x) => x !== id));
  };

  const pruefen = () => {
    const schlechteImKorb = warenkorbProdukte.filter((p) => p.bewertung === "schlecht");
    const abgedeckt = new Set(
      warenkorbProdukte.map((p) => p.zutat).filter(Boolean) as string[],
    );
    const fehlend = REZEPT_ZUTATEN_KEYS.filter((z) => !abgedeckt.has(z));

    if (schlechteImKorb.length === 0 && fehlend.length === 0) {
      setStatus("erfolg");
      setCartOpen(false);
      setTimeout(onErfolg, 1200);
    }
    // Bei Fehler: keine Hinweise anzeigen — Schüler:innen sollen selbst herausfinden.
  };

  return (
    <div className="rounded-sm border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-paper-deep/40 px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-xl sm:text-2xl">🌿</span>
          <div className="min-w-0">
            <p className="truncate font-serif text-base font-bold leading-tight sm:text-lg">
              Grüner Markt
            </p>
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              Nachhaltig einkaufen · CH
            </p>
          </div>
        </div>
      </div>

      {/* Rezept-Akkordeon */}
      <details className="border-b border-border bg-paper-deep/20 px-3 py-2 sm:px-5">
        <summary className="cursor-pointer font-mono-typed text-[11px] uppercase tracking-wider text-stamp">
          📝 Rezept · {REZEPT.titel}
        </summary>
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {REZEPT.zutaten.map((z) => (
            <li key={z}>• {z}</li>
          ))}
        </ul>
      </details>

      {/* Kategorien — horizontal scroll auf mobile */}
      <div className="border-b border-border bg-paper px-3 py-2 sm:px-5">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {KATEGORIEN.map((k) => (
            <button
              key={k.id}
              onClick={() => setAktiveKat(k.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono-typed text-xs transition-colors",
                aktiveKat === k.id
                  ? "border-ink bg-ink text-paper"
                  : "border-border bg-paper hover:bg-secondary",
              )}
            >
              <span>{k.emoji}</span>
              <span className="whitespace-nowrap">{k.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Produkt-Grid */}
      <div className="px-3 py-3 pb-24 sm:px-5 sm:pb-5">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {kategorieProdukte.map((p) => (
            <ProduktKarte
              key={p.id}
              produkt={p}
              imKorb={inKorb(p.id)}
              onAdd={() => hinzufuegen(p.id)}
              onRemove={() => entfernen(p.id)}
              onInfo={() => setDetailId(p.id)}
            />
          ))}
        </div>
      </div>

      {/* Sticky Cart Bar (mobile-first) */}
      <div className="sticky bottom-0 z-20 border-t border-border bg-paper/95 px-3 py-2.5 backdrop-blur sm:px-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCartOpen((v) => !v)}
            className="flex flex-1 items-center justify-between gap-2 rounded-sm border border-border bg-card px-3 py-2 text-left"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">🛒</span>
              <span className="font-mono-typed text-xs">
                {warenkorb.length} Artikel
              </span>
            </span>
            <span className="font-mono-typed text-sm font-bold">
              CHF {total.toFixed(2)}
            </span>
          </button>
          <button
            onClick={pruefen}
            disabled={status === "erfolg"}
            className="rounded-sm bg-primary px-4 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
          >
            Bezahlen
          </button>
        </div>

        {status === "erfolg" && (
          <div className="mt-2 rounded-sm border border-emerald-700/40 bg-emerald-700/5 p-3 text-xs">
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-emerald-800">
              ✓ Einkauf nachhaltig abgeschlossen
            </p>
            <p className="mt-1 text-foreground/80">
              Maya wäre stolz. Lade nun den fachlichen Input …
            </p>
          </div>
        )}
      </div>

      {/* Bottom-Sheet Warenkorb */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setCartOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 max-h-[80vh] rounded-t-lg border-t border-border bg-paper shadow-2xl transition-transform duration-300",
          cartOpen ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!cartOpen}
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
              Warenkorb
            </p>
            <h4 className="font-serif text-lg font-bold">Dein Einkauf</h4>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Warenkorb schließen"
            className="rounded p-1.5 text-muted-foreground hover:bg-secondary"
          >
            ✕
          </button>
        </div>
        <ul className="max-h-[50vh] space-y-2 overflow-y-auto px-4 pb-3">
          {warenkorbProdukte.map((p) => (
            <li
              key={p.id}
              className="flex items-start justify-between gap-2 rounded-sm border border-border/60 bg-card p-2 text-xs"
            >
              <div className="min-w-0">
                <p className="font-medium leading-tight">
                  {p.emoji} {p.name}
                </p>
                <p className="text-muted-foreground">CHF {p.preis.toFixed(2)}</p>
              </div>
              <button
                onClick={() => entfernen(p.id)}
                aria-label={`${p.name} entfernen`}
                className="rounded p-1 text-muted-foreground hover:bg-stamp/10 hover:text-stamp"
              >
                ✕
              </button>
            </li>
          ))}
          {warenkorbProdukte.length === 0 && (
            <li className="py-6 text-center text-xs text-muted-foreground">
              Korb ist leer.
            </li>
          )}
        </ul>
        <div className="flex items-center justify-between border-t border-dashed border-border px-4 py-3 font-mono-typed text-sm">
          <span>Total</span>
          <span className="font-bold">CHF {total.toFixed(2)}</span>
        </div>
      </aside>
    </div>
  );
}

function ProduktKarte({
  produkt,
  imKorb,
  onAdd,
  onRemove,
}: {
  produkt: Produkt;
  imKorb: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-sm border bg-paper p-2.5 text-sm transition-colors sm:p-3",
        imKorb ? "border-ink/60 bg-paper-deep/40" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-2xl sm:text-3xl" aria-hidden>
          {produkt.emoji}
        </span>
        <span className="font-mono-typed text-[11px] sm:text-xs">
          CHF {produkt.preis.toFixed(2)}
        </span>
      </div>
      <p className="mt-1.5 text-xs font-medium leading-tight sm:text-sm">
        {produkt.name}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {produkt.siegel.map((s) => (
          <span
            key={s}
            className="rounded-full border border-border bg-card px-1.5 py-0.5 text-[9px] font-mono-typed sm:text-[10px]"
          >
            {s}
          </span>
        ))}
        {produkt.saison === "in" && (
          <span className="rounded-full bg-emerald-700/10 px-1.5 py-0.5 text-[9px] font-mono-typed text-emerald-800 sm:text-[10px]">
            Saison
          </span>
        )}
      </div>
      <button
        onClick={imKorb ? onRemove : onAdd}
        className={cn(
          "mt-2 rounded-sm py-1.5 text-[11px] font-semibold transition-colors sm:text-xs",
          imKorb
            ? "border border-stamp/40 bg-stamp/5 text-stamp hover:bg-stamp/10"
            : "bg-ink text-paper hover:bg-ink/90",
        )}
      >
        {imKorb ? "− Entfernen" : "+ In den Korb"}
      </button>
    </div>
  );
}
