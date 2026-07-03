import { Mail, MailOpen } from "lucide-react";

/**
 * Header-Chip für den Umschlag am Ende jeder Etappe.
 * Wird oben in der "Nächste Etappe"-Karte platziert.
 */
export function EnvelopeHeader({ nr, ort }: { nr: number; ort: string }) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-stamp/40 bg-stamp/10 px-3 py-1.5">
      <MailOpen className="h-4 w-4 text-stamp" />
      <span className="font-mono-typed text-[11px] uppercase tracking-[0.18em] text-stamp">
        Umschlag {nr} · {ort}
      </span>
    </div>
  );
}

/**
 * Hinweisbanner am Ende des vorletzten Schritts, um klarzumachen,
 * dass der Weiter-Klick den nächsten Umschlag öffnet.
 */
export function EnvelopeHint({ nr }: { nr: number }) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-sm border border-dashed border-stamp/50 bg-stamp/5 px-4 py-3">
      <Mail className="h-5 w-5 shrink-0 text-stamp" />
      <p className="font-serif text-sm leading-snug text-foreground/85">
        Jetzt wartet <strong>Umschlag {nr}</strong> auf dich — er verrät den Ort
        der nächsten Etappe.
      </p>
    </div>
  );
}
