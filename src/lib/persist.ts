// Persistente useState-Varianten (localStorage).
// SSR-sicher: Wert wird beim ersten Render vom Server = initial gerendert,
// nach dem Mount wird ggf. der gespeicherte Wert nachgezogen.

import { useCallback, useEffect, useRef, useState } from "react";

type Updater<T> = T | ((prev: T) => T);

function safeGet(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

/**
 * Wie `useState`, aber der Wert wird unter `key` in `localStorage` gespiegelt.
 * Der Reset-Knopf im Spiel entfernt alle Keys mit Präfix `akte-` bzw. `maya-`,
 * daher sollten neue Keys diesen Präfixen folgen.
 */
export function usePersistentState<T>(
  key: string,
  initial: T | (() => T),
): [T, (v: Updater<T>) => void] {
  const initialRef = useRef<T | null>(null);
  if (initialRef.current === null) {
    initialRef.current =
      typeof initial === "function" ? (initial as () => T)() : initial;
  }
  const [value, setValue] = useState<T>(initialRef.current);

  // Beim Mount aus dem Storage hydratisieren.
  useEffect(() => {
    const raw = safeGet(key);
    if (raw !== null) {
      try {
        setValue(JSON.parse(raw) as T);
      } catch {
        /* ignore malformed */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (v: Updater<T>) => {
      setValue((prev) => {
        const next =
          typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        try {
          safeSet(key, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key],
  );

  return [value, set];
}

/** Set-Variante — JSON-Serialisierung als Array. */
export function usePersistentSet<T>(
  key: string,
  initial: () => Set<T>,
): [Set<T>, (v: Updater<Set<T>>) => void] {
  const [arr, setArr] = usePersistentState<T[]>(key, () => Array.from(initial()));
  const asSet = new Set<T>(arr);
  const set = useCallback(
    (v: Updater<Set<T>>) => {
      setArr((prevArr) => {
        const prevSet = new Set<T>(prevArr);
        const nextSet =
          typeof v === "function" ? (v as (p: Set<T>) => Set<T>)(prevSet) : v;
        return Array.from(nextSet);
      });
    },
    [setArr],
  );
  return [asSet, set];
}
