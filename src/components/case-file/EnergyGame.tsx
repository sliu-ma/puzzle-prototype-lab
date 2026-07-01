import { useMemo, useState } from "react";
import { Check, RotateCcw, Wallet, Zap } from "lucide-react";
import { BUDGET, DEVICES, formatNumber, type EnergyDevice } from "@/lib/energy-data";
import houseBg from "@/assets/house-bg.jpg";
import coin from "@/assets/coin.png";
import trophy from "@/assets/trophy.png";

function Coin({ value, variant = "coin" }: { value: string | number; variant?: "coin" | "energy" }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <img src={variant === "coin" ? coin : trophy} alt="" className="h-5 w-5 object-contain" />
      <span className="font-bold tabular-nums">{value}</span>
    </span>
  );
}

const ENERGY_TARGET = 8000; // kWh/Jahr Mindestziel

type Choices = Record<string, string>;

export function EnergyGame({ onErfolg }: { onErfolg: () => void }) {
  const defaults = useMemo<Choices>(
    () => Object.fromEntries(DEVICES.map((d) => [d.id, d.options[0].id])),
    [],
  );
  const [choices, setChoices] = useState<Choices>(defaults);
  const [open, setOpen] = useState<EnergyDevice | null>(null);
  const [showFail, setShowFail] = useState(false);

  const totals = useMemo(() => {
    let invested = 0;
    let energy = 0;
    for (const d of DEVICES) {
      const opt = d.options.find((o) => o.id === choices[d.id]) ?? d.options[0];
      invested += opt.cost;
      energy += opt.energy;
    }
    return { invested, energy };
  }, [choices]);

  const remaining = BUDGET - totals.invested;
  const erreicht = totals.energy >= ENERGY_TARGET;

  const setChoice = (deviceId: string, optId: string) => {
    setChoices((c) => ({ ...c, [deviceId]: optId }));
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
            Ersparnis
          </span>
          <span className="inline-flex items-center gap-1.5 font-bold tabular-nums">
            <Zap className="h-4 w-4 text-emerald-600" />
            {formatNumber(totals.energy)} kWh
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
        Ziel: mind. <strong>{formatNumber(ENERGY_TARGET)} kWh</strong> sparen, ohne das Budget zu sprengen.
        {erreicht && " ✓ Ziel erreicht — du kannst prüfen."}
      </div>

      {/* Haus-Stage */}
      <div className="relative mx-auto w-full max-w-sm">
        <img
          src={houseBg}
          alt="Querschnitt Haus mit Räumen"
          className="block h-auto w-full rounded-sm shadow-md"
        />
        {DEVICES.map((device) => {
          const chosen = choices[device.id];
          const isChanged = chosen !== device.options[0].id;
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
          Noch nicht genug Energie gespart. Tippe auf die markierten Bereiche im Haus und wähle effizientere Optionen.
        </div>
      )}

      {/* Modal */}
      {open && (
        <DeviceModal
          device={open}
          current={choices[open.id]}
          remaining={remaining}
          onChoose={(optId) => setChoice(open.id, optId)}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
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
  current: string;
  remaining: number;
  onChoose: (optId: string) => void;
  onClose: () => void;
}) {
  const currentOpt = device.options.find((o) => o.id === current) ?? device.options[0];

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

        <div className="space-y-2">
          {device.options.map((opt) => {
            const isCurrent = opt.id === current;
            const wouldBe = remaining + currentOpt.cost - opt.cost;
            const tooExpensive = !isCurrent && wouldBe < 0;
            return (
              <button
                key={opt.id}
                disabled={tooExpensive}
                onClick={() => onChoose(opt.id)}
                className={`relative flex w-full items-start gap-3 rounded-sm border p-3 text-left transition ${
                  isCurrent
                    ? "border-emerald-600 bg-emerald-50"
                    : tooExpensive
                      ? "cursor-not-allowed border-border bg-secondary/40 opacity-50"
                      : "border-border bg-secondary/40 hover:bg-secondary"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-paper text-xl">
                  {device.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold">
                    {opt.label}
                    {isCurrent && (
                      <span className="ml-2 text-[11px] font-normal text-emerald-700">
                        ✓ gewählt
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-foreground/70">{opt.description}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                  <Coin value={opt.cost} />
                  <span className="font-bold text-emerald-700 whitespace-nowrap">
                    {opt.energy > 0 ? `−${formatNumber(opt.energy)} kWh` : "—"}
                  </span>
                </div>
                {isCurrent && (
                  <div className="absolute right-2 top-2 rounded-full bg-emerald-500 p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

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
