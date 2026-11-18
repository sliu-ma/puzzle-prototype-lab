import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BookOpen, Lock, PenLine } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getFactSets, getNotes, setNotes, NOTEBOOK_EVENT, STAGE_NAMES, type SavedFactSet,
} from "@/lib/notebook";

const HIDDEN = ["/lehrer", "/anleitung"];
const TOTAL = 15;

/** Immer erreichbares Notizbuch mit Faktenkarten und eigenen Notizen. */
export function Notebook() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"facts" | "notes">("facts");
  const [sets, setSets] = useState<SavedFactSet[]>([]);
  const [notes, setNotesState] = useState("");
  const [stage, setStage] = useState<number | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const sync = () => { setSets(getFactSets()); setNotesState(getNotes()); };
    sync();
    const onNew = (e: Event) => {
      sync();
      const s = (e as CustomEvent<{ newStage: number | null }>).detail?.newStage;
      if (s) {
        setPulse(true);
        toast(`3 Faktenkarten zu ${STAGE_NAMES[s]} in Jakobs Notizbuch gesichert`);
        window.setTimeout(() => setPulse(false), 4000);
      }
    };
    window.addEventListener(NOTEBOOK_EVENT, onNew);
    window.addEventListener("maya-progress", sync);
    return () => {
      window.removeEventListener(NOTEBOOK_EVENT, onNew);
      window.removeEventListener("maya-progress", sync);
    };
  }, []);

  if (HIDDEN.some((p) => pathname.startsWith(p))) return null;

  const count = sets.reduce((n, s) => n + s.cards.length, 0);
  const current = sets.find((s) => s.stage === stage) ?? null;

  return (
    <>
      <button
        type="button"
        onClick={() => { setStage(null); setOpen(true); }}
        aria-label="Jakobs Notizbuch öffnen"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/95 text-foreground shadow-md backdrop-blur",
          pulse && "animate-pulse ring-2 ring-stamp",
        )}
      >
        <BookOpen className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90dvh] max-w-md flex-col gap-3 bg-paper">
          <DialogHeader>
            <DialogTitle className="font-serif">Jakobs Notizbuch</DialogTitle>
            <DialogDescription className="text-xs">
              Gesammelte Fakten und eure eigenen Notizen. Auch im Hearing griffbereit.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-1 rounded-sm border border-border bg-card p-1">
            {([["facts", `Fakten ${count}/${TOTAL}`], ["notes", "Eigene Notizen"]] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={cn(
                  "min-h-10 rounded-sm font-mono-typed text-[11px] uppercase tracking-wider",
                  tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "notes" ? (
              <div>
                <label className="mb-1 flex items-center gap-1.5 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                  <PenLine className="h-3.5 w-3.5" /> Wird automatisch gespeichert
                </label>
                <textarea
                  value={notes}
                  rows={12}
                  maxLength={5000}
                  onChange={(e) => { setNotesState(e.target.value); setNotes(e.target.value); }}
                  placeholder="Zahlen, Codes, Argumente fürs Hearing …"
                  className="w-full resize-none rounded-sm border border-border bg-card px-3 py-2 font-serif text-[16px] leading-7 focus:border-stamp focus:outline-none"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(to bottom, transparent 0, transparent 27px, var(--border) 27px, var(--border) 28px)",
                    backgroundPositionY: "8px",
                  }}
                />
              </div>
            ) : current ? (
              <div className="space-y-3">
                <button type="button" onClick={() => setStage(null)} className="font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground">
                  ← Alle Etappen
                </button>
                <p className="font-serif text-lg font-semibold">{current.title}</p>
                {current.cards.map((c, i) => (
                  <div key={i} className="rounded-sm border border-border bg-card p-3 shadow-sm">
                    <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">Karte {i + 1}</p>
                    <p className="mt-1 font-serif font-semibold">{c.title}</p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{c.body}</p>
                    {c.hint && <p className="mt-2 text-xs italic text-muted-foreground">{c.hint}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-2">
                {[1, 2, 3, 4, 5].map((s) => {
                  const set = sets.find((x) => x.stage === s);
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!set}
                      onClick={() => setStage(s)}
                      className={cn(
                        "flex min-h-14 items-center justify-between rounded-sm border px-3 text-left",
                        set ? "border-border bg-card shadow-sm" : "border-dashed border-border bg-paper-deep/30 text-muted-foreground",
                      )}
                    >
                      <span>
                        <span className="block font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">Etappe {s}</span>
                        <span className="font-serif font-semibold">{STAGE_NAMES[s]}</span>
                      </span>
                      {set ? (
                        <span className="font-mono-typed text-[11px] text-stamp">{set.cards.length} Karten</span>
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </button>
                  );
                })}
                <p className="pt-1 text-center text-xs text-muted-foreground">
                  Beantwortet die Prüffragen nach dem Fachinput, um die Karten freizuschalten.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
