import { AdminFormField } from "@/components/admin/forms/AdminFormField";
import { SettingsCheckbox } from "@/components/admin/settings/SettingsCheckbox";
import { settingsInputClassName } from "@/components/admin/settings/settingsFormStyles";
import type { UseAdminSettingsReturn } from "@/components/admin/settings/useAdminSettings";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";

type ReadingSettingsTabProps = {
  settings: UseAdminSettingsReturn;
};

export function ReadingSettingsTab({ settings }: ReadingSettingsTabProps) {
  const { form, setField } = settings;

  return (
    <AdminPanel className="space-y-6">
      <AdminFormField label="Posts per page" htmlFor="posts-per-page">
        <input
          id="posts-per-page"
          type="number"
          min={1}
          value={form.postsPerPage}
          onChange={(e) => setField("postsPerPage", e.target.value)}
          className={settingsInputClassName}
        />
      </AdminFormField>

      <AdminFormField label="Comment Settings">
        <div className="flex flex-col gap-3">
          <SettingsCheckbox
            id="allow-comments"
            label="Allow comments on articles"
            checked={form.allowComments}
            onCheckedChange={(v) => setField("allowComments", v)}
          />
          <SettingsCheckbox
            id="require-registration-comment"
            label="Require user registration to comment"
            checked={form.requireRegistrationToComment}
            onCheckedChange={(v) => setField("requireRegistrationToComment", v)}
          />
          {/* <SettingsCheckbox
            id="auto-approve-comments"
            label="Auto-approve comments from known users"
            checked={form.autoApproveKnownUsers}
            onCheckedChange={(v) => setField("autoApproveKnownUsers", v)}
          /> */}
        </div>
      </AdminFormField>

      <AdminFormField label="Related Articles Count" htmlFor="related-articles">
        <input
          id="related-articles"
          type="number"
          min={0}
          value={form.relatedArticlesCount}
          onChange={(e) => setField("relatedArticlesCount", e.target.value)}
          className={settingsInputClassName}
        />
      </AdminFormField>
    </AdminPanel>
  );
}
