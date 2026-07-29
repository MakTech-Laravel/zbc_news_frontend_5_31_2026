import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { NewsletterHtmlEditor } from "@/components/admin/newsletters/NewsletterHtmlEditor";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { SettingsSaveBar } from "@/components/admin/settings/SettingsSaveBar";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/usePermission";
import {
  fetchAdminPrivacyPolicy,
  updateAdminPrivacyPolicy,
  type PrivacyPolicyContent,
} from "@/services/admin/privacyPolicy";
import { PERMISSIONS } from "@/types/permissions";

const RICH_SECTIONS: {
  key: keyof Omit<PrivacyPolicyContent, "id" | "hero_meta" | "updated_at">;
  label: string;
}[] = [
  { key: "plain_summary", label: "Plain-English Summary" },
  { key: "overview", label: "Overview" },
  { key: "data_we_collect", label: "Data We Collect" },
  { key: "how_we_use", label: "How We Use Your Data" },
  { key: "your_rights", label: "Your Rights" },
  { key: "data_security", label: "Data Security" },
  { key: "third_parties", label: "Third-Party Services" },
  { key: "contact", label: "Contact Our Privacy Team" },
];

function emptyContent(): PrivacyPolicyContent {
  return {
    hero_meta: "",
    plain_summary: "",
    overview: "",
    data_we_collect: "",
    how_we_use: "",
    your_rights: "",
    data_security: "",
    third_parties: "",
    contact: "",
  };
}

export default function AdminPrivacyPolicy() {
  const { can, isSuperAdmin } = usePermission();
  const canShow = isSuperAdmin || can(PERMISSIONS.PRIVACY_POLICY.SHOW);
  const canUpdate = isSuperAdmin || can(PERMISSIONS.PRIVACY_POLICY.UPDATE);

  const [content, setContent] = useState<PrivacyPolicyContent>(emptyContent());
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
        setContent(await fetchAdminPrivacyPolicy());
      } catch {
        toast.error("Failed to load privacy policy content.");
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
        hero_meta,
        plain_summary,
        overview,
        data_we_collect,
        how_we_use,
        your_rights,
        data_security,
        third_parties,
        contact,
      } = content;
      setContent(
        await updateAdminPrivacyPolicy({
          hero_meta,
          plain_summary,
          overview,
          data_we_collect,
          how_we_use,
          your_rights,
          data_security,
          third_parties,
          contact,
        }),
      );
      toast.success("Privacy policy saved.");
    } catch {
      toast.error("Failed to save privacy policy.");
    } finally {
      setSaving(false);
    }
  }

  if (!canShow) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Privacy Policy" description="You do not have permission to view this page." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Privacy Policy" description="Loading…" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <AdminPageHeader
        title="Privacy Policy"
        description="Section titles are fixed. Edit the hero meta line and the body content under each title."
      />

      <section className="space-y-3">
        <label className="block text-sm font-semibold text-admin-heading" htmlFor="privacy-hero-meta">
          Hero meta line
        </label>
        <Input
          id="privacy-hero-meta"
          value={content.hero_meta}
          disabled={!canUpdate}
          onChange={(e) => setContent((c) => ({ ...c, hero_meta: e.target.value }))}
          placeholder="Last updated: June 1, 2026 · Version 4.1 · Effective: June 1, 2026"
          className="h-11"
        />
      </section>

      {RICH_SECTIONS.map((section) => (
        <section key={section.key} className="space-y-3">
          <h2 className="text-base font-bold text-admin-heading">{section.label}</h2>
          <div className={canUpdate ? undefined : "pointer-events-none opacity-70"}>
            <NewsletterHtmlEditor
              value={content[section.key] ?? ""}
              onChange={(value) => setContent((c) => ({ ...c, [section.key]: value }))}
            />
          </div>
        </section>
      ))}

      {canUpdate ? <SettingsSaveBar onSave={handleSave} saving={saving} /> : null}
    </div>
  );
}
