import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { PaperCard } from "./PaperCard";
import { Stamp } from "./Stamp";
import { cn } from "@/lib/utils";

// Default für Etappe 1 — bewusst NICHT im UI angezeigt.
const DEFAULT_TOKEN = "CpZk0z9RaQkL22gtiWoR";
const DEFAULT_STORAGE_KEY = "akte-001-unlocked";

// Hash zur Persistenz – wir speichern nicht den Klartext-Token im LocalStorage.
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
};

export function QRGate({
  children,
  token = DEFAULT_TOKEN,
  storageKey = DEFAULT_STORAGE_KEY,
  title,
  description,
  label = "Etappe · Versiegelt",
}: Props) {
  const EXPECTED_TOKEN = token;
  const STORAGE_KEY = storageKey;
  const [unlocked, setUnlocked] = useState<boolean | null>(null); // null = noch nicht geprüft
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expectedHash, setExpectedHash] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  // Initial: gespeicherten Hash gegen erwarteten Hash prüfen
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

  // Scanner starten/stoppen
  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;
    const reader = new BrowserQRCodeReader();

    (async () => {
      try {
        if (!videoRef.current) return;
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
              } catch {
                /* ignore */
              }
              ctrl.stop();
              setUnlocked(true);
              setScanning(false);
              setError(null);
            } else {
              setError("Zugriff verweigert. Dieser QR-Code passt nicht zur Etappe.");
              ctrl.stop();
              setScanning(false);
            }
          },
        );
        controlsRef.current = controls;
      } catch (e: any) {
        if (cancelled) return;
        setError(
          e?.name === "NotAllowedError"
            ? "Kamera-Zugriff wurde abgelehnt. Bitte erlaube den Zugriff in den Browser-Einstellungen."
            : "Kamera konnte nicht gestartet werden.",
        );
        setScanning(false);
      }
    })();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [scanning]);

  // Lade-Zustand
  if (unlocked === null || expectedHash === null) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="font-mono-typed text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Lade Akte …
        </p>
      </main>
    );
  }

  if (unlocked) {
    return <>{children}</>;
  }

  // Gate-Ansicht: gesperrt
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
                Akte 001 · Versiegelt
              </p>
              <h1 className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl">
                {title ?? (
                  <>
                    QR-Code scannen,
                    <br />
                    um Akte zu öffnen
                  </>
                )}
              </h1>
            </div>
            <Stamp rotate={8}>Gesperrt</Stamp>
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-foreground/80">
            {description ??
              "Diese Akte ist versiegelt. Sie lässt sich nur mit dem original beigelegten QR-Code öffnen. Halte den Code vor die Kamera deines Geräts."}
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
            <div className="mt-5 rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

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
                  setScanning(false);
                }}
                className="rounded-sm border border-border bg-card px-5 py-3 font-serif text-sm hover:bg-secondary"
              >
                Abbrechen
              </button>
            )}
          </div>

          <p className="mt-6 font-mono-typed text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Hinweis: Ohne gültigen Scan bleibt die Akte verschlossen.
          </p>
        </PaperCard>
      </div>
    </main>
  );
}
