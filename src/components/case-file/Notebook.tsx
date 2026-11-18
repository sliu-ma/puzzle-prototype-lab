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

const HINT_KEY = "maya-notebook-hint";

const MARGIN: Record<number, string> = {
  1: "Zug statt Flug: 3 kg vs. über 40 kg CO₂ !!",
  2: "Saisontabelle prüfen! Regional schlägt Bio aus Übersee?",
  3: "20 °C reichen. Kurz duschen. → wichtig fürs Hearing",
  4: "Rote Liste beachten! Auch «leicht gefährdet» zählt.",
  5: "Gutachten nachrechnen. Wer hat sie bezahlt??",
};
const QUESTION: Record<number, string> = {
  1: "Hier fehlen mir noch verlässliche Mobilitätsdaten …",
  2: "Was kaufen die Leute im Dorfladen wirklich? Nachfragen!",
  3: "Wie viel Energie verbraucht ein Haushalt? Noch offen.",
  4: "Welche Arten leben auf der Lichtung? Liste unvollständig.",
  5: "Gas, Kohle oder Solar? Zahlen der Gemeinde stimmen nicht …",
};

const HIDDEN = ["/lehrer", "/anleitung"];
const PAGES = [1, 2, 3, 4, 5, 0]; // 0 = Eigene Notizen
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
  const [cover, setCover] = useState<"closed" | "opening" | "open">("closed");
  const [hint, setHint] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => { setUnlocked(getUnlockedStages()); setNotesState(getNotes()); };
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
    const start = last ? PAGES.indexOf(last) : 0;
    setPage(start);
    setCover("closed");
    setOpen(true);
    if (hint) { setHint(false); try { localStorage.setItem(HINT_KEY, "seen"); } catch { /* ignore */ } }
    window.setTimeout(() => goTo(start, false), 30);
  };

  if (HIDDEN.some((p) => pathname.startsWith(p))) return null;

  const openCover = () => {
    setCover("opening");
    window.setTimeout(() => { setCover("open"); goTo(page, false); }, 750);
  };

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
          Jakobs Notizbuch ist jetzt immer hier griffbereit.
        </span>
      )}
      </span>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="[perspective:1600px] flex h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 bg-kraft p-0 sm:h-[90dvh] sm:max-w-xl sm:rounded-md sm:border">
          {cover !== "open" && <Cover opening={cover === "opening"} onOpen={openCover} />}
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
              const has = s === 0 || unlocked.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={s === 0 ? "Eigene Notizen" : `Etappe ${s} ${STAGE_NAMES[s]}`}
                  className={cn(
                    "min-h-9 flex-1 rounded-t-md border border-b-0 border-ink/15 font-mono-typed text-[11px] uppercase tracking-wider transition-transform",
                    i === page ? "translate-y-0 bg-paper text-ink" : "translate-y-1 bg-paper-deep text-ink/60",
                    !has && "opacity-60",
                  )}
                >
                  {s === 0 ? <PenLine className="mx-auto h-3.5 w-3.5" /> : s}
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
                  <StagePage stage={s} unlocked={unlocked.includes(s)} />
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
    <div className="relative" style={{ ["--pen" as string]: "oklch(0.42 0.12 260)" }}>
      {stage === 3 && <CoffeeRing />}
      <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">Etappe {stage}</p>
      <h3 className="mb-1 font-serif text-2xl font-semibold italic text-ink">{STAGE_NAMES[stage]}</h3>
      <Doodle stage={stage} />
      <p className="mb-5 mt-1 -rotate-1 font-serif text-sm italic text-[color:var(--pen)]">{unlocked ? MARGIN[stage] : QUESTION[stage]}</p>
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

function Cover({ opening, onOpen }: { opening: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Notizbuch aufschlagen"
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 overflow-hidden border-l-[10px] border-ink/40 p-8 text-center transition-transform duration-700 ease-in-out [transform-origin:left_center] [backface-visibility:hidden]"
      style={{
        transform: opening ? "rotateY(-105deg)" : "rotateY(0deg)",
        background: "radial-gradient(circle at 30% 20%, color-mix(in oklab, var(--kraft) 85%, white), var(--kraft) 55%, color-mix(in oklab, var(--kraft) 70%, black))",
      }}
    >
      <span aria-hidden className="absolute inset-y-0 left-3 border-l-2 border-dashed border-ink/25" />
      <span aria-hidden className="absolute inset-y-0 right-6 w-3 rounded-sm bg-ink/25 shadow-inner" />
      <span className="font-mono-typed text-[10px] uppercase tracking-[0.3em] text-ink/70">Feldnotizen & Recherchen</span>
      <span className="font-serif text-4xl font-bold italic text-ink">Jakob Keller</span>
      <span className="rounded-sm border-2 border-stamp/70 px-3 py-1 font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp" style={{ transform: "rotate(-4deg)" }}>
        Projekt Lichtung · Vertraulich
      </span>
      <span className="mt-6 rotate-2 bg-paper px-4 py-3 font-serif text-sm italic text-ink shadow-md" style={{ boxShadow: "0 -6px 0 -2px color-mix(in oklab, var(--paper-deep) 80%, transparent) inset" }}>
        Für Maja. Zahlen lügen nicht,<br />wenn man genau hinsieht. – Opa
      </span>
      <span className="mt-6 animate-pulse font-mono-typed text-[10px] uppercase tracking-[0.2em] text-ink/70">Tippen zum Aufschlagen</span>
    </button>
  );
}

function CoffeeRing() {
  return (
    <svg aria-hidden className="pointer-events-none absolute -right-2 top-24 h-24 w-24 opacity-25" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="38" fill="none" stroke="#8a5a2b" strokeWidth="5" strokeDasharray="180 12 40 8" />
      <circle cx="52" cy="49" r="34" fill="none" stroke="#8a5a2b" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

function Doodle({ stage }: { stage: number }) {
  const common = { fill: "none", stroke: "var(--pen)", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const art: Record<number, React.ReactNode> = {
    1: (<g {...common}><path d="M5 30 Q40 10 75 28 T140 22" strokeDasharray="4 4" /><circle cx="5" cy="30" r="3" /><circle cx="75" cy="28" r="3" /><circle cx="140" cy="22" r="3" /><path d="M100 8 l14 4 l-14 4 l3 -4 z" /><path d="M96 4 L120 20 M120 4 L96 20" /></g>),
    2: (<g {...common}><circle cx="22" cy="22" r="12" /><path d="M22 10 q2 -6 7 -7" /><ellipse cx="58" cy="22" rx="9" ry="12" /><path d="M58 10 q1 -4 4 -5" /><path d="M80 30 l10 -10 l10 10" /><text x="104" y="28" fontSize="11" fill="var(--pen)" stroke="none" fontStyle="italic">Sept.?</text></g>),
    3: (<g {...common}><path d="M10 8 h20 l-4 8 h-12 z" /><path d="M14 22 v4 M20 22 v6 M26 22 v4" /><rect x="60" y="4" width="8" height="26" rx="4" /><circle cx="64" cy="32" r="5" /><ellipse cx="64" cy="18" rx="14" ry="7" /><text x="84" y="22" fontSize="11" fill="var(--pen)" stroke="none">20 °C</text></g>),
    4: (<g {...common}><path d="M5 25 q15 -15 30 0 t30 0 t30 0" /><circle cx="98" cy="25" r="3" /><path d="M5 25 l-4 3 M5 25 l-4 -3" /><path d="M115 10 q8 10 0 20 q-8 -10 0 -20" /><path d="M115 10 v20" /></g>),
    5: (<g {...common}><path d="M20 30 v-4 a10 10 0 1 1 8 0 v4 z" /><path d="M21 34 h6" /><path d="M55 4 l-8 14 h8 l-6 14" /><text x="72" y="22" fontSize="11" fill="var(--pen)" stroke="none">÷ ? = ??</text></g>),
  };
  return <svg aria-hidden viewBox="0 0 150 36" className="h-9 w-40 opacity-80">{art[stage]}</svg>;
}
