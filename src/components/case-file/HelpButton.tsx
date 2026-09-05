import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { LifeBuoy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getRoundSession } from "@/lib/round-client";
import { getCurrentStage, getStartTs, isRoundOver } from "@/lib/progress";
import { recordHelpRequest } from "@/lib/score-events";
import { cn } from "@/lib/utils";
import { IconStamp } from "./IconStamp";

/** Seiten der Lehrperson bzw. Wartezimmer brauchen den Knopf nicht. */
const HIDDEN = ["/lehrer", "/lobby", "/abschluss"];

/**
 * Hilferuf einer Gruppe an die betreuende Lehrperson. Erscheint erst, wenn
 * eine Klassenrunde läuft, und meldet Etappe plus optionalen Kurztext.
 */
export function HelpButton() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [sentAt, setSentAt] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => {
      setVisible(!!getRoundSession() && !!getStartTs() && !isRoundOver());
    };
    sync();
    window.addEventListener("maya-progress", sync);
    const id = window.setInterval(sync, 5000);
    return () => {
      window.removeEventListener("maya-progress", sync);
      window.clearInterval(id);
    };
  }, []);

  if (!visible || HIDDEN.some((p) => pathname.startsWith(p))) return null;

  const send = () => {
    recordHelpRequest(getCurrentStage(), note.trim() || undefined);
    setSentAt(Date.now());
    setNote("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSentAt(null);
          setOpen(true);
        }}
        aria-label="Hilfe von der Lehrperson anfordern"
        className="fixed bottom-4 left-3 z-40 flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card/95 px-3 py-2 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground shadow-md backdrop-blur"
      >
        <LifeBuoy className="h-4 w-4 text-stamp" />
        Hilfe
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <IconStamp icon={LifeBuoy} rotate={-4} className="mb-2" />
            <DialogTitle className="text-center font-serif">
              {sentAt ? "Hilferuf ist unterwegs" : "Hilfe anfordern"}
            </DialogTitle>
            <DialogDescription className="pt-2 text-center text-sm leading-relaxed">
              {sentAt
                ? "Eure Lehrperson sieht euren Hilferuf und meldet sich bei euch."
                : "Schreibt kurz, wo es klemmt. Die Lehrperson sieht den Hilferuf samt Etappe in ihrer Übersicht und meldet sich bei euch."}
            </DialogDescription>
          </DialogHeader>

          {sentAt ? (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 font-serif text-sm font-semibold text-primary-foreground"
            >
              <Check className="h-4 w-4" /> Alles klar
            </button>
          ) : (
            <>
              <textarea
                value={note}
                maxLength={200}
                rows={3}
                onChange={(e) => setNote(e.target.value)}
                placeholder="z. B. Wir finden den QR-Code beim Pumpwerk nicht."
                className="w-full rounded-sm border border-border bg-paper px-3 py-2 text-[16px] focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/25"
              />
              <button
                type="button"
                onClick={send}
                className={cn(
                  "mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 font-serif text-sm font-semibold text-primary-foreground",
                )}
              >
                Hilferuf senden
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground"
              >
                Abbrechen
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
