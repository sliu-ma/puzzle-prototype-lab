/**
 * Planungsbereich einer Runde.
 *
 * Solange eine Runde «in Planung» ist, kann alles in Ruhe vorbereitet werden:
 * Anzahl Wege, Verzweigungen pro Posten, Orte der Posten und das Material.
 * Erst mit «Runde für Gruppen öffnen» wird der Rundencode gültig.
 */
import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Lock, Save, Unlock } from "lucide-react";
import { BranchDiagram } from "@/components/teacher/BranchDiagram";
import { QRPrintList } from "@/components/teacher/QRPrintList";
import { teacherSetRoundPaths } from "@/lib/rounds.functions";
import {
  STAGE_IDS,
  defaultBranches,
  normalizeBranches,
  normalizeStationDescriptions,
  stationsFor,
  type Branches,
  type StationDescriptions,
} from "@/lib/variants";

export function PlanningPanel({
  password,
  code,
  pathCount,
  branches,
  stationDescriptions,
  reload,
  busy,
  onOpenForTeams,
}: {
  password: string;
  code: string;
  pathCount: number;
  branches: Branches | null;
  stationDescriptions: StationDescriptions | null;
  reload: () => void;
  busy: boolean;
  onOpenForTeams: () => void;
}) {
  const [draftPaths, setDraftPaths] = useState(pathCount);
  const [draftBranches, setDraftBranches] = useState<Branches>(() =>
    normalizeBranches(branches, pathCount),
  );
  const [draftPlaces, setDraftPlaces] = useState<StationDescriptions>(() =>
    normalizeStationDescriptions(
      stationDescriptions,
      normalizeBranches(branches, pathCount),
      pathCount,
    ),
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCodes, setShowCodes] = useState(false);

  // Neue Serverdaten übernehmen, solange nichts Ungespeichertes offen ist.
  useEffect(() => {
    if (dirty) return;
    const nextBranches = normalizeBranches(branches, pathCount);
    setDraftPaths(pathCount);
    setDraftBranches(nextBranches);
    setDraftPlaces(
      normalizeStationDescriptions(stationDescriptions, nextBranches, pathCount),
    );
  }, [branches, stationDescriptions, pathCount, dirty]);

  const normalized = useMemo(
    () => normalizeBranches(draftBranches, draftPaths),
    [draftBranches, draftPaths],
  );

  const placesOpen = STAGE_IDS.reduce((sum, stage) => {
    const count = stationsFor(normalized, stage, draftPaths).length;
    const values = draftPlaces[String(stage)] ?? [];
    return (
      sum +
      Array.from({ length: count }).filter((_, i) => !(values[i] ?? "").trim()).length
    );
  }, 0);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const places = normalizeStationDescriptions(draftPlaces, normalized, draftPaths);
      await teacherSetRoundPaths({
        data: {
          password,
          code,
          pathCount: draftPaths,
          branches: normalized,
          stationDescriptions: places,
        },
      });
      setDraftPlaces(places);
      setDirty(false);
      setSaved(true);
      reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Die Planung konnte nicht gespeichert werden.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-stamp/40 bg-stamp/5 p-3">
        <p className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
          In Planung
        </p>
        <p className="mt-1 text-sm text-foreground/80">
          Der Rundencode ist noch gesperrt: Gruppen können nicht beitreten. Legt hier
          Wege, Orte und Material fest und öffnet die Runde erst am Spieltag.
        </p>
      </div>

      <div className="rounded-sm border border-border bg-secondary/40 p-3">
        <label className="flex flex-wrap items-center gap-2 font-serif text-sm font-semibold">
          Wie viele Wege soll diese Runde haben?
          <select
            value={draftPaths}
            onChange={(e) => {
              const n = Number(e.target.value);
              setDraftPaths(n);
              setDraftBranches(defaultBranches(n));
              setDraftPlaces({});
              setDirty(true);
              setSaved(false);
            }}
            className="min-h-[40px] rounded-sm border border-border bg-paper px-2 text-sm"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n === 1 ? "1 (alle gleich)" : `${n} Wege`}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          Mit mehreren Wegen laufen die Gruppen versetzt. Pro Posten legt ihr fest, wie
          viele Stationen es gibt und wo sie stehen.
        </p>

        <div className="mt-3">
          <BranchDiagram
            pathCount={draftPaths}
            branches={normalized}
            onChange={(next) => {
              setDraftBranches(next);
              setDirty(true);
              setSaved(false);
            }}
            descriptions={draftPlaces}
            onDescriptionsChange={(next) => {
              setDraftPlaces(next);
              setDirty(true);
              setSaved(false);
            }}
          />
        </div>

        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !dirty}
          className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 font-serif font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Wird gespeichert" : saved ? "Gespeichert" : "Planung speichern"}
        </button>
      </div>

      <div className="rounded-sm border border-border bg-card p-3">
        <p className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
          Checkliste
        </p>
        <ul className="mt-2 space-y-1.5 text-sm">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-stamp" />
            Titel und Zeitbudget gesetzt
          </li>
          <li className="flex items-center gap-2">
            {dirty ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Check className="h-4 w-4 text-stamp" />
            )}
            {dirty ? "Planung noch nicht gespeichert" : "Wege gespeichert"}
          </li>
          <li className="flex items-center gap-2">
            {placesOpen > 0 ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Check className="h-4 w-4 text-stamp" />
            )}
            {placesOpen > 0
              ? `${placesOpen} Orte noch offen (freiwillig)`
              : "Alle Orte eingetragen"}
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            QR-Codes gedruckt oder als ZIP gespeichert
          </li>
        </ul>

        <button
          type="button"
          onClick={() => setShowCodes((v) => !v)}
          className="font-mono-typed mt-3 min-h-[40px] text-[10px] uppercase tracking-wider text-muted-foreground underline"
        >
          {showCodes ? "QR-Codes ausblenden" : "QR-Codes zum Ausdrucken zeigen"}
        </button>
        {showCodes && <QRPrintList pathCount={draftPaths} branches={normalized} />}
      </div>

      <button
        type="button"
        onClick={onOpenForTeams}
        disabled={busy || dirty}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-sm border border-stamp bg-stamp/10 px-4 font-serif text-base font-semibold disabled:opacity-50"
      >
        <Unlock className="h-4 w-4" />
        Runde für Gruppen öffnen
      </button>
      <p className="text-xs text-muted-foreground">
        {dirty
          ? "Zuerst die Planung speichern, dann kann die Runde geöffnet werden."
          : "Danach gilt der Rundencode und die Wege sind fixiert. Ohne angemeldete Gruppe könnt ihr wieder in die Planung zurück."}
      </p>
    </div>
  );
}
