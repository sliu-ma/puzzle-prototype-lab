import { useEffect, useRef, useState, type ReactNode } from "react";
import { SuccessReaction } from "./SuccessReaction";
import { STATION } from "@/lib/story-beats";

interface Props {
  stationKey: keyof typeof STATION;
  /** True wenn das Rätsel gelöst ist (z. B. step === "input") */
  triggered: boolean;
  storageKey: string;
  children?: ReactNode;
}

/**
 * Blendet einmalig die Maja-Erfolgs-Reaktion ein, sobald `triggered` wechselt.
 */
export function EtappeSuccess({ stationKey, triggered, storageKey, children }: Props) {
  const [open, setOpen] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (!triggered || fired.current) return;
    try {
      if (localStorage.getItem(storageKey) === "1") {
        fired.current = true;
        return;
      }
    } catch {
      /* noop */
    }
    fired.current = true;
    setOpen(true);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* noop */
    }
  }, [triggered, storageKey]);

  const beat = STATION[stationKey].success;

  return (
    <>
      {children}
      <SuccessReaction
        open={open}
        mood={beat.mood}
        text={beat.text}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
