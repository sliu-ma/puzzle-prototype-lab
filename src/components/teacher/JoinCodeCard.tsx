// Beitritt zur Klassenrunde: Rundencode, QR-Code und Beitritts-Link.
// Der QR-Code wird lokal im Browser als Data-URL erzeugt, damit keine
// Fremdanfrage nötig ist und die Ansicht auch ohne Internet-Bild funktioniert.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { Check, Copy, Maximize2, QrCode, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Öffentliche Beitritts-URL einer Runde, z. B. https://…/?r=ABCDE */
export function joinUrl(code: string) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/?r=${encodeURIComponent(code)}`;
}

function useQrDataUrl(text: string, size: number) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#1c1917", light: "#ffffff" },
    })
      .then((url) => {
        if (alive) setSrc(url);
      })
      .catch(() => {
        if (alive) setSrc(null);
      });
    return () => {
      alive = false;
    };
  }, [text, size]);
  return src;
}

/** Vollbild-Ansicht für Beamer oder Wand: nur Code, QR-Code, Teamzähler. */
function WallView({
  code,
  teamCount,
  onClose,
}: {
  code: string;
  teamCount: number;
  onClose: () => void;
}) {
  const url = joinUrl(code);
  const qr = useQrDataUrl(url, 900);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-[3cqh] bg-paper px-[4cqw] py-[4cqh] [container-type:size]">
      <button
        type="button"
        onClick={onClose}
        aria-label="Beitrittsansicht schliessen"
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-sm border border-border bg-card text-muted-foreground hover:text-foreground"
      >
        <X className="h-5 w-5" />
      </button>

      <p className="font-mono-typed text-[max(10px,1.6cqh)] uppercase tracking-[0.3em] text-stamp">
        Klassenrunde beitreten
      </p>

      <div className="flex flex-col items-center gap-[2cqh] sm:flex-row sm:gap-[4cqw]">
        {qr && (
          <img
            src={qr}
            alt={`QR-Code zum Beitritt der Runde ${code}`}
            className="h-[38cqh] w-[38cqh] max-w-[80cqw] rounded-sm border border-border bg-white p-[1cqh]"
          />
        )}
        <div className="text-center sm:text-left">
          <p className="font-mono-typed text-[max(9px,1.4cqh)] uppercase tracking-[0.25em] text-muted-foreground">
            Code
          </p>
          <p className="font-mono-typed text-[min(18cqh,14cqw)] font-bold leading-none tracking-[0.12em] text-foreground">
            {code}
          </p>
          <p className="mt-[1.5cqh] font-serif text-[max(14px,2.4cqh)] text-foreground/80">
            {joinUrl(code).replace(/^https?:\/\//, "")}
          </p>
        </div>
      </div>

      <p className="flex items-center gap-2 rounded-sm border border-border bg-secondary/60 px-[2cqw] py-[1.4cqh] font-serif text-[max(14px,2.6cqh)] font-semibold">
        <Users className="h-[2.6cqh] w-[2.6cqh] min-h-4 min-w-4 text-stamp" />
        {teamCount === 1 ? "1 Team angemeldet" : `${teamCount} Teams angemeldet`}
      </p>
    </div>,
    document.body,
  );
}

export function JoinCodeCard({
  code,
  teamCount,
  className,
}: {
  code: string;
  teamCount: number;
  className?: string;
}) {
  const [wall, setWall] = useState(false);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const url = joinUrl(code);
  const qr = useQrDataUrl(url, 320);

  const copy = (what: "code" | "link") => {
    void navigator.clipboard?.writeText(what === "code" ? code : url);
    setCopied(what);
    window.setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className={cn("rounded-sm border border-border bg-secondary/40 p-3", className)}>
      <p className="flex items-center gap-1.5 font-mono-typed text-[10px] uppercase tracking-wider text-muted-foreground">
        <QrCode className="h-3.5 w-3.5" />
        So treten die Gruppen bei
      </p>

      <div className="mt-3 flex items-start gap-3">
        {qr ? (
          <img
            src={qr}
            alt={`QR-Code zum Beitritt der Runde ${code}`}
            className="h-28 w-28 shrink-0 rounded-sm border border-border bg-white p-1"
          />
        ) : (
          <div className="h-28 w-28 shrink-0 rounded-sm border border-dashed border-border" />
        )}

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => copy("code")}
            className="flex w-full items-center justify-between gap-2 rounded-sm border border-border bg-card px-2.5 py-2 text-left"
          >
            <span className="font-mono-typed text-xl font-bold tracking-[0.2em]">
              {code}
            </span>
            {copied === "code" ? (
              <Check className="h-4 w-4 shrink-0 text-stamp" />
            ) : (
              <Copy className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </button>

          <button
            type="button"
            onClick={() => copy("link")}
            className="mt-1.5 flex w-full items-center justify-between gap-2 rounded-sm border border-border bg-card px-2.5 py-2 text-left"
          >
            <span className="truncate text-xs text-foreground/80">
              {url.replace(/^https?:\/\//, "")}
            </span>
            {copied === "link" ? (
              <Check className="h-4 w-4 shrink-0 text-stamp" />
            ) : (
              <Copy className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </button>

          <p className="mt-1.5 text-xs text-muted-foreground">
            Wer den QR-Code scannt, gibt nur noch den Teamnamen ein.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setWall(true)}
        className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-sm border border-border font-serif font-semibold"
      >
        <Maximize2 className="h-4 w-4" />
        Beitritt anzeigen
      </button>

      {wall && (
        <WallView code={code} teamCount={teamCount} onClose={() => setWall(false)} />
      )}
    </div>
  );
}
