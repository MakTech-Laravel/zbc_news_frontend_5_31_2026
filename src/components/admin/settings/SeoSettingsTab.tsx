import { SeoPublicPagesList } from "@/components/admin/settings/SeoPublicPagesList";
import { SitemapToolsCard } from "@/components/admin/settings/SitemapToolsCard";

export function SeoSettingsTab() {
  return (
    <div className="space-y-6">
      <SeoPublicPagesList />
      <SitemapToolsCard />
    </div>
  );
}
