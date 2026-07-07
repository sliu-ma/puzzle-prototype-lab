import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, RotateCcw, Wallet, Zap } from "lucide-react";
import {
  BUDGET,
  DEVICES,
  ENERGY_TARGET,
  formatNumber,
  type EnergyDevice,
  type EnergyLabelGrade,
  type EnergyOption,
} from "@/lib/energy-data";
import houseAsset from "@/assets/haus.png.asset.json";
import coin from "@/assets/coin.png";
import trophy from "@/assets/trophy.png";
import labelA from "@/assets/label-a.png.asset.json";
import labelB from "@/assets/label-b.png.asset.json";
import labelC from "@/assets/label-c.png.asset.json";
import labelD from "@/assets/label-d.png.asset.json";
import labelE from "@/assets/label-e.png.asset.json";
import labelF from "@/assets/label-f.png.asset.json";
import labelG from "@/assets/label-g.png.asset.json";

const LABEL_MAP: Record<EnergyLabelGrade, { url: string }> = {
  A: labelA,
  B: labelB,
  C: labelC,
  D: labelD,
  E: labelE,
  F: labelF,
  G: labelG,
};

function EnergyLabel({ grade, size = "large" }: { grade: EnergyLabelGrade; size?: "small" | "large" }) {
  return (
    <img
      src={LABEL_MAP[grade].url}
      alt={`Energieklasse ${grade}`}
      className={`w-auto object-contain ${size === "large" ? "h-8" : "h-4"}`}
    />
  );
}

function Coin({ value, variant = "coin" }: { value: string | number; variant?: "coin" | "energy" }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <img src={variant === "coin" ? coin : trophy} alt="" className="h-5 w-5 object-contain" />
      <span className="font-bold tabular-nums">{value}</span>
    </span>
  );
}

// A choice per device: either an option-id (flat) or a record of group-id → option-id.
type DeviceChoice = string | Record<string, string>;
type Choices = Record<string, DeviceChoice>;

function defaultDeviceChoice(d: EnergyDevice): DeviceChoice {
  if (d.groups) {
    return Object.fromEntries(d.groups.map((g) => [g.id, g.options[0].id]));
  }
  return d.options![0].id;
}

function resolveDeviceTotals(d: EnergyDevice, choice: DeviceChoice) {
  if (d.groups) {
    const rec = choice as Record<string, string>;
    let cost = 0;
    let energy = 0;
    for (const g of d.groups) {
      const optId = rec[g.id] ?? g.options[0].id;
      const opt = g.options.find((o) => o.id === optId) ?? g.options[0];
      cost += opt.cost;
      energy += opt.energy;
    }
    return { cost, energy };
  }
  const opts = d.options!;
  const opt = opts.find((o) => o.id === (choice as string)) ?? opts[0];
  return { cost: opt.cost, energy: opt.energy };
}

function isDefaultChoice(d: EnergyDevice, choice: DeviceChoice): boolean {
  if (d.groups) {
    const rec = choice as Record<string, string>;
    return d.groups.every((g) => (rec[g.id] ?? g.options[0].id) === g.options[0].id);
  }
  return (choice as string) === d.options![0].id;
}

export function EnergyGame({ onErfolg }: { onErfolg: () => void }) {
  const defaults = useMemo<Choices>(
    () => Object.fromEntries(DEVICES.map((d) => [d.id, defaultDeviceChoice(d)])),
    [],
  );
  const [choices, setChoices] = useState<Choices>(defaults);
  const [open, setOpen] = useState<EnergyDevice | null>(null);
  const [showFail, setShowFail] = useState(false);

  const totals = useMemo(() => {
    let invested = 0;
    let energy = 0;
    for (const d of DEVICES) {
      const t = resolveDeviceTotals(d, choices[d.id]);
      invested += t.cost;
      energy += t.energy;
    }
    return { invested, energy };
  }, [choices]);

  const remaining = BUDGET - totals.invested;
  const erreicht = totals.energy >= ENERGY_TARGET;

  const setChoice = (deviceId: string, choice: DeviceChoice) => {
    setChoices((c) => ({ ...c, [deviceId]: choice }));
  };

  const reset = () => {
    setChoices(defaults);
    setShowFail(false);
  };

  const pruefen = () => {
    if (erreicht && totals.invested <= BUDGET) onErfolg();
    else setShowFail(true);
  };

  return (
    <div className="rounded-sm border border-border bg-paper p-3 sm:p-5">
      {/* HUD */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border bg-secondary/40 px-3 py-2 text-sm">
        <div className="flex items-center gap-3">
          <span className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
            Budget
          </span>
          <span className="inline-flex items-center gap-1.5 font-bold tabular-nums">
            <Wallet className="h-4 w-4 text-stamp" />
            {formatNumber(totals.invested)} / {formatNumber(BUDGET)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono-typed text-[10px] uppercase tracking-wider text-stamp">
            Energiesparpunkte
          </span>
          <span className={`inline-flex items-center gap-1.5 font-bold tabular-nums ${totals.energy < 0 ? "text-destructive" : ""}`}>
            <Zap className={`h-4 w-4 ${totals.energy < 0 ? "text-destructive" : "text-emerald-600"}`} />
            {formatNumber(totals.energy)} ESP
          </span>
        </div>
      </div>

      {/* Ziel-Banner */}
      <div
        className={`mb-3 rounded-sm border px-3 py-2 text-sm ${
          erreicht
            ? "border-emerald-700/50 bg-emerald-50 text-emerald-900"
            : "border-stamp/40 bg-stamp/5 text-foreground/80"
        }`}
      >
        Ziel: mind. <strong>{formatNumber(ENERGY_TARGET)} ESP</strong> sammeln, ohne das Budget zu sprengen.
        <span className="ml-1 text-foreground/60">
          Tipp: Viele Punkte gibt es gratis — Gewohnheiten schlagen teure Geräte.
        </span>
        {erreicht && " ✓ Ziel erreicht — du kannst prüfen."}
      </div>

      {/* Haus-Stage */}
      <div className="relative mx-auto w-full max-w-sm">
        <img
          src={houseAsset.url}
          alt="Querschnitt Haus mit Räumen"
          className="block h-auto w-full rounded-sm shadow-md"
        />
        {DEVICES.map((device) => {
          const chosen = choices[device.id];
          const isChanged = !isDefaultChoice(device, chosen);
          return (
            <button
              key={device.id}
              onClick={() => setOpen(device)}
              className={`absolute rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-stamp ${
                isChanged
                  ? "bg-emerald-400/25 ring-2 ring-emerald-400/80"
                  : "bg-transparent hover:bg-white/25 active:bg-white/40"
              }`}
              style={{
                left: `${device.x}%`,
                top: `${device.y}%`,
                width: `${device.w}%`,
                height: `${device.h}%`,
              }}
              aria-label={device.name}
              title={device.name}
            >
              <span className="sr-only">{device.name}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          onClick={reset}
          aria-label="Zurücksetzen"
          className="inline-flex items-center gap-1 rounded-sm border border-border bg-paper px-3 py-2 text-xs hover:bg-secondary"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
        <button
          onClick={pruefen}
          className="rounded-sm bg-primary px-5 py-2.5 font-serif text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          Entscheidung prüfen →
        </button>
      </div>

      {showFail && !erreicht && (
        <div className="mt-3 rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Noch nicht genug Energiesparpunkte. Tippe auf die markierten Bereiche im Haus und wähle sparsamere Optionen — viele bringen Punkte, ohne etwas zu kosten.
        </div>
      )}

      {/* Modal */}
      {open && (
        <DeviceModal
          device={open}
          current={choices[open.id]}
          remaining={remaining}
          onChoose={(choice) => setChoice(open.id, choice)}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function OptionRow({
  opt,
  icon,
  isCurrent,
  disabled,
  onChoose,
}: {
  opt: EnergyOption;
  icon: string;
  isCurrent: boolean;
  disabled: boolean;
  onChoose: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onChoose}
      className={`relative flex w-full items-start gap-3 rounded-sm border p-3 text-left transition ${
        isCurrent
          ? "border-emerald-600 bg-emerald-50"
          : disabled
            ? "cursor-not-allowed border-border bg-secondary/40 opacity-50"
            : "border-border bg-secondary/40 hover:bg-secondary"
      }`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-paper text-2xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-bold leading-tight">{opt.productName ?? opt.label}</span>
          {isCurrent && (
            <span className="text-[11px] font-normal text-emerald-700">✓ gewählt</span>
          )}
        </div>
        <div className="mt-0.5 line-clamp-1 text-xs text-foreground/70">{opt.description}</div>
        {opt.energyLabel && (
          <div className="mt-2">
            <EnergyLabel grade={opt.energyLabel} />
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3 text-xs">
        <Coin value={opt.cost} />
        <span
          className={`whitespace-nowrap font-bold ${
            opt.energy > 0
              ? "text-emerald-700"
              : opt.energy < 0
                ? "text-destructive"
                : "text-foreground/50"
          }`}
        >
          {opt.energy > 0 ? `+${formatNumber(opt.energy)} ESP` : opt.energy < 0 ? `${formatNumber(opt.energy)} ESP` : "—"}
        </span>
      </div>
      {isCurrent && (
        <div className="absolute right-2 top-2 rounded-full bg-emerald-500 p-1">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </button>
  );
}

function DeviceModal({
  device,
  current,
  remaining,
  onChoose,
  onClose,
}: {
  device: EnergyDevice;
  current: DeviceChoice;
  remaining: number;
  onChoose: (choice: DeviceChoice) => void;
  onClose: () => void;
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  useEffect(() => {
    setOpenGroup(null);
  }, [device.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-border bg-paper p-5 shadow-2xl sm:rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-2xl">{device.icon}</span>
          <h3 className="font-serif text-xl font-bold">{device.name}</h3>
        </div>
        <p className="mb-4 text-xs text-foreground/70">
          Raum: <span className="font-bold">{device.room}</span>
        </p>

        {device.groups ? (
          openGroup === null ? (
            <div className="space-y-2">
              {device.groups.map((group) => {
                const rec = current as Record<string, string>;
                const currentId = rec[group.id] ?? group.options[0].id;
                const currentOpt = group.options.find((o) => o.id === currentId) ?? group.options[0];
                const isChanged = currentId !== group.options[0].id;
                return (
                  <button
                    key={group.id}
                    onClick={() => setOpenGroup(group.id)}
                    className={`flex w-full items-center gap-3 rounded-sm border p-3 text-left transition hover:bg-secondary ${
                      isChanged ? "border-emerald-600 bg-emerald-50" : "border-border bg-secondary/40"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold">{group.label}</div>
                      <div className="text-xs text-foreground/70">
                        aktuell: <span className="italic">{currentOpt.label}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-foreground/50" />
                  </button>
                );
              })}
            </div>
          ) : (
            (() => {
              const group = device.groups.find((g) => g.id === openGroup)!;
              const rec = current as Record<string, string>;
              const currentId = rec[group.id] ?? group.options[0].id;
              const currentOpt = group.options.find((o) => o.id === currentId) ?? group.options[0];
              return (
                <div>
                  <button
                    onClick={() => setOpenGroup(null)}
                    className="mb-3 text-xs text-foreground/70 hover:text-foreground"
                  >
                    ← Zurück zur Auswahl
                  </button>
                  <p className="mb-2 font-mono-typed text-[11px] uppercase tracking-wider text-stamp">
                    {group.label}
                  </p>
                  <div className="space-y-2">
                    {group.options.map((opt) => {
                      const isCurrent = opt.id === currentId;
                      const wouldBe = remaining + currentOpt.cost - opt.cost;
                      const tooExpensive = !isCurrent && wouldBe < 0;
                      return (
                        <OptionRow
                          key={opt.id}
                          opt={opt}
                          icon={device.icon}
                          isCurrent={isCurrent}
                          disabled={tooExpensive}
                          onChoose={() => onChoose({ ...rec, [group.id]: opt.id })}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })()
          )
        ) : (
          <div className="space-y-2">
            {(() => {
              const opts = device.options!;
              const currentOpt = opts.find((o) => o.id === (current as string)) ?? opts[0];
              return opts.map((opt) => {
                const isCurrent = opt.id === currentOpt.id;
                const wouldBe = remaining + currentOpt.cost - opt.cost;
                const tooExpensive = !isCurrent && wouldBe < 0;
                return (
                  <OptionRow
                    key={opt.id}
                    opt={opt}
                    icon={device.icon}
                    isCurrent={isCurrent}
                    disabled={tooExpensive}
                    onChoose={() => onChoose(opt.id)}
                  />
                );
              });
            })()}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="rounded-sm border border-border bg-paper px-4 py-2 text-sm hover:bg-secondary"
          >
            ← Zurück
          </button>
          <div className="flex items-center gap-1 text-xs text-foreground/70">
            Konto: <Coin value={formatNumber(remaining)} />
          </div>
        </div>
      </div>
    </div>
  );
}
