import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type Hint = {
  id: number;
  unlockMin: number;
  label: string;
  title: string;
  body: string;
};

const DEFAULT_HINTS: Hint[] = [
  {
    id: 0,
    unlockMin: 3,
    label: "Tipp 1",
    title: "Schau dir den Warenkorb genau an",
    body: "Öffne den Warenkorb. Bei zwei Produkten lohnt sich ein zweiter Blick — woher kommen sie? Wachsen sie hier gerade?",
  },
  {
    id: 1,
    unlockMin: 6,
    label: "Tipp 2",
    title: "Saisonal & regional vs. Import",
    body: "Erdbeeren wachsen in der Schweiz erst ab Mai/Juni. Eier mit „Bodenhaltung“ aus dem Ausland sagen nichts über Auslauf oder kurze Wege. Suche jeweils ein passendes Schweizer Produkt mit Siegel (z. B. Bio Suisse, IP-Suisse).",
  },
  {
    id: 2,
    unlockMin: 9,
    label: "Auflösung",
    title: "So geht's",
    body: "Entferne die Erdbeeren aus Spanien und die Bodenhaltungs-Eier aus dem EU-Import. Lege stattdessen die Schweizer Erdbeeren (IP-Suisse, in Saison) und die Bio-Freiland-Eier aus der Schweiz in den Korb. Dann kannst du bezahlen.",
  },
];

const DEFAULT_STORAGE_KEY = "akte-001-hints-start";

type Props = {
  hints?: Hint[];
  storageKey?: string;
};

export function HintSystem({ hints = DEFAULT_HINTS, storageKey = DEFAULT_STORAGE_KEY }: Props = {}) {
  const HINTS = hints;
  const STORAGE_KEY = storageKey;
  const [now, setNow] = useState(() => Date.now());
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<number>(0);

  // Timer beim ersten Mounten starten (oder aus localStorage wieder aufnehmen)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setStartedAt(parseInt(stored, 10));
    } else {
      const ts = Date.now();
      window.localStorage.setItem(STORAGE_KEY, String(ts));
      setStartedAt(ts);
    }
  }, []);

  // Tick alle 5 s — reicht für Minutengranularität
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 5000);
    return () => window.clearInterval(t);
  }, []);

  const elapsedMin = startedAt ? (now - startedAt) / 60000 : 0;
  const unlockedCount = HINTS.filter((h) => elapsedMin >= h.unlockMin).length;
  const nextHint = HINTS.find((h) => elapsedMin < h.unlockMin);
  const minutesToNext = nextHint ? Math.max(0, Math.ceil(nextHint.unlockMin - elapsedMin)) : null;

  const activeHint = HINTS[activeId];
  const activeUnlocked = elapsedMin >= activeHint.unlockMin;

  // Wenn der aktuell ausgewählte Tipp noch nicht freigeschaltet ist,
  // beim Öffnen automatisch auf den jüngsten freigeschalteten springen.
  const openPanel = () => {
    if (unlockedCount > 0) {
      setActiveId(Math.min(activeId, unlockedCount - 1));
    }
    setOpen(true);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={open ? () => setOpen(false) : openPanel}
        className={cn(
          "fixed bottom-20 right-3 z-40 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 sm:bottom-6 sm:right-6",
          unlockedCount > 0 && "border-stamp/50 bg-stamp/10 text-stamp",
        )}
        aria-label="Tipps anzeigen"
      >
        <span className="text-base">💡</span>
        <span className="font-mono-typed text-xs uppercase tracking-wider">
          Tipps
        </span>
        {unlockedCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stamp px-1.5 text-[10px] font-bold text-paper">
            {unlockedCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-label="Tipp-System"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-lg border-t border-border bg-paper shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md sm:rounded-lg sm:border"
          >
            <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border sm:hidden" />
            <header className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                  Unterstützung
                </p>
                <h3 className="font-serif text-lg font-bold">Mayas Hinweise</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Schließen"
                className="rounded p-1.5 text-muted-foreground hover:bg-secondary"
              >
                ✕
              </button>
            </header>

            {/* Tabs */}
            <div className="flex gap-1.5 border-b border-border px-4 pb-2">
              {HINTS.map((h) => {
                const unlocked = elapsedMin >= h.unlockMin;
                const isActive = activeId === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => unlocked && setActiveId(h.id)}
                    disabled={!unlocked}
                    className={cn(
                      "flex-1 rounded-t-sm border-b-2 px-2 py-2 font-mono-typed text-[10px] uppercase tracking-wider transition-colors",
                      isActive && unlocked
                        ? "border-stamp text-stamp"
                        : "border-transparent text-muted-foreground",
                      !unlocked && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <span className="block">{unlocked ? "🔓" : "🔒"}</span>
                    <span className="block">{h.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Inhalt */}
            <div className="px-4 py-4">
              {activeUnlocked ? (
                <div>
                  <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                    {activeHint.label}
                  </p>
                  <h4 className="mt-1 font-serif text-xl font-bold">
                    {activeHint.title}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                    {activeHint.body}
                  </p>
                </div>
              ) : (
                <div className="rounded-sm border border-dashed border-border bg-paper-deep/30 p-4 text-center">
                  <p className="text-2xl">🔒</p>
                  <p className="mt-2 font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground">
                    Noch gesperrt
                  </p>
                  <p className="mt-1 text-sm text-foreground/70">
                    Versuch's erst selbst — das Spiel ist nicht so schwer, wie
                    es aussieht.
                  </p>
                </div>
              )}

              {nextHint && (
                <p className="mt-4 border-t border-dashed border-border pt-3 text-center font-mono-typed text-[11px] text-muted-foreground">
                  Nächster Hinweis in ca. {minutesToNext} Min.
                </p>
              )}
              {!nextHint && (
                <p className="mt-4 border-t border-dashed border-border pt-3 text-center font-mono-typed text-[11px] text-muted-foreground">
                  Alle Tipps freigeschaltet.
                </p>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
