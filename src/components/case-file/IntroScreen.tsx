import { useState } from "react";
import {
  Mail,
  ArrowRight,
  Compass,
  Clock,
  Search,
  Camera,
  Bird,
  ChevronDown,
} from "lucide-react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { getHearingClock } from "@/lib/progress";
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

/* ---------- Interaktive Personenkarte ---------- */

type Persona = {
  id: string;
  name: string;
  alter: string;
  rolle: string;
  icon: React.ReactNode;
  fact: string;
  color: string;
};

function PersonCard({
  p,
  open,
  onToggle,
}: {
  p: Persona;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group block w-full text-left"
    >
      <div className="flex gap-4 rounded-sm border border-border bg-paper p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${p.color}`}
        >
          {p.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-serif text-lg font-bold">
              {p.name}
              <span className="ml-2 font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground">
                {p.alter}
              </span>
            </p>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
          <p className="mt-0.5 text-sm text-foreground/75">{p.rolle}</p>

          <div
            className={`grid transition-all duration-300 ease-out ${
              open
                ? "mt-3 grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="rounded-sm border border-dashed border-stamp/40 bg-stamp/5 p-3 font-serif italic text-[14px] leading-relaxed text-foreground/85">
                {p.fact}
              </div>
            </div>
          </div>

          {!open && (
            <p className="mt-2 font-mono-typed text-[10px] uppercase tracking-wider text-stamp/80">
              Tippen für ein Detail
            </p>
          )}
        </div>
      </div>
    </button>
  );
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
  const [openPerson, setOpenPerson] = useState<string | null>(null);
  const envelope = useEnvelopePrompt();
  const total = 3;
  useScrollToTopOnChange(step);

  const personen: Persona[] = [
    {
      id: "maja",
      name: "Maja",
      alter: "17",
      rolle: "Das seid ihr.",
      color: "bg-amber-100 text-amber-700",
      icon: <Camera className="h-6 w-6" />,
      fact:
        "Fotografiert am liebsten mit einer alten Analogkamera vom Flohmarkt. Trägt immer ein zerknittertes Notizbuch mit Filmrollen-Nummern dabei.",
    },
    {
      id: "elvira",
      name: "Elvira",
      alter: "68",
      rolle: "Majas Grosstante.",
      color: "bg-emerald-100 text-emerald-700",
      icon: <Bird className="h-6 w-6" />,
      fact:
        "War 40 Jahre lang Biologielehrerin an der Kanti. Steht seit ihrer Pensionierung fast täglich vor Sonnenaufgang auf, um Vögel zu zählen — und hat einen Ordner voller handgezeichneter Karten von Speicher.",
    },
  ];

  const finish = () => {
    envelope.ask({
      nr: 1,
      ort: "Küchentisch · Elviras Haus",
      etappeLabel: "Umschlag 1 · Küchentisch",
      onConfirm: () => {
        markIntroSeen();
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

        {step === 0 && (
          <PaperCard rotate={-0.4}>
            <div className="absolute right-4 top-6 sm:right-8 sm:top-8">
              <Stamp rotate={8}>Briefing</Stamp>
            </div>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              So spielt ihr
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
              Fünf Etappen. Ein Hearing.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
              Ihr habt bis <strong>{getHearingClock() ?? "19:00"} Uhr</strong>,
              um Majas Grosstante Elvira zu helfen. An jedem Ort im Dorf
              wartet ein Rätsel. Löst ihr es, schaltet sich die nächste Etappe frei.
            </p>
            <ul className="mt-5 space-y-3 text-[15px]">
              <li className="flex gap-3">
                <Compass className="mt-0.5 h-5 w-5 shrink-0 text-stamp" />
                <span>
                  <strong>QR-Code scannen</strong> – jede Etappe startet mit einem
                  Code, den ihr im Dorf findet.
                </span>
              </li>
              <li className="flex gap-3">
                <Search className="mt-0.5 h-5 w-5 shrink-0 text-stamp" />
                <span>
                  <strong>Rätsel lösen</strong> – lest genau, wählt bewusst.
                  Nach 3, 6 und 9 Minuten gibt es Tipps.
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-stamp" />
                <span>
                  <strong>Zeit im Blick</strong> – um{" "}
                  {getHearingClock() ?? "19:00"} Uhr beginnt die
                  Gemeinderatssitzung. Bis dahin müsst ihr im Saal sein.
                </span>
              </li>
            </ul>
          </PaperCard>
        )}

        {step === 1 && (
          <PaperCard rotate={0.3}>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Die Personen
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
              Wer ist wer?
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Tippt auf eine Karte, um ein Detail zu entdecken.
            </p>

            <div className="mt-5 space-y-3">
              {personen.map((p) => (
                <PersonCard
                  key={p.id}
                  p={p}
                  open={openPerson === p.id}
                  onToggle={() =>
                    setOpenPerson(openPerson === p.id ? null : p.id)
                  }
                />
              ))}
            </div>
          </PaperCard>
        )}

        {step === 2 && (
          <PaperCard rotate={-0.2} tape="top-left">
            <div className="absolute right-4 top-6 sm:right-8 sm:top-8">
              <Stamp rotate={-8}>Küchentisch</Stamp>
            </div>
            <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
              Der Brief
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              Maja sitzt im Zug nach Speicher …
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
              Ihr letzter Sommer vor der Matura. Grosstante Elvira hat sie zu
              sich aufs Land eingeladen. Doch als sie ankommt, ist das Haus
              leer. Auf dem Küchentisch liegt nur ein Brief:
            </p>



            <div
              className="mt-5 rounded-sm border border-border bg-paper-deep/40 p-5 font-serif text-[15px] leading-relaxed text-foreground/90 shadow-inner"
              style={{ transform: "rotate(-0.4deg)" }}
            >
              <Mail className="mb-2 h-4 w-4 text-stamp" />
              <p>
                „Liebe Maja, falls du das liest, bin ich gerade im Dorf
                unterwegs. Du erinnerst dich an unsere Hütte im Wald – dort, wo
                wir als Kind stundenlang Vögel beobachtet haben? Die Gemeinde
                sucht wegen drohender Stromengpässe dringend nach Lösungen und
                plant dort ein neues <strong>Gaskraftwerk</strong>. Heute Abend
                um <strong>{getHearingClock() ?? "19:00"} Uhr</strong> findet
                die Gemeinderatssitzung statt – dann wird abgestimmt.
              </p>
              <p className="mt-3">
                Ich bin sicher, dass wir mit den richtigen Fakten eine viel
                nachhaltigere Lösung für Speicher zeigen können! Ich bin
                unterwegs und sammle die letzten Daten. Kannst du mir helfen?
                Fang am <strong>alten Bahnhof</strong> an – dort liegt ein
                Hinweis für dich."
              </p>
              <p className="mt-4 text-right italic text-foreground/70">
                – Elvira
              </p>
            </div>
          </PaperCard>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={finish}
            className="font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Überspringen
          </button>
          <button
            onClick={next}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
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
