import { useState } from "react";
import { AlertTriangle, Check, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { SectionEyebrow } from "@/components/legal/SectionEyebrow";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  ACCESSIBILITY_ADDRESS,
  ACCESSIBILITY_BADGES,
  ACCESSIBILITY_EMAIL,
  ACCESSIBILITY_FEATURES,
  ACCESSIBILITY_PHONE,
  COMMITMENT_STATS,
  KEYBOARD_SHORTCUTS,
  KNOWN_LIMITATIONS,
  SUPPORTED_TECHNOLOGIES,
} from "./accessibilityData";

export function AccessibilityStatementContent() {
  const [issue, setIssue] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!issue.trim()) {
      toast.error("Please describe the accessibility issue.");
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Thank you. We'll investigate your report within 5 business days.");
      setIssue("");
      setPageUrl("");
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white">
      <section className="bg-zbc-hero-navy py-20 md:py-24">
        <div className="mx-auto container max-w-4xl px-4">
          <SectionEyebrow variant="red" className="text-zbc-red-accent">
            Inclusive Design
          </SectionEyebrow>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl">
            Accessibility Statement
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-[1.625rem] text-zbc-blue-border">
            ZBC News is committed to ensuring that our journalism is accessible to everyone — including the 1.3 billion
            people worldwide who live with some form of disability.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {ACCESSIBILITY_BADGES.map((badge) => (
              <span
                key={badge.label}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold",
                  badge.variant === "success" && "bg-admin-trend-up text-white",
                  badge.variant === "info" && "border border-zbc-blue bg-zbc-blue-deep text-zbc-blue-light",
                )}
              >
                {badge.variant === "success" ? <Check className="size-3" aria-hidden /> : null}
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zbc-gray-50 py-16 md:py-20">
        <div className="mx-auto container max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionEyebrow>Our Commitment</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-black text-zbc-hero-navy">Journalism Is for Everyone</h2>
              <div className="mt-6 space-y-4 text-base leading-[1.625rem] text-admin-label">
                <p>
                  We believe access to high-quality news is a public right. Barriers to that access — whether a paywall or
                  an inaccessible interface — run counter to our mission.
                </p>
                <p>
                  Our engineering and editorial teams work together to ensure ZBC News meets WCAG 2.1 Level AA as a
                  minimum standard. Formal third-party accessibility audits are conducted bi-annually, with priority
                  issues resolved within 5 business days.
                </p>
                <p>
                  We conduct user testing with people who rely on assistive technology, and we actively maintain an
                  accessibility feedback channel that routes directly to our engineering team.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {COMMITMENT_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-zbc-gray-200 bg-white p-6 text-center"
                >
                  <p className="text-3xl font-black text-zbc-hero-navy">{stat.value}</p>
                  <p className="mt-1 text-xs text-zbc-nav-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto container max-w-7xl px-4">
          <SectionEyebrow className="text-center">What We&apos;ve Built</SectionEyebrow>
          <h2 className="mt-3 text-center text-3xl font-black text-zbc-hero-navy">Accessibility Features</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {ACCESSIBILITY_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="border border-zbc-gray-200 p-8">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center bg-zbc-blue-light text-zbc-blue">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <h3 className="text-xl font-black text-zbc-hero-navy">{feature.title}</h3>
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {feature.items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-5 text-admin-label">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-admin-trend-up" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-zbc-gray-200 py-16 md:py-20">
        <div className="mx-auto container max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionEyebrow>Navigation</SectionEyebrow>
              <h2 className="mt-3 text-3xl font-black text-zbc-hero-navy">Keyboard Shortcuts</h2>
              <div className="mt-6 overflow-hidden rounded-lg border border-zbc-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-zbc-hero-navy text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold">Key</th>
                      <th className="px-4 py-3 text-left font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {KEYBOARD_SHORTCUTS.map((row) => (
                      <tr key={row.key} className="border-b border-zbc-gray-100 last:border-0">
                        <td className="px-4 py-3 font-mono text-sm font-bold text-zbc-hero-navy">{row.key}</td>
                        <td className="px-4 py-3 text-admin-label">{row.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <SectionEyebrow>Compatibility</SectionEyebrow>
              <h2 className="mt-3 text-3xl font-black text-zbc-hero-navy">Supported Technologies</h2>
              <ul className="mt-6 space-y-3">
                {SUPPORTED_TECHNOLOGIES.map((tech) => (
                  <li
                    key={tech.name}
                    className="flex items-center justify-between gap-4 border border-zbc-gray-200 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-zbc-hero-navy">{tech.name}</p>
                      <p className="text-xs text-zbc-nav-muted">{tech.platform}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 px-2 py-0.5 text-xs font-bold",
                        tech.status === "Supported"
                          ? "bg-admin-badge-published-bg text-admin-badge-published-text"
                          : "bg-admin-badge-draft-bg text-admin-badge-draft-text",
                      )}
                    >
                      {tech.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zbc-gray-200 py-10">
        <div className="mx-auto container max-w-7xl px-4">
          <div className="flex gap-4 rounded-lg bg-admin-badge-draft-bg p-5">
            <AlertTriangle className="size-5 shrink-0 text-admin-badge-draft-text" aria-hidden />
            <div>
              <p className="text-sm font-bold text-zbc-hero-navy">Known Limitations</p>
              <p className="mt-1 text-sm leading-[1.625rem] text-admin-label">{KNOWN_LIMITATIONS}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zbc-hero-navy py-16 md:py-20">
        <div className="mx-auto container max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionEyebrow variant="blue">Your Voice Matters</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-black text-white">Report an Accessibility Issue</h2>
              <p className="mt-4 text-sm leading-[1.625rem] text-zbc-blue-muted">
                Encountered a barrier on ZBC News? Tell us. We take every accessibility report seriously and commit to
                investigating within 5 business days.
              </p>
              <dl className="mt-8 space-y-4 text-xs uppercase tracking-wide text-zbc-blue-muted">
                <div>
                  <dt className="font-bold">Email</dt>
                  <dd className="mt-1 text-sm normal-case">
                    <a href={`mailto:${ACCESSIBILITY_EMAIL}`} className="text-zbc-blue-light">
                      {ACCESSIBILITY_EMAIL}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-bold">Phone (TTY)</dt>
                  <dd className="mt-1 text-sm normal-case text-zbc-blue-light">{ACCESSIBILITY_PHONE}</dd>
                </div>
                <div>
                  <dt className="font-bold">Mailing</dt>
                  <dd className="mt-1 text-sm normal-case text-zbc-blue-light">{ACCESSIBILITY_ADDRESS}</dd>
                </div>
              </dl>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="accessibility-issue" className="mb-2 block text-sm font-semibold text-white">
                  Describe the issue <span className="text-zbc-red-accent">*</span>
                </label>
                <textarea
                  id="accessibility-issue"
                  rows={4}
                  value={issue}
                  onChange={(event) => setIssue(event.target.value)}
                  placeholder="Tell us what happened and what assistive technology you were using…"
                  className="w-full resize-y border border-zbc-blue-border bg-white px-4 py-3 text-sm text-zbc-gray-1000 placeholder:text-zbc-gray-500/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zbc-blue"
                  required
                />
              </div>
              <div>
                <label htmlFor="accessibility-url" className="mb-2 block text-sm font-semibold text-white">
                  Page URL (if applicable)
                </label>
                <Input
                  id="accessibility-url"
                  type="url"
                  value={pageUrl}
                  onChange={(event) => setPageUrl(event.target.value)}
                  placeholder="https://zbcnews.com/..."
                  className="h-11 rounded-none border-zbc-blue-border bg-white"
                />
              </div>
              <div>
                <label htmlFor="accessibility-email" className="mb-2 block text-sm font-semibold text-white">
                  Your Email (for follow-up)
                </label>
                <Input
                  id="accessibility-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-11 rounded-none border-zbc-blue-border bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white py-3 text-sm font-bold text-zbc-hero-navy disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Report Accessibility Issue"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="border-t border-zbc-gray-200 bg-brand-soft py-6">
        <div className="mx-auto container flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <p className="text-sm font-semibold text-zbc-hero-navy">Need Immediate Accessibility Help?</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-zbc-hero-navy px-5 py-2.5 text-sm font-bold text-white"
          >
            Contact Support
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
