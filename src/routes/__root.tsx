import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { GlobalTimer } from "@/components/case-file/GlobalTimer";
import { BadgeToast } from "@/components/case-file/BadgeToast";
import { ScoreCounter } from "@/components/case-file/ScoreCounter";
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
      { title: "Wo ist Maya?, Ein Escape-Room über Nachhaltigkeit" },
      {
        name: "description",
        content:
          "Maya ist verschwunden. Übernimm ihre Akte und finde heraus, was sie über nachhaltigen Konsum entdeckt hat. Bildungs-Escape-Room auf Deutsch.",
      },
      { property: "og:title", content: "Wo ist Maya?, Ein Escape-Room über Nachhaltigkeit" },
      {
        property: "og:description",
        content:
          "Maya ist verschwunden. Übernimm ihre Akte und finde heraus, was sie über nachhaltigen Konsum entdeckt hat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Wo ist Maya?, Ein Escape-Room über Nachhaltigkeit" },
      { name: "description", content: "Build interactive educational escape rooms with a canvas-based design tool." },
      { property: "og:description", content: "Build interactive educational escape rooms with a canvas-based design tool." },
      { name: "twitter:description", content: "Build interactive educational escape rooms with a canvas-based design tool." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4eefa4b0-6f8f-44e7-9b17-554a31c22eaa/id-preview-d167bbf9--9bd6c632-68ea-4681-aaff-b71704dee477.lovable.app-1777560002209.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4eefa4b0-6f8f-44e7-9b17-554a31c22eaa/id-preview-d167bbf9--9bd6c632-68ea-4681-aaff-b71704dee477.lovable.app-1777560002209.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
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
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
        <ScoreCounter />
        <GlobalTimer />
      </div>
      <BadgeToast />
    </>
  );
}
