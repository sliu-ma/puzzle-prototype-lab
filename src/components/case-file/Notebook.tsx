import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BookOpen, ChevronLeft, ChevronRight, Lock, PenLine } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PaperCard } from "./PaperCard";
import { getFactCards } from "@/lib/fact-cards";
import {
  getUnlockedStages, getNotes, setNotes, NOTEBOOK_EVENT, STAGE_NAMES,
} from "@/lib/notebook";
import { hasSeenBriefing } from "@/lib/progress";

const HINT_KEY = "maya-notebook-hint";

const HIDDEN = ["/lehrer", "/anleitung"];
const ROT = [-1.6, 1.2, -0.8];
const TAPES = ["top-left", "top-right", "top"] as const;

/** Liniertes Papier mit roter Randlinie, wie in einem Schulheft. */
const PAGE_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, transparent 27px, color-mix(in oklab, var(--stamp) 45%, transparent) 27px, color-mix(in oklab, var(--stamp) 45%, transparent) 28px, transparent 28px), repeating-linear-gradient(to bottom, transparent 0, transparent 27px, color-mix(in oklab, var(--ink) 10%, transparent) 27px, color-mix(in oklab, var(--ink) 10%, transparent) 28px)",
};

export function Notebook() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState<number[]>([]);
  const [notes, setNotesState] = useState("");
  const [page, setPage] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [hint, setHint] = useState(false);
  // Das Notizbuch gibt es erst, sobald die Ermittlung läuft (Briefing done).
  const [started, setStarted] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  // 1 = Gesammelte Faktenkarten, 0 = Eigene Notizen
  const PAGES = [1, 0];
  const stages = unlocked.filter((n) => n >= 1 && n <= 5).sort((a, b) => a - b);

  useEffect(() => {
    const sync = () => { setUnlocked(getUnlockedStages()); setNotesState(getNotes()); setStarted(hasSeenBriefing()); };
    sync();
    try { setHint(localStorage.getItem(HINT_KEY) === "pending"); } catch { /* ignore */ }
    const onHint = () => { setHint(true); setPulse(true); window.setTimeout(() => setPulse(false), 6000); };
    window.addEventListener("maya-notebook-received", onHint);
    const onNew = (e: Event) => {
      sync();
      const s = (e as CustomEvent<{ newStage: number }>).detail?.newStage;
      if (s) {
        setPulse(true);
        toast(`3 Faktenkarten zu ${STAGE_NAMES[s]} in Jakobs Notizbuch eingeklebt`);
        window.setTimeout(() => setPulse(false), 4000);
      }
    };
    window.addEventListener(NOTEBOOK_EVENT, onNew);
    window.addEventListener("maya-progress", sync);
    return () => {
      window.removeEventListener(NOTEBOOK_EVENT, onNew);
      window.removeEventListener("maya-progress", sync);
      window.removeEventListener("maya-notebook-received", onHint);
    };
  }, []);

  const goTo = (i: number, smooth = true) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    setPage(i);
  };

  const openBook = () => {
    setUnlocked(getUnlockedStages());
    const last = getUnlockedStages().at(-1);
    void last;
    const start = 0;
    setPage(start);
    setOpen(true);
    if (hint) { setHint(false); try { localStorage.setItem(HINT_KEY, "seen"); } catch { /* ignore */ } }
    window.setTimeout(() => goTo(start, false), 30);
  };

  if (!started || HIDDEN.some((p) => pathname.startsWith(p))) return null;

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== page) setPage(i);
  };

  return (
    <>
      <span className="relative inline-flex">
      <button
        type="button"
        onClick={openBook}
        aria-label="Jakobs Notizbuch öffnen"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-md backdrop-blur",
          pulse && "animate-pulse ring-2 ring-stamp",
        )}
      >
        <BookOpen className="h-4 w-4" />
      </button>
      {hint && !open && (
        <span className="absolute right-0 top-11 z-50 w-48 rounded-sm border border-ink/20 bg-paper px-3 py-2 text-left font-serif text-xs italic leading-snug text-ink shadow-lg">
          Jakobs Notizbuch ist hier.
        </span>
      )}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 bg-kraft p-0 sm:h-[90dvh] sm:max-w-xl sm:rounded-md sm:border">
          {/* Einband */}
          <div className="px-4 pb-2 pt-4 pr-12">
            <DialogTitle className="font-serif text-lg text-ink">Jakobs Notizbuch</DialogTitle>
            <DialogDescription className="font-mono-typed text-[10px] uppercase tracking-wider text-ink/70">
              {unlocked.length * 3} / 15 Faktenkarten eingeklebt
            </DialogDescription>
          </div>

          {/* Register-Reiter */}
          <div className="flex gap-1 px-3">
            {PAGES.map((s, i) => {
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => goTo(i)}
                  
                  className={cn(
                    "min-h-9 flex-1 rounded-t-md border border-b-0 border-ink/15 font-mono-typed text-[11px] uppercase tracking-wider transition-transform",
                    i === page ? "translate-y-0 bg-paper text-ink" : "translate-y-1 bg-paper-deep text-ink/60",
                  )}
                >
                  {s === 0 ? <span className="inline-flex items-center gap-1"><PenLine className="h-3.5 w-3.5" /> Eigene Notizen</span> : "Faktenkarten"}
                </button>
              );
            })}
          </div>

          {/* Seiten */}
          <div
            ref={scroller}
            onScroll={onScroll}
            className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden bg-paper shadow-inner [scrollbar-width:none]"
          >
            {PAGES.map((s) => (
              <section
                key={s}
                className="h-full w-full shrink-0 snap-start overflow-y-auto pb-10 pl-10 pr-4 pt-5"
                style={PAGE_STYLE}
              >
                {s === 0 ? (
                  <NotesPage notes={notes} onChange={(v) => { setNotesState(v); setNotes(v); }} />
                ) : (
                  <div>
                    <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">{stages.length * 3} / 15 eingeklebt</p>
                    <h3 className="mb-5 font-serif text-2xl font-semibold italic text-ink">Deine gesammelten Faktenkarten</h3>
                    {stages.length === 0 ? (
                      <p className="flex items-center gap-2 font-serif text-sm italic text-ink/60"><Lock className="h-4 w-4" /> Nach jeder erfolgreich gelösten Etappe, erscheinen die neuen Faktenkarten hier.{"\u00a0"}</p>
                    ) : (
                      <div className="space-y-10">{stages.map((n) => <StagePage key={n} stage={n} unlocked />)}</div>
                    )}
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Blättern */}
          <div className="flex items-center justify-between bg-kraft px-3 py-2">
            <button type="button" disabled={page === 0} onClick={() => goTo(page - 1)} aria-label="Vorherige Seite" className="flex h-10 w-10 items-center justify-center rounded-full text-ink disabled:opacity-30">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-mono-typed text-[11px] uppercase tracking-wider text-ink/80">
              Seite {page + 1} / {PAGES.length}
            </span>
            <button type="button" disabled={page === PAGES.length - 1} onClick={() => goTo(page + 1)} aria-label="Nächste Seite" className="flex h-10 w-10 items-center justify-center rounded-full text-ink disabled:opacity-30">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StagePage({ stage, unlocked }: { stage: number; unlocked: boolean }) {
  const cards = unlocked ? getFactCards(stage) : [];
  return (
    <div className="relative">
      <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">Etappe {stage}</p>
      <h3 className="mb-5 font-serif text-2xl font-semibold italic text-ink">{STAGE_NAMES[stage]}</h3>
      {unlocked ? (
        <div className="space-y-7">
          {cards.map((c, i) => (
            <PaperCard key={i} rotate={ROT[i % 3]} tape={TAPES[i % 3]} className="p-4">
              <div className={cn("flex flex-col gap-3", c.visualFirst && "flex-col-reverse")}>
                <div>
                  <p className="font-serif text-base font-semibold text-ink">{c.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/85">{c.body}</p>
                </div>
                {c.visual && <div className="w-full">{c.visual}</div>}
              </div>
            </PaperCard>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-sm border-2 border-dashed border-ink/20" style={{ transform: `rotate(${ROT[i]}deg)` }} />
          ))}
          <p className="flex items-center justify-center gap-2 pt-2 text-center font-serif text-sm italic text-ink/60">
            <Lock className="h-4 w-4" /> Prüffragen bestehen, um einzukleben.
          </p>
        </div>
      )}
    </div>
  );
}

function NotesPage({ notes, onChange }: { notes: string; onChange: (v: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">Eure Seite</p>
      <h3 className="mb-1 font-serif text-2xl font-semibold italic text-ink">Eigene Notizen</h3>
      <p className="mb-2 font-mono-typed text-[10px] uppercase tracking-wider text-ink/50">Wird automatisch gespeichert</p>
      <PaperCard rotate={-1.6} tape="top-left" className="mb-4 mt-4 p-3">
        <p className="font-mono-typed text-[13px] leading-snug text-ink/85">
          Hier ist Platz für eure eigenen Notizen.
          Meine Faktenkarten sind weiter hinten eingeklebt.
        </p>
        <p className="mt-1 text-right font-mono-typed text-[12px] text-stamp">– J.</p>
      </PaperCard>
      <textarea
        value={notes}
        maxLength={5000}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Zahlen, Codes, Argumente fürs Hearing …"
        className="min-h-[60dvh] w-full flex-1 resize-none border-0 bg-transparent p-0 font-serif text-[16px] leading-7 text-ink placeholder:text-ink/40 focus:outline-none"
      />
    </div>
  );
}

