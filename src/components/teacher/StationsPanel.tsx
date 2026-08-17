import { useEffect, useState, useCallback } from "react";
import { MapPin, Camera, Save, Trash2, Printer } from "lucide-react";
import {
  teacherListStations,
  teacherUpsertStation,
  teacherUploadStationPhoto,
  teacherDeleteStation,
} from "@/lib/stations.functions";
import { StationCard, type StationCardData } from "./StationCard";
import { cn } from "@/lib/utils";

const STAGE_DEFAULTS = [
  { nr: 1, placeName: "Bahnhof", defaultNote: "" },
  { nr: 2, placeName: "Dorfladen", defaultNote: "" },
  { nr: 3, placeName: "Wald-Lichtung", defaultNote: "" },
  { nr: 4, placeName: "Jakobs Haus", defaultNote: "" },
  { nr: 5, placeName: "Wasserkraftwerk", defaultNote: "" },
];

function emptyStation(stageNr: number): StationCardData {
  return {
    stageNr,
    placeName: STAGE_DEFAULTS.find((d) => d.nr === stageNr)?.placeName ?? `Etappe ${stageNr}`,
    address: "",
    lat: null,
    lng: null,
    note: "",
    photoPath: null,
    mapUrl: null,
  };
}

function toForm(station: StationCardData): StationForm {
  return {
    stageNr: station.stageNr,
    placeName: station.placeName,
    address: station.address,
    note: station.note,
    lat: station.lat ?? null,
    lng: station.lng ?? null,
    photoPath: station.photoPath ?? null,
    mapUrl: station.mapUrl ?? null,
  };
}


export type StationForm = {
  stageNr: number;
  placeName: string;
  address: string;
  note: string;
  lat: number | null;
  lng: number | null;
  photoPath: string | null;
  mapUrl: string | null;
};

type Props = {
  password: string;
  code: string;
  onPrint: () => void;
};

export function StationsPanel({ password, code, onPrint }: Props) {
  const [stations, setStations] = useState<StationCardData[]>([]);
  const [forms, setForms] = useState<Record<number, StationForm>>({});
  const [loading, setLoading] = useState(false);
  const [savingStage, setSavingStage] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingStage, setUploadingStage] = useState<number | null>(null);


  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await teacherListStations({ data: { password, code } });
      const withDefaults = STAGE_DEFAULTS.map((d) => {
        const found = rows.find((r) => r.stageNr === d.nr);
        return found ?? emptyStation(d.nr);
      });
      setStations(withDefaults);
      setForms(Object.fromEntries(withDefaults.map((s) => [s.stageNr, toForm(s)])));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Laden fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }, [password, code]);

  useEffect(() => {
    load();
  }, [load]);

  const updateForm = (stageNr: number, patch: Partial<StationForm>) => {
    setForms((prev) => ({ ...prev, [stageNr]: { ...prev[stageNr]!, ...patch } }));
  };

  const save = async (stageNr: number) => {
    setSavingStage(stageNr);
    try {
      const form = forms[stageNr]!;
      const saved = await teacherUpsertStation({
        data: { password, code, ...form },
      });
      setStations((prev) => {
        const next = prev.filter((s) => s.stageNr !== stageNr);
        next.push({
          stageNr: saved.stageNr,
          placeName: saved.placeName,
          address: saved.address,
          lat: saved.lat,
          lng: saved.lng,
          note: saved.note,
          photoPath: saved.photoPath,
          mapUrl: saved.mapUrl,
        });
        return next.sort((a, b) => a.stageNr - b.stageNr);
      });
      setForms((prev) => ({ ...prev, [stageNr]: toForm(saved) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setSavingStage(null);
    }
  };


  const upload = async (stageNr: number, file: File) => {
    setUploadingStage(stageNr);
    try {
      const { path } = await teacherUploadStationPhoto({
        data: { password, code, stageNr, file },
      });
      updateForm(stageNr, { photoPath: path });
      await save(stageNr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
    } finally {
      setUploadingStage(null);
    }
  };

  const remove = async (stageNr: number) => {
    if (!confirm(`Posten für Etappe ${stageNr} wirklich zurücksetzen?`)) return;
    try {
      await teacherDeleteStation({ data: { password, code, stageNr } });
      const fresh = emptyStation(stageNr);
      setStations((prev) => {
        const next = prev.filter((s) => s.stageNr !== stageNr);
        next.push(fresh);
        return next.sort((a, b) => a.stageNr - b.stageNr);
      });
      setForms((prev) => ({ ...prev, [stageNr]: toForm(fresh) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen.");
    }
  };

  if (loading && stations.length === 0) {
    return <p className="text-sm text-muted-foreground">Posten werden geladen…</p>;
  }

  const allReady = stations.every((s) => s.address.trim() && s.lat && s.lng);

  return (
    <section className="mt-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Erfasse für jede Etappe den nächsten Ort. Die Karten kommen in die Umschläge.
        </p>
        <button
          type="button"
          disabled={!allReady}
          onClick={onPrint}
          className="flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-sm bg-primary px-3 font-serif text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <Printer className="h-4 w-4" />
          Karten drucken
        </button>
      </div>

      {!allReady && (
        <p className="rounded-sm border border-dashed border-border p-2 text-xs text-muted-foreground">
          Fülle mindestens Adresse und Ortsname für alle fünf Etappen aus, bevor du die Karten druckst.
        </p>
      )}

      {error && (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
          {error}
        </p>
      )}

      {STAGE_DEFAULTS.map((stage) => {
        const form = forms[stage.nr] ?? emptyStation(stage.nr);
        const saved = stations.find((s) => s.stageNr === stage.nr) ?? emptyStation(stage.nr);
        const isDirty =
          form.placeName !== saved.placeName ||
          form.address !== saved.address ||
          form.note !== saved.note;

        return (
          <details
            key={stage.nr}
            className="group rounded-sm border border-border bg-secondary/30 open:bg-secondary/50"
            open={isDirty || !saved.address.trim()}
          >
            <summary className="flex cursor-pointer items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stamp font-mono-typed text-xs font-bold text-paper">
                  {stage.nr}
                </span>
                <span className="font-serif font-bold">{form.placeName || stage.placeName}</span>
                {saved.address.trim() && (
                  <span className="hidden text-xs text-muted-foreground sm:inline">· {saved.address}</span>
                )}
                {!saved.address.trim() && (
                  <span className="text-xs text-destructive">· noch offen</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground group-open:hidden">Bearbeiten</span>
            </summary>

            <div className="space-y-3 p-3 pt-0">
              {/* Formular */}
              <div className="grid gap-3">
                <div>
                  <label className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                    Ortsname
                  </label>
                  <input
                    value={form.placeName}
                    onChange={(e) => updateForm(stage.nr, { placeName: e.target.value })}
                    placeholder={stage.placeName}
                    className="mt-1 w-full rounded-sm border border-border bg-paper px-3 py-2 text-[16px] focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/25"
                  />
                </div>
                <div>
                  <label className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                    Adresse
                  </label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={form.address}
                      onChange={(e) => updateForm(stage.nr, { address: e.target.value })}
                      placeholder="Hauptstrasse 61, 9042 Speicher"
                      className="w-full rounded-sm border border-border bg-paper py-2 pl-8 pr-3 text-[16px] focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/25"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                    Zusatzsatz (optional)
                  </label>
                  <input
                    value={form.note}
                    onChange={(e) => updateForm(stage.nr, { note: e.target.value })}
                    placeholder="Das Rätsel wartet beim Eingang."
                    className="mt-1 w-full rounded-sm border border-border bg-paper px-3 py-2 text-[16px] focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/25"
                  />
                </div>
              </div>

              {/* Aktionen */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={savingStage === stage.nr}
                  onClick={() => save(stage.nr)}
                  className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-sm bg-primary px-3 font-serif text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {savingStage === stage.nr ? (
                    <span className="animate-pulse">Speichern…</span>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Speichern
                    </>
                  )}
                </button>
                <label className="flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-border px-3 font-serif text-sm font-semibold hover:border-stamp">
                  <Camera className="h-4 w-4" />
                  Foto
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      void upload(stage.nr, file);
                      e.target.value = "";
                    }}
                  />
                  {uploadingStage === stage.nr && (
                    <span className="sr-only">Upload läuft…</span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => remove(stage.nr)}
                  className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-sm border border-border px-3 font-serif text-sm font-semibold text-destructive hover:border-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Vorschau */}
              {saved.address.trim() && (

                <div className="pt-2">
                  <p className="mb-2 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                    Vorschau
                  </p>
                  <StationCard station={saved} className="max-w-sm" />
                </div>
              )}
            </div>
          </details>
        );
      })}
    </section>
  );
}
