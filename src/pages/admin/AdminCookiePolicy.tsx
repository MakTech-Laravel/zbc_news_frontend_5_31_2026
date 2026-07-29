import { useEffect, useState, type ReactNode } from "react";
import toast from "react-hot-toast";

import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { SettingsSaveBar } from "@/components/admin/settings/SettingsSaveBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/usePermission";
import {
  fetchAdminCookiePolicy,
  updateAdminCookiePolicy,
  type CookieBrowserControl,
  type CookieCategoryContent,
  type CookieFaqItem,
  type CookiePolicyContent,
} from "@/services/admin/cookiePolicy";
import { PERMISSIONS } from "@/types/permissions";

const CATEGORY_ORDER = ["essential", "analytics", "preferences", "advertising"] as const;

function emptyContent(): CookiePolicyContent {
  return {
    hero_meta: "",
    hero_description: "",
    preferences_intro: "",
    categories: CATEGORY_ORDER.map((id) => ({
      id,
      title: "",
      description: "",
      always_on: id === "essential",
      default_enabled: id !== "advertising",
    })),
    browser_intro: "",
    browser_controls: [{ browser: "", path: "" }],
    faqs: [{ question: "", answer: "" }],
    contact_heading: "",
    contact_description: "",
    contact_email: "",
    banner_title: "",
    banner_description: "",
  };
}

function normalizeCategories(categories: CookieCategoryContent[]): CookieCategoryContent[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  return CATEGORY_ORDER.map((id) => {
    const existing = byId.get(id);
    return {
      id,
      title: existing?.title ?? "",
      description: existing?.description ?? "",
      always_on: id === "essential",
      default_enabled: id === "essential" ? true : Boolean(existing?.default_enabled),
    };
  });
}

function Field({
  label,
  value,
  disabled,
  onChange,
  id,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  id?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-admin-heading" htmlFor={id}>
        {label}
      </label>
      <Input id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="h-11" />
    </div>
  );
}

function TextArea({
  label,
  value,
  disabled,
  onChange,
  id,
  rows = 3,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  id?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-admin-heading" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        disabled={disabled}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-admin-input-border bg-white px-3 py-2 text-sm text-admin-heading outline-none focus:border-zbc-blue"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-admin-input-border bg-white p-5">
      <h2 className="text-base font-bold text-admin-heading">{title}</h2>
      {children}
    </section>
  );
}

export default function AdminCookiePolicy() {
  const { can, isSuperAdmin } = usePermission();
  const canShow = isSuperAdmin || can(PERMISSIONS.COOKIE_POLICY.SHOW);
  const canUpdate = isSuperAdmin || can(PERMISSIONS.COOKIE_POLICY.UPDATE);

  const [content, setContent] = useState<CookiePolicyContent>(emptyContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!canShow) {
      setLoading(false);
      return;
    }

    void (async () => {
      setLoading(true);
      try {
        const data = await fetchAdminCookiePolicy();
        setContent({ ...data, categories: normalizeCategories(data.categories) });
      } catch {
        toast.error("Failed to load cookie policy content.");
      } finally {
        setLoading(false);
      }
    })();
  }, [canShow]);

  function updateCategory(index: number, patch: Partial<CookieCategoryContent>) {
    setContent((c) => {
      const categories = [...c.categories];
      const current = categories[index];
      if (!current) return c;
      categories[index] = {
        ...current,
        ...patch,
        id: current.id,
        always_on: current.id === "essential",
        default_enabled: current.id === "essential" ? true : Boolean(patch.default_enabled ?? current.default_enabled),
      };
      return { ...c, categories };
    });
  }

  function updateBrowserControl(index: number, patch: Partial<CookieBrowserControl>) {
    setContent((c) => {
      const browser_controls = [...c.browser_controls];
      const current = browser_controls[index];
      if (!current) return c;
      browser_controls[index] = { ...current, ...patch };
      return { ...c, browser_controls };
    });
  }

  function updateFaq(index: number, patch: Partial<CookieFaqItem>) {
    setContent((c) => {
      const faqs = [...c.faqs];
      const current = faqs[index];
      if (!current) return c;
      faqs[index] = { ...current, ...patch };
      return { ...c, faqs };
    });
  }

  async function handleSave() {
    if (!canUpdate) return;
    setSaving(true);
    try {
      const payload = {
        hero_meta: content.hero_meta,
        hero_description: content.hero_description,
        preferences_intro: content.preferences_intro,
        categories: normalizeCategories(content.categories),
        browser_intro: content.browser_intro,
        browser_controls: content.browser_controls,
        faqs: content.faqs,
        contact_heading: content.contact_heading,
        contact_description: content.contact_description,
        contact_email: content.contact_email,
        banner_title: content.banner_title,
        banner_description: content.banner_description,
      };
      const saved = await updateAdminCookiePolicy(payload);
      setContent({ ...saved, categories: normalizeCategories(saved.categories) });
      toast.success("Cookie policy saved.");
    } catch {
      toast.error("Failed to save cookie policy.");
    } finally {
      setSaving(false);
    }
  }

  if (!canShow) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Cookie Policy" description="You do not have permission to view this page." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Cookie Policy" description="Loading…" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <AdminPageHeader
        title="Cookie Policy"
        description="Edit each section of the public cookie policy and the consent banner. Category IDs are fixed so consent preferences stay consistent."
      />

      <Section title="Hero">
        <Field
          id="cookie-hero-meta"
          label="Hero meta line"
          value={content.hero_meta}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, hero_meta: value }))}
        />
        <TextArea
          id="cookie-hero-description"
          label="Hero description"
          value={content.hero_description}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, hero_description: value }))}
          rows={4}
        />
      </Section>

      <Section title="Consent banner">
        <Field
          id="cookie-banner-title"
          label="Banner title"
          value={content.banner_title}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, banner_title: value }))}
        />
        <TextArea
          id="cookie-banner-description"
          label="Banner description"
          value={content.banner_description}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, banner_description: value }))}
        />
      </Section>

      <Section title="Preferences intro">
        <TextArea
          id="cookie-preferences-intro"
          label="Intro text above category toggles"
          value={content.preferences_intro}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, preferences_intro: value }))}
        />
      </Section>

      <Section title="Cookie categories">
        <div className="space-y-5">
          {content.categories.map((category, index) => (
            <div key={category.id} className="space-y-3 border border-admin-input-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-admin-heading">{category.title || category.id}</p>
                <span className="rounded bg-zbc-blue-light px-2 py-0.5 text-xs font-bold text-zbc-blue">
                  ID: {category.id}
                </span>
                {category.always_on ? (
                  <span className="rounded bg-zbc-gray-100 px-2 py-0.5 text-xs font-bold text-admin-label">
                    Always on
                  </span>
                ) : null}
              </div>
              <Field
                label="Title"
                value={category.title}
                disabled={!canUpdate}
                onChange={(value) => updateCategory(index, { title: value })}
              />
              <TextArea
                label="Description"
                value={category.description}
                disabled={!canUpdate}
                onChange={(value) => updateCategory(index, { description: value })}
              />
              {!category.always_on ? (
                <label className="flex items-center gap-2 text-sm text-admin-heading">
                  <input
                    type="checkbox"
                    checked={category.default_enabled}
                    disabled={!canUpdate}
                    onChange={(e) => updateCategory(index, { default_enabled: e.target.checked })}
                  />
                  Default enabled before user chooses
                </label>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Browser controls">
        <TextArea
          id="cookie-browser-intro"
          label="Intro text"
          value={content.browser_intro}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, browser_intro: value }))}
        />
        <div className="space-y-3">
          {content.browser_controls.map((item, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
              <Input
                value={item.browser}
                disabled={!canUpdate}
                placeholder="Browser"
                onChange={(e) => updateBrowserControl(index, { browser: e.target.value })}
              />
              <Input
                value={item.path}
                disabled={!canUpdate}
                placeholder="Settings path"
                onChange={(e) => updateBrowserControl(index, { path: e.target.value })}
              />
              {canUpdate ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={content.browser_controls.length <= 1}
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      browser_controls: c.browser_controls.filter((_, i) => i !== index),
                    }))
                  }
                >
                  Remove
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        {canUpdate ? (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setContent((c) => ({
                ...c,
                browser_controls: [...c.browser_controls, { browser: "", path: "" }],
              }))
            }
          >
            Add browser
          </Button>
        ) : null}
      </Section>

      <Section title="FAQ">
        <div className="space-y-4">
          {content.faqs.map((item, index) => (
            <div key={index} className="space-y-3 border border-admin-input-border p-4">
              <Field
                label="Question"
                value={item.question}
                disabled={!canUpdate}
                onChange={(value) => updateFaq(index, { question: value })}
              />
              <TextArea
                label="Answer"
                value={item.answer}
                disabled={!canUpdate}
                onChange={(value) => updateFaq(index, { answer: value })}
                rows={4}
              />
              {canUpdate ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={content.faqs.length <= 1}
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      faqs: c.faqs.filter((_, i) => i !== index),
                    }))
                  }
                >
                  Remove FAQ
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        {canUpdate ? (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setContent((c) => ({
                ...c,
                faqs: [...c.faqs, { question: "", answer: "" }],
              }))
            }
          >
            Add FAQ
          </Button>
        ) : null}
      </Section>

      <Section title="Contact CTA">
        <Field
          id="cookie-contact-heading"
          label="Heading"
          value={content.contact_heading}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, contact_heading: value }))}
        />
        <TextArea
          id="cookie-contact-description"
          label="Description"
          value={content.contact_description}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, contact_description: value }))}
        />
        <Field
          id="cookie-contact-email"
          label="Email"
          value={content.contact_email}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, contact_email: value }))}
        />
      </Section>

      {canUpdate ? <SettingsSaveBar onSave={handleSave} saving={saving} /> : null}
    </div>
  );
}
