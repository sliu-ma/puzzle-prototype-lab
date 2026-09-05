import { useCallback, useEffect, useState } from "react";

/**
 * Erledigte Hilferufe der Lehrperson – pro Runde im localStorage.
 * Gemeinsame Quelle für Live-Ansicht und Chaträume.
 */

const EVENT = "mm-help-done";

export function helpDoneKey(code: string) {
  return `mm.teacher.help.done.${code}`;
}

/** Einheitliche ID eines Hilferufs (identisch in Live und Chat). */
export function helpId(
  teamId: string,
  h: { at: string; stage: number; note: string | null },
) {
  return `${teamId}|${h.at}|${h.stage}|${h.note ?? ""}`;
}

export function readHelpDone(code: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(helpDoneKey(code));
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function writeHelpDone(code: string, set: Set<string>) {
  try {
    window.localStorage.setItem(helpDoneKey(code), JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: code }));
}

/** Reaktive Sicht auf die erledigten Hilferufe einer Runde. */
export function useHelpDone(code: string) {
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!code) return;
    setDone(readHelpDone(code));
    const sync = () => setDone(readHelpDone(code));
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [code]);

  const toggle = useCallback(
    (id: string) => {
      const next = readHelpDone(code);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeHelpDone(code, next);
      setDone(next);
    },
    [code],
  );

  /** Mehrere IDs als erledigt markieren (z. B. beantwortete Hilferufe). */
  const markDone = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      const next = readHelpDone(code);
      let changed = false;
      for (const id of ids)
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      if (!changed) return;
      writeHelpDone(code, next);
      setDone(next);
    },
    [code],
  );

  return { done, toggle, markDone };
}
