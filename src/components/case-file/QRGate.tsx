import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { PaperCard } from "./PaperCard";
import { Stamp } from "./Stamp";
import { cn } from "@/lib/utils";
import { recordStageScan } from "@/lib/progress";


// Default für Etappe 1, bewusst NICHT im UI angezeigt.
const DEFAULT_TOKEN = "CpZk0z9RaQkL22gtiWoR";
const DEFAULT_STORAGE_KEY = "akte-001-unlocked";

/**
 * Schalter für die manuelle Eingabe der Zeichenfolge unter dem QR-Code.
 * Auf `true` stellen, um den Ausweg ohne Kamera wieder sichtbar zu machen.
 * Bewusst ausgeschaltet: sonst kann der Code weitergeschickt werden, ohne
 * dass eine Gruppe vor Ort ist.
 */
const ALLOW_MANUAL_ENTRY = false;

// Hash zur Persistenz, wir speichern nicht den Klartext-Token im LocalStorage.
async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type Props = {
  children: React.ReactNode;
  token?: string;
  storageKey?: string;
  title?: React.ReactNode;
  description?: string;
  label?: string;
  /** Etappen-Nummer, für die Punkte-Zeitmessung ab dem Scan. */
  stage?: number;
};


type DiagnosticInfo = {
  name: string;
  message: string;
  stack?: string;
  isIframe: boolean;
  protocol: string;
  userAgent: string;
  permissionState?: string;
  hasMediaDevices: boolean;
  hasGetUserMedia: boolean;
};

type FriendlyError = {
  headline: string;
  detail: string;
  builderBlocked: boolean;
  diagnostics: DiagnosticInfo;
};

function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin access throws → wir sind definitiv im iframe
    return true;
  }
}

async function collectDiagnostics(err: unknown): Promise<DiagnosticInfo> {
  const e = err as { name?: string; message?: string; stack?: string } | null;
  let permissionState: string | undefined;
  try {
    const status = await navigator.permissions?.query?.({
      name: "camera" as PermissionName,
    });
    permissionState = status?.state;
  } catch {
    /* ignore */
  }
  return {
    name: e?.name ?? "UnknownError",
    message: e?.message ?? String(err),
    stack: e?.stack,
    isIframe: isInIframe(),
    protocol: typeof location !== "undefined" ? location.protocol : "n/a",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "n/a",
    permissionState,
    hasMediaDevices: typeof navigator !== "undefined" && !!navigator.mediaDevices,
    hasGetUserMedia:
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function",
  };
}

function classifyError(diag: DiagnosticInfo): {
  headline: string;
  detail: string;
  builderBlocked: boolean;
} {
  const msg = diag.message.toLowerCase();
  const looksLikePolicy =
    msg.includes("permissions policy") ||
    msg.includes("permission policy") ||
    msg.includes("disallowed by permissions policy") ||
    msg.includes("permission denied by system");

  if (!diag.hasMediaDevices || !diag.hasGetUserMedia) {
    return {
      headline: "Kamera-API nicht verfügbar",
      detail:
        "Dieser Browser stellt navigator.mediaDevices.getUserMedia nicht bereit. Kamera nur über HTTPS und in aktuellen Browsern.",
      builderBlocked: false,
    };
  }

  if (diag.name === "NotAllowedError" && diag.isIframe && looksLikePolicy) {
    return {
      headline: "Lovable Builder blockiert die Kamera",
      detail:
        "Die Preview im Builder läuft in einem iframe ohne Kamera-Freigabe (Permissions-Policy). Öffne die Preview in einem neuen Tab oder nutze die veröffentlichte Version, dort funktioniert der Scanner.",
      builderBlocked: true,
    };
  }

  if (diag.name === "NotAllowedError" && diag.isIframe) {
    // Häufig meldet Chrome im iframe generisch „Permission denied", trotzdem meist Policy
    return {
      headline: "Kamera in dieser Vorschau blockiert",
      detail:
        "Der eingebettete Builder-Kontext hat den Kamerazugriff verweigert. Öffne die Preview in einem neuen Tab oder verwende die veröffentlichte Version.",
      builderBlocked: true,
    };
  }

  switch (diag.name) {
    case "NotAllowedError":
      return {
        headline: "Kamera-Zugriff verweigert",
        detail:
          "Du hast den Zugriff auf die Kamera abgelehnt oder das Betriebssystem blockiert ihn. Erlaube die Kamera in den Browser- bzw. System-Einstellungen und lade neu.",
        builderBlocked: false,
      };
    case "NotFoundError":
    case "OverconstrainedError":
      return {
        headline: "Keine Kamera gefunden",
        detail: "Auf diesem Gerät wurde keine passende Kamera erkannt.",
        builderBlocked: false,
      };
    case "NotReadableError":
      return {
        headline: "Kamera wird bereits verwendet",
        detail:
          "Eine andere App oder ein anderer Tab greift gerade auf die Kamera zu. Schliesse sie und versuche es erneut.",
        builderBlocked: false,
      };
    case "SecurityError":
      return {
        headline: "Kamera nur über HTTPS",
        detail: "Der Kamerazugriff ist nur über eine sichere Verbindung (HTTPS) möglich.",
        builderBlocked: false,
      };
    case "TypeError":
      return {
        headline: "Kamera-API nicht verfügbar",
        detail:
          "getUserMedia steht in diesem Kontext nicht zur Verfügung (evtl. unsicherer Kontext oder alter Browser).",
        builderBlocked: false,
      };
    default:
      return {
        headline: "Kamera konnte nicht gestartet werden",
        detail: `${diag.name}: ${diag.message}`,
        builderBlocked: false,
      };
  }
}

export function QRGate({
  children,
  token = DEFAULT_TOKEN,
  storageKey = DEFAULT_STORAGE_KEY,
  title,
  description,
  label = "Etappe · Versiegelt",
  stage,
}: Props) {

  const EXPECTED_TOKEN = token;
  const STORAGE_KEY = storageKey;
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [manual, setManual] = useState("");
  const [manualError, setManualError] = useState(false);
  const [expectedHash, setExpectedHash] = useState<string | null>(null);


  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const expected = await sha256(EXPECTED_TOKEN);
      if (!mounted) return;
      setExpectedHash(expected);
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setUnlocked(stored === expected);
      } catch {
        setUnlocked(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /** Ausweg ohne Kamera: Zeichenfolge unter dem QR-Code eintippen. */
  const unlockManually = async () => {
    const clean = manual.trim();
    if (clean !== EXPECTED_TOKEN) {
      setManualError(true);
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, await sha256(EXPECTED_TOKEN));
      if (stage) recordStageScan(stage);
    } catch {
      /* ignore */
    }
    setManualError(false);
    setError(null);
    setScanning(false);
    setUnlocked(true);
  };


  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;
    const reader = new BrowserQRCodeReader();

    (async () => {
      // 1) Erst explizit getUserMedia aufrufen, damit wir den *echten* Fehler bekommen.
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw Object.assign(new Error("mediaDevices.getUserMedia is undefined"), {
            name: "TypeError",
          });
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        mediaStreamRef.current = stream;
      } catch (e) {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error("[QRGate] getUserMedia failed:", e);
        const diag = await collectDiagnostics(e);
        const cls = classifyError(diag);
        setError({ ...cls, diagnostics: diag });
        setScanning(false);
        return;
      }

      // 2) Kamera läuft → an zXing übergeben (nutzt intern denselben Stream-Pfad)
      try {
        if (!videoRef.current) return;
        // Stream direkt anhängen, dann zXing dekodieren lassen
        videoRef.current.srcObject = mediaStreamRef.current;
        await videoRef.current.play().catch(() => {});
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          async (result, _err, ctrl) => {
            if (cancelled || !result) return;
            const text = result.getText();
            if (text === EXPECTED_TOKEN) {
              try {
                const hash = await sha256(EXPECTED_TOKEN);
                localStorage.setItem(STORAGE_KEY, hash);
                if (stage) recordStageScan(stage);
              } catch {
                /* ignore */
              }

              ctrl.stop();
              setUnlocked(true);
              setScanning(false);
              setError(null);
            } else {
              const diag = await collectDiagnostics(
                new Error("QR-Code passt nicht zur Etappe"),
              );
              setError({
                headline: "Falscher QR-Code",
                detail: "Dieser QR-Code passt nicht zur aktuellen Etappe.",
                builderBlocked: false,
                diagnostics: { ...diag, name: "WrongCodeError" },
              });
              ctrl.stop();
              setScanning(false);
            }
          },
        );
        controlsRef.current = controls;
      } catch (e) {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error("[QRGate] zXing decode failed:", e);
        const diag = await collectDiagnostics(e);
        const cls = classifyError(diag);
        setError({ ...cls, diagnostics: diag });
        setScanning(false);
      }
    })();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    };
  }, [scanning]);

  if (unlocked === null || expectedHash === null) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="font-mono-typed text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Lade Etappe …
        </p>
      </main>
    );
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <main className="relative min-h-screen px-3 py-8 sm:px-4 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-ink) 0, var(--color-ink) 1px, transparent 1px, transparent 28px)",
        }}
      />
      <div className="relative mx-auto max-w-xl">
        <PaperCard rotate={-0.4} tape="top">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono-typed text-[11px] uppercase tracking-[0.2em] text-stamp">
                {label}
              </p>
              <h1 className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl">
                {title ?? (
                  <>
                    QR-Code scannen,
                    <br />
                    um Etappe zu öffnen
                  </>
                )}
              </h1>
            </div>
            <Stamp rotate={8}>Gesperrt</Stamp>
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-foreground/80">
            {description ??
              "Diese Etappe ist versiegelt. Sie lässt sich nur mit dem original beigelegten QR-Code öffnen. Halte den Code vor die Kamera deines Geräts."}
          </p>

          <div
            className={cn(
              "mt-6 overflow-hidden rounded-sm border border-border bg-black/90",
              !scanning && "hidden",
            )}
          >
            <video
              ref={videoRef}
              className="aspect-square w-full object-cover"
              muted
              playsInline
            />
          </div>

          {error && (
            <div className="mt-5 rounded-sm border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <p className="font-serif text-base font-semibold text-destructive">
                {error.headline}
              </p>
              <p className="mt-1 text-destructive/90">{error.detail}</p>

              {error.builderBlocked && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => window.open(location.href, "_blank", "noopener")}
                    className="rounded-sm bg-primary px-3 py-2 font-serif text-xs font-semibold text-primary-foreground shadow hover:-translate-y-0.5 transition-transform"
                  >
                    Preview in neuem Tab öffnen
                  </button>
                </div>
              )}

              <p className="mt-3 text-xs leading-relaxed text-destructive/80">
                Wenn die Kamera nicht will: Der Code steht auch als Zeichenfolge unter
                dem QR-Bild. Gib ihn unten von Hand ein oder frag die Lehrperson.
              </p>
            </div>
          )}

          {/* Ausweg ohne Kamera: Zeichenfolge unter dem QR-Code eintippen. */}
          <div className="mt-5 rounded-sm border border-border bg-paper/60 p-3">
            <label
              htmlFor="qr-manual"
              className="font-mono-typed block text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              Code von Hand eingeben
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="qr-manual"
                value={manual}
                onChange={(e) => {
                  setManual(e.target.value);
                  setManualError(false);
                }}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Zeichenfolge unter dem QR-Code"
                className="min-h-11 w-full rounded-sm border border-border bg-card px-3 text-[16px] focus:border-stamp focus:outline-none focus:ring-2 focus:ring-stamp/25"
              />
              <button
                type="button"
                onClick={() => void unlockManually()}
                className="min-h-11 shrink-0 rounded-sm bg-primary px-3 font-serif text-sm font-semibold text-primary-foreground"
              >
                Öffnen
              </button>
            </div>
            {manualError && (
              <p className="mt-2 text-xs text-destructive">
                Diese Zeichenfolge passt nicht zu dieser Etappe.
              </p>
            )}
          </div>


          <div className="mt-6 flex flex-wrap gap-3">
            {!scanning ? (
              <button
                onClick={() => {
                  setError(null);
                  setScanning(true);
                }}
                className="rounded-sm bg-primary px-5 py-3 font-serif text-sm font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                📷 Kamera starten & QR scannen
              </button>
            ) : (
              <button
                onClick={() => {
                  controlsRef.current?.stop();
                  mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
                  setScanning(false);
                }}
                className="rounded-sm border border-border bg-card px-5 py-3 font-serif text-sm hover:bg-secondary"
              >
                Abbrechen
              </button>
            )}
          </div>

          <p className="mt-6 font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Hinweis: Ohne gültigen Scan bleibt die Etappe verschlossen.
          </p>
        </PaperCard>
      </div>
    </main>
  );
}
