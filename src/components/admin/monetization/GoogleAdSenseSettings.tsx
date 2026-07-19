import * as React from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { request } from "@/api/request";
import { fetchAdminSiteSettings } from "@/services/admin/siteSettings";

export function GoogleAdSenseSettings() {
  const queryClient = useQueryClient();
  const [clientId, setClientId] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { settings } = await fetchAdminSiteSettings();
      setClientId(settings.googleAdsenseClient);
    } catch {
      setError("Failed to load Google AdSense settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    const trimmed = clientId.trim();
    if (trimmed && !trimmed.startsWith("ca-pub-")) {
      setError('Publisher ID should look like "ca-pub-xxxxxxxxxxxxxxxx".');
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const formData = new FormData();
      formData.append("google_adsense_client", trimmed);

      await request.post("/admin/site-settings/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await queryClient.invalidateQueries({ queryKey: ["public-site-settings"] });
      setSaved(true);
    } catch {
      setError("Failed to save Publisher ID.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPanel>
        <div className="flex items-center gap-2 text-sm text-admin-label">
          <Loader2 className="size-4 animate-spin" />
          Loading Google AdSense…
        </div>
      </AdminPanel>
    );
  }

  return (
    <AdminPanel>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-admin-heading">Google AdSense (common)</h2>
          <p className="mt-1 text-sm text-admin-label">
            Publisher ID is shared by <strong>all</strong> Google ads on the site. Ad unit IDs are
            set individually per placement below.
          </p>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {saved ? (
          <p className="text-sm text-emerald-600">Publisher ID saved.</p>
        ) : null}

        <label className="block max-w-xl space-y-1.5">
          <span className="text-sm font-medium text-admin-heading">Publisher ID (ca-pub-…)</span>
          <input
            type="text"
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setSaved(false);
            }}
            placeholder="ca-pub-xxxxxxxxxxxxxxxx"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </label>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="rounded-md bg-zbc-blue px-4 py-2 text-sm font-medium text-white hover:bg-zbc-blue/90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Publisher ID"}
          </button>
        </div>
      </div>
    </AdminPanel>
  );
}
