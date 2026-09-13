/**
 * Grafische Übersicht der Wege über alle Posten.
 *
 * Jeder Weg (A bis D) hat eine Farbe und läuft von links nach rechts durch die
 * sechs Posten. Wo mehrere Wege an derselben Station stehen, laufen die Linien
 * zusammen: dort genügt ein einziger QR-Code. Der eingetragene Ort steht direkt
 * an der Station, damit man ohne zweite Liste sieht, wo ein Posten liegt.
 */
import {
  LETTERS,
  PATH_COLOR,
  STAGE_IDS,
  STAGE_LABELS,
  lettersFor,
  stationsFor,
  type Branches,
  type Letter,
  type StationDescriptions,
} from "@/lib/variants";

const COL_W = 132;
const ROW_H = 58;
const PAD_X = 66;
const PAD_TOP = 40;

function stationY(index: number, count: number) {
  // Stationen mittig um die Achse verteilen.
  const offset = index - (count - 1) / 2;
  return PAD_TOP + 2 * ROW_H + offset * ROW_H;
}

/** «Posten 1 · Mobilität», Hearing bleibt ohne Nummer. */
export function stageTitle(stage: number) {
  const name = STAGE_LABELS[stage] ?? `Posten ${stage}`;
  return stage >= 6 ? name : `Posten ${stage} · ${name}`;
}

function shorten(text: string, max = 16) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function BranchDiagram({
  pathCount,
  branches,
  onChange,
  descriptions,
  onDescriptionsChange,
}: {
  pathCount: number;
  branches: Branches;
  onChange?: (next: Branches) => void;
  descriptions?: StationDescriptions | null;
  onDescriptionsChange?: (next: StationDescriptions) => void;
}) {
  const letters = lettersFor(pathCount);
  const width = PAD_X * 2 + COL_W * (STAGE_IDS.length - 1);
  const height = PAD_TOP + 4 * ROW_H + 46;

  const stationsPerStage = STAGE_IDS.map((stage) =>
    stationsFor(branches, stage, pathCount),
  );

  /** Setzt einen Weg an einem Posten auf eine bestimmte Station. */
  const move = (stage: number, letter: Letter, target: number) => {
    if (!onChange) return;
    const stations = stationsFor(branches, stage, pathCount).map((s) => [...s]);
    const cleaned = stations.map((s) => s.filter((l) => l !== letter));
    while (cleaned.length <= target) cleaned.push([]);
    cleaned[target]!.push(letter);
    const next: Branches = { ...branches };
    next[String(stage)] = cleaned
      .filter((s) => s.length > 0)
      .map((s) => [...s].sort() as Letter[]);
    onChange(next);
  };

  const setStationCount = (stage: number, count: number) => {
    if (!onChange) return;
    const current = stationsFor(branches, stage, pathCount);
    const flat = current.flat();
    const stations: Letter[][] = Array.from({ length: count }, () => []);
    // Wege gleichmässig auf die neuen Stationen verteilen.
    flat.forEach((l, i) => stations[i % count]!.push(l));
    const next: Branches = { ...branches };
    next[String(stage)] = stations
      .filter((s) => s.length > 0)
      .map((s) => [...s].sort() as Letter[]);
    onChange(next);
    if (onDescriptionsChange) {
      const currentDescriptions = descriptions?.[String(stage)] ?? [];
      onDescriptionsChange({
        ...(descriptions ?? {}),
        [String(stage)]: Array.from(
          { length: count },
          (_, index) => currentDescriptions[index] ?? "",
        ),
      });
    }
  };

  const setDescription = (stage: number, index: number, value: string) => {
    if (!onDescriptionsChange) return;
    const count = stationsFor(branches, stage, pathCount).length;
    const current = descriptions?.[String(stage)] ?? [];
    onDescriptionsChange({
      ...(descriptions ?? {}),
      [String(stage)]: Array.from({ length: count }, (_, i) =>
        i === index ? value : (current[i] ?? ""),
      ),
    });
  };

  const showBranchEditor = !!onChange && pathCount > 1;
  const showStageCards = showBranchEditor || !!onDescriptionsChange;

  return (
    <div>
      <div className="overflow-x-auto rounded-sm border border-border bg-card p-2">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Wege der Gruppen über die Posten mit Ortsangaben"
          className="min-w-[760px]"
        >
          {/* Postenbeschriftung mit Nummer */}
          {STAGE_IDS.map((stage, i) => (
            <g key={`lbl-${stage}`}>
              <text
                x={PAD_X + i * COL_W}
                y={16}
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: 9, letterSpacing: 1 }}
              >
                {stage >= 6 ? "ZIEL" : `POSTEN ${stage}`}
              </text>
              <text
                x={PAD_X + i * COL_W}
                y={30}
                textAnchor="middle"
                className="fill-foreground"
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                {STAGE_LABELS[stage]}
              </text>
            </g>
          ))}

          {/* Wege als Linien */}
          {letters.map((letter) => {
            const pts = STAGE_IDS.map((stage, i) => {
              const stations = stationsPerStage[i]!;
              const idx = Math.max(
                0,
                stations.findIndex((s) => s.includes(letter)),
              );
              return {
                x: PAD_X + i * COL_W,
                y: stationY(idx, stations.length),
              };
            });
            const d = pts
              .map((p, i) => {
                if (i === 0) return `M ${p.x} ${p.y}`;
                const prev = pts[i - 1]!;
                const mx = (prev.x + p.x) / 2;
                return `C ${mx} ${prev.y} ${mx} ${p.y} ${p.x} ${p.y}`;
              })
              .join(" ");
            const shift = (LETTERS.indexOf(letter) - 1.5) * 2.2;
            return (
              <g key={letter} transform={`translate(0 ${shift})`}>
                <path
                  d={d}
                  fill="none"
                  stroke={PATH_COLOR[letter]}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  opacity={0.9}
                />
              </g>
            );
          })}

          {/* Stationen als Punkte mit Buchstaben und Ort */}
          {STAGE_IDS.map((stage, i) => {
            const stations = stationsPerStage[i]!;
            const places = descriptions?.[String(stage)] ?? [];
            return stations.map((station, idx) => {
              const x = PAD_X + i * COL_W;
              const y = stationY(idx, stations.length);
              const place = (places[idx] ?? "").trim();
              return (
                <g key={`st-${stage}-${idx}`}>
                  <title>
                    {`${stageTitle(stage)} · Weg ${station.join(", ")}${
                      place ? ` · ${place}` : " · Ort offen"
                    }`}
                  </title>
                  <rect
                    x={x - 26}
                    y={y - 13}
                    width={52}
                    height={24}
                    rx={3}
                    className="fill-secondary stroke-border"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    className="fill-foreground"
                    style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}
                  >
                    {station.join("")}
                  </text>
                  <text
                    x={x}
                    y={y + 22}
                    textAnchor="middle"
                    className={place ? "fill-foreground" : "fill-muted-foreground"}
                    style={{ fontSize: 8.5, fontStyle: place ? "normal" : "italic" }}
                  >
                    {place ? shorten(place) : "Ort offen"}
                  </text>
                  {station.length > 1 && (
                    <text
                      x={x}
                      y={y + 32}
                      textAnchor="middle"
                      className="fill-muted-foreground"
                      style={{ fontSize: 7.5, letterSpacing: 0.5 }}
                    >
                      1 QR-CODE
                    </text>
                  )}
                </g>
              );
            });
          })}
        </svg>
      </div>

      {/* Farblegende */}
      {pathCount > 1 && (
        <div className="mt-2 flex flex-wrap gap-3">
          {letters.map((l) => (
            <span key={l} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-block h-2.5 w-5 rounded-sm"
                style={{ backgroundColor: PATH_COLOR[l] }}
              />
              Weg {l}
            </span>
          ))}
        </div>
      )}

      {showStageCards && (
        <div className="mt-4 space-y-3">
          {STAGE_IDS.map((stage, i) => {
            const stations = stationsPerStage[i]!;
            return (
              <div
                key={`edit-${stage}`}
                className="rounded-sm border border-border bg-card p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-serif text-sm font-semibold">
                    {stageTitle(stage)}
                  </p>
                  {showBranchEditor && (
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      Stationen
                      <select
                        value={stations.length}
                        onChange={(e) =>
                          setStationCount(stage, Number(e.target.value))
                        }
                        className="min-h-[36px] rounded-sm border border-border bg-background px-2 text-sm text-foreground"
                      >
                        {letters.map((_, n) => (
                          <option key={n} value={n + 1}>
                            {n + 1}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                <div className="mt-2 space-y-2">
                  {stations.map((station, index) => (
                    <div
                      key={`station-${stage}-${index}`}
                      className="rounded-sm border border-border/70 bg-secondary/30 p-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1">
                          {station.map((l) => (
                            <span
                              key={l}
                              className="font-mono-typed inline-flex h-6 w-6 items-center justify-center rounded-sm text-[11px] font-bold text-white"
                              style={{ backgroundColor: PATH_COLOR[l] }}
                              aria-label={`Weg ${l}`}
                            >
                              {l}
                            </span>
                          ))}
                        </span>
                        <span className="font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
                          {stations.length > 1
                            ? `Station ${index + 1}${station.length > 1 ? " · ein QR-Code für beide Wege" : ""}`
                            : "alle Gruppen am gleichen Ort"}
                        </span>
                      </div>

                      {onDescriptionsChange ? (
                        <input
                          type="text"
                          maxLength={160}
                          value={descriptions?.[String(stage)]?.[index] ?? ""}
                          onChange={(event) =>
                            setDescription(stage, index, event.target.value)
                          }
                          placeholder="Wo steht dieser Posten? z. B. Haltestelle Bünteli"
                          aria-label={`Ort für ${stageTitle(stage)}, Station ${index + 1}`}
                          className="mt-2 min-h-[42px] w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground"
                        />
                      ) : (
                        <p className="mt-1 text-sm">
                          {descriptions?.[String(stage)]?.[index]?.trim() || (
                            <span className="italic text-muted-foreground">
                              Ort noch offen
                            </span>
                          )}
                        </p>
                      )}

                      {showBranchEditor && stations.length > 1 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {station.map((l) => (
                            <label
                              key={l}
                              className="flex items-center gap-1.5 rounded-sm border border-border bg-background px-2 py-1 text-xs"
                            >
                              Weg {l} verschieben nach
                              <select
                                value={index}
                                onChange={(e) => move(stage, l, Number(e.target.value))}
                                className="min-h-[32px] rounded-sm border border-border bg-background px-1 text-xs text-foreground"
                                aria-label={`Station für Weg ${l} bei ${stageTitle(stage)}`}
                              >
                                {stations.map((_, idx) => (
                                  <option key={idx} value={idx}>
                                    Station {idx + 1}
                                  </option>
                                ))}
                              </select>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
