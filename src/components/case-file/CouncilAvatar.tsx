type Props = {
  name: string;
  ressort: string;
  accent: "earth" | "green" | "blue" | "stamp";
};

const accentColors: Record<Props["accent"], string> = {
  earth: "#8a6a3b",
  green: "#3f6b3a",
  blue: "#365a78",
  stamp: "var(--color-stamp)",
};

export function CouncilAvatar({ name, ressort, accent }: Props) {
  const initials = name
    .replace(/^(Herr|Frau|Gemeindepräsident|Gemeindepräsidentin)\s+/, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div
        className="grid h-12 w-12 place-items-center rounded-full font-serif text-lg font-bold text-white shadow-sm"
        style={{ backgroundColor: accentColors[accent], transform: "rotate(-2deg)" }}
      >
        {initials}
      </div>
      <div>
        <p className="font-serif text-base font-semibold leading-tight text-foreground">{name}</p>
        <p className="font-mono-typed text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Ressort {ressort}
        </p>
      </div>
    </div>
  );
}
