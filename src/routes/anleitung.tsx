import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Award,
  ChevronDown,
  Flag,
  Lightbulb,
  MapPin,
  Puzzle,
  QrCode,
  Smartphone,
  Timer,
  Users,
} from "lucide-react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/anleitung")({
  head: () => ({
    meta: [
      { title: "So spielst du | Majas Mission - Escape Game zu Nachhaltigkeit" },
      {
        name: "description",
        content:
          "Die Anleitung zu Majas Mission: Team bilden, QR-Codes vor Ort scannen, Rätsel lösen, Hinweise nutzen und in 90 Minuten alle fünf Etappen schaffen.",
      },
      { property: "og:title", content: "So spielst du | Majas Mission" },
      {
        property: "og:description",
        content:
          "Team bilden, QR-Codes scannen, Rätsel lösen: So funktioniert das mobile Escape Game zu Nachhaltigkeit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnleitungPage,
});

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("reveal-up", inView && "reveal-up-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

const STEPS = [
  {
    icon: Users,
    title: "Team bilden",
    body: "Bildet eine Gruppe und tretet über den QR-Code oder den Link eurer Lehrperson der Lobby bei. Ein Gerät pro Gruppe genügt.",
  },
  {
    icon: QrCode,
    title: "QR-Code vor Ort scannen",
    body: "Jede Etappe ist versiegelt. Erst der QR-Code am Posten vor Ort entsperrt die Akte auf eurem Gerät.",
  },
  {
    icon: Puzzle,
    title: "Rätsel lösen",
    body: "Lest die Texte und Dokumente genau. Die Antworten stecken in den Details, also schaut euch alles in Ruhe an.",
  },
  {
    icon: Lightbulb,
    title: "Hinweise nutzen",
    body: "Ihr steckt fest? Nach 3 Minuten gibt es einen Tipp, nach 6 einen zweiten und nach 9 die Auflösung. Aufgedeckte Hinweise könnt ihr jederzeit wieder öffnen.",
  },
  {
    icon: Flag,
    title: "Zum Hearing schaffen",
    body: "Löst alle fünf Etappen und seid rechtzeitig beim Hearing. Die Gemeinderatssitzung wartet nicht.",
  },
] as const;

const FACTS = [
  {
    icon: Timer,
    title: "90 Minuten",
    body: "Der Timer startet nach dem Briefing. Plant eure Zeit zwischen den Posten gut ein.",
  },
  {
    icon: Award,
    title: "Badges sammeln",
    body: "Für besonders gute Leistungen gibt es Abzeichen, zum Beispiel wenn ihr eine Etappe ganz ohne Hinweis schafft.",
  },
  {
    icon: Smartphone,
    title: "Ein Gerät pro Gruppe",
    body: "Ihr spielt gemeinsam auf einem Handy. Besprecht euch, bevor ihr eine Antwort eingebt.",
  },
] as const;

const FAQ = [
  {
    q: "Was, wenn wir bei einem Rätsel feststecken?",
    a: "Kein Problem: Die Hinweise öffnen sich automatisch nach 3, 6 und 9 Minuten. Ihr könnt sie aber auch früher aufdecken, wenn ihr wollt.",
  },
  {
    q: "Brauchen wir Internet?",
    a: "Ja, das Spiel läuft im Browser auf dem Handy. Ladet die Seite am besten, solange ihr noch gutes Netz habt.",
  },
  {
    q: "Können wir Hinweise nochmal ansehen?",
    a: "Ja. Jeder aufgedeckte Hinweis bleibt gespeichert und lässt sich jederzeit wieder aufklappen.",
  },
  {
    q: "Was passiert, wenn die Zeit abläuft?",
    a: "Nach 90 Minuten endet die Runde. Nicht geschaffte Etappen werden dann gesperrt, gelöste dürft ihr im Rückblick noch ansehen.",
  },
  {
    q: "Müssen wir die Etappen in einer bestimmten Reihenfolge spielen?",
    a: "Eure Lehrperson legt die Reihenfolge und die Wege fest. Folgt einfach den Anweisungen im Spiel.",
  },
] as const;

function HeroSection() {
  return (
    <header className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 text-center">
      {/* Schwebende Papier-Elemente im Hintergrund */}
      <div
        aria-hidden
        className="animate-float-slow paper-card absolute left-[6%] top-[14%] h-20 w-16 rounded-sm opacity-60"
        style={{ "--float-rot": "-8deg" } as React.CSSProperties}
      />
      <div
        aria-hidden
        className="animate-float-slow paper-card absolute right-[8%] top-[22%] h-16 w-20 rounded-sm opacity-50"
        style={{ "--float-rot": "6deg", animationDelay: "1.2s" } as React.CSSProperties}
      />
      <div
        aria-hidden
        className="animate-float-slow paper-card absolute bottom-[18%] left-[12%] h-14 w-14 rounded-sm opacity-40"
        style={{ "--float-rot": "10deg", animationDelay: "2.1s" } as React.CSSProperties}
      />

      <PaperCard rotate={-1} tape="top" className="paper-card-lift max-w-md px-8 py-10">
        <div className="mb-5 flex justify-center">
          <span className="animate-stamp-in inline-block">
            <Stamp rotate={-8}>Anleitung</Stamp>
          </span>
        </div>
        <h1 className="text-4xl leading-tight sm:text-5xl">
          So spielst du
          <br />
          <span className="text-accent">Majas Mission</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Ein Escape Game durch Widnau: fünf Etappen, fünf Akten, 90 Minuten.
          Hier erfährst du alles, was du wissen musst.
        </p>
      </PaperCard>

      <div className="animate-bounce-soft absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground">
        <span className="font-mono-typed text-xs uppercase tracking-widest">Scrollen</span>
        <ChevronDown className="h-5 w-5" aria-hidden />
      </div>
    </header>
  );
}

function StorySection() {
  return (
    <section className="px-5 py-14">
      <Reveal className="mx-auto max-w-md">
        <PaperCard rotate={1} tape="top-right" className="px-7 py-8">
          <h2 className="text-2xl">Die Geschichte</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Maja findet im Haus ihres Grossvaters Jakob fünf versiegelte Akten.
            Darin steckt sein Vermächtnis: Wissen über Mobilität, Konsum, Wohnen,
            Biodiversität und Energie.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            In 90 Minuten tritt der Gemeinderat zusammen. Nur wer alle Akten
            entschlüsselt, kann Jakobs Anliegen rechtzeitig ans Hearing bringen.
          </p>
        </PaperCard>
      </Reveal>
    </section>
  );
}

function StepCard({
  step,
  index,
}: {
  step: (typeof STEPS)[number];
  index: number;
}) {
  const Icon = step.icon;
  return (
    <Reveal delay={index * 90}>
      <div className="relative pl-14">
        <span
          aria-hidden
          className="stamp-mark absolute left-0 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-sm"
        >
          {index + 1}
        </span>
        <PaperCard rotate={index % 2 === 0 ? -0.8 : 0.8} className="px-6 py-5">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden />
            <h3 className="text-lg">{step.title}</h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
        </PaperCard>
      </div>
    </Reveal>
  );
}

function StepsSection() {
  const { ref, inView } = useInView<HTMLDivElement>(0.1);
  return (
    <section className="px-5 py-14">
      <Reveal className="mx-auto mb-10 max-w-md text-center">
        <Stamp rotate={-4}>Ablauf</Stamp>
        <h2 className="mt-4 text-3xl">So spielst du, in fünf Schritten</h2>
      </Reveal>

      <div ref={ref} className="relative mx-auto max-w-md">
        <span
          aria-hidden
          className={cn(
            "timeline-line absolute bottom-8 left-5 top-8 w-0.5 bg-kraft",
            inView && "timeline-line-visible",
          )}
        />
        <div className="flex flex-col gap-8">
          {STEPS.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FactsSection() {
  return (
    <section className="px-5 py-14">
      <Reveal className="mx-auto mb-8 max-w-md text-center">
        <Stamp rotate={3}>Wichtig</Stamp>
        <h2 className="mt-4 text-3xl">Das musst du wissen</h2>
      </Reveal>
      <div className="mx-auto grid max-w-md gap-6">
        {FACTS.map((fact, i) => {
          const Icon = fact.icon;
          return (
            <Reveal key={fact.title} delay={i * 100}>
              <PaperCard rotate={i % 2 === 0 ? 0.8 : -0.8} className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                  <h3 className="text-lg">{fact.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{fact.body}</p>
              </PaperCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="px-5 py-14">
      <Reveal className="mx-auto mb-8 max-w-md text-center">
        <Stamp rotate={-3}>Fragen</Stamp>
        <h2 className="mt-4 text-3xl">Häufige Fragen</h2>
      </Reveal>
      <div className="mx-auto flex max-w-md flex-col gap-4">
        {FAQ.map((item, i) => (
          <Reveal key={item.q} delay={i * 60}>
            <PaperCard rotate={i % 2 === 0 ? -0.5 : 0.5} className="px-5 py-0">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-left font-serif text-base font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            </PaperCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="px-5 pb-20 pt-10">
      <Reveal className="mx-auto max-w-md text-center">
        <PaperCard rotate={-1} tape="top" className="paper-card-lift px-8 py-10">
          <div className="mb-5 flex justify-center">
            <Stamp rotate={-6}>Bereit?</Stamp>
          </div>
          <h2 className="text-2xl">Dann scanne den ersten QR-Code vor Ort</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            <MapPin className="mr-1 inline h-4 w-4 align-[-2px] text-accent" aria-hidden />
            Deine Lehrperson sagt dir, wo es losgeht. Viel Erfolg bei Majas Mission!
          </p>
        </PaperCard>
      </Reveal>
    </section>
  );
}

function AnleitungPage() {
  return (
    <main className="min-h-dvh">
      <HeroSection />
      <StorySection />
      <StepsSection />
      <FactsSection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
