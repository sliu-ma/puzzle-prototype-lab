/**
 * Grafische Übersicht der Wege über alle Posten.
 *
 * Jeder Weg (A bis D) hat eine Farbe und läuft von links nach rechts durch die
 * sechs Posten. Wo mehrere Wege an derselben Station stehen, laufen die Linien
 * zusammen: dort genügt ein einziger QR-Code.
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
} from "@/lib/variants";

const COL_W = 118;
const ROW_H = 46;
const PAD_X = 58;
const PAD_TOP = 34;

function stationY(index: number, count: number) {
  // Stationen mittig um die Achse verteilen.
  const offset = index - (count - 1) / 2;
  return PAD_TOP + 2 * ROW_H + offset * ROW_H;
}

export function BranchDiagram({
  pathCount,
  branches,
  onChange,
}: {
  pathCount: number;
  branches: Branches;
  onChange?: (next: Branches) => void;
}) {
  const letters = lettersFor(pathCount);
  const width = PAD_X * 2 + COL_W * (STAGE_IDS.length - 1);
  const height = PAD_TOP + 4 * ROW_H + 30;

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
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-sm border border-border bg-card p-2">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Wege der Gruppen über die Posten"
          className="min-w-[680px]"
        >
          {/* Postenbeschriftung */}
          {STAGE_IDS.map((stage, i) => (
            <text
              key={`lbl-${stage}`}
              x={PAD_X + i * COL_W}
              y={18}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 10, letterSpacing: 1 }}
            >
              {STAGE_LABELS[stage]?.toUpperCase()}
            </text>
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

          {/* Stationen als Punkte mit Buchstaben */}
          {STAGE_IDS.map((stage, i) => {
            const stations = stationsPerStage[i]!;
            return stations.map((station, idx) => {
              const x = PAD_X + i * COL_W;
              const y = stationY(idx, stations.length);
              return (
                <g key={`st-${stage}-${idx}`}>
                  <rect
                    x={x - 26}
                    y={y - 12}
                    width={52}
                    height={24}
                    rx={3}
                    className="fill-secondary stroke-border"
                    strokeWidth={1}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className="fill-foreground"
                    style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}
                  >
                    {station.join("")}
                  </text>
                </g>
              );
            });
          })}
        </svg>
      </div>

      {/* Farblegende */}
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

      {onChange && pathCount > 1 && (
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
                    {STAGE_LABELS[stage]}
                  </p>
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
                </div>

                {stations.length > 1 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {letters.map((l) => {
                      const at = Math.max(
                        0,
                        stations.findIndex((s) => s.includes(l)),
                      );
                      return (
                        <label
                          key={l}
                          className="flex items-center gap-1.5 rounded-sm border border-border px-2 py-1 text-xs"
                        >
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: PATH_COLOR[l] }}
                          />
                          {l}
                          <select
                            value={at}
                            onChange={(e) => move(stage, l, Number(e.target.value))}
                            className="min-h-[32px] rounded-sm border border-border bg-background px-1 text-xs text-foreground"
                            aria-label={`Station für Weg ${l} bei ${STAGE_LABELS[stage]}`}
                          >
                            {stations.map((_, idx) => (
                              <option key={idx} value={idx}>
                                Station {idx + 1}
                              </option>
                            ))}
                          </select>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
