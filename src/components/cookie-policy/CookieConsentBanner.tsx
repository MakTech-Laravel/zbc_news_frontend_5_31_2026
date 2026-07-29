import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Settings2, X } from "lucide-react";

import { useCookieConsent } from "@/context/CookieConsentProvider";
import { cn } from "@/lib/utils";
import {
  fetchPublicCookiePolicy,
  type CookiePolicyContent,
} from "@/services/frontend/cookiePolicy";
import type { CookieCategoryId } from "@/services/admin/cookiePolicy";

function CookieToggle({
  enabled,
  disabled,
  onChange,
  label,
}: {
  enabled: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!enabled)}
      className={cn(
        "relative h-6 w-12 shrink-0 transition-colors",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        enabled ? "bg-zbc-hero-navy" : "bg-zbc-gray-200",
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-4 bg-white transition-transform",
          enabled ? "left-7" : "left-1",
        )}
      />
    </button>
  );
}

export function CookieConsentBanner() {
  const {
    ready,
    hasChoice,
    preferences,
    savePreferences,
    acceptAll,
    rejectOptional,
    preferencesOpen,
    setPreferencesOpen,
  } = useCookieConsent();

  const [policy, setPolicy] = useState<CookiePolicyContent | null>(null);
  const [draft, setDraft] = useState(preferences);

  useEffect(() => {
    if (!ready) return;
    void fetchPublicCookiePolicy()
      .then(setPolicy)
      .catch(() => setPolicy(null));
  }, [ready]);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences, preferencesOpen]);

  if (!ready) return null;

  const showBanner = !hasChoice;
  const showPanel = preferencesOpen;

  if (!showBanner && !showPanel) return null;

  const title = policy?.banner_title ?? "We use cookies";
  const description =
    policy?.banner_description ??
    "ZBC News uses essential cookies to keep the site working, and optional cookies for analytics, preferences, and advertising.";

  const categories = policy?.categories ?? [
    {
      id: "essential" as const,
      title: "Strictly Essential",
      description: "Required for the site to work.",
      always_on: true,
      default_enabled: true,
    },
    {
      id: "analytics" as const,
      title: "Analytics",
      description: "Helps us understand how the site is used.",
      always_on: false,
      default_enabled: false,
    },
    {
      id: "preferences" as const,
      title: "Preferences",
      description: "Remembers your display and reading choices.",
      always_on: false,
      default_enabled: false,
    },
    {
      id: "advertising" as const,
      title: "Advertising",
      description: "Used for relevant advertising.",
      always_on: false,
      default_enabled: false,
    },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-4 md:p-6">
      <div
        role="dialog"
        aria-label="Cookie consent"
        className="mx-auto w-full max-w-3xl border border-zbc-gray-200 bg-white shadow-[0_-8px_32px_rgba(15,23,42,0.12)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zbc-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-zbc-hero-navy">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-admin-label">{description}</p>
            <Link to="/cookie-policy" className="mt-2 inline-block text-xs font-bold text-zbc-blue">
              Cookie Policy
            </Link>
          </div>
          {showPanel ? (
            <button
              type="button"
              aria-label="Close cookie preferences"
              className="shrink-0 p-1 text-admin-label hover:text-zbc-hero-navy"
              onClick={() => setPreferencesOpen(false)}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        {showPanel ? (
          <div className="max-h-[50vh] space-y-3 overflow-y-auto px-5 py-4">
            {categories.map((category) => {
              const id = category.id as CookieCategoryId;
              const alwaysOn = category.always_on || id === "essential";
              return (
                <div
                  key={id}
                  className="flex flex-col gap-3 border border-zbc-gray-200 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-zbc-hero-navy">{category.title}</p>
                    <p className="mt-1 text-xs leading-5 text-admin-label">{category.description}</p>
                  </div>
                  <CookieToggle
                    label={`${category.title} cookies`}
                    enabled={alwaysOn ? true : draft[id]}
                    disabled={alwaysOn}
                    onChange={
                      alwaysOn
                        ? undefined
                        : (value) => setDraft((prev) => ({ ...prev, [id]: value }))
                    }
                  />
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 border-t border-zbc-gray-100 px-5 py-4">
          {showPanel ? (
            <button
              type="button"
              onClick={() => savePreferences(draft)}
              className="bg-zbc-hero-navy px-4 py-2.5 text-sm font-bold text-white"
            >
              Save preferences
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={acceptAll}
                className="bg-zbc-hero-navy px-4 py-2.5 text-sm font-bold text-white"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={rejectOptional}
                className="border border-admin-input-border px-4 py-2.5 text-sm font-bold text-zbc-content-dark"
              >
                Reject optional
              </button>
              <button
                type="button"
                onClick={() => setPreferencesOpen(true)}
                className="inline-flex items-center gap-2 border border-admin-input-border px-4 py-2.5 text-sm font-bold text-zbc-content-dark"
              >
                <Settings2 className="size-4" aria-hidden />
                Customize
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
