import { useEffect, useState } from "react";
import { CloudOff } from "lucide-react";
import { SYNC_CHANGED, flushNow, getPendingSyncCount } from "@/lib/round-client";

/**
 * Zeigt nur dann etwas an, wenn Punkte-Ereignisse noch nicht beim Server
 * angekommen sind (Funkloch). Tippen löst einen sofortigen Versuch aus.
 */
export function SyncIndicator() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    setPending(getPendingSyncCount());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ pending: number }>).detail;
      setPending(detail?.pending ?? 0);
    };
    window.addEventListener(SYNC_CHANGED, onChange);
    return () => window.removeEventListener(SYNC_CHANGED, onChange);
  }, []);

  if (pending <= 0) return null;

  return (
    <button
      type="button"
      onClick={() => flushNow()}
      title="Punkte sind noch nicht übertragen. Tippen für einen neuen Versuch."
      className="flex items-center gap-1.5 rounded-sm border border-border bg-card/95 px-2.5 py-1.5 font-mono-typed text-xs text-muted-foreground shadow-md backdrop-blur transition-transform active:scale-95"
    >
      <CloudOff className="h-4 w-4 text-stamp" />
      <span className="sr-only">
        Punkte noch nicht übertragen. Tippen für einen neuen Versuch.
      </span>
      <span aria-hidden>offline</span>
    </button>
  );
}
