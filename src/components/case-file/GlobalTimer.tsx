import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getStartTs, TIMER_DURATION_MIN } from "@/lib/progress";
import { cn } from "@/lib/utils";

// Marker (Minuten seit Start), bei denen ein Maja-Popup erscheint.
// Erste 75 Min: alle 15 Min. Letzte 15 Min: alle 5 Min.
type MajaBeat = { at: number; title: string; body: string; urgent?: boolean };

const BEATS: MajaBeat[] = [
  {
    at: 15,
    title: "Maja · 14:27",
    body:
      "Erste Viertelstunde rum. Ich bin am Bahnhof angekommen — alles ruhig. Bleibt dran, jede Spur zählt.",
  },
  {
    at: 30,
    title: "Maja · 14:42",
    body:
      "Eine halbe Stunde. Elviras Notizen ergeben langsam Sinn. Hearing ist um 19:00 — wir haben Zeit, aber nicht ewig.",
  },
  {
    at: 45,
    title: "Maja · 14:57",
    body:
      "Halbzeit. Die Hälfte der 90 Minuten ist weg. Wenn ihr feststeckt: lest die Hinweise noch einmal in Ruhe.",
  },
  {
    at: 60,
    title: "Maja · 15:12",
    body:
      "Eine Stunde. Im Gemeindesaal stellen sie schon die Stühle. Wir müssen die Argumente bis dahin zusammen haben.",
  },
  {
    at: 75,
    title: "Maja · 15:27",
    body:
      "Noch 15 Minuten. Ab jetzt melde ich mich häufiger. Konzentriert euch auf das Wesentliche.",
    urgent: true,
  },
  {
    at: 80,
    title: "Maja · 15:32",
    body:
      "10 Minuten. Vetterli wartet nicht. Falls die Lösung nahe ist — jetzt durchziehen.",
    urgent: true,
  },
  {
    at: 85,
    title: "Maja · 15:37",
    body:
      "Nur noch 5 Minuten! Wenn ihr beim Hearing seid: gebt euer Bestes. Wenn nicht: macht den letzten Schritt jetzt.",
    urgent: true,
  },
  {
    at: 90,
    title: "Maja · 15:42",
    body:
      "Zeit ist um. Das Hearing beginnt. Was ihr habt, müsst ihr jetzt einsetzen — ich vertraue auf euch.",
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
  const [startTs, setStartTs] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [popup, setPopup] = useState<MajaBeat | null>(null);

  useEffect(() => {
    const sync = () => setStartTs(getStartTs());
    sync();
    window.addEventListener("maya-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("maya-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!startTs) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [startTs]);

  useEffect(() => {
    if (!startTs) return;
    const elapsedMin = (now - startTs) / 60000;
    const shown = getShown();
    const due = BEATS.find((b) => elapsedMin >= b.at && !shown.has(b.at));
    if (due && !popup) {
      markShown(due.at);
      setPopup(due);
    }
  }, [now, startTs, popup]);

  if (!startTs) return null;

  const totalMs = TIMER_DURATION_MIN * 60_000;
  const remaining = startTs + totalMs - now;
  const isOver = remaining <= 0;
  const isFinal = remaining <= 15 * 60_000;

  return (
    <>
      <div
        className={cn(
          "fixed right-3 top-3 z-40 flex items-center gap-2 rounded-sm border bg-card/95 px-3 py-1.5 font-mono-typed text-sm shadow-md backdrop-blur",
          isOver
            ? "border-destructive text-destructive"
            : isFinal
              ? "border-stamp text-stamp animate-pulse"
              : "border-border text-foreground",
        )}
        aria-live="polite"
      >
        {isOver ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        <span className="tabular-nums font-semibold">
          {isOver ? "00:00" : format(remaining)}
        </span>
      </div>

      <Dialog open={!!popup} onOpenChange={(o) => !o && setPopup(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle
              className={cn(
                "font-serif",
                popup?.urgent && "text-destructive",
              )}
            >
              {popup?.urgent ? "⚠ " : "✉ "}
              {popup?.title}
            </DialogTitle>
            <DialogDescription className="pt-3 font-serif text-base italic leading-relaxed text-foreground/85">
              „{popup?.body}"
            </DialogDescription>
          </DialogHeader>
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
