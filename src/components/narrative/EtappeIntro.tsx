import { useEffect, useState, type ReactNode } from "react";
import { StoryIntro } from "./StoryIntro";
import { STATION } from "@/lib/story-beats";
import { PaperCard } from "@/components/case-file/PaperCard";

interface Props {
  stationKey: keyof typeof STATION;
  storageKey: string;
  title: string;
  children: ReactNode;
}

/**
 * Zeigt einmalig die Story-Intro-Panels einer Etappe, bevor die eigentliche
 * Rätselseite gerendert wird. Speichert „gesehen" in localStorage.
 */
export function EtappeIntro({ stationKey, storageKey, title, children }: Props) {
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(storageKey) === "1";
      setShow(!seen);
    } catch {
      /* noop */
    }
    setReady(true);
  }, [storageKey]);

  const done = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* noop */
    }
    setShow(false);
  };

  if (!ready) return null;

  if (show) {
    const beats = STATION[stationKey];
    return (
      <main className="relative min-h-screen px-3 py-6 sm:px-4 sm:py-14">
        <div className="relative mx-auto max-w-2xl">
          <PaperCard rotate={-0.3}>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Story · Zwischenszene
            </p>
            <h2 className="mt-1.5 font-serif text-2xl font-bold sm:text-3xl">{title}</h2>
            <div className="mt-5">
              <StoryIntro panels={beats.intro} onDone={done} />
            </div>
          </PaperCard>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
