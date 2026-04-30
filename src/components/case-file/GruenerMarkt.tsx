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

type Status = "shop" | "fehler" | "erfolg";

export function GruenerMarkt({ startWarenkorb, onErfolg }: GruenerMarktProps) {
  const [warenkorb, setWarenkorb] = useState<string[]>(startWarenkorb);
  const [aktiveKat, setAktiveKat] = useState<Kategorie>("fruechte-gemuese");
  const [status, setStatus] = useState<Status>("shop");
  const [feedback, setFeedback] = useState<string[]>([]);

  const produktById = useMemo(
    () => Object.fromEntries(PRODUKTE.map((p) => [p.id, p])) as Record<string, Produkt>,
    [],
  );

  const warenkorbProdukte = warenkorb.map((id) => produktById[id]).filter(Boolean);
  const total = warenkorbProdukte.reduce((s, p) => s + p.preis, 0);

  const kategorieProdukte = PRODUKTE.filter((p) => p.kategorie === aktiveKat);

  const anzahlProKat = (k: Kategorie) =>
    PRODUKTE.filter((p) => p.kategorie === k).length;

  const inKorb = (id: string) => warenkorb.includes(id);

  const hinzufuegen = (id: string) => {
    if (!warenkorb.includes(id)) setWarenkorb([...warenkorb, id]);
  };
  const entfernen = (id: string) => {
    setWarenkorb(warenkorb.filter((x) => x !== id));
  };

  const pruefen = () => {
    const probleme: string[] = [];
    const schlechteImKorb = warenkorbProdukte.filter((p) => p.bewertung === "schlecht");
    schlechteImKorb.forEach((p) => {
      probleme.push(`„${p.name}" ist problematisch: ${p.problemHinweis}`);
    });

    // Rezept-Abdeckung
    const abgedeckt = new Set(
      warenkorbProdukte.map((p) => p.zutat).filter(Boolean) as string[],
    );
    const fehlend = REZEPT_ZUTATEN_KEYS.filter((z) => !abgedeckt.has(z));
    fehlend.forEach((z) => {
      probleme.push(`Für das Rezept fehlt noch eine Zutat: ${z}.`);
    });

    if (probleme.length === 0) {
      setStatus("erfolg");
      setFeedback([]);
      setTimeout(onErfolg, 1200);
    } else {
      setStatus("fehler");
      setFeedback(probleme);
    }
  };

  return (
    <div className="rounded-sm border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-paper-deep/40 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <div>
            <p className="font-serif text-lg font-bold leading-none">Grüner Markt</p>
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
              Nachhaltig einkaufen lernen · CH
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-paper">
          🛒
          <span className="font-mono-typed text-sm">
            {warenkorb.length} · CHF {total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-[1fr_320px]">
        {/* Linke Seite: Kategorien + Produkte */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {KATEGORIEN.map((k) => (
              <button
                key={k.id}
                onClick={() => setAktiveKat(k.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono-typed text-xs transition-colors",
                  aktiveKat === k.id
                    ? "border-ink bg-ink text-paper"
                    : "border-border bg-paper hover:bg-secondary",
                )}
              >
                <span>{k.emoji}</span>
                {k.label}
                <span className="opacity-60">({anzahlProKat(k.id)})</span>
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {kategorieProdukte.map((p) => (
              <ProduktKarte
                key={p.id}
                produkt={p}
                imKorb={inKorb(p.id)}
                onAdd={() => hinzufuegen(p.id)}
                onRemove={() => entfernen(p.id)}
              />
            ))}
            {kategorieProdukte.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                Keine Produkte in dieser Kategorie.
              </p>
            )}
          </div>
        </div>

        {/* Rechte Seite: Warenkorb */}
        <aside className="rounded-sm border border-border bg-paper p-4">
          <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
            Warenkorb
          </p>
          <h4 className="mt-1 font-serif text-lg font-bold">Dein Einkauf</h4>

          <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
            {warenkorbProdukte.map((p) => (
              <li
                key={p.id}
                className="flex items-start justify-between gap-2 rounded-sm border border-border/60 bg-card p-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-medium leading-tight">
                    {p.emoji} {p.name}
                  </p>
                  <p className="text-muted-foreground">
                    {p.herkunft} · CHF {p.preis.toFixed(2)}
                  </p>
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
              <li className="py-4 text-center text-xs text-muted-foreground">
                Korb ist leer.
              </li>
            )}
          </ul>

          <div className="mt-3 flex items-center justify-between border-t border-dashed border-border pt-3 font-mono-typed text-sm">
            <span>Total</span>
            <span className="font-bold">CHF {total.toFixed(2)}</span>
          </div>

          <button
            onClick={pruefen}
            disabled={status === "erfolg"}
            className="mt-3 w-full rounded-sm bg-primary py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
          >
            Bezahlen
          </button>

          {status === "fehler" && (
            <div className="mt-3 rounded-sm border border-stamp/40 bg-stamp/5 p-3 text-xs">
              <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                ✗ Noch nicht bereit
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-foreground/80">
                {feedback.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {status === "erfolg" && (
            <div className="mt-3 rounded-sm border border-emerald-700/40 bg-emerald-700/5 p-3 text-xs">
              <p className="font-mono-typed text-[10px] uppercase tracking-wider text-emerald-800">
                ✓ Einkauf nachhaltig abgeschlossen
              </p>
              <p className="mt-1 text-foreground/80">
                Maya wäre stolz. Lade nun den fachlichen Input …
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Rezept-Sticky-Karte unten */}
      <div className="border-t border-border bg-paper-deep/30 px-5 py-3">
        <details>
          <summary className="cursor-pointer font-mono-typed text-xs uppercase tracking-wider text-stamp">
            📝 Rezept anzeigen ({REZEPT.titel})
          </summary>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
            {REZEPT.zutaten.map((z) => (
              <li key={z}>• {z}</li>
            ))}
          </ul>
        </details>
      </div>
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
        "flex flex-col rounded-sm border bg-paper p-3 text-sm transition-colors",
        imKorb ? "border-ink/60 bg-paper-deep/40" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl" aria-hidden>
          {produkt.emoji}
        </span>
        <span className="font-mono-typed text-xs">CHF {produkt.preis.toFixed(2)}</span>
      </div>
      <p className="mt-2 font-medium leading-tight">{produkt.name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{produkt.herkunft}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {produkt.siegel.map((s) => (
          <span
            key={s}
            className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-mono-typed"
          >
            {s}
          </span>
        ))}
        {produkt.saison === "in" && (
          <span className="rounded-full bg-emerald-700/10 px-2 py-0.5 text-[10px] font-mono-typed text-emerald-800">
            Saison
          </span>
        )}
      </div>
      <button
        onClick={imKorb ? onRemove : onAdd}
        className={cn(
          "mt-3 rounded-sm py-1.5 text-xs font-semibold transition-colors",
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
