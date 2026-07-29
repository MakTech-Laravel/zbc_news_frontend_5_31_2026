import { useEffect, useMemo, useState } from "react";
import { BarChart3, ChevronDown, Mail, Settings, Shield, Target } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import type { LucideIcon } from "lucide-react";

import { LegalPageHero } from "@/components/legal/LegalPageHero";
import { useCookieConsent } from "@/context/CookieConsentProvider";
import { cn } from "@/lib/utils";
import type { CookieCategoryId, CookiePolicyContent } from "@/services/admin/cookiePolicy";
import { fetchPublicCookiePolicy } from "@/services/frontend/cookiePolicy";

const CATEGORY_ICONS: Record<CookieCategoryId, LucideIcon> = {
  essential: Shield,
  analytics: BarChart3,
  preferences: Settings,
  advertising: Target,
};

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

function emptyDraft(): Record<CookieCategoryId, boolean> {
  return {
    essential: true,
    analytics: false,
    preferences: false,
    advertising: false,
  };
}

export function CookiePolicyContent() {
  const { preferences, savePreferences, acceptAll, rejectOptional, ready } = useCookieConsent();
  const [content, setContent] = useState<CookiePolicyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<CookieCategoryId, boolean>>(emptyDraft);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        setContent(await fetchPublicCookiePolicy());
      } catch {
        setError("Unable to load the cookie policy right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    setDraft({ ...preferences, essential: true });
  }, [ready, preferences]);

  const categories = useMemo(() => {
    if (!content?.categories?.length) return [];
    return content.categories.map((category) => ({
      ...category,
      icon: CATEGORY_ICONS[category.id] ?? Shield,
    }));
  }, [content]);

  function handleSave() {
    savePreferences(draft);
    toast.success("Cookie preferences saved.");
  }

  function handleRejectAll() {
    rejectOptional();
    toast.success("Optional cookies disabled.");
  }

  function handleAcceptAll() {
    acceptAll();
    toast.success("All cookies accepted.");
  }

  if (loading) {
    return (
      <div className="bg-white px-6 py-20 text-center text-sm text-admin-label">
        Loading cookie policy…
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="bg-white px-6 py-20 text-center text-sm text-admin-label">
        {error ?? "Cookie policy is unavailable."}
      </div>
    );
  }

  return (
    <div className="bg-white">
      <LegalPageHero
        title="Cookie Policy"
        meta={content.hero_meta}
        description={content.hero_description}
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto container max-w-3xl px-4">
          <h2 className="text-3xl font-black text-zbc-hero-navy">Manage Cookie Preferences</h2>
          <p className="mt-2 text-sm text-admin-label">{content.preferences_intro}</p>

          <div className="mt-6 space-y-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const enabled = draft[category.id];
              const alwaysOn = category.always_on || category.id === "essential";

              return (
                <div
                  key={category.id}
                  className="flex flex-col gap-4 border border-zbc-gray-200 p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center bg-zbc-blue-light text-zbc-blue">
                    <Icon className="size-[18px]" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-zbc-hero-navy">{category.title}</h3>
                      {alwaysOn ? (
                        <span className="bg-zbc-blue-light px-2 py-0.5 text-xs font-bold text-zbc-blue">
                          Always On
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-[1.625rem] text-admin-label">
                      {category.description}
                    </p>
                  </div>
                  <CookieToggle
                    label={`${category.title} cookies`}
                    enabled={alwaysOn ? true : enabled}
                    disabled={alwaysOn}
                    onChange={
                      alwaysOn
                        ? undefined
                        : (value) => setDraft((prev) => ({ ...prev, [category.id]: value }))
                    }
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="bg-zbc-hero-navy px-6 py-2.5 text-sm font-bold text-white"
            >
              Save My Preferences
            </button>
            <button
              type="button"
              onClick={handleRejectAll}
              className="border border-admin-input-border px-6 py-2.5 text-sm font-bold text-zbc-content-dark"
            >
              Reject All Optional
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="border border-admin-input-border px-6 py-2.5 text-sm font-bold text-zbc-content-dark"
            >
              Accept All
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-zbc-gray-200 py-12 md:py-16">
        <div className="mx-auto container max-w-3xl px-4">
          <h2 className="text-3xl font-black text-zbc-hero-navy">Browser-Level Cookie Controls</h2>
          <p className="mt-4 text-sm text-admin-label">{content.browser_intro}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {content.browser_controls.map((item) => (
              <div key={`${item.browser}-${item.path}`} className="rounded-lg border border-zbc-gray-200 bg-zbc-gray-50 p-4">
                <p className="text-sm font-bold text-zbc-hero-navy">{item.browser}</p>
                <p className="mt-0.5 text-xs leading-4 text-zbc-nav-muted">{item.path}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zbc-gray-200 py-12 md:py-16">
        <div className="mx-auto container max-w-3xl px-4">
          <h2 className="text-3xl font-black text-zbc-hero-navy">Cookie FAQ</h2>
          <div className="mt-6 divide-y divide-zbc-gray-200 border border-zbc-gray-200">
            {content.faqs.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={item.question}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <span className="text-sm font-bold text-zbc-hero-navy">{item.question}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-zbc-hero-navy transition-transform",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                  {isOpen ? (
                    <p className="px-5 pb-4 text-sm leading-[1.625rem] text-admin-label">
                      {item.answer}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-zbc-hero-navy py-12 md:py-16">
        <div className="mx-auto container max-w-3xl px-4">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex size-12 shrink-0 items-center justify-center bg-zbc-blue-deep/40 text-zbc-blue-light">
              <Mail className="size-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-black text-white">{content.contact_heading}</h2>
              <p className="mt-2 text-sm leading-[1.625rem] text-zbc-blue-muted">
                {content.contact_description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${content.contact_email}`}
                className="inline-flex items-center gap-2 bg-white px-5 py-2.5 text-sm font-bold text-zbc-hero-navy"
              >
                <Mail className="size-4" aria-hidden />
                {content.contact_email}
              </a>
              <Link
                to="/privacy"
                className="inline-flex items-center border border-zbc-blue-border px-5 py-2.5 text-sm font-bold text-white"
              >
                View Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
