import { School } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { IconStamp } from "./IconStamp";
import { RETURN_NOTICE, RETURN_TITLE } from "@/lib/story";

/**
 * Pop-up, sobald die Lehrperson die Runde abgeschlossen und damit alle
 * Gruppen zurückgerufen hat. Weiter ermitteln lässt sich nicht mehr.
 */
export function RoundClosedOverlay() {
  return (
    <Dialog open>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <IconStamp icon={School} tone="urgent" rotate={-5} className="mb-2" />
          <DialogTitle className="text-center font-serif text-destructive">
            {RETURN_TITLE}
          </DialogTitle>
          <DialogDescription className="pt-3 text-center font-serif text-base font-semibold leading-relaxed text-foreground">
            {RETURN_NOTICE}
          </DialogDescription>
        </DialogHeader>
        <p className="text-center font-serif text-sm italic leading-relaxed text-foreground/75">
          Die Lehrperson hat die Runde beendet. Weiter ermitteln können wir
          jetzt nicht mehr.
        </p>
        <Link
          to="/abschluss"
          className="mt-2 block w-full rounded-sm bg-primary px-4 py-2.5 text-center font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          Zum Abschluss →
        </Link>
      </DialogContent>
    </Dialog>
  );
}
