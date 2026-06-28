import { useState } from "react";
import { MajaAvatar } from "./MajaAvatar";
import { SpeechBubble } from "./SpeechBubble";
import { Stamp } from "@/components/case-file/Stamp";

interface Props {
  onDone: () => void;
}

const LINES = [
  "Das ist Elviras Brief — er lag heute Mittag auf dem Küchentisch.",
  "Heute Abend stimmt der Rat über ein Gaskraftwerk ab. Sie ist verschwunden.",
  "Sie hat fünf Hinweise im Dorf hinterlegt. Wir müssen sie alle finden.",
];

export function IntroLetter({ onDone }: Props) {
  const [i, setI] = useState(0);
  const last = i === LINES.length - 1;

  return (
    <div className="relative mx-auto max-w-2xl space-y-5 animate-fade-in">
      <div className="relative" style={{ perspective: "800px" }}>
        <article
          className="paper-card paper-card-lift relative rounded-sm bg-card px-6 py-7 sm:px-10 sm:py-9"
          style={{
            transform: "rotate(-2deg)",
            animation: "fade-in 0.6s ease-out",
          }}
        >
          <div className="absolute right-4 top-4">
            <Stamp rotate={10}>Eilig</Stamp>
          </div>
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Samstag · 14:12 Uhr · Dorfstrasse 4
          </p>
          <h2 className="mt-3 font-serif text-2xl font-bold leading-tight sm:text-3xl">
            Liebe Maja —
          </h2>
          <p className="mt-3 font-serif text-[15px] italic leading-relaxed text-foreground/85">
            Wenn du das liest, bin ich schon unterwegs. Heute Abend kippt der
            Rat alles, wofür wir gekämpft haben. Ich habe fünf Hinweise im Dorf
            hinterlegt — jeden brauchst du. Vertrau mir.
          </p>
          <p className="mt-3 font-mono-typed text-[11px] uppercase tracking-wider text-stamp">
            — Elvira
          </p>
        </article>
      </div>

      <div className="flex items-end gap-3 px-1">
        <MajaAvatar mood={i === 0 ? "denkend" : i === 2 ? "neutral" : "besorgt"} size={88} />
        <div className="flex-1 pb-1">
          <SpeechBubble key={i} text={LINES[i]} tail="left" speed={22} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onDone}
          className="rounded-sm border border-border bg-card px-3 py-2 font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground hover:bg-secondary"
        >
          Intro überspringen
        </button>
        <div className="flex items-center gap-2">
          {LINES.map((_, k) => (
            <span
              key={k}
              className={
                k <= i
                  ? "h-1.5 w-8 rounded-full bg-ink transition-all"
                  : "h-1.5 w-4 rounded-full bg-ink/20 transition-all"
              }
            />
          ))}
        </div>
        {last ? (
          <button
            onClick={onDone}
            className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            Abenteuer starten →
          </button>
        ) : (
          <button
            onClick={() => setI(i + 1)}
            className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            Weiter →
          </button>
        )}
      </div>
    </div>
  );
}
