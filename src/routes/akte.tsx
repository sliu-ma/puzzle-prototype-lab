import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PaperCard } from "@/components/case-file/PaperCard";
import { Stamp } from "@/components/case-file/Stamp";
import { EvidenceModal } from "@/components/case-file/EvidenceModal";
import { CodeLock } from "@/components/case-file/CodeLock";
import { RECEIPT, SOLUTION_CODE } from "@/lib/maya-data";

export const Route = createFileRoute("/akte")({
  head: () => ({
    meta: [
      { title: "Akte 001 — Wo ist Maya?" },
      {
        name: "description",
        content:
          "Kapitel 1: Der Einkaufszettel. Lies Mayas Beweise, vergleiche und finde den Code, um den verschlossenen Umschlag zu öffnen.",
      },
    ],
  }),
  component: AktePage,
});

type EvidenceId = "voicemail" | "receipt" | "notes" | "study" | "envelope" | null;

function AktePage() {
  const [open, setOpen] = useState<EvidenceId>(null);
  const [unlocked, setUnlocked] = useState(false);

  return (
    <main className="relative min-h-screen px-4 py-10 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-ink) 0, var(--color-ink) 1px, transparent 1px, transparent 28px)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <Link
              to="/"
              className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              ← Aktenmappe schließen
            </Link>
            <h1 className="mt-2 font-serif text-3xl font-bold sm:text-5xl">
              Akte 001 · Kapitel 1
            </h1>
            <p className="mt-1 font-serif italic text-foreground/70">
              Der Einkaufszettel
            </p>
          </div>
          <Stamp rotate={-6}>Vertraulich</Stamp>
        </header>

        {/* Briefing */}
        <PaperCard className="mb-10" rotate={-0.3}>
          <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
            Auftrag
          </p>
          <p className="mt-3 font-serif text-lg leading-relaxed text-foreground/90">
            Sieh dir alle Beweisstücke an. Vergleiche Mayas Kassenbon mit ihrem Recherche-Material.
            Aus den Antworten auf ihre vier Fragen ergibt sich ein <strong>vierstelliger Code</strong>{" "}
            — er öffnet den verschlossenen Umschlag.
          </p>
        </PaperCard>

        {/* Evidence board */}
        <section
          aria-label="Beweisstücke"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <PaperCard
            as="button"
            onClick={() => setOpen("voicemail")}
            ariaLabel="Sprachnachricht öffnen"
            rotate={-1.5}
            tape="top-left"
            className="min-h-[210px]"
          >
            <p className="font-mono-typed text-[10px] uppercase tracking-[0.18em] text-stamp">
              Beweis 01 · Audio-Transkript
            </p>
            <h3 className="mt-3 font-serif text-2xl font-bold">Sprachnachricht</h3>
            <p className="mt-3 text-sm text-foreground/70">
              Mayas letzte Nachricht an ihre beste Freundin Lin. Aufgenommen am Mittwoch, 14:32 Uhr.
            </p>
            <p className="mt-4 font-mono-typed text-xs uppercase tracking-wider text-muted-foreground">
              ▶ 0:47
            </p>
          </PaperCard>

          <PaperCard
            as="button"
            onClick={() => setOpen("receipt")}
            ariaLabel="Kassenbon öffnen"
            rotate={1}
            tape="top"
            className="min-h-[210px]"
          >
            <p className="font-mono-typed text-[10px] uppercase tracking-[0.18em] text-stamp">
              Beweis 02 · Kassenbon
            </p>
            <h3 className="mt-3 font-serif text-2xl font-bold">Der Einkauf</h3>
            <p className="mt-3 text-sm text-foreground/70">
              Bon eines Supermarkts in der Innenstadt. 8 Produkte. Mayas Handschrift am Rand.
            </p>
            <p className="mt-4 font-mono-typed text-xs uppercase tracking-wider text-muted-foreground">
              Markt-Frisch · 13.03. · 17:48
            </p>
          </PaperCard>

          <PaperCard
            as="button"
            onClick={() => setOpen("notes")}
            ariaLabel="Notizzettel öffnen"
            rotate={-0.8}
            tape="top-right"
            className="min-h-[210px]"
          >
            <p className="font-mono-typed text-[10px] uppercase tracking-[0.18em] text-stamp">
              Beweis 03 · Mayas Notizen
            </p>
            <h3 className="mt-3 font-serif text-2xl font-bold">Vier Fragen</h3>
            <p className="mt-3 text-sm text-foreground/70">
              Ein abgerissener Notizzettel mit Mayas Aufgaben — die Reihenfolge der Antworten ist
              wichtig.
            </p>
            <p className="mt-4 font-mono-typed text-xs uppercase tracking-wider text-muted-foreground">
              4 Aufgaben · Bleistift
            </p>
          </PaperCard>

          <PaperCard
            as="button"
            onClick={() => setOpen("study")}
            ariaLabel="Recherche öffnen"
            rotate={1.2}
            tape="top-left"
            className="min-h-[210px] lg:col-span-2"
          >
            <p className="font-mono-typed text-[10px] uppercase tracking-[0.18em] text-stamp">
              Beweis 04 · Recherche
            </p>
            <h3 className="mt-3 font-serif text-2xl font-bold">
              Was heißt eigentlich „nachhaltig einkaufen"?
            </h3>
            <p className="mt-3 text-sm text-foreground/70">
              Mayas Lese-Material: regional, saisonal, fair. Drei Begriffe, die du brauchst, um den
              Bon zu lesen.
            </p>
            <p className="mt-4 font-mono-typed text-xs uppercase tracking-wider text-muted-foreground">
              Ausdruck · 3 Karten
            </p>
          </PaperCard>

          <PaperCard
            as="button"
            onClick={() => setOpen("envelope")}
            ariaLabel="Verschlossenen Umschlag öffnen"
            rotate={-1.8}
            className={`min-h-[210px] ${
              unlocked ? "bg-paper-deep/60" : "bg-secondary"
            }`}
          >
            <div className="flex h-full flex-col">
              <p className="font-mono-typed text-[10px] uppercase tracking-[0.18em] text-stamp">
                Beweis 05 · Verschlossen
              </p>
              <h3 className="mt-3 font-serif text-2xl font-bold">
                {unlocked ? "Umschlag (geöffnet)" : "Brauner Umschlag"}
              </h3>
              <p className="mt-3 text-sm text-foreground/70">
                {unlocked
                  ? "Der Umschlag liegt offen vor dir. Klicke, um den Inhalt zu lesen."
                  : "Mit Klebeband versiegelt. Ein 4-stelliges Schloss verriegelt das Klappband."}
              </p>
              <div className="mt-auto pt-4">
                {unlocked ? (
                  <span className="font-mono-typed text-xs uppercase tracking-wider text-emerald-800">
                    ✓ Geöffnet · Inhalt einsehen
                  </span>
                ) : (
                  <span className="stamp-mark inline-block px-2 py-0.5 text-[10px]">
                    🔒 Code erforderlich
                  </span>
                )}
              </div>
            </div>
          </PaperCard>
        </section>

        <p className="mt-12 text-center font-mono-typed text-xs uppercase tracking-[0.2em] text-muted-foreground">
          — Ende der Akte · Kapitel 1 —
        </p>
      </div>

      {/* Modals */}
      <EvidenceModal
        open={open === "voicemail"}
        onClose={() => setOpen(null)}
        kicker="Beweis 01 · Sprachnachricht"
        title="Mayas Nachricht an Lin"
      >
        <div className="space-y-4 font-serif italic">
          <p className="text-foreground/60">[Aufnahme · 14:32 · 47 Sek.]</p>
          <blockquote className="border-l-4 border-stamp pl-4 not-italic font-sans text-[15px] leading-relaxed">
            „Lin, hör mal — ich war eben im Markt-Frisch. Ich glaub, ich hab's. Du weißt, was sie
            uns über dieses Gaskraftwerk erzählen, dass es ja so super grün und regional ist? Einer
            der Investoren hat genau diese Supermarkt-Kette."
            <br />
            <br />
            „Und ich hab gerade dort eingekauft — wegen Bio, hab ich gedacht. Aber wenn du den Bon
            siehst… also, ich hab vier Fragen aufgeschrieben. Vier Antworten, vier Ziffern. Ich pack
            alles in den Umschlag. Falls mir was passiert — du weißt schon, wo der Schlüssel zur
            Antwort liegt."
            <br />
            <br />
            „Bis gleich. Ich fahr noch zur Redaktion."
          </blockquote>
          <p className="text-sm text-foreground/60 not-italic font-sans">
            <strong>Maya kam nie in der Redaktion an.</strong>
          </p>
        </div>
      </EvidenceModal>

      <EvidenceModal
        open={open === "receipt"}
        onClose={() => setOpen(null)}
        kicker="Beweis 02 · Kassenbon"
        title="Markt-Frisch · 13. März · 17:48"
        className="max-w-xl"
      >
        <div className="-mx-2 rounded-sm bg-paper p-4 font-mono-typed text-[13px] leading-relaxed text-ink shadow-inner sm:p-6">
          <div className="text-center">
            <p className="text-base font-bold tracking-widest">MARKT–FRISCH</p>
            <p className="text-[11px]">Hauptstraße 14 · Filiale 042</p>
            <p className="mt-1 text-[11px]">— — — — — — — — — — — —</p>
          </div>
          <table className="mt-3 w-full text-[12px]">
            <thead>
              <tr className="border-b border-dashed border-ink/40 text-left">
                <th className="py-1 pr-2">Produkt</th>
                <th className="py-1 pr-2">Herkunft</th>
                <th className="py-1 pr-2">Saison</th>
                <th className="py-1 pr-2">Siegel</th>
                <th className="py-1 text-right">€</th>
              </tr>
            </thead>
            <tbody>
              {RECEIPT.map((it) => (
                <tr key={it.id} className="border-b border-dotted border-ink/15">
                  <td className="py-1.5 pr-2">{it.name}</td>
                  <td className="py-1.5 pr-2">{it.origin}</td>
                  <td className="py-1.5 pr-2">
                    {it.season === "in" && "in Saison"}
                    {it.season === "out" && "nicht Saison"}
                    {it.season === "import" && "Import"}
                  </td>
                  <td className="py-1.5 pr-2 uppercase">
                    {it.label === "none" ? "—" : it.label}
                  </td>
                  <td className="py-1.5 text-right">{it.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px]">— — — — — — — — — — — —</p>
          <p className="mt-1 text-right text-[12px]">Datum: heute, 13. März</p>
        </div>
        <p className="mt-4 text-sm font-serif italic text-foreground/70">
          Am Rand, mit Bleistift: <span className="ink-underline">„Saison = Deutschland, März"</span>
          <br />
          Daneben: <span className="ink-underline">„Region = unser Bundesland, nicht nur DE"</span>
        </p>
      </EvidenceModal>

      <EvidenceModal
        open={open === "notes"}
        onClose={() => setOpen(null)}
        kicker="Beweis 03 · Mayas Notizen"
        title="Vier Fragen, vier Ziffern"
        className="max-w-xl"
      >
        <div
          className="rounded-sm bg-paper-deep/70 p-6 font-mono-typed text-[15px] leading-relaxed text-ink"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0, transparent 27px, oklch(0.42 0.135 28 / 0.18) 27px, oklch(0.42 0.135 28 / 0.18) 28px)",
          }}
        >
          <p className="font-serif text-base italic">— Code-Schlüssel für Lin —</p>
          <ol className="mt-4 space-y-3">
            <li>
              <strong>Ziffer 1:</strong> Wie viele Produkte auf dem Bon sind <u>nicht in Saison</u>{" "}
              (Deutschland, März)?
            </li>
            <li>
              <strong>Ziffer 2:</strong> Wie viele Produkte kommen von <u>außerhalb Europas</u>?
            </li>
            <li>
              <strong>Ziffer 3:</strong> Wie viele Produkte tragen <u>kein</u> Bio- und{" "}
              <u>kein</u> Fairtrade-Siegel?
            </li>
            <li>
              <strong>Ziffer 4:</strong> Wie viele Produkte sind <u>wirklich regional</u> (also aus
              unserer Region, nicht nur „DE")?
            </li>
          </ol>
          <p className="mt-4 text-sm italic">
            Reihenfolge merken! Erst Ziffer 1, dann 2, dann 3, dann 4. — M.
          </p>
        </div>
      </EvidenceModal>

      <EvidenceModal
        open={open === "study"}
        onClose={() => setOpen(null)}
        kicker="Beweis 04 · Recherche"
        title="Drei Begriffe, die du brauchst"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Saisonal",
              body: "Obst und Gemüse, das gerade in deinem Land wächst und geerntet werden kann. Wer im März in Deutschland Erdbeeren oder Tomaten kauft, kauft Ware, die im warmen Süden oder im beheizten Gewächshaus produziert wurde — das kostet viel Energie.",
              hint: "Im März in DE in Saison: Äpfel (Lager), Kartoffeln, Feldsalat, Lauch, Möhren …",
            },
            {
              title: "Regional",
              body: "Lebensmittel aus deiner Umgebung — meist 50–100 km. Kurzer Transport, frischer, oft kleinere Höfe. Achtung: „Aus Deutschland" ist noch nicht regional. Region heißt: aus deiner Gegend.",
              hint: "Auf dem Bon: nur Produkte mit Region (DE) gelten als regional.",
            },
            {
              title: "Fair & Bio",
              body: "Bio = ohne synthetische Pestizide, artgerecht. Fairtrade = faire Löhne für Bauernfamilien, vor allem bei Kaffee, Bananen, Schokolade. Produkte ohne Siegel werden weder geprüft noch garantiert fair.",
              hint: "Zähle nur Siegel, die im Bon stehen.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-sm border border-border bg-paper p-4 shadow-sm"
            >
              <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
                Karte
              </p>
              <h4 className="mt-1 font-serif text-xl font-bold">{c.title}</h4>
              <p className="mt-2 text-sm text-foreground/85">{c.body}</p>
              <p className="mt-3 border-t border-dashed border-border pt-2 text-xs italic text-foreground/60">
                {c.hint}
              </p>
            </div>
          ))}
        </div>
      </EvidenceModal>

      <EvidenceModal
        open={open === "envelope"}
        onClose={() => setOpen(null)}
        kicker={unlocked ? "Beweis 05 · Geöffnet" : "Beweis 05 · Verschlossen"}
        title={unlocked ? "Inhalt des Umschlags" : "Brauner Umschlag"}
        className="max-w-lg"
      >
        {!unlocked ? (
          <>
            <p className="mb-6 text-foreground/80">
              Der Umschlag ist mit Tape versiegelt und mit einem 4-stelligen Zahlenschloss
              gesichert. Trag die vier Ziffern ein, die du aus dem Bon errechnet hast.
            </p>
            <CodeLock expected={SOLUTION_CODE} onUnlock={() => setUnlocked(true)} />
            <p className="mt-6 text-center font-mono-typed text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Tipp: Reihenfolge ist Saison · Welt · ohne Siegel · regional
            </p>
          </>
        ) : (
          <div className="space-y-5">
            <div
              className="rounded-sm bg-paper p-5 font-serif italic leading-relaxed text-foreground/90"
              style={{ transform: "rotate(-0.3deg)" }}
            >
              <p className="not-italic font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
                Mayas Notiz · gefaltetes Blatt
              </p>
              <p className="mt-3">
                „Wer ‚regional und nachhaltig' auf seine Werbung schreibt, aber so einkaufen lässt —
                der hat ein Problem mit der Wahrheit. Genau wie bei dem Gaskraftwerk."
              </p>
              <p className="mt-3">
                „Auf dem Foto, das ich gefunden hab, sieht man, wer wirklich dahintersteckt. Es
                liegt im zweiten Umschlag, in der Redaktion. Wenn du das hier liest, Lin — du weißt,
                wo."
              </p>
            </div>

            <div className="rounded-sm border-2 border-dashed border-stamp bg-paper-deep/40 p-5">
              <p className="font-mono-typed text-[10px] uppercase tracking-[0.2em] text-stamp">
                Kapitel 2 folgt
              </p>
              <h4 className="mt-1 font-serif text-xl font-bold">Die Geldspur</h4>
              <p className="mt-2 text-sm text-foreground/80">
                In Kapitel 2 folgst du Mayas Spur in die Redaktion und entwirrst, wer die Investoren
                des Gaskraftwerks wirklich sind.
              </p>
              <p className="mt-3 font-mono-typed text-[11px] uppercase tracking-wider text-muted-foreground">
                In Vorbereitung — bald spielbar
              </p>
            </div>

            <div className="text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-sm border border-border bg-card px-5 py-2.5 font-serif text-sm font-semibold transition-colors hover:bg-secondary"
              >
                ← Akte schließen
              </Link>
            </div>
          </div>
        )}
      </EvidenceModal>
    </main>
  );
}
