import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import { SeoPageEditForm } from "@/components/admin/settings/SeoPageEditForm";
import { SettingsPageShell } from "@/components/admin/settings/SettingsPageShell";
import { SettingsSaveBar } from "@/components/admin/settings/SettingsSaveBar";
import { useSeoPageEditor } from "@/components/admin/settings/useSeoPageEditor";

export default function AdminSettingsSeoEdit() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const editor = useSeoPageEditor(pageId);

  if (!pageId || !editor.page) {
    return <Navigate to="/admin/settings?tab=seo" replace />;
  }

  const handleSave = () => {
    editor.save();
    navigate("/admin/settings?tab=seo");
  };

  return (
    <SettingsPageShell
      activeTab="seo"
      onTabChange={(tab) => {
        if (tab === "seo") {
          navigate("/admin/settings?tab=seo");
          return;
        }
        navigate(`/admin/settings?tab=${tab}`);
      }}
    >
      <Link
        to="/admin/settings?tab=seo"
        className="inline-flex items-center gap-2 text-sm font-medium text-admin-label transition-colors hover:text-admin-heading"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to public pages
      </Link>

      <SeoPageEditForm
        page={editor.page}
        metaTitle={editor.metaTitle}
        metaDescription={editor.metaDescription}
        metaKeywords={editor.metaKeywords}
        onMetaTitleChange={editor.setMetaTitle}
        onMetaDescriptionChange={editor.setMetaDescription}
        onMetaKeywordsChange={editor.setMetaKeywords}
      />

      <SettingsSaveBar onSave={handleSave} />
    </SettingsPageShell>
  );
}
