import * as React from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import {
  createAdminNavigationLink,
  deleteAdminNavigationLink,
  fetchAdminNavigationLinks,
  updateAdminNavigationLink,
  type AdminNavigationLink,
} from "@/services/admin/monetization";

type LinkDraft = AdminNavigationLink;

const EMPTY_LINK = {
  label: "",
  url: "/",
  icon: "TrendingUp",
  sort_order: 1,
  is_active: true,
  location: "home_quick_links",
};

export function HomeQuickLinksManager() {
  const [links, setLinks] = React.useState<LinkDraft[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<number | "new" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [newLink, setNewLink] = React.useState({ ...EMPTY_LINK });

  const loadLinks = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminNavigationLinks("home_quick_links");
      setLinks(data);
    } catch {
      setError("Failed to load quick links.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadLinks();
  }, [loadLinks]);

  const updateLink = (id: number, patch: Partial<LinkDraft>) => {
    setLinks((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const handleAdd = async () => {
    if (!newLink.label.trim()) return;
    setSavingId("new");
    setError(null);
    try {
      await createAdminNavigationLink({
        ...newLink,
        sort_order: links.length + 1,
      });
      setNewLink({ ...EMPTY_LINK, sort_order: links.length + 2 });
      await loadLinks();
    } catch {
      setError("Failed to add link.");
    } finally {
      setSavingId(null);
    }
  };

  const handleSave = async (link: LinkDraft) => {
    setSavingId(link.id);
    setError(null);
    try {
      await updateAdminNavigationLink(link.id, {
        label: link.label,
        url: link.url,
        icon: link.icon,
        sort_order: link.sort_order,
        is_active: link.is_active,
      });
      await loadLinks();
    } catch {
      setError(`Failed to save "${link.label}".`);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setSavingId(id);
    setError(null);
    try {
      await deleteAdminNavigationLink(id);
      await loadLinks();
    } catch {
      setError("Failed to delete link.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <AdminPanel>
        <div className="flex items-center gap-2 text-sm text-admin-label">
          <Loader2 className="size-4 animate-spin" />
          Loading quick links…
        </div>
      </AdminPanel>
    );
  }

  return (
    <AdminPanel padding="none" className="overflow-hidden">
      <div className="border-b border-border px-6 pb-4 pt-6">
        <h2 className="text-lg font-semibold text-admin-heading">Homepage Quick Links</h2>
        <p className="mt-1 text-sm text-admin-label">
          These are the links shown in the Trending/Most Read row on the homepage.
        </p>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4">
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-xs font-medium text-admin-label">Label</label>
            <input
              type="text"
              value={newLink.label}
              onChange={(e) => setNewLink((p) => ({ ...p, label: e.target.value }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Trending"
            />
          </div>
          <div className="min-w-[120px] flex-1">
            <label className="mb-1 block text-xs font-medium text-admin-label">Path</label>
            <input
              type="text"
              value={newLink.url}
              onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="/"
            />
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-xs font-medium text-admin-label">Icon</label>
            <input
              type="text"
              value={newLink.icon ?? ""}
              onChange={(e) => setNewLink((p) => ({ ...p, icon: e.target.value }))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="TrendingUp"
            />
          </div>
          <button
            type="button"
            disabled={savingId === "new"}
            onClick={() => void handleAdd()}
            className="inline-flex items-center gap-2 rounded-md bg-zbc-blue px-4 py-2 text-sm font-medium text-white hover:bg-zbc-blue/90 disabled:opacity-60"
          >
            <Plus className="size-4" />
            Add Link
          </button>
        </div>

        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-4"
            >
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(link.id, { label: e.target.value })}
                className="min-w-[120px] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                className="min-w-[100px] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={link.icon ?? ""}
                onChange={(e) => updateLink(link.id, { icon: e.target.value })}
                className="min-w-[120px] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                min={1}
                value={link.sort_order}
                onChange={(e) =>
                  updateLink(link.id, { sort_order: Number(e.target.value) || 1 })
                }
                className="w-16 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={savingId === link.id}
                onClick={() => void handleSave(link)}
                className="rounded-md bg-zbc-blue px-4 py-2 text-sm font-medium text-white hover:bg-zbc-blue/90 disabled:opacity-60"
              >
                {savingId === link.id ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                disabled={savingId === link.id}
                onClick={() => void handleDelete(link.id)}
                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm text-admin-label hover:bg-muted disabled:opacity-60"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminPanel>
  );
}
