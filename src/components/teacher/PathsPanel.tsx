/**
 * Wege und Material einer Runde.
 *
 * Zeigt die Verteilung der Wege (A bis D), erlaubt zufälliges Verteilen,
 * Korrekturen pro Gruppe und das Ausdrucken der benötigten QR-Codes. Der
 * Bereich steht im Wartezimmer und während der laufenden Runde zur Verfügung.
 */
import { useState } from "react";
import { Shuffle } from "lucide-react";
import { BranchDiagram } from "@/components/teacher/BranchDiagram";
import { QRPrintList } from "@/components/teacher/QRPrintList";
import {
  PATH_COLOR,
  lettersFor,
  normalizeBranches,
  type Branches,
  type Letter,
} from "@/lib/variants";
import {
  teacherAssignVariants,
  teacherSetTeamVariant,
} from "@/lib/rounds.functions";
import { cn } from "@/lib/utils";

export function PathsPanel({
  password,
  code,
  pathCount,
  branches,
  teams,
  reload,
}: {
  password: string;
  code: string;
  pathCount: number;
  branches: Branches | null;
  teams: { teamId: string; name: string; variant: string | null }[];
  reload: () => void;
}) {
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCodes, setShowCodes] = useState(false);

  const letters = lettersFor(pathCount);
  const assigned = teams.filter((t) => t.variant).length;

  const assign = async () => {
    setAssigning(true);
    setError(null);
    try {
      await teacherAssignVariants({ data: { password, code } });
      reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Die Wege konnten nicht verteilt werden.",
      );
    } finally {
      setAssigning(false);
    }
  };

  const setOne = async (teamId: string, variant: string) => {
    setError(null);
    try {
      await teacherSetTeamVariant({ data: { password, teamId, variant } });
      reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Der Weg konnte nicht geändert werden.",
      );
    }
  };

  return (
    <section className="mt-5 rounded-sm border border-border bg-secondary/40 p-3">
      <h3 className="font-serif text-lg font-bold">Wege ({pathCount}) und Material</h3>
      <p className="mt-1 text-sm text-foreground/80">
        Verteilt die Wege, sobald alle Gruppen angemeldet sind. Gruppen, die später
        dazukommen, erhalten automatisch den Weg mit den wenigsten Gruppen.
      </p>

      <button
        type="button"
        onClick={() => void assign()}
        disabled={assigning || teams.length === 0}
        className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-sm border border-stamp bg-stamp/10 px-3 font-serif font-semibold disabled:opacity-50"
      >
        <Shuffle className={cn("h-4 w-4", assigning && "animate-spin")} />
        {assigned > 0 ? "Wege neu verteilen" : "Wege zufällig verteilen"}
      </button>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      <p className="mt-2 text-xs text-muted-foreground">
        {assigned} von {teams.length} Gruppen haben einen Weg.
      </p>

      <ul className="mt-3 space-y-1.5">
        {teams.map((t) => (
          <li
            key={t.teamId}
            className="flex items-center gap-2 rounded-sm border border-border bg-card px-2.5 py-2"
          >
            <span
              className="font-mono-typed flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-base font-bold text-white"
              style={{
                backgroundColor: t.variant
                  ? PATH_COLOR[t.variant as Letter]
                  : "hsl(var(--muted-foreground))",
              }}
              aria-hidden
            >
              {t.variant ?? "?"}
            </span>
            <p className="min-w-0 flex-1 truncate font-serif font-semibold">{t.name}</p>
            <label className="sr-only" htmlFor={`weg-${t.teamId}`}>
              Weg für {t.name}
            </label>
            <select
              id={`weg-${t.teamId}`}
              value={t.variant ?? ""}
              onChange={(e) => void setOne(t.teamId, e.target.value)}
              className="min-h-[40px] rounded-sm border border-border bg-background px-2 font-mono-typed text-sm"
            >
              <option value="">–</option>
              {letters.map((l) => (
                <option key={l} value={l}>
                  Weg {l}
                </option>
              ))}
            </select>
          </li>
        ))}
        {teams.length === 0 && (
          <li className="rounded-sm border border-dashed border-border p-3 text-sm text-muted-foreground">
            Noch keine Gruppe angemeldet.
          </li>
        )}
      </ul>

      <div className="mt-3">
        <BranchDiagram
          pathCount={pathCount}
          branches={normalizeBranches(branches, pathCount)}
        />
      </div>

      <button
        type="button"
        onClick={() => setShowCodes((v) => !v)}
        className={cn(
          "font-mono-typed mt-3 min-h-[40px] text-[10px] uppercase tracking-wider text-muted-foreground underline",
        )}
      >
        {showCodes ? "QR-Codes ausblenden" : "QR-Codes zum Ausdrucken zeigen"}
      </button>
      {showCodes && (
        <QRPrintList
          pathCount={pathCount}
          branches={normalizeBranches(branches, pathCount)}
        />
      )}
    </section>
  );
}
