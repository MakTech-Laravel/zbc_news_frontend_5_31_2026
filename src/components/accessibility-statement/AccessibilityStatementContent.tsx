import { useEffect, useState } from "react";
import { AlertTriangle, Check, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { resolveAccessibilityFeatureIcon } from "@/components/accessibility-statement/accessibilityFeatureIcons";
import { SectionEyebrow } from "@/components/legal/SectionEyebrow";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AccessibilityStatementContent } from "@/services/admin/accessibilityStatement";
import { submitAccessibilityReport } from "@/services/frontend/accessibilityReports";
import { fetchPublicAccessibilityStatement } from "@/services/frontend/accessibilityStatement";

export function AccessibilityStatementContent() {
  const [content, setContent] = useState<AccessibilityStatementContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issue, setIssue] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        setContent(await fetchPublicAccessibilityStatement());
      } catch {
        setError("Unable to load the accessibility statement right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!issue.trim()) {
      toast.error("Please describe the accessibility issue.");
      return;
    }

    setSubmitting(true);
    try {
      await submitAccessibilityReport({
        issue: issue.trim(),
        page_url: pageUrl.trim() || undefined,
        email: email.trim() || undefined,
      });
      toast.success("Thank you. We'll investigate your report within 5 business days.");
      setIssue("");
      setPageUrl("");
      setEmail("");
    } catch {
      toast.error("Unable to submit your report right now. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white px-6 py-20 text-center text-sm text-admin-label">
        Loading accessibility statement…
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="bg-white px-6 py-20 text-center text-sm text-admin-label">
        {error ?? "Accessibility statement is unavailable."}
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="bg-zbc-hero-navy py-20 md:py-24">
        <div className="mx-auto container max-w-4xl px-4">
          <SectionEyebrow variant="red" className="text-zbc-red-accent">
            {content.hero_eyebrow}
          </SectionEyebrow>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl">
            {content.hero_title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-[1.625rem] text-zbc-blue-border">
            {content.hero_intro}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {content.badges.map((badge) => (
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
              <h2 className="mt-4 text-3xl font-black text-zbc-hero-navy">{content.commitment_heading}</h2>
              <div className="mt-6 space-y-4 text-base leading-[1.625rem] text-admin-label">
                {content.commitment_paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {content.commitment_stats.map((stat) => (
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
          <h2 className="mt-3 text-center text-3xl font-black text-zbc-hero-navy">
            {content.features_heading}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {content.features.map((feature) => {
              const Icon = resolveAccessibilityFeatureIcon(feature.icon);
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
              <h2 className="mt-3 text-3xl font-black text-zbc-hero-navy">{content.shortcuts_heading}</h2>
              <div className="mt-6 overflow-hidden rounded-lg border border-zbc-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-zbc-hero-navy text-white">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold">Key</th>
                      <th className="px-4 py-3 text-left font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.keyboard_shortcuts.map((row) => (
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
              <h2 className="mt-3 text-3xl font-black text-zbc-hero-navy">{content.technologies_heading}</h2>
              <ul className="mt-6 space-y-3">
                {content.supported_technologies.map((tech) => (
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
              <p className="mt-1 text-sm leading-[1.625rem] text-admin-label">{content.known_limitations}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zbc-hero-navy py-16 md:py-20">
        <div className="mx-auto container max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionEyebrow variant="blue">Your Voice Matters</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-black text-white">{content.report_heading}</h2>
              <p className="mt-4 text-sm leading-[1.625rem] text-zbc-blue-muted">{content.report_intro}</p>
              <dl className="mt-8 space-y-4 text-xs uppercase tracking-wide text-zbc-blue-muted">
                <div>
                  <dt className="font-bold">Email</dt>
                  <dd className="mt-1 text-sm normal-case">
                    <a href={`mailto:${content.contact_email}`} className="text-zbc-blue-light">
                      {content.contact_email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="font-bold">Phone (TTY)</dt>
                  <dd className="mt-1 text-sm normal-case text-zbc-blue-light">{content.contact_phone}</dd>
                </div>
                <div>
                  <dt className="font-bold">Mailing</dt>
                  <dd className="mt-1 text-sm normal-case text-zbc-blue-light">{content.contact_address}</dd>
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
          <p className="text-sm font-semibold text-zbc-hero-navy">{content.cta_text}</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-zbc-hero-navy px-5 py-2.5 text-sm font-bold text-white"
          >
            {content.cta_button_label}
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
