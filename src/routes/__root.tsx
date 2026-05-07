import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { AmbientBackground } from "@/components/AmbientBackground";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Research OS" },
      { name: "description", content: "A premium research operating system for tracking experiments, milestones, and insights." },
      { name: "author", content: "Research OS" },
      { property: "og:title", content: "Research OS" },
      { property: "og:description", content: "A premium research operating system for tracking experiments, milestones, and insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Research OS" },
      { name: "twitter:description", content: "A premium research operating system for tracking experiments, milestones, and insights." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ede555b6-06dc-4a97-8b94-524e8b79985c/id-preview-b9345e6a--63cee7d3-0cdf-46b4-9a93-16dd1d5cf824.lovable.app-1778131258961.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ede555b6-06dc-4a97-8b94-524e8b79985c/id-preview-b9345e6a--63cee7d3-0cdf-46b4-9a93-16dd1d5cf824.lovable.app-1778131258961.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
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
  const { queryClient } = Route.useRouteContext();
  const [cmd, setCmd] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isFullscreen = path === "/focus" || path === "/export";

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <AmbientBackground />
        <div className="flex min-h-screen w-full">
          {!isFullscreen && <Sidebar onCommand={() => setCmd(true)} />}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={path}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <CommandPalette open={cmd} onOpenChange={setCmd} />
        <Toaster position="bottom-right" theme="light" richColors closeButton />
      </StoreProvider>
    </QueryClientProvider>
  );
}
