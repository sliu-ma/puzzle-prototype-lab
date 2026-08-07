import { useMemo, useState } from "react";
import {
  Mail,
  ArrowRight,
  Compass,
  Clock,
  Search,
  
  Footprints,
  TriangleAlert,
  Play,
} from "lucide-react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { PrologueOverlay } from "@/components/case-file/PrologueVideo";
import { getHearingClock, startGame } from "@/lib/progress";
import { getRoundSession } from "@/lib/round-client";
import { useEnvelopePrompt } from "@/components/case-file/EnvelopeDialog";
import { useScrollToTopOnChange } from "@/hooks/use-scroll-top";

const KEY = "maya-intro-seen";

export function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
}

/* ---------- Screen ---------- */

export function IntroScreen({
  teamName,
  onDone,
}: {
  teamName: string;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [letterOpen, setLetterOpen] = useState(false);
  const [prologueOpen, setPrologueOpen] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const envelope = useEnvelopePrompt();
  useScrollToTopOnChange(step);

  // In einer Klassenrunde zeigt die Lehrperson das Video am Beamer.
  // Ohne Runde (Einzelspieler-Code) läuft es hier auf dem Gerät.
  const showVideo = useMemo(() => getRoundSession() === null, []);
  const steps = showVideo
    ? (["video", "ankunft", "brief", "regeln"] as const)
    : (["ankunft", "brief", "regeln"] as const);
  const total = steps.length;
  const current = steps[step];

  const finish = () => {
    envelope.ask({
      nr: 1,
      ort: "Alter Bahnhof · Fahrkartenschalter",
      etappeLabel: "Umschlag 1 · Alter Bahnhof",
      onConfirm: () => {
        markIntroSeen();
        startGame();
        onDone();
      },
    });
  };

  const next = () => {
    if (step < total - 1) setStep(step + 1);
    else finish();
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-ink) 0, var(--color-ink) 1px, transparent 1px, transparent 28px)",
        }}
      />

      <div className="relative mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono-typed text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Team {teamName} · Briefing
          </p>
          <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full ${
                  i <= step ? "bg-stamp" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        {current === "video" && (
          <PaperCard rotate={-0.3}>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Vor einem Jahr
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
              Das Versprechen
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              Schaut zuerst die Vorgeschichte. Danach geht es los.
            </p>
            <button
              type="button"
              onClick={() => setPrologueOpen(true)}
              className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 font-serif text-base font-semibold text-primary-foreground"
            >
              <Play className="h-4 w-4" />
              Vorgeschichte abspielen
            </button>
            {prologueOpen && (
              <PrologueOverlay
                allowSkip={false}
                onFinished={() => {
                  setPrologueOpen(false);
                  setStep(step + 1);
                }}
              />
            )}
          </PaperCard>
        )}

        {current === "ankunft" && (
          <PaperCard rotate={0.3} tape="top-left">
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Heute · Grünwald
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
              Zurück im Wald
            </h2>

            <ul className="mt-5 space-y-4 text-[15px] leading-relaxed text-foreground/85">
              <li className="flex gap-3">
                <Footprints className="mt-0.5 h-5 w-5 shrink-0 text-stamp" />
                <span>
                  Zum ersten Mal seit Jakobs Tod ist Maja wieder hier. Sie erkennt
                  den grossen Felsen. <strong>Die Lichtung.</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-stamp" />
                <span>
                  Doch heute hängen rot-weisse Absperrbänder zwischen den Bäumen.
                  Am Weg steht ein Schild:
                </span>
              </li>
            </ul>

            <div
              className="mt-4 rounded-sm border-2 border-destructive/50 bg-destructive/5 p-4 text-center"
              style={{ transform: "rotate(-1deg)" }}
            >
              <p className="font-mono-typed text-sm font-bold uppercase tracking-[0.15em] text-destructive">
                Geplantes Gaskraftwerk
              </p>
              <p className="mt-1 font-mono-typed text-[11px] uppercase tracking-wider text-foreground/70">
                Rodungsarbeiten beginnen nach Genehmigung
              </p>
            </div>

            <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
              Ihre Lichtung soll gerodet werden.
            </p>

          </PaperCard>
        )}

        {current === "brief" && (
          <PaperCard rotate={-0.2}>
            <div className="absolute right-4 top-6 sm:right-8 sm:top-8">
              <Stamp rotate={-8}>Der Brief</Stamp>
            </div>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Der Umschlag
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Ein Brief von Opa Jakob
            </h2>

            <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
              Am Forsthaus steht die Tür offen. Dann hört sie Schritte.
            </p>

            <div className="mt-4 rounded-sm border border-border bg-paper-deep/40 p-4 font-serif italic text-[15px] leading-relaxed text-foreground/90">
              „Du musst Maja sein. Ich bin ein Freund deines Grossvaters. Kurz vor
              seinem Tod hat er mir diesen Umschlag für dich gegeben.“
            </div>


            {!letterOpen ? (
              <button
                type="button"
                onClick={() => setLetterOpen(true)}
                className="mt-5 flex min-h-[140px] w-full flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-stamp/50 bg-paper-deep/30 p-6 transition-transform hover:-translate-y-0.5"
              >
                <Mail className="h-10 w-10 text-stamp" />
                <span className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                  Umschlag öffnen
                </span>
              </button>
            ) : (
              <div
                className="mt-5 rounded-sm border border-border bg-paper-deep/40 p-5 font-serif text-[15px] leading-relaxed text-foreground/90 shadow-inner"
                style={{ transform: "rotate(-0.4deg)" }}
              >
                <p>Liebe Maja</p>
                <p className="mt-3">
                  <strong>
                    Heute Abend um {getHearingClock() ?? "19:00"} Uhr entscheidet
                    der Gemeinderat über das Gaskraftwerk auf der Waldlichtung.
                  </strong>{" "}
                  Dafür müsste ein Teil des Waldes gerodet werden.
                </p>
                <p className="mt-3">
                  Ich habe Fakten gesammelt, aber meine Arbeit nicht fertigstellen
                  können. Folge meinen Spuren, sammle alle Hinweise. Und vergiss nie
                  unser Versprechen.
                </p>
                <p className="mt-4 text-right italic text-foreground/70">
                  Dein Opa Jakob
                </p>
              </div>
            )}
          </PaperCard>
        )}

        {current === "regeln" && (
          <PaperCard rotate={-0.4}>
            <div className="absolute right-4 top-6 sm:right-8 sm:top-8">
              <Stamp rotate={8}>Briefing</Stamp>
            </div>
            <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
              Fünf Etappen. Ein Hearing.
            </h2>
            <ul className="mt-5 space-y-3 text-[15px]">
              <li className="flex gap-3">
                <Compass className="mt-0.5 h-5 w-5 shrink-0 text-stamp" />
                <span>
                  <strong>QR-Code scannen</strong>, an jedem Ort im Dorf.
                </span>
              </li>
              <li className="flex gap-3">
                <Search className="mt-0.5 h-5 w-5 shrink-0 text-stamp" />
                <span>
                  <strong>Rätsel lösen</strong>, das schaltet die nächste Etappe
                  frei.
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-stamp" />
                <span>
                  <strong>Bis {getHearingClock() ?? "19:00"} Uhr</strong> im
                  Gemeindesaal sein.
                </span>
              </li>
            </ul>
          </PaperCard>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={next}
            disabled={current === "video" && !videoWatched}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-40"
          >
            {step < total - 1 ? "Weiter" : "Ermittlung starten"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {envelope.dialog}
    </main>
  );
}
