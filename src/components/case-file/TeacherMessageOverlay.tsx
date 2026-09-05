import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getRoundSession } from "@/lib/round-client";
import { getRoundState } from "@/lib/rounds.functions";
import { getStartTs, getEndTs, isRoundClosed } from "@/lib/progress";
import { recordMessageAck } from "@/lib/score-events";

import { IconStamp } from "./IconStamp";

type Message = { id: string; body: string; createdAt: string };

// Gesehene Nachrichten liegen unter einem maya-Schlüssel, damit sie beim
// Zurücksetzen des Spiels mitgelöscht werden.
const SEEN_KEY = "maya-teacher-messages-seen";
const POLL_MS = 10_000;

function getSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function markSeen(ids: string[]) {
  try {
    const seen = getSeen();
    ids.forEach((id) => seen.add(id));
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-100)));
  } catch {
    /* ignore */
  }
}

/**
 * Zeigt Nachrichten der Lehrperson als Pop-up im Stil der Zeitmeldungen.
 * Jede Nachricht erscheint nur einmal pro Gerät.
 */
export function TeacherMessageOverlay() {
  const onSummary = useRouterState({
    select: (s) => s.location.pathname.startsWith("/abschluss"),
  });
  const [queue, setQueue] = useState<Message[]>([]);

  useEffect(() => {
    if (onSummary) return;
    let alive = true;

    const check = () => {
      // Sitzung bei jedem Zyklus neu lesen: Gruppen treten erst nach dem
      // ersten Rendern bei, ein einmaliges Auslesen würde das Polling stoppen.
      const session = getRoundSession();
      if (!session) return;
      if (!getStartTs() || getEndTs() || isRoundClosed()) return;
      void getRoundState({
        data: { code: session.code, teamId: session.teamId, token: session.token },
      })
        .then((res) => {
          if (!alive || !res.found) return;
          const seen = getSeen();
          const fresh = (res.messages ?? []).filter((m) => !seen.has(m.id));
          if (fresh.length === 0) return;
          markSeen(fresh.map((m) => m.id));
          setQueue((q) => [...q, ...fresh]);
        })
        .catch(() => undefined);
    };

    check();
    const id = window.setInterval(check, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [onSummary]);

  const current = queue[0];
  if (!current) return null;

  // Lesebestätigung: die Lehrperson sieht damit, dass die Nachricht angekommen ist.
  const confirm = () => {
    recordMessageAck(current.id);
    setQueue((q) => q.slice(1));
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) confirm();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <IconStamp icon={Megaphone} rotate={-4} className="mb-2" />
          <DialogTitle className="text-center font-serif">
            Nachricht der Lehrperson
          </DialogTitle>
          <DialogDescription className="pt-3 font-serif text-base leading-relaxed text-foreground/85">
            {current.body}
          </DialogDescription>
        </DialogHeader>
        <button
          type="button"
          onClick={confirm}
          className="mt-2 min-h-[48px] w-full rounded-sm bg-primary px-4 font-serif text-sm font-semibold text-primary-foreground"
        >
          Verstanden
        </button>
      </DialogContent>
    </Dialog>
  );
}

