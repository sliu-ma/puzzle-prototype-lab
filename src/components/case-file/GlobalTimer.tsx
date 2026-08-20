import { useEffect, useRef, useState } from "react";
import { Clock, AlertTriangle, CheckCircle2, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getStartTs,
  getEndTs,
  getBudgetMin,
  formatClock,
  getHearingClock,
} from "@/lib/progress";
import { getRoundSession } from "@/lib/round-client";
import { getRoundState } from "@/lib/rounds.functions";
import { setBudgetMin } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { TimeUpOverlay } from "./TimeUpOverlay";
import { IconStamp } from "./IconStamp";

// Marker (Minuten seit Start), bei denen ein Maja-Popup erscheint.
// Erste 75 Min: alle 15 Min. Letzte 15 Min: alle 5 Min.
type MajaBeat = { at: number; body: (hearing: string) => string; urgent?: boolean };

const BEATS: MajaBeat[] = [
  {
    at: 15,
    body: () =>
      "Erste Viertelstunde rum. Ich bin unterwegs, alles ruhig. Bleibt dran, jede Spur zählt.",
  },
  {
    at: 30,
    body: (h) =>
      `Eine halbe Stunde. Jakobs Notizen ergeben langsam Sinn. Die Sitzung ist um ${h}, wir haben Zeit, aber nicht ewig.`,
  },
  {
    at: 45,
    body: () =>
      "Halbzeit. Die Hälfte der 90 Minuten ist weg. Wenn ihr feststeckt: lest die Hinweise noch einmal in Ruhe.",
  },
  {
    at: 60,
    body: () =>
      "Eine Stunde. Im Gemeindesaal stellen sie schon die Stühle. Wir müssen die Argumente bis dahin zusammen haben.",
  },
  {
    at: 75,
    body: () =>
      "Noch 15 Minuten. Ab jetzt melde ich mich häufiger. Konzentriert euch auf das Wesentliche.",
    urgent: true,
  },
  {
    at: 80,
    body: () =>
      "10 Minuten. Vetterli wartet nicht. Falls die Lösung nahe ist, jetzt durchziehen.",
    urgent: true,
  },
  {
    at: 85,
    body: () =>
      "Nur noch 5 Minuten! Wenn ihr beim Hearing seid: gebt euer Bestes. Wenn nicht: macht den letzten Schritt jetzt.",
    urgent: true,
  },
];


const SHOWN_KEY = "maya-timer-shown";

function getShown(): Set<number> {
  try {
    const raw = localStorage.getItem(SHOWN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}
function markShown(at: number) {
  try {
    const s = getShown();
    s.add(at);
    localStorage.setItem(SHOWN_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

function format(ms: number) {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function GlobalTimer() {
  const onSummary = useRouterState({
    select: (s) => s.location.pathname.startsWith("/abschluss"),
  });
  const [startTs, setStartTs] = useState<number | null>(null);
  const [endTs, setEndTs] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [popup, setPopup] = useState<MajaBeat | null>(null);
  const [bonusMin, setBonusMin] = useState<number | null>(null);
  const popupTimer = useRef<number | null>(null);

  useEffect(() => {
    const sync = () => {
      setStartTs(getStartTs());
      setEndTs(getEndTs());
    };
    sync();
    window.addEventListener("maya-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("maya-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Die Lehrperson kann während der Runde Zeit nachgeben. Dafür fragen wir
  // regelmässig das Zeitbudget der Runde ab und melden Zuwachs per Pop-up.
  useEffect(() => {
    if (!startTs || endTs) return;
    const session = getRoundSession();
    if (!session) return;
    let alive = true;
    const check = () => {
      void getRoundState({ data: { code: session.code } })
        .then((res) => {
          if (!alive || !res.found) return;
          const local = getBudgetMin();
          if (res.budgetMin > local) {
            setBudgetMin(res.budgetMin);
            setBonusMin(res.budgetMin - local);
          }
        })
        .catch(() => undefined);
    };
    check();
    const id = window.setInterval(check, 15_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [startTs, endTs]);

  useEffect(() => {
    if (!startTs || endTs) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [startTs, endTs]);

  useEffect(() => {
    if (!startTs || endTs) return;
    const elapsedMin = (now - startTs) / 60000;
    const shown = getShown();
    const due = BEATS.find((b) => elapsedMin >= b.at && !shown.has(b.at));
    if (due) {
      markShown(due.at);
      setPopup(due);
    }
  }, [now, startTs, endTs]);

  // Zeitmeldungen schliessen sich nach 60 Sekunden von selbst. Eine neue
  // Meldung überschreibt die laufende, daher räumen wir den alten Timer
  // immer auf, bevor ein neuer startet.
  useEffect(() => {
    if (popupTimer.current) {
      window.clearTimeout(popupTimer.current);
      popupTimer.current = null;
    }
    if (!popup) return;
    popupTimer.current = window.setTimeout(() => {
      setPopup(null);
    }, 60_000);
    return () => {
      if (popupTimer.current) {
        window.clearTimeout(popupTimer.current);
        popupTimer.current = null;
      }
    };
  }, [popup]);

  if (!startTs) return null;

  const totalMs = getBudgetMin() * 60_000;
  const effectiveNow = endTs ?? now;
  const remaining = startTs + totalMs - effectiveNow;
  const isFinished = !!endTs;
  const isOver = !isFinished && remaining <= 0;
  const isFinal = !isFinished && remaining <= 15 * 60_000;
  const hearing = getHearingClock() ?? "19:00";
  const popupTitle = popup
    ? `Maja · ${formatClock(new Date(startTs + popup.at * 60_000))}`
    : "";
  const popupBody = popup ? popup.body(hearing) : "";

  return (
    <>
      {isOver && !onSummary && <TimeUpOverlay />}
      <div
        className={cn(
          "flex items-center gap-2 rounded-sm border bg-card/95 px-3 py-1.5 font-mono-typed text-sm shadow-md backdrop-blur",
          isFinished
            ? "border-emerald-600 text-emerald-700"
            : isOver
              ? "border-destructive text-destructive"
              : isFinal
                ? "border-stamp text-stamp animate-pulse"
                : "border-border text-foreground",
        )}
        aria-live="polite"
      >
        {isFinished ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : isOver ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        <span className="tabular-nums font-semibold">
          {isOver ? "00:00" : format(remaining)}
        </span>
        {isFinished && <span className="text-xs font-serif">· Fertig</span>}
      </div>


      <Dialog open={bonusMin !== null} onOpenChange={(o) => !o && setBonusMin(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <IconStamp icon={Clock} tone="neutral" rotate={-5} className="mb-2" />
            <DialogTitle className="text-center font-serif">
              +{bonusMin ?? 0} Minuten mehr Zeit
            </DialogTitle>
            <DialogDescription className="pt-3 font-serif text-base italic leading-relaxed text-foreground/85">
              „Gute Nachricht: Die Gemeindeversammlung beginnt später. Ihr habt{" "}
              {bonusMin ?? 0} Minuten zusätzlich. Nutzt sie gut."
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setBonusMin(null)}
            className="mt-2 w-full rounded-sm bg-primary px-4 py-2 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            Weiter →
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!popup} onOpenChange={(o) => !o && setPopup(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <IconStamp
              icon={popup?.urgent ? AlertTriangle : Mail}
              tone={popup?.urgent ? "urgent" : "neutral"}
              rotate={-5}
              className={cn("mb-2", popup?.urgent && "animate-pulse")}
            />
            <DialogTitle
              className={cn(
                "text-center font-serif",
                popup?.urgent && "text-destructive",
              )}
            >
              {popupTitle}
            </DialogTitle>
            <DialogDescription className="pt-3 font-serif text-base italic leading-relaxed text-foreground/85">
              „{popupBody}"
            </DialogDescription>
          </DialogHeader>
          <div
            key={popup?.at ?? "none"}
            className="mt-4 h-1 w-full overflow-hidden rounded-full bg-border"
            aria-hidden="true"
          >
            <div className="animate-shrink-x h-full w-full origin-left rounded-full bg-primary" />
          </div>
          <button
            onClick={() => setPopup(null)}
            className="mt-2 w-full rounded-sm bg-primary px-4 py-2 font-serif text-sm font-semibold text-primary-foreground hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            Verstanden →
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}

