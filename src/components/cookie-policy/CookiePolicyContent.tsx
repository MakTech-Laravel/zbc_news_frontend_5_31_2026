import { useState } from "react";
import { ChevronDown, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { LegalPageHero } from "@/components/legal/LegalPageHero";
import { cn } from "@/lib/utils";

import {
  BROWSER_CONTROLS,
  COOKIE_CATEGORIES,
  COOKIE_FAQ,
  COOKIE_PRIVACY_EMAIL,
  type CookieCategoryId,
} from "./cookiePolicyData";

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

export function CookiePolicyContent() {
  const [preferences, setPreferences] = useState<Record<CookieCategoryId, boolean>>(() =>
    Object.fromEntries(COOKIE_CATEGORIES.map((cat) => [cat.id, cat.defaultEnabled])) as Record<
      CookieCategoryId,
      boolean
    >,
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function savePreferences(next: Record<CookieCategoryId, boolean>) {
    setPreferences(next);
    toast.success("Cookie preferences saved.");
  }

  function handleSave() {
    savePreferences(preferences);
  }

  function handleRejectAll() {
    const next = {
      essential: true,
      analytics: false,
      preferences: false,
      advertising: false,
    };
    savePreferences(next);
  }

  function handleAcceptAll() {
    const next = {
      essential: true,
      analytics: true,
      preferences: true,
      advertising: true,
    };
    savePreferences(next);
  }

  return (
    <div className="bg-white">
      <LegalPageHero
        title="Cookie Policy"
        meta="Last updated: June 1, 2026 · Version 2.3"
        description="ZBC News uses cookies to keep you logged in, remember your preferences, understand how our journalism is read, and — with your consent — to serve relevant advertising. This page explains every cookie we use and gives you full control."
      />

      <section className="py-12 md:py-16">
        <div className="mx-auto container max-w-3xl px-4">
          <h2 className="text-3xl font-black text-zbc-hero-navy">Manage Cookie Preferences</h2>
          <p className="mt-2 text-sm text-admin-label">
            Toggle optional cookie categories. Essential cookies cannot be disabled — they&apos;re required for ZBC News
            to work.
          </p>

          <div className="mt-6 space-y-3">
            {COOKIE_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const enabled = preferences[category.id];

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
                      {category.alwaysOn ? (
                        <span className="bg-zbc-blue-light px-2 py-0.5 text-xs font-bold text-zbc-blue">
                          Always On
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-[1.625rem] text-admin-label">{category.description}</p>
                    <button type="button" className="mt-1 text-xs font-bold text-zbc-blue">
                      Details
                    </button>
                  </div>
                  <CookieToggle
                    label={`${category.title} cookies`}
                    enabled={enabled}
                    disabled={category.alwaysOn}
                    onChange={
                      category.alwaysOn
                        ? undefined
                        : (value) => setPreferences((prev) => ({ ...prev, [category.id]: value }))
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
          <p className="mt-4 text-sm text-admin-label">
            You can also manage cookies directly in your browser settings:
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {BROWSER_CONTROLS.map((item) => (
              <div key={item.browser} className="rounded-lg border border-zbc-gray-200 bg-zbc-gray-50 p-4">
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
            {COOKIE_FAQ.map((item, index) => {
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
                      className={cn("size-4 shrink-0 text-zbc-hero-navy transition-transform", isOpen && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                  {isOpen ? (
                    <p className="px-5 pb-4 text-sm leading-[1.625rem] text-admin-label">{item.answer}</p>
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
              <h2 className="text-2xl font-black text-white">Questions About Cookies?</h2>
              <p className="mt-2 text-sm leading-[1.625rem] text-zbc-blue-muted">
                Our privacy team can help with any questions about how ZBC News uses tracking technologies.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${COOKIE_PRIVACY_EMAIL}`}
                className="inline-flex items-center gap-2 bg-white px-5 py-2.5 text-sm font-bold text-zbc-hero-navy"
              >
                <Mail className="size-4" aria-hidden />
                {COOKIE_PRIVACY_EMAIL}
              </a>
              <Link
                to="/privacy-policy"
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
