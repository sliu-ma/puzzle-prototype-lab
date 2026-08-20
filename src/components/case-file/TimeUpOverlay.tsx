import { AlertTriangle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { IconStamp } from "./IconStamp";

/**
 * Pop-up, sobald die Spielzeit abgelaufen ist. Die Runde wird nicht
 * zurückgesetzt, sondern führt zum Abschluss mit Punkten und Abzeichen.
 */
export function TimeUpOverlay() {
  return (
    <Dialog open>
      <DialogContent className="max-w-sm" hideClose>
        <DialogHeader>
          <IconStamp icon={AlertTriangle} tone="urgent" rotate={-5} className="mb-2" />
          <DialogTitle className="text-center font-serif text-destructive">
            Die Zeit ist um
          </DialogTitle>
          <DialogDescription className="pt-3 font-serif text-base italic leading-relaxed text-foreground/85">
            „Die Gemeindeversammlung hat begonnen. Weiter ermitteln können wir
            jetzt nicht mehr. Schaut euch an, was ihr zusammengetragen habt."
          </DialogDescription>
        </DialogHeader>
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
