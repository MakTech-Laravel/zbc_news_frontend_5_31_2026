import * as React from "react";

import { env } from "@/config/env";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          "timeout-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "flexible" | "compact";
          appearance?: "always" | "execute" | "interaction-only";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  onTokenChange: (token: string | null) => void;
  className?: string;
};

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type WidgetStatus = "loading" | "ready" | "error";

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile requires a browser environment."));
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Turnstile.")), {
        once: true,
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile."));
    document.head.appendChild(script);
  });
}

/**
 * Cloudflare Turnstile widget. Renders nothing when `VITE_TURNSTILE_SITE_KEY` is unset.
 * On failure we show our own retry UI instead of Cloudflare's Troubleshoot modal.
 */
export function TurnstileWidget({ onTokenChange, className }: TurnstileWidgetProps) {
  const siteKey = env.turnstileSiteKey;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const onTokenChangeRef = React.useRef(onTokenChange);
  const [status, setStatus] = React.useState<WidgetStatus>("loading");
  const [retryKey, setRetryKey] = React.useState(0);

  React.useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  React.useEffect(() => {
    if (!siteKey) {
      onTokenChangeRef.current(null);
      return;
    }

    let cancelled = false;
    setStatus("loading");
    onTokenChangeRef.current(null);

    void loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
        }

        containerRef.current.innerHTML = "";

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          size: "flexible",
          appearance: "always",
          callback: (token) => {
            if (cancelled) return;
            setStatus("ready");
            onTokenChangeRef.current(token);
          },
          "error-callback": () => {
            if (cancelled) return;
            onTokenChangeRef.current(null);
            setStatus("error");
            if (widgetIdRef.current && window.turnstile) {
              try {
                window.turnstile.remove(widgetIdRef.current);
              } catch {
                // ignore
              }
              widgetIdRef.current = null;
            }
            if (containerRef.current) {
              containerRef.current.innerHTML = "";
            }
          },
          "expired-callback": () => {
            if (cancelled) return;
            onTokenChangeRef.current(null);
            setStatus("loading");
            if (widgetIdRef.current && window.turnstile) {
              window.turnstile.reset(widgetIdRef.current);
            }
          },
          "timeout-callback": () => {
            if (cancelled) return;
            onTokenChangeRef.current(null);
            setStatus("error");
          },
        });

        if (!cancelled) {
          setStatus("ready");
        }
      })
      .catch(() => {
        if (cancelled) return;
        onTokenChangeRef.current(null);
        setStatus("error");
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, retryKey]);

  if (!siteKey) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-muted/40 px-3 py-3",
        className,
      )}
    >
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Security verification
      </p>

      {status === "error" ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">
            Verification could not load. If you are on localhost, add{" "}
            <span className="font-medium">localhost</span> to this Turnstile
            widget&apos;s hostnames in Cloudflare, or use Cloudflare test keys
            for local development.
          </p>
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => {
              setStatus("loading");
              setRetryKey((value) => value + 1);
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {status === "loading" ? (
            <p className="mb-2 text-xs text-muted-foreground">Loading check…</p>
          ) : null}
          <div
            ref={containerRef}
            className="min-h-[65px] w-full overflow-hidden [&_iframe]:max-w-full"
          />
        </>
      )}
    </div>
  );
}

export function isTurnstileRequired(): boolean {
  return Boolean(env.turnstileSiteKey);
}

export function resetTurnstile() {
  if (!window.turnstile) return;
  window.turnstile.reset();
}
