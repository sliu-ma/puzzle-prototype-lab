import { useEffect, useRef, useState } from "react";
import { Check, X, NotebookPen, SearchCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { drawStatements, markFactCheckPassed, type FactStatement } from "@/lib/fact-checks";
import { setFactCheckOpen } from "@/lib/overlay-bus";

interface Props {
  open: boolean;
  stage: number;
  pool: FactStatement[];
  onPassed: () => void;
  onReread: () => void;
}

/** Majas Hearing-Notizen: 3 Aussagen aus dem Pool. Bei Fehlern kommen neue Aussagen. */
export function FactCheck({ open, stage, pool, onPassed, onReread }: Props) {
  const [statements, setStatements] = useState<FactStatement[]>(() => drawStatements(pool));
  const [answers, setAnswers] = useState<(boolean | null)[]>(() => statements.map(() => null));
  const [failed, setFailed] = useState(false);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    setFactCheckOpen(open);
    return () => setFactCheckOpen(false);
  }, [open]);

  const onPassedRef = useRef(onPassed);
  onPassedRef.current = onPassed;
  useEffect(() => {
    if (!passed) return;
    const t = setTimeout(() => onPassedRef.current(), 4000);
    return () => clearTimeout(t);
  }, [passed]);

  const allAnswered = answers.every((a) => a !== null);

  const set = (i: number, v: boolean) => {
    if (passed) return;
    setAnswers((prev) => prev.map((a, j) => (j === i ? v : a)));
  };

  const check = () => {
    const ok = answers.every((a, i) => a === statements[i].correct);
    if (ok) {
      setPassed(true);
      markFactCheckPassed(stage);
    } else {
      setFailed(true);
      const next = drawStatements(pool, undefined, statements);
      setStatements(next);
      setAnswers(next.map(() => null));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onReread()}>
      <DialogContent className="z-[60] max-h-[92dvh] overflow-y-auto rounded-sm border-border bg-card p-5 sm:max-w-lg">
        <div className={passed ? "sr-only" : undefined}>
          <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
            Notizblatt · Majas Hearing-Vorbereitung
          </p>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl font-bold"><NotebookPen className="h-5 w-5 text-stamp" />Stimmen meine Notizen?</DialogTitle>
          <DialogDescription className="font-serif text-sm text-foreground/80">
            „Meine Notizen fürs Hearing: Was stimmt, was ist falsch?"
          </DialogDescription>
        </div>

        {!passed && (
          <ul className="space-y-3">
            {statements.map((s, i) => (
              <li key={s.text} className="rounded-sm border border-border bg-background p-3">
                <p className="font-serif text-[15px] leading-snug">{s.text}</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {([true, false] as const).map((v) => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => set(i, v)}
                      className={cn(
                        "flex min-h-11 items-center justify-center gap-1.5 rounded-sm border px-3 py-2 font-serif text-sm transition-colors",
                        answers[i] !== v
                          ? "border-border bg-card hover:bg-secondary"
                          : v
                            ? "border-status-done bg-status-done text-primary-foreground"
                            : "border-destructive bg-destructive text-destructive-foreground",
                      )}
                    >
                      {v ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      {v ? "Richtig" : "Falsch"}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="grid grid-cols-2 gap-2">
          {!passed && (
            <button type="button" onClick={onReread} className="min-h-11 rounded-sm border border-border bg-card px-2 py-2 font-serif text-sm leading-tight hover:bg-secondary">
              ← Karten ansehen
            </button>
          )}
          {!passed && (
            <button type="button" disabled={!allAnswered} onClick={check} className="min-h-11 rounded-sm bg-primary px-2 py-2 font-serif text-sm font-semibold leading-tight text-primary-foreground disabled:opacity-50">
              Notizen prüfen
            </button>
          )}
        </div>
        {passed && (
          <div role="status" className="flex flex-col items-center gap-6 py-10 text-center">
            <div className="animate-stamp-in rounded-lg border-4 border-stamp px-7 py-3.5 opacity-90">
              <p className="font-mono-typed text-xl font-bold uppercase tracking-[0.18em] text-stamp sm:text-2xl">
                Geprüft
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-serif text-lg font-bold">„Perfekt, danke!"</p>
              <p className="font-serif text-sm text-foreground/80">So können wir vor den Gemeinderat treten.</p>
            </div>
            <div className="h-1 w-44 overflow-hidden rounded-full bg-secondary">
              <div className="animate-outro-count h-full w-full origin-left rounded-full bg-stamp/60" />
            </div>
          </div>
        )}
        {failed && !passed && (
          <div role="alert" className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-card/95 p-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-stamp text-stamp">
              <SearchCheck className="h-8 w-8" />
            </span>
            <p className="font-serif text-lg font-bold">„Halt, das stimmt nicht!"</p>
            <p className="font-serif text-sm text-foreground/80">Lies die Karten nochmals genau.</p>
            <button type="button" onClick={() => { setFailed(false); onReread(); }} className="min-h-11 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground">
              Zu den Faktenkarten →
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
