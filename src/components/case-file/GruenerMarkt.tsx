import { useEffect, useMemo, useRef, useState } from "react";
import { usePersistentState } from "@/lib/persist";

import { cn } from "@/lib/utils";
import {
  KATEGORIEN,
  PRODUKTE,
  REZEPT,
  REZEPT_ZUTATEN_KEYS,
  SIEGEL,
  type Kategorie,
  type Produkt,
} from "@/lib/maya-data";
import { ProduktDetailDialog } from "./ProduktDetailDialog";

import { MarketTutorial, type TutorialStep } from "./MarketTutorial";

interface GruenerMarktProps {
  startWarenkorb: string[];
  onErfolg: () => void;
}

type Status = "shop" | "erfolg";

export function GruenerMarkt({ startWarenkorb, onErfolg }: GruenerMarktProps) {
  const [warenkorb, setWarenkorb] = usePersistentState<string[]>(
    "akte-2-warenkorb",
    startWarenkorb,
  );
  const [aktiveKat, setAktiveKat] = useState<Kategorie>("milch-eier");
  const [status, setStatus] = usePersistentState<Status>("akte-2-shop-status", "shop");
  const [hadFail, setHadFail] = usePersistentState<boolean>("akte-2-had-fail", false);

  const [cartOpen, setCartOpen] = useState(false);
  const [detail, setDetail] = useState<Produkt | null>(null);
  const [feedback, setFeedback] = useState<boolean>(false);

  const [tutorialSeen, setTutorialSeen] = usePersistentState<boolean>(
    "akte-2-tutorial-seen",
    false,
  );
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const kategorienRef = useRef<HTMLDivElement>(null);
  const produktRef = useRef<HTMLDivElement>(null);
  const cartBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tutorialSeen) return;
    const t = window.setTimeout(() => setTutorialOpen(true), 250);
    return () => window.clearTimeout(t);
  }, [tutorialSeen]);

  const tutorialSteps: TutorialStep[] = [
    {
      targetRef: kategorienRef,
      text: "Wechsle hier zwischen den Produktgruppen.",
      placement: "below",
    },
    {
      targetRef: produktRef,
      text: "Tippe auf ein Produkt, um Herkunft, Labels und die Nachhaltigkeits-Bewertung zu sehen.",
      placement: "below",
    },
    {
      targetRef: cartBarRef,
      text: "Hier siehst du deinen Warenkorb. Tippe darauf, um alle Artikel im Detail zu prüfen.",
      placement: "above",
    },
  ];

  const closeTutorial = () => {
    setTutorialOpen(false);
    setTutorialSeen(true);
  };

  const produktById = useMemo(
    () => Object.fromEntries(PRODUKTE.map((p) => [p.id, p])) as Record<string, Produkt>,
    [],
  );

  const warenkorbProdukte = warenkorb.map((id) => produktById[id]).filter(Boolean);
  const total = warenkorbProdukte.reduce((s, p) => s + p.preis, 0);

  const kategorieProdukte = PRODUKTE.filter((p) => p.kategorie === aktiveKat)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "de"));

  const inKorb = (id: string) => warenkorb.includes(id);

  const hinzufuegen = (id: string) => {
    setFeedback(false);
    if (!warenkorb.includes(id)) setWarenkorb([...warenkorb, id]);
  };
  const entfernen = (id: string) => {
    setFeedback(false);
    setWarenkorb(warenkorb.filter((x) => x !== id));
  };

  const pruefen = () => {
    const schlechteImKorb = warenkorbProdukte.filter((p) => p.bewertung === "schlecht");
    const abgedeckt = new Set(
      warenkorbProdukte.map((p) => p.zutat).filter(Boolean) as string[],
    );
    const fehlend = REZEPT_ZUTATEN_KEYS.filter((z) => !abgedeckt.has(z));

    if (fehlend.length > 0 || schlechteImKorb.length > 0) {
      setFeedback(true);
      setHadFail(true);
      return;
    }
    setFeedback(false);
    // Badge wird erst am Ende der Etappe vergeben, damit die "Gelöst"-Animation
    // nicht mit der Badge-Animation kollidiert. Wir merken uns nur die Berechtigung.
    if (!hadFail) {
      try {
        localStorage.setItem("akte-2-perfect-eligible", "1");
      } catch {}
    }
    setStatus("erfolg");
    setCartOpen(false);
    setTimeout(onErfolg, 1200);
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
        <button
          onClick={() => setTutorialOpen(true)}
          aria-label="Tutorial anzeigen"
          className="shrink-0 rounded-full border border-border bg-paper px-2 py-1 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground hover:bg-secondary"
        >
          ? Hilfe
        </button>
      </div>

      {/* Rezept-Akkordeon */}
      <details open className="border-b border-border bg-paper-deep/20 px-3 py-2 sm:px-5">
        <summary className="cursor-pointer font-mono-typed text-[11px] uppercase tracking-wider text-stamp">
          Rezept · {REZEPT.titel}
        </summary>
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {REZEPT.zutaten.map((z) => (
            <li key={z}>• {z}</li>
          ))}
        </ul>
      </details>

      {/* Kategorien */}
      <div ref={kategorienRef} className="border-b border-border bg-paper px-3 py-2 sm:px-5">
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
          {kategorieProdukte.map((p, idx) => (
            <div key={p.id} ref={idx === 0 ? produktRef : undefined}>
              <ProduktKarte
                produkt={p}
                imKorb={inKorb(p.id)}
                onAdd={() => hinzufuegen(p.id)}
                onRemove={() => entfernen(p.id)}
                onOpenDetail={() => setDetail(p)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Cart Bar */}
      <div ref={cartBarRef} className="sticky bottom-0 z-20 border-t border-border bg-paper/95 px-3 py-2.5 backdrop-blur sm:px-5">
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
              ✓ Ping! Die Kasse springt an, Einkauf nachhaltig abgeschlossen.
            </p>
          </div>
        )}

        {status !== "erfolg" && feedback && (
          <div className="mt-2 rounded-sm border border-stamp/40 bg-stamp/5 p-3 text-xs">
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
              Die Kasse springt nicht an. Schau dich nochmal um.
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
              <div className="flex min-w-0 items-center gap-2">
                {p.bildUrl ? (
                  <img src={p.bildUrl} alt="" className="h-8 w-8 shrink-0 rounded-sm object-contain" />
                ) : (
                  <span className="text-lg" aria-hidden>{p.emoji}</span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium leading-tight">{p.name}</p>
                  <p className="text-muted-foreground">CHF {p.preis.toFixed(2)}</p>
                </div>
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

      <ProduktDetailDialog
        produkt={detail}
        onOpenChange={(open) => !open && setDetail(null)}
      />

      <MarketTutorial
        open={tutorialOpen}
        steps={tutorialSteps}
        onClose={closeTutorial}
      />
    </div>
  );
}

function ProduktKarte({
  produkt,
  imKorb,
  onAdd,
  onRemove,
  onOpenDetail,
}: {
  produkt: Produkt;
  imKorb: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onOpenDetail: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-sm border bg-paper p-2.5 text-sm transition-colors sm:p-3",
        imKorb ? "border-ink/60 bg-paper-deep/40" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={onOpenDetail}
        aria-label={`${produkt.name}, Details anzeigen`}
        className="group flex aspect-square w-full items-center justify-center overflow-hidden rounded-sm border border-border/60 bg-white transition-colors hover:border-ink/40"
      >
        {produkt.bildUrl ? (
          <img
            src={produkt.bildUrl}
            alt={produkt.name}
            className="h-full w-full object-contain p-1.5 transition-transform group-hover:scale-105"
          />
        ) : (
          <span className="text-4xl transition-transform group-hover:scale-110 sm:text-5xl" aria-hidden>
            {produkt.emoji}
          </span>
        )}
      </button>

      <div className="mt-2 flex items-start justify-between gap-1">
        <p className="text-xs font-medium leading-tight sm:text-sm">{produkt.name}</p>
        <span className="shrink-0 font-mono-typed text-[11px] sm:text-xs">
          CHF {produkt.preis.toFixed(2)}
        </span>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {produkt.siegel.map((key) => {
          const info = SIEGEL[key];
          return info.logoUrl ? (
            <img
              key={key}
              src={info.logoUrl}
              alt={info.label}
              title={info.label}
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                const fallback = document.createElement("span");
                fallback.textContent = info.label;
                fallback.className =
                  "rounded-full border border-border bg-card px-1.5 py-0.5 font-mono-typed text-[9px] sm:text-[10px]";
                img.replaceWith(fallback);
              }}
              className="h-7 w-7 rounded-full border border-border bg-white object-contain p-1 sm:h-8 sm:w-8"
            />
          ) : (
            <span
              key={key}
              className="rounded-full border border-border bg-card px-1.5 py-0.5 font-mono-typed text-[9px] sm:text-[10px]"
            >
              {info.label}
            </span>
          );
        })}
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
