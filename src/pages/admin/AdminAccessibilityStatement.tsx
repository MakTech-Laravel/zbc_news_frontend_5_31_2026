import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  ACCESSIBILITY_FEATURE_ICON_OPTIONS,
  resolveAccessibilityFeatureIcon,
} from "@/components/accessibility-statement/accessibilityFeatureIcons";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { SettingsSaveBar } from "@/components/admin/settings/SettingsSaveBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/usePermission";
import {
  fetchAdminAccessibilityStatement,
  updateAdminAccessibilityStatement,
  type AccessibilityStatementContent,
} from "@/services/admin/accessibilityStatement";
import { PERMISSIONS } from "@/types/permissions";

function emptyContent(): AccessibilityStatementContent {
  return {
    hero_eyebrow: "",
    hero_title: "",
    hero_intro: "",
    badges: [],
    commitment_heading: "",
    commitment_paragraphs: [""],
    commitment_stats: [],
    features_heading: "",
    features: [],
    shortcuts_heading: "",
    keyboard_shortcuts: [],
    technologies_heading: "",
    supported_technologies: [],
    known_limitations: "",
    report_heading: "",
    report_intro: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    cta_text: "",
    cta_button_label: "",
  };
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

export default function AdminAccessibilityStatement() {
  const { can, isSuperAdmin } = usePermission();
  const canShow = isSuperAdmin || can(PERMISSIONS.ACCESSIBILITY_STATEMENT.SHOW);
  const canUpdate = isSuperAdmin || can(PERMISSIONS.ACCESSIBILITY_STATEMENT.UPDATE);

  const [content, setContent] = useState<AccessibilityStatementContent>(emptyContent());
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
        setContent(await fetchAdminAccessibilityStatement());
      } catch {
        toast.error("Failed to load accessibility statement content.");
      } finally {
        setLoading(false);
      }
    })();
  }, [canShow]);

  async function handleSave() {
    if (!canUpdate) return;
    setSaving(true);
    try {
      const { id: _id, updated_at: _updatedAt, ...payload } = content;
      setContent(await updateAdminAccessibilityStatement(payload));
      toast.success("Accessibility statement saved.");
    } catch {
      toast.error("Failed to save accessibility statement.");
    } finally {
      setSaving(false);
    }
  }

  if (!canShow) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Accessibility Statement"
          description="You do not have permission to view this page."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Accessibility Statement" description="Loading…" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <AdminPageHeader
        title="Accessibility Statement"
        description="Edit each section of the public accessibility page. SEO meta is managed under Settings → Public SEO pages."
      />

      <div className="rounded-lg border border-admin-input-border bg-zbc-blue-light/40 px-4 py-3 text-sm text-admin-heading">
        Page SEO (title, description, OG image) is edited in{" "}
        <Link to="/admin/settings/seo/accessibility-statement" className="font-semibold text-zbc-blue underline">
          Settings → SEO → Accessibility Statement
        </Link>
        .
      </div>

      <Section title="Hero">
        <Field
          id="a11y-hero-eyebrow"
          label="Eyebrow"
          value={content.hero_eyebrow}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, hero_eyebrow: value }))}
        />
        <Field
          id="a11y-hero-title"
          label="Title"
          value={content.hero_title}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, hero_title: value }))}
        />
        <TextArea
          id="a11y-hero-intro"
          label="Intro"
          value={content.hero_intro}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, hero_intro: value }))}
          rows={4}
        />
      </Section>

      <Section title="Badges">
        <div className="space-y-3">
          {content.badges.map((badge, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
              <Input
                value={badge.label}
                disabled={!canUpdate}
                placeholder="Badge label"
                onChange={(e) =>
                  setContent((c) => {
                    const badges = [...c.badges];
                    badges[index] = { ...badge, label: e.target.value };
                    return { ...c, badges };
                  })
                }
              />
              <select
                value={badge.variant}
                disabled={!canUpdate}
                className="h-11 rounded-md border border-admin-input-border bg-white px-3 text-sm"
                onChange={(e) =>
                  setContent((c) => {
                    const badges = [...c.badges];
                    badges[index] = {
                      ...badge,
                      variant: e.target.value === "success" ? "success" : "info",
                    };
                    return { ...c, badges };
                  })
                }
              >
                <option value="success">Success</option>
                <option value="info">Info</option>
              </select>
              {canUpdate ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      badges: c.badges.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
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
                badges: [...c.badges, { label: "", variant: "info" }],
              }))
            }
          >
            <Plus className="size-4" /> Add badge
          </Button>
        ) : null}
      </Section>

      <Section title="Commitment">
        <Field
          id="a11y-commitment-heading"
          label="Heading"
          value={content.commitment_heading}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, commitment_heading: value }))}
        />
        <div className="space-y-3">
          {content.commitment_paragraphs.map((paragraph, index) => (
            <div key={index} className="space-y-2">
              <TextArea
                label={`Paragraph ${index + 1}`}
                value={paragraph}
                disabled={!canUpdate}
                onChange={(value) =>
                  setContent((c) => {
                    const commitment_paragraphs = [...c.commitment_paragraphs];
                    commitment_paragraphs[index] = value;
                    return { ...c, commitment_paragraphs };
                  })
                }
              />
              {canUpdate && content.commitment_paragraphs.length > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      commitment_paragraphs: c.commitment_paragraphs.filter((_, i) => i !== index),
                    }))
                  }
                >
                  Remove paragraph
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
                commitment_paragraphs: [...c.commitment_paragraphs, ""],
              }))
            }
          >
            <Plus className="size-4" /> Add paragraph
          </Button>
        ) : null}
      </Section>

      <Section title="Commitment stats">
        <div className="space-y-3">
          {content.commitment_stats.map((stat, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Input
                value={stat.value}
                disabled={!canUpdate}
                placeholder="Value"
                onChange={(e) =>
                  setContent((c) => {
                    const commitment_stats = [...c.commitment_stats];
                    commitment_stats[index] = { ...stat, value: e.target.value };
                    return { ...c, commitment_stats };
                  })
                }
              />
              <Input
                value={stat.label}
                disabled={!canUpdate}
                placeholder="Label"
                onChange={(e) =>
                  setContent((c) => {
                    const commitment_stats = [...c.commitment_stats];
                    commitment_stats[index] = { ...stat, label: e.target.value };
                    return { ...c, commitment_stats };
                  })
                }
              />
              {canUpdate ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      commitment_stats: c.commitment_stats.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
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
                commitment_stats: [...c.commitment_stats, { value: "", label: "" }],
              }))
            }
          >
            <Plus className="size-4" /> Add stat
          </Button>
        ) : null}
      </Section>

      <Section title="Features">
        <Field
          id="a11y-features-heading"
          label="Section heading"
          value={content.features_heading}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, features_heading: value }))}
        />
        <div className="space-y-4">
          {content.features.map((feature, index) => {
            const Icon = resolveAccessibilityFeatureIcon(feature.icon);
            return (
              <div key={index} className="space-y-3 border border-admin-input-border p-4">
                <div className="flex items-center gap-2 text-admin-heading">
                  <Icon className="size-4" />
                  <span className="text-sm font-bold">{feature.title || `Feature ${index + 1}`}</span>
                </div>
                <Field
                  label="Title"
                  value={feature.title}
                  disabled={!canUpdate}
                  onChange={(value) =>
                    setContent((c) => {
                      const features = [...c.features];
                      features[index] = { ...feature, title: value };
                      return { ...c, features };
                    })
                  }
                />
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-admin-heading">Icon</label>
                  <select
                    value={feature.icon}
                    disabled={!canUpdate}
                    className="h-11 w-full rounded-md border border-admin-input-border bg-white px-3 text-sm"
                    onChange={(e) =>
                      setContent((c) => {
                        const features = [...c.features];
                        features[index] = { ...feature, icon: e.target.value };
                        return { ...c, features };
                      })
                    }
                  >
                    {ACCESSIBILITY_FEATURE_ICON_OPTIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <TextArea
                  label="Items (one per line)"
                  value={feature.items.join("\n")}
                  disabled={!canUpdate}
                  rows={5}
                  onChange={(value) =>
                    setContent((c) => {
                      const features = [...c.features];
                      features[index] = {
                        ...feature,
                        items: value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      };
                      return { ...c, features };
                    })
                  }
                />
                {canUpdate ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setContent((c) => ({
                        ...c,
                        features: c.features.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    Remove feature
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
        {canUpdate ? (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setContent((c) => ({
                ...c,
                features: [...c.features, { title: "", icon: "Eye", items: [] }],
              }))
            }
          >
            <Plus className="size-4" /> Add feature
          </Button>
        ) : null}
      </Section>

      <Section title="Keyboard shortcuts">
        <Field
          id="a11y-shortcuts-heading"
          label="Section heading"
          value={content.shortcuts_heading}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, shortcuts_heading: value }))}
        />
        <div className="space-y-3">
          {content.keyboard_shortcuts.map((row, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
              <Input
                value={row.key}
                disabled={!canUpdate}
                placeholder="Key"
                onChange={(e) =>
                  setContent((c) => {
                    const keyboard_shortcuts = [...c.keyboard_shortcuts];
                    keyboard_shortcuts[index] = { ...row, key: e.target.value };
                    return { ...c, keyboard_shortcuts };
                  })
                }
              />
              <Input
                value={row.action}
                disabled={!canUpdate}
                placeholder="Action"
                onChange={(e) =>
                  setContent((c) => {
                    const keyboard_shortcuts = [...c.keyboard_shortcuts];
                    keyboard_shortcuts[index] = { ...row, action: e.target.value };
                    return { ...c, keyboard_shortcuts };
                  })
                }
              />
              {canUpdate ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      keyboard_shortcuts: c.keyboard_shortcuts.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
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
                keyboard_shortcuts: [...c.keyboard_shortcuts, { key: "", action: "" }],
              }))
            }
          >
            <Plus className="size-4" /> Add shortcut
          </Button>
        ) : null}
      </Section>

      <Section title="Supported technologies">
        <Field
          id="a11y-tech-heading"
          label="Section heading"
          value={content.technologies_heading}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, technologies_heading: value }))}
        />
        <div className="space-y-3">
          {content.supported_technologies.map((tech, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_140px_auto]">
              <Input
                value={tech.name}
                disabled={!canUpdate}
                placeholder="Name"
                onChange={(e) =>
                  setContent((c) => {
                    const supported_technologies = [...c.supported_technologies];
                    supported_technologies[index] = { ...tech, name: e.target.value };
                    return { ...c, supported_technologies };
                  })
                }
              />
              <Input
                value={tech.platform}
                disabled={!canUpdate}
                placeholder="Platform"
                onChange={(e) =>
                  setContent((c) => {
                    const supported_technologies = [...c.supported_technologies];
                    supported_technologies[index] = { ...tech, platform: e.target.value };
                    return { ...c, supported_technologies };
                  })
                }
              />
              <select
                value={tech.status}
                disabled={!canUpdate}
                className="h-11 rounded-md border border-admin-input-border bg-white px-3 text-sm"
                onChange={(e) =>
                  setContent((c) => {
                    const supported_technologies = [...c.supported_technologies];
                    supported_technologies[index] = {
                      ...tech,
                      status: e.target.value === "Partial" ? "Partial" : "Supported",
                    };
                    return { ...c, supported_technologies };
                  })
                }
              >
                <option value="Supported">Supported</option>
                <option value="Partial">Partial</option>
              </select>
              {canUpdate ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      supported_technologies: c.supported_technologies.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
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
                supported_technologies: [
                  ...c.supported_technologies,
                  { name: "", platform: "", status: "Supported" },
                ],
              }))
            }
          >
            <Plus className="size-4" /> Add technology
          </Button>
        ) : null}
      </Section>

      <Section title="Known limitations">
        <TextArea
          id="a11y-limitations"
          label="Limitations text"
          value={content.known_limitations}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, known_limitations: value }))}
          rows={4}
        />
      </Section>

      <Section title="Report section">
        <Field
          id="a11y-report-heading"
          label="Heading"
          value={content.report_heading}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, report_heading: value }))}
        />
        <TextArea
          id="a11y-report-intro"
          label="Intro"
          value={content.report_intro}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, report_intro: value }))}
        />
        <Field
          id="a11y-contact-email"
          label="Contact email"
          value={content.contact_email}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, contact_email: value }))}
        />
        <Field
          id="a11y-contact-phone"
          label="Contact phone"
          value={content.contact_phone}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, contact_phone: value }))}
        />
        <Field
          id="a11y-contact-address"
          label="Contact address"
          value={content.contact_address}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, contact_address: value }))}
        />
      </Section>

      <Section title="Bottom CTA">
        <Field
          id="a11y-cta-text"
          label="CTA text"
          value={content.cta_text}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, cta_text: value }))}
        />
        <Field
          id="a11y-cta-button"
          label="Button label"
          value={content.cta_button_label}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, cta_button_label: value }))}
        />
      </Section>

      {canUpdate ? <SettingsSaveBar onSave={handleSave} saving={saving} /> : null}
    </div>
  );
}
