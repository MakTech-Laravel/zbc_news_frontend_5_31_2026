import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { NewsletterHtmlEditor } from "@/components/admin/newsletters/NewsletterHtmlEditor";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { SettingsSaveBar } from "@/components/admin/settings/SettingsSaveBar";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/hooks/usePermission";
import {
  fetchAdminTermsOfService,
  updateAdminTermsOfService,
  type TermsOfServiceContent,
} from "@/services/admin/termsOfService";
import { PERMISSIONS } from "@/types/permissions";

const RICH_SECTIONS: {
  key: keyof Omit<TermsOfServiceContent, "id" | "hero_meta" | "updated_at">;
  label: string;
}[] = [
  { key: "quick_summary", label: "Quick Summary" },
  { key: "account_terms", label: "Account Terms" },
  { key: "content_ip", label: "Content & Intellectual Property" },
  { key: "subscriptions", label: "Subscriptions & Payment" },
  { key: "prohibited", label: "Prohibited Conduct" },
  { key: "disputes", label: "Disputes & Legal" },
  { key: "contact", label: "Contact Legal" },
];

function emptyContent(): TermsOfServiceContent {
  return {
    hero_meta: "",
    quick_summary: "",
    account_terms: "",
    content_ip: "",
    subscriptions: "",
    prohibited: "",
    disputes: "",
    contact: "",
  };
}

export default function AdminTermsOfService() {
  const { can, isSuperAdmin } = usePermission();
  const canShow = isSuperAdmin || can(PERMISSIONS.TERMS_OF_SERVICE.SHOW);
  const canUpdate = isSuperAdmin || can(PERMISSIONS.TERMS_OF_SERVICE.UPDATE);

  const [content, setContent] = useState<TermsOfServiceContent>(emptyContent());
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
        setContent(await fetchAdminTermsOfService());
      } catch {
        toast.error("Failed to load terms of service content.");
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
        quick_summary,
        account_terms,
        content_ip,
        subscriptions,
        prohibited,
        disputes,
        contact,
      } = content;
      setContent(
        await updateAdminTermsOfService({
          hero_meta,
          quick_summary,
          account_terms,
          content_ip,
          subscriptions,
          prohibited,
          disputes,
          contact,
        }),
      );
      toast.success("Terms of service saved.");
    } catch {
      toast.error("Failed to save terms of service.");
    } finally {
      setSaving(false);
    }
  }

  if (!canShow) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Terms of Service" description="You do not have permission to view this page." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Terms of Service" description="Loading…" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <AdminPageHeader
        title="Terms of Service"
        description="Section titles are fixed. Edit the hero meta line and the body content under each title."
      />

      <section className="space-y-3">
        <label className="block text-sm font-semibold text-admin-heading" htmlFor="terms-hero-meta">
          Hero meta line
        </label>
        <Input
          id="terms-hero-meta"
          value={content.hero_meta}
          disabled={!canUpdate}
          onChange={(e) => setContent((c) => ({ ...c, hero_meta: e.target.value }))}
          placeholder="Last updated: June 1, 2026 · Effective: June 1, 2026"
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
