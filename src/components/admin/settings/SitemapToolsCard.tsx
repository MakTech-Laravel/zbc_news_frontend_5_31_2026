import * as React from "react";
import toast from "react-hot-toast";
import { Download, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  downloadRobotsFile,
  downloadSitemapFile,
  refreshSitemapCache,
} from "@/services/admin/seoPages";

export function SitemapToolsCard() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [downloading, setDownloading] = React.useState<string | null>(null);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshSitemapCache();
      toast.success("Sitemap cache refreshed");
    } catch {
      toast.error("Failed to refresh sitemap cache");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDownload(
    key: string,
    run: () => Promise<void>,
  ) {
    setDownloading(key);
    try {
      await run();
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h2 className="text-xl font-medium text-[#121212]">Sitemap &amp; robots.txt</h2>
        <p className="mt-1 text-base text-[#2b2a2a]">
          Rebuild the cached sitemaps after publishing, or download the current files to
          inspect them.
        </p>
        <p className="mt-2 rounded-md bg-admin-surface/60 px-3 py-2 text-sm text-admin-trend-muted">
          These are for inspection and manual refresh only. Google Search Console is given
          the live URL (e.g. <code>https://zbc.news/sitemap.xml</code>) — you never upload a
          file anywhere. Downloading here does not submit anything to Google.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} aria-hidden />
          {refreshing ? "Refreshing…" : "Refresh sitemap cache now"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={downloading === "general"}
          onClick={() => handleDownload("general", () => downloadSitemapFile("general"))}
        >
          <Download className="size-4" aria-hidden />
          Download sitemap.xml
        </Button>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={downloading === "news"}
          onClick={() => handleDownload("news", () => downloadSitemapFile("news"))}
        >
          <Download className="size-4" aria-hidden />
          Download news-sitemap.xml
        </Button>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          disabled={downloading === "robots"}
          onClick={() => handleDownload("robots", () => downloadRobotsFile())}
        >
          <Download className="size-4" aria-hidden />
          Download robots.txt
        </Button>
      </div>
    </div>
  );
}
