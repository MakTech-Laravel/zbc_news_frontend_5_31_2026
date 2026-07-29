import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { AboutValueIconField } from "@/components/about-us/AboutValueIconField";
import { CareersPerkIconField } from "@/components/admin/careers/CareersPerkIconField";
import { NewsletterHtmlEditor } from "@/components/admin/newsletters/NewsletterHtmlEditor";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { SettingsSaveBar } from "@/components/admin/settings/SettingsSaveBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/usePermission";
import {
  fetchAdminAboutUs,
  updateAdminAboutUs,
  type AboutUsContent,
} from "@/services/admin/aboutUs";
import { PERMISSIONS } from "@/types/permissions";

function emptyContent(): AboutUsContent {
  return {
    hero_title: "",
    hero_subtitle: "",
    intro_html: "",
    values: [],
    leadership_subtitle: "",
    leaders: [],
    journey: [],
  };
}

export default function AdminAboutUs() {
  const { can, isSuperAdmin } = usePermission();
  const canShow = isSuperAdmin || can(PERMISSIONS.ABOUT_US.SHOW);
  const canUpdate = isSuperAdmin || can(PERMISSIONS.ABOUT_US.UPDATE);

  const [content, setContent] = useState<AboutUsContent>(emptyContent());
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
        setContent(await fetchAdminAboutUs());
      } catch {
        toast.error("Failed to load About Us content.");
      } finally {
        setLoading(false);
      }
    })();
  }, [canShow]);

  async function handleSave() {
    if (!canUpdate) return;
    setSaving(true);
    try {
      const {
        hero_title,
        hero_subtitle,
        intro_html,
        values,
        leadership_subtitle,
        leaders,
        journey,
      } = content;
      setContent(
        await updateAdminAboutUs({
          hero_title,
          hero_subtitle,
          intro_html,
          values,
          leadership_subtitle,
          leaders,
          journey,
        }),
      );
      toast.success("About Us saved.");
    } catch {
      toast.error("Failed to save About Us.");
    } finally {
      setSaving(false);
    }
  }

  if (!canShow) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="About Us" description="You do not have permission to view this page." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="About Us" description="Loading…" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <AdminPageHeader
        title="About Us"
        description="Edit hero, intro, core values, leadership, and journey. Section headings stay fixed on the public page."
      />

      <section className="space-y-4 rounded-lg border border-admin-input-border bg-admin-surface p-4 sm:p-6">
        <h2 className="text-base font-bold text-admin-heading">Hero</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="about-hero-title"
            label="Title"
            value={content.hero_title}
            disabled={!canUpdate}
            onChange={(value) => setContent((c) => ({ ...c, hero_title: value }))}
          />
          <Field
            id="about-hero-subtitle"
            label="Subtitle"
            value={content.hero_subtitle}
            disabled={!canUpdate}
            onChange={(value) => setContent((c) => ({ ...c, hero_subtitle: value }))}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-admin-heading">Intro</h2>
        <div className={canUpdate ? undefined : "pointer-events-none opacity-70"}>
          <NewsletterHtmlEditor
            value={content.intro_html}
            onChange={(value) => setContent((c) => ({ ...c, intro_html: value }))}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-admin-input-border bg-admin-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-admin-heading">Our Core Values</h2>
          {canUpdate && content.values.length < 12 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() =>
                setContent((c) => ({
                  ...c,
                  values: [...c.values, { icon: "ShieldCheck", title: "", description: "" }],
                }))
              }
            >
              <Plus className="size-4" />
              Add value
            </Button>
          ) : null}
        </div>

        <div className="space-y-4">
          {content.values.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-md border border-admin-input-border p-4 md:grid-cols-[auto_1fr_auto]"
            >
              <AboutValueIconField
                value={item.icon}
                disabled={!canUpdate}
                onChange={(icon) =>
                  setContent((c) => {
                    const values = [...c.values];
                    values[index] = { ...values[index], icon };
                    return { ...c, values };
                  })
                }
              />

              <div className="space-y-3">
                <Field
                  label="Title"
                  value={item.title}
                  disabled={!canUpdate}
                  onChange={(value) =>
                    setContent((c) => {
                      const values = [...c.values];
                      values[index] = { ...values[index], title: value };
                      return { ...c, values };
                    })
                  }
                />
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-admin-label">Description</span>
                  <textarea
                    value={item.description}
                    disabled={!canUpdate}
                    rows={3}
                    onChange={(e) =>
                      setContent((c) => {
                        const values = [...c.values];
                        values[index] = { ...values[index], description: e.target.value };
                        return { ...c, values };
                      })
                    }
                    className="w-full rounded-md border border-admin-input-border bg-transparent px-3 py-2 text-sm text-admin-heading outline-none focus:border-zbc-blue"
                  />
                </label>
              </div>

              {canUpdate ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 self-start"
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      values: c.values.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-admin-input-border bg-admin-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-admin-heading">Our Leadership</h2>
          {canUpdate && content.leaders.length < 24 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() =>
                setContent((c) => ({
                  ...c,
                  leaders: [...c.leaders, { name: "", role: "", bio: "", initials: "", photo: "" }],
                }))
              }
            >
              <Plus className="size-4" />
              Add leader
            </Button>
          ) : null}
        </div>

        <Field
          label="Section subtitle"
          value={content.leadership_subtitle}
          disabled={!canUpdate}
          onChange={(value) => setContent((c) => ({ ...c, leadership_subtitle: value }))}
        />

        <div className="space-y-4">
          {content.leaders.map((leader, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-md border border-admin-input-border p-4 md:grid-cols-[auto_1fr_1fr]"
            >
              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-admin-label">Photo</span>
                <CareersPerkIconField
                  value={leader.photo || null}
                  disabled={!canUpdate}
                  alt={`${leader.name || "Leader"} photo`}
                  onChange={(url) =>
                    setContent((c) => {
                      const leaders = [...c.leaders];
                      leaders[index] = { ...leaders[index], photo: url || "" };
                      return { ...c, leaders };
                    })
                  }
                />
              </div>

              <Field
                label="Name"
                value={leader.name}
                disabled={!canUpdate}
                onChange={(value) =>
                  setContent((c) => {
                    const leaders = [...c.leaders];
                    leaders[index] = { ...leaders[index], name: value };
                    return { ...c, leaders };
                  })
                }
              />
              <Field
                label="Role"
                value={leader.role}
                disabled={!canUpdate}
                onChange={(value) =>
                  setContent((c) => {
                    const leaders = [...c.leaders];
                    leaders[index] = { ...leaders[index], role: value };
                    return { ...c, leaders };
                  })
                }
              />
              <Field
                label="Initials"
                value={leader.initials}
                disabled={!canUpdate}
                onChange={(value) =>
                  setContent((c) => {
                    const leaders = [...c.leaders];
                    leaders[index] = { ...leaders[index], initials: value };
                    return { ...c, leaders };
                  })
                }
              />
              <label className="block space-y-1.5 md:col-span-2">
                <span className="text-xs font-medium text-admin-label">Bio</span>
                <textarea
                  value={leader.bio}
                  disabled={!canUpdate}
                  rows={2}
                  onChange={(e) =>
                    setContent((c) => {
                      const leaders = [...c.leaders];
                      leaders[index] = { ...leaders[index], bio: e.target.value };
                      return { ...c, leaders };
                    })
                  }
                  className="w-full rounded-md border border-admin-input-border bg-transparent px-3 py-2 text-sm text-admin-heading outline-none focus:border-zbc-blue"
                />
              </label>
              {canUpdate ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 md:col-span-3 md:w-fit"
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      leaders: c.leaders.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-admin-input-border bg-admin-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-admin-heading">Our Journey</h2>
          {canUpdate && content.journey.length < 30 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() =>
                setContent((c) => ({
                  ...c,
                  journey: [...c.journey, { year: "", short_year: "", description: "" }],
                }))
              }
            >
              <Plus className="size-4" />
              Add milestone
            </Button>
          ) : null}
        </div>

        <div className="space-y-4">
          {content.journey.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-md border border-admin-input-border p-4 md:grid-cols-[1fr_1fr_2fr_auto]"
            >
              <Field
                label="Year"
                value={item.year}
                disabled={!canUpdate}
                onChange={(value) =>
                  setContent((c) => {
                    const journey = [...c.journey];
                    journey[index] = { ...journey[index], year: value };
                    return { ...c, journey };
                  })
                }
              />
              <Field
                label="Short year"
                value={item.short_year}
                disabled={!canUpdate}
                onChange={(value) =>
                  setContent((c) => {
                    const journey = [...c.journey];
                    journey[index] = { ...journey[index], short_year: value };
                    return { ...c, journey };
                  })
                }
              />
              <Field
                label="Description"
                value={item.description}
                disabled={!canUpdate}
                onChange={(value) =>
                  setContent((c) => {
                    const journey = [...c.journey];
                    journey[index] = { ...journey[index], description: value };
                    return { ...c, journey };
                  })
                }
              />
              {canUpdate ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 self-end"
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      journey: c.journey.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {canUpdate ? <SettingsSaveBar onSave={handleSave} saving={saving} /> : null}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id?: string;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-admin-label">{label}</span>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-10"
      />
    </label>
  );
}
