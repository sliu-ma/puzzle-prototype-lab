import { useCallback, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowRight, MapPin } from "lucide-react";

/* ---------- SVG Envelope Illustration ---------- */

function EnvelopeArt({ nr }: { nr: number }) {
  return (
    <div className="relative mx-auto flex h-48 w-full max-w-[280px] items-center justify-center sm:h-56">
      <svg
        viewBox="0 0 320 220"
        className="h-full w-full drop-shadow-lg"
        role="img"
        aria-label={`Umschlag Nummer ${nr}`}
      >
        {/* Body */}
        <rect
          x="20"
          y="50"
          width="280"
          height="150"
          rx="6"
          fill="#f5ecd7"
          stroke="#8a6a3b"
          strokeWidth="2.5"
        />
        {/* Bottom paper texture lines */}
        <line x1="20" y1="130" x2="300" y2="130" stroke="#c9b591" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="160" x2="300" y2="160" stroke="#c9b591" strokeWidth="1" opacity="0.5" />
        {/* Open flap */}
        <path
          d="M 20 50 L 160 20 L 300 50 L 160 130 Z"
          fill="#e8dbb8"
          stroke="#8a6a3b"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Inner shadow of flap */}
        <path
          d="M 30 55 L 160 125 L 290 55"
          fill="none"
          stroke="#8a6a3b"
          strokeWidth="1"
          opacity="0.35"
        />
        {/* Wax seal */}
        <g transform="translate(160 155)">
          <circle r="34" fill="#9c2b2b" stroke="#6a1a1a" strokeWidth="2" />
          <circle r="34" fill="url(#waxShine)" opacity="0.6" />
          <text
            textAnchor="middle"
            dy="10"
            fontSize="34"
            fontFamily="Georgia, serif"
            fontWeight="700"
            fill="#f5ecd7"
          >
            {nr}
          </text>
        </g>
        <defs>
          <radialGradient id="waxShine" cx="30%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ---------- Dialog ---------- */

export function EnvelopeDialog({
  open,
  nr,
  ort,
  etappeLabel,
  onConfirm,
  onOpenChange,
}: {
  open: boolean;
  nr: number;
  ort: string;
  etappeLabel?: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-stamp/30 bg-paper p-0 sm:rounded-sm">
        <div className="relative overflow-hidden rounded-sm">
          {/* Paper grain */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, var(--color-ink) 0, var(--color-ink) 1px, transparent 1px, transparent 24px)",
            }}
          />

          <div className="relative px-6 pb-6 pt-8 sm:px-8">
            <p className="text-center font-mono-typed text-[11px] uppercase tracking-[0.22em] text-stamp">
              {etappeLabel ?? `Umschlag ${nr}`}
            </p>

            <div className="mt-4">
              <EnvelopeArt nr={nr} />
            </div>

            <DialogTitle asChild>
              <h2 className="mt-4 text-center font-serif text-2xl font-bold sm:text-3xl">
                Öffne jetzt Umschlag {nr}
              </h2>
            </DialogTitle>

            <DialogDescription asChild>
              <p className="mt-3 text-center font-serif text-[15px] leading-relaxed text-foreground/85">
                Der nächste Hinweis von Grossvater Jakob liegt bereit. Nimm
                den Umschlag mit der grossen Nummer <strong>{nr}</strong> und
                öffne ihn jetzt.
              </p>
            </DialogDescription>

            <div className="mt-4 flex items-center justify-center gap-2 rounded-sm border border-dashed border-stamp/40 bg-stamp/5 px-3 py-2">
              <MapPin className="h-4 w-4 text-stamp" />
              <span className="font-mono-typed text-[11px] uppercase tracking-[0.18em] text-stamp">
                {ort}
              </span>
            </div>

            <button
              onClick={onConfirm}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              Umschlag geöffnet
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Hook: einmaliger Prompt pro Umschlag ---------- */

type PromptState = {
  nr: number;
  ort: string;
  etappeLabel?: string;
} | null;

const flagKey = (nr: number) => `maya-envelope-${nr}-shown`;

function alreadyShown(nr: number): boolean {
  try {
    return localStorage.getItem(flagKey(nr)) === "1";
  } catch {
    return false;
  }
}

function markShown(nr: number) {
  try {
    localStorage.setItem(flagKey(nr), "1");
  } catch {
    /* ignore */
  }
}

export function useEnvelopePrompt() {
  const [state, setState] = useState<PromptState>(null);
  const confirmRef = useRef<(() => void) | null>(null);

  const ask = useCallback(
    (opts: {
      nr: number;
      ort: string;
      etappeLabel?: string;
      onConfirm: () => void;
      force?: boolean;
    }) => {
      if (!opts.force && alreadyShown(opts.nr)) {
        opts.onConfirm();
        return;
      }
      confirmRef.current = opts.onConfirm;
      setState({ nr: opts.nr, ort: opts.ort, etappeLabel: opts.etappeLabel });
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (state) markShown(state.nr);
    const fn = confirmRef.current;
    confirmRef.current = null;
    setState(null);
    fn?.();
  }, [state]);

  const dialog = state ? (
    <EnvelopeDialog
      open={true}
      nr={state.nr}
      ort={state.ort}
      etappeLabel={state.etappeLabel}
      onConfirm={handleConfirm}
      onOpenChange={(o) => {
        if (!o) {
          // Dismiss ohne Bestätigung: nichts markieren, damit es erneut auftaucht
          confirmRef.current = null;
          setState(null);
        }
      }}
    />
  ) : null;

  return { ask, dialog };
}
