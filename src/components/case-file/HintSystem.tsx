import { useEffect, useState } from "react";
import { Lock, Lightbulb, Clock, KeyRound, Sparkles } from "lucide-react";
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
const INTRO_STORAGE_KEY = "akte-003-hints-start";
const INTRO_FLAG_KEY = "akte-003-hints-intro-shown";

export const HINT_STORAGE_KEYS = [
  "akte-001-hints-start",
  "akte-002-hints-start",
  "akte-003-hints-start",
  "akte-004-hints-start",
  "akte-005-hints-start",
] as const;

function revealedKey(storageKey: string) {
  return `${storageKey}-revealed`;
}

function readRevealed(storageKey: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(revealedKey(storageKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

export function getTotalRevealedHints(): number {
  if (typeof window === "undefined") return 0;
  return HINT_STORAGE_KEYS.reduce((sum, k) => sum + readRevealed(k).length, 0);
}

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
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [showIntro, setShowIntro] = useState(false);

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
    setRevealed(new Set(readRevealed(STORAGE_KEY)));
  }, [STORAGE_KEY]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 5000);
    return () => window.clearInterval(t);
  }, []);

  // Einmaliges Intro-Pop-up, sobald Tipp 1 (nach 3 Min) freigeschaltet ist.
  const elapsedMinForIntro = startedAt ? (now - startedAt) / 60000 : 0;
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (STORAGE_KEY !== INTRO_STORAGE_KEY) return;
    if (!startedAt) return;
    if (elapsedMinForIntro < 3) return;
    if (revealed.has(0)) return;
    if (window.localStorage.getItem(INTRO_FLAG_KEY)) return;
    setShowIntro(true);
  }, [STORAGE_KEY, startedAt, elapsedMinForIntro, revealed]);

  const dismissIntro = () => {
    try {
      window.localStorage.setItem(INTRO_FLAG_KEY, "1");
    } catch {
      /* ignore */
    }
    setShowIntro(false);
  };

  const elapsedMin = startedAt ? (now - startedAt) / 60000 : 0;
  const unlockedCount = HINTS.filter((h) => elapsedMin >= h.unlockMin).length;
  const nextHint = HINTS.find((h) => elapsedMin < h.unlockMin);
  const minutesToNext = nextHint ? Math.max(0, Math.ceil(nextHint.unlockMin - elapsedMin)) : null;

  const activeHint = HINTS[activeId];
  const activeUnlocked = elapsedMin >= activeHint.unlockMin;
  const activeRevealed = revealed.has(activeHint.id);
  const prevHint = activeId > 0 ? HINTS[activeId - 1] : null;
  const canRevealActive = !prevHint || revealed.has(prevHint.id);

  const reveal = (id: number) => {
    const idx = HINTS.findIndex((h) => h.id === id);
    if (idx < 0) return;
    // Vorgänger müssen aufgedeckt sein
    for (let i = 0; i < idx; i++) {
      if (!revealed.has(HINTS[i].id)) return;
    }
    setRevealed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        window.localStorage.setItem(revealedKey(STORAGE_KEY), JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  };


  const openPanel = () => {
    const unlocked = HINTS.filter((h) => elapsedMin >= h.unlockMin);
    const revealedSet = revealed;
    // Erster aufdeckbarer, noch nicht aufgedeckter Hinweis (Vorgänger aufgedeckt).
    const firstRevealable = unlocked.find((h, i) => {
      if (revealedSet.has(h.id)) return false;
      const idx = HINTS.findIndex((x) => x.id === h.id);
      for (let j = 0; j < idx; j++) {
        if (!revealedSet.has(HINTS[j].id)) return false;
      }
      return true;
    });
    if (firstRevealable) {
      setActiveId(firstRevealable.id);
    } else if (unlocked.length > 0) {
      setActiveId(unlocked[unlocked.length - 1].id);
    }
    setOpen(true);
  };


  return (
    <>
      {/* Intro-Pop-up (einmalig, nach 3 Min bei Akte 001) */}
      {showIntro && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={dismissIntro}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Hinweise erklärt"
            className="fixed left-1/2 top-1/2 z-[70] w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-paper p-5 shadow-2xl"
          >
            <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
              Unterstützung freigeschaltet
            </p>
            <h3 className="mt-1 font-serif text-xl font-bold leading-snug">
              Du brauchst Hilfe? Maya hat Hinweise für dich.
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/85">
              <li>
                Unten rechts findest du den Button{" "}
                <span className="font-semibold">💡 Tipps</span>.
              </li>
              <li>
                Nach <strong>3 Minuten</strong> gibt es Tipp 1, nach{" "}
                <strong>6 Minuten</strong> Tipp 2 und nach{" "}
                <strong>9 Minuten</strong> die Auflösung.
              </li>
              <li>
                Du entscheidest selbst, ob du sie anschaust — klicke auf das
                Schloss, um einen Hinweis aufzudecken.
              </li>
            </ul>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={dismissIntro}
                className="rounded-sm border border-border bg-paper px-4 py-2 font-mono-typed text-[11px] uppercase tracking-wider text-foreground/80 transition-colors hover:bg-secondary"
              >
                Alles klar
              </button>
              <button
                onClick={() => {
                  dismissIntro();
                  openPanel();
                }}
                className="rounded-sm bg-stamp px-4 py-2 font-mono-typed text-[11px] uppercase tracking-wider text-paper transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Tipps jetzt öffnen
              </button>
            </div>
          </div>
        </>
      )}


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
                const isRevealed = revealed.has(h.id);
                const isActive = activeId === h.id;
                const icon = !unlocked ? "🔒" : "🔓";
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
                    <span className="block">{icon}</span>
                    <span className="block">{h.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Inhalt */}
            <div className="px-4 py-4">
              {!activeUnlocked ? (
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
              ) : !activeRevealed ? (
                canRevealActive ? (
                  <div className="rounded-sm border border-dashed border-stamp/40 bg-stamp/5 p-5 text-center">
                    <button
                      onClick={() => reveal(activeHint.id)}
                      aria-label={`${activeHint.label} aufdecken`}
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-stamp/60 bg-paper text-stamp shadow-md transition-all hover:-translate-y-0.5 hover:bg-stamp hover:text-paper hover:shadow-lg"
                    >
                      <Lock className="h-7 w-7" />
                    </button>
                    <p className="mt-3 font-serif text-[15px] leading-relaxed text-foreground/85">
                      Du kannst dir {activeHint.label} anschauen. Klicke auf das
                      Schloss.
                    </p>
                    <button
                      onClick={() => reveal(activeHint.id)}
                      className="mt-4 rounded-sm bg-stamp px-4 py-2 font-mono-typed text-[11px] uppercase tracking-wider text-paper transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      Hinweis aufdecken
                    </button>
                  </div>
                ) : (
                  <div className="rounded-sm border border-dashed border-border bg-paper-deep/30 p-5 text-center">
                    <p className="text-2xl">🔒</p>
                    <p className="mt-2 font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground">
                      Reihenfolge beachten
                    </p>
                    <p className="mt-1 text-sm text-foreground/70">
                      Decke zuerst {prevHint?.label} auf, bevor du{" "}
                      {activeHint.label} anschauen kannst.
                    </p>
                  </div>
                )

              ) : (
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
