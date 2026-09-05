import { useEffect } from "react";
import { getRoundSession, resumeSync } from "@/lib/round-client";
import { getTeamEvents } from "@/lib/rounds.functions";
import { mergeScoreEvents } from "@/lib/score-events";
import { applyRestoredEvents } from "@/lib/progress";

/**
 * Holt beim Öffnen der App den auf dem Server gespeicherten Stand der Gruppe
 * zurück. Damit geht der Fortschritt nicht verloren, wenn ein Handy leer ist,
 * abstürzt oder die Gruppe auf ein anderes Gerät wechselt. Zusätzlich wird
 * alles noch nicht Übertragene einmal nachgeschickt.
 */
export function ProgressRecovery() {
  useEffect(() => {
    const session = getRoundSession();
    if (!session) return;
    let alive = true;

    void getTeamEvents({ data: { teamId: session.teamId, token: session.token } })
      .then((res) => {
        if (!alive) return;
        mergeScoreEvents(res.events);
        applyRestoredEvents(res.types);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) resumeSync();
      });

    return () => {
      alive = false;
    };
  }, []);

  return null;
}
