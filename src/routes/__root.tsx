import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { GlobalTimer } from "@/components/case-file/GlobalTimer";
import { BadgeToast } from "@/components/case-file/BadgeToast";
import { ScoreCounter } from "@/components/case-file/ScoreCounter";
import { SyncIndicator } from "@/components/case-file/SyncIndicator";
import { ErrorScreen } from "@/components/case-file/ErrorScreen";
import { TeacherMessageOverlay } from "@/components/case-file/TeacherMessageOverlay";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="stamp-mark inline-block px-3 py-1 text-xs">Akte nicht gefunden</p>
        <h1 className="mt-6 font-serif text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 font-serif text-xl font-semibold text-foreground">
          Diese Spur führt ins Leere
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Die Seite, die du suchst, existiert nicht oder wurde verlegt.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Zurück zum Anfang
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Majas Mission - Escape Game zu Nachhaltigkeit" },
      {
        name: "description",
        content:
          "Majas Mission ist ein mobiler Bildungs Escape Game zum Thema Nachhaltigkeit: Schulklassen lösen reale Rätsel zu Mobilität, Konsum, Energie & mehr",
      },
      { property: "og:title", content: "Majas Mission - Escape Game zu Nachhaltigkeit" },
      {
        property: "og:description",
        content:
          "Majas Mission ist ein mobiler Bildungs Escape Game zum Thema Nachhaltigkeit: Schulklassen lösen reale Rätsel zu Mobilität, Konsum, Energie & mehr",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Majas Mission - Escape Game zu Nachhaltigkeit" },
      {
        name: "twitter:description",
        content:
          "Majas Mission ist ein mobiler Bildungs Escape Game zum Thema Nachhaltigkeit: Schulklassen lösen reale Rätsel zu Mobilität, Konsum, Energie & mehr",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=Special+Elite&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ({ reset }) => <ErrorScreen reset={reset} />,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <div className="fixed right-3 top-3 z-40 flex items-center gap-2">
        <SyncIndicator />
        <ScoreCounter />
        <GlobalTimer />
      </div>
      <BadgeToast />
      <TeacherMessageOverlay />
      <Toaster />
    </>
  );
}
