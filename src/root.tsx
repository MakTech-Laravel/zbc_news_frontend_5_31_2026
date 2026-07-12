import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  type LinksFunction,
} from "react-router";

import stylesheet from "@/index.css?url";
import { AppBootstrapEffects } from "@/AppBootstrapEffects";
import { AuthProvider } from "@/auth/AuthProvider";
import { ErrorBoundary as AppErrorBoundary } from "@/components/error/ErrorBoundary";
import { AuthenticatedNotificationsProvider } from "@/contexts/AuthenticatedNotificationsProvider";
import { SiteSettingsProvider } from "@/context/SiteSettingsProvider";
import { queryClient } from "@/lib/queryClient";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesheet }];

/** Baseline document title; individual routes override via their own meta(). */
export const meta = () => [
  { title: "ZBC News" },
  { name: "description", content: "ZBC News - Your trusted news source" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <AuthProvider>
          <AuthenticatedNotificationsProvider>
            <AppErrorBoundary>
              <AppBootstrapEffects />
              <Outlet />
            </AppErrorBoundary>
          </AuthenticatedNotificationsProvider>
          <Toaster position="top-right" />
        </AuthProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong";
  return (
    <main className="flex min-h-dvh items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold">{message}</h1>
        <p className="mt-2 text-muted-foreground">
          Please try again or return to the homepage.
        </p>
      </div>
    </main>
  );
}
