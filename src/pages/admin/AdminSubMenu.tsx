import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Pin, Plus, Radio, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toApiDatetimeValue, toDatetimeLocalValue } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { searchAdminPanel } from "@/services/admin/search";
import {
  endSubMenuLiveCoverage,
  fetchAdminSubMenus,
  removeSubMenuManualEntry,
  reorderSubMenuManualEntries,
  startSubMenuLiveCoverage,
  updateSubMenuSettings,
  upsertSubMenuManualEntry,
  type MostReadPeriod,
  type SubMenuManualEntry,
  type SubMenuKey,
  type SubMenuSnapshot,
} from "@/services/admin/subMenu";

type TabId = SubMenuKey;

const TABS: { id: TabId; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "most_read", label: "Most Read" },
  { id: "live_updates", label: "Live Updates" },
  { id: "editorial_picks", label: "Editorial Picks" },
];

const PERIOD_OPTIONS: { value: MostReadPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "all", label: "All time" },
];

function formatWhen(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

export default function AdminSubMenu() {
  const [activeTab, setActiveTab] = useState<TabId>("trending");
  const [snapshots, setSnapshots] = useState<
    Partial<Record<SubMenuKey, SubMenuSnapshot>>
  >({});
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [busyId, setBusyId] = useState<number | "add" | "live" | null>(null);

  const [limit, setLimit] = useState("5");
  const [pinnedSlots, setPinnedSlots] = useState("3");
  const [windowHours, setWindowHours] = useState("24");
  const [defaultPeriod, setDefaultPeriod] = useState<MostReadPeriod>("today");
  const [isEnabled, setIsEnabled] = useState(true);

  const [articleQuery, setArticleQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; title: string; slug: string }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [addAsPinned, setAddAsPinned] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");

  const snapshot = snapshots[activeTab];
  const manual = snapshot?.manual ?? [];
  const preview = snapshot?.items ?? [];
  const algorithmic = snapshot?.algorithmic ?? [];
  const liveArticles = useMemo(
    () => algorithmic.filter((article) => article.is_live),
    [algorithmic],
  );

  const showScheduleFields = activeTab === "editorial_picks";
  const showLiveControls = activeTab === "live_updates";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSubMenus();
      setSnapshots(data);
    } catch {
      toast.error("Failed to load sub menu.");
      setSnapshots({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const settings = snapshots[activeTab]?.settings;
    if (!settings) return;
    setLimit(String(settings.limit));
    setPinnedSlots(String(settings.pinned_slots));
    setWindowHours(String(settings.trending_window_hours));
    setDefaultPeriod(settings.most_read_default_period);
    setIsEnabled(settings.is_enabled);
    setStartsAt("");
    setEndsAt("");
    setEditingScheduleId(null);
    setEditStartsAt("");
    setEditEndsAt("");
    setSelectedArticleId(null);
    setArticleQuery("");
    setSearchResults([]);
  }, [activeTab, snapshots]);

  useEffect(() => {
    const q = articleQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }

    // Keep the selected title in the input without reopening the result list.
    if (selectedArticleId != null) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSearching(true);
      void searchAdminPanel(q, 8)
        .then((results) => {
          setSearchResults(
            results.articles.map((article) => ({
              id: article.id,
              title: article.title,
              slug: article.slug,
            })),
          );
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [articleQuery, selectedArticleId]);

  const orderedManualIds = useMemo(() => manual.map((entry) => entry.id), [manual]);

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      await updateSubMenuSettings(activeTab, {
        limit: Number(limit) || 0,
        pinned_slots: Number(pinnedSlots) || 0,
        trending_window_hours: Number(windowHours) || 0,
        most_read_default_period: defaultPeriod,
        is_enabled: isEnabled,
      });
      toast.success("Settings saved.");
      await load();
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleAddManual() {
    if (!selectedArticleId) {
      toast.error("Select an article first.");
      return;
    }
    setBusyId("add");
    try {
      await upsertSubMenuManualEntry(activeTab, {
        article_id: selectedArticleId,
        is_pinned: addAsPinned,
        is_active: true,
        sort_order: manual.length,
        starts_at: startsAt.trim() ? toApiDatetimeValue(startsAt) : null,
        ends_at: endsAt.trim() ? toApiDatetimeValue(endsAt) : null,
      });
      toast.success("Article added to section.");
      setSelectedArticleId(null);
      setArticleQuery("");
      setSearchResults([]);
      setStartsAt("");
      setEndsAt("");
      await load();
    } catch {
      toast.error("Failed to add article.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleStartLive() {
    if (!selectedArticleId) {
      toast.error("Select an article first.");
      return;
    }
    setBusyId("live");
    try {
      await startSubMenuLiveCoverage(selectedArticleId);
      toast.success("Live coverage started.");
      setSelectedArticleId(null);
      setArticleQuery("");
      setSearchResults([]);
      await load();
    } catch {
      toast.error("Failed to start live coverage.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleEndLive(articleId: number) {
    setBusyId(articleId);
    try {
      await endSubMenuLiveCoverage(articleId);
      toast.success("Live coverage ended.");
      await load();
    } catch {
      toast.error("Failed to end live coverage.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleTogglePin(entry: SubMenuManualEntry) {
    setBusyId(entry.id);
    try {
      await upsertSubMenuManualEntry(activeTab, {
        article_id: entry.article_id,
        is_pinned: !entry.is_pinned,
        is_active: entry.is_active,
        sort_order: entry.sort_order,
        starts_at: entry.starts_at,
        ends_at: entry.ends_at,
      });
      await load();
    } catch {
      toast.error("Failed to update pin.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleActive(entry: SubMenuManualEntry) {
    setBusyId(entry.id);
    try {
      await upsertSubMenuManualEntry(activeTab, {
        article_id: entry.article_id,
        is_pinned: entry.is_pinned,
        is_active: !entry.is_active,
        sort_order: entry.sort_order,
        starts_at: entry.starts_at,
        ends_at: entry.ends_at,
      });
      await load();
    } catch {
      toast.error("Failed to update entry.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSaveSchedule(entry: SubMenuManualEntry) {
    setBusyId(entry.id);
    try {
      await upsertSubMenuManualEntry(activeTab, {
        article_id: entry.article_id,
        is_pinned: entry.is_pinned,
        is_active: entry.is_active,
        sort_order: entry.sort_order,
        starts_at: editStartsAt.trim() ? toApiDatetimeValue(editStartsAt) : null,
        ends_at: editEndsAt.trim() ? toApiDatetimeValue(editEndsAt) : null,
      });
      toast.success("Schedule updated.");
      setEditingScheduleId(null);
      await load();
    } catch {
      toast.error("Failed to update schedule.");
    } finally {
      setBusyId(null);
    }
  }

  function openScheduleEditor(entry: SubMenuManualEntry) {
    setEditingScheduleId(entry.id);
    setEditStartsAt(toDatetimeLocalValue(entry.starts_at));
    setEditEndsAt(toDatetimeLocalValue(entry.ends_at));
  }

  async function handleRemove(entry: SubMenuManualEntry) {
    if (!window.confirm(`Remove "${entry.article?.title ?? `Article #${entry.article_id}`}" from this section?`)) {
      return;
    }
    setBusyId(entry.id);
    try {
      await removeSubMenuManualEntry(entry.id);
      toast.success("Removed.");
      await load();
    } catch {
      toast.error("Failed to remove entry.");
    } finally {
      setBusyId(null);
    }
  }

  async function moveManual(entryId: number, direction: -1 | 1) {
    const index = orderedManualIds.indexOf(entryId);
    if (index < 0) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= orderedManualIds.length) return;

    const next = [...orderedManualIds];
    const [moved] = next.splice(index, 1);
    next.splice(nextIndex, 0, moved);

    setBusyId(entryId);
    try {
      await reorderSubMenuManualEntries(activeTab, next);
      await load();
    } catch {
      toast.error("Failed to reorder.");
    } finally {
      setBusyId(null);
    }
  }

  function articleSearchBlock(onSelectHint?: string) {
    return (
      <div className="space-y-3 rounded-md border border-border p-3">
        <Input
          placeholder="Search published articles..."
          value={articleQuery}
          onChange={(e) => {
            setArticleQuery(e.target.value);
            setSelectedArticleId(null);
          }}
        />
        {searching ? <p className="text-xs text-admin-label">Searching...</p> : null}
        {searchResults.length > 0 ? (
          <ul className="max-h-40 space-y-1 overflow-y-auto">
            {searchResults.map((article) => {
              const id = Number(article.id);
              const selected = selectedArticleId === id;
              return (
                <li key={article.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArticleId(id);
                      setArticleQuery(article.title ?? "");
                      setSearchResults([]);
                    }}
                    className={cn(
                      "w-full rounded-md px-2 py-1.5 text-left text-sm",
                      selected ? "bg-primary/10 text-primary" : "hover:bg-muted",
                    )}
                  >
                    {article.title}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        {onSelectHint ? (
          <p className="text-xs text-admin-label">{onSelectHint}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sub Menu"
        description="Configure Trending, Most Read, Live Updates, and Editorial Picks."
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const tabEnabled = snapshots[tab.id]?.settings.is_enabled ?? true;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-muted text-admin-label hover:text-admin-heading",
              )}
            >
              {tab.label}
              {!tabEnabled ? (
                <span
                  className={cn(
                    "ml-2 text-[10px] font-medium uppercase",
                    activeTab === tab.id ? "text-white/80" : "text-amber-700",
                  )}
                >
                  Off
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {!loading && !isEnabled ? (
        <AdminPanel className="border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">
            This section is currently <strong>hidden</strong> on the public site. Enable it and
            save settings to show the card again.
          </p>
        </AdminPanel>
      ) : null}

      {loading ? (
        <AdminPanel>
          <div className="flex items-center gap-2 text-sm text-admin-label">
            <Loader2 className="size-4 animate-spin" />
            Loading sub menu...
          </div>
        </AdminPanel>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <AdminPanel>
              <h2 className="mb-4 text-base font-bold text-admin-heading">Settings</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium text-admin-label">Enabled</span>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => setIsEnabled(e.target.checked)}
                      className="size-4"
                    />
                    <span className="text-admin-heading">
                      {isEnabled ? "Visible on site" : "Hidden on site"}
                    </span>
                  </div>
                </label>

                <label className="space-y-1.5 text-sm">
                  <span className="font-medium text-admin-label">Item limit</span>
                  <Input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                  />
                </label>

                {activeTab === "trending" ? (
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-admin-label">
                      Trending window (hours)
                    </span>
                    <Input
                      type="number"
                      value={windowHours}
                      onChange={(e) => setWindowHours(e.target.value)}
                    />
                  </label>
                ) : null}

                {activeTab === "most_read" ? (
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium text-admin-label">Default period</span>
                    <select
                      value={defaultPeriod}
                      onChange={(e) => setDefaultPeriod(e.target.value as MostReadPeriod)}
                      className="flex h-9 w-full rounded-md border border-zbc-gray-200/50 bg-zbc-gray-200/50 px-3 text-sm"
                    >
                      {PERIOD_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <label className="space-y-1.5 text-sm">
                  <span className="font-medium text-admin-label">Pinned slots</span>
                  <Input
                    type="number"
                    value={pinnedSlots}
                    onChange={(e) => setPinnedSlots(e.target.value)}
                  />
                </label>
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => void handleSaveSettings()}
                  disabled={savingSettings}
                >
                  {savingSettings ? "Saving..." : "Save settings"}
                </Button>
              </div>
            </AdminPanel>

            {showLiveControls ? (
              <AdminPanel>
                <h2 className="mb-1 text-base font-bold text-admin-heading">Live coverage</h2>
                <p className="mb-4 text-sm text-admin-label">
                  Start live on a published article. Live articles feed this section
                  automatically. You can also pin articles below.
                </p>
                {articleSearchBlock("Select an article, then start live or add as a manual boost.")}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => void handleStartLive()}
                    disabled={busyId === "live" || !selectedArticleId}
                  >
                    <Radio className="size-4" />
                    {busyId === "live" ? "Starting..." : "Start live"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleAddManual()}
                    disabled={busyId === "add" || !selectedArticleId}
                  >
                    <Plus className="size-4" />
                    {busyId === "add" ? "Adding..." : "Add manual boost"}
                  </Button>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm text-admin-label">
                  <input
                    type="checkbox"
                    checked={addAsPinned}
                    onChange={(e) => setAddAsPinned(e.target.checked)}
                    className="size-4"
                  />
                  Manual boost as pinned
                </label>

                <ul className="mt-4 space-y-2">
                  {liveArticles.length === 0 ? (
                    <li className="text-sm text-admin-label">No articles are live right now.</li>
                  ) : (
                    liveArticles.map((article) => (
                      <li
                        key={article.id}
                        className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-admin-heading">
                            {article.title}
                          </p>
                          <p className="mt-0.5 text-xs text-emerald-700">
                            Live | started {formatWhen(article.live_started_at)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busyId === article.id}
                          onClick={() => void handleEndLive(article.id)}
                        >
                          End live
                        </Button>
                      </li>
                    ))
                  )}
                </ul>

                <h3 className="mb-2 mt-6 text-sm font-bold text-admin-heading">Manual boosts</h3>
                <ul className="space-y-2">
                  {manual.length === 0 ? (
                    <li className="text-sm text-admin-label">No manual entries yet.</li>
                  ) : (
                    manual.map((entry, index) => (
                      <li
                        key={entry.id}
                        className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-admin-heading">
                            {entry.article?.title ?? `Article #${entry.article_id}`}
                          </p>
                          <p className="mt-0.5 text-xs text-admin-label">
                            {entry.is_pinned ? "Pinned" : "Manual"} |{" "}
                            {entry.is_active ? "Active" : "Inactive"} | order {index + 1}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busyId === entry.id || index === 0}
                            onClick={() => void moveManual(entry.id, -1)}
                          >
                            Up
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busyId === entry.id || index === manual.length - 1}
                            onClick={() => void moveManual(entry.id, 1)}
                          >
                            Down
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busyId === entry.id}
                            onClick={() => void handleTogglePin(entry)}
                          >
                            <Pin className="size-3.5" />
                            {entry.is_pinned ? "Unpin" : "Pin"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busyId === entry.id}
                            onClick={() => void handleToggleActive(entry)}
                          >
                            {entry.is_active ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busyId === entry.id}
                            onClick={() => void handleRemove(entry)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </AdminPanel>
            ) : (
              <AdminPanel>
                <h2 className="mb-1 text-base font-bold text-admin-heading">Manual pins</h2>
                <p className="mb-4 text-sm text-admin-label">
                  {showScheduleFields
                    ? "Curate editorial picks with optional start/end schedule windows."
                    : "Search and pin articles. Pinned items fill reserved slots first."}
                </p>

                {articleSearchBlock()}

                <div className="mt-3 space-y-3">
                  <label className="flex items-center gap-2 text-sm text-admin-label">
                    <input
                      type="checkbox"
                      checked={addAsPinned}
                      onChange={(e) => setAddAsPinned(e.target.checked)}
                      className="size-4"
                    />
                    Add as pinned
                  </label>

                  {showScheduleFields ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1.5 text-sm">
                        <span className="font-medium text-admin-label">Starts at</span>
                        <Input
                          type="datetime-local"
                          value={startsAt}
                          onChange={(e) => setStartsAt(e.target.value)}
                        />
                      </label>
                      <label className="space-y-1.5 text-sm">
                        <span className="font-medium text-admin-label">Ends at</span>
                        <Input
                          type="datetime-local"
                          value={endsAt}
                          onChange={(e) => setEndsAt(e.target.value)}
                        />
                      </label>
                    </div>
                  ) : null}

                  <Button
                    type="button"
                    onClick={() => void handleAddManual()}
                    disabled={busyId === "add" || !selectedArticleId}
                  >
                    <Plus className="size-4" />
                    {busyId === "add" ? "Adding..." : "Add article"}
                  </Button>
                </div>

                <ul className="mt-4 space-y-2">
                  {manual.length === 0 ? (
                    <li className="text-sm text-admin-label">No manual entries yet.</li>
                  ) : (
                    manual.map((entry, index) => (
                      <li
                        key={entry.id}
                        className="flex flex-col gap-2 rounded-md border border-border p-3"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-admin-heading">
                              {entry.article?.title ?? `Article #${entry.article_id}`}
                            </p>
                            <p className="mt-0.5 text-xs text-admin-label">
                              {entry.is_pinned ? "Pinned" : "Manual"} |{" "}
                              {entry.is_active ? "Active" : "Inactive"} | order {index + 1}
                              {showScheduleFields
                                ? ` | ${formatWhen(entry.starts_at)} -> ${formatWhen(entry.ends_at)}`
                                : ""}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busyId === entry.id || index === 0}
                              onClick={() => void moveManual(entry.id, -1)}
                            >
                              Up
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busyId === entry.id || index === manual.length - 1}
                              onClick={() => void moveManual(entry.id, 1)}
                            >
                              Down
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busyId === entry.id}
                              onClick={() => void handleTogglePin(entry)}
                            >
                              <Pin className="size-3.5" />
                              {entry.is_pinned ? "Unpin" : "Pin"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busyId === entry.id}
                              onClick={() => void handleToggleActive(entry)}
                            >
                              {entry.is_active ? "Disable" : "Enable"}
                            </Button>
                            {showScheduleFields ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={busyId === entry.id}
                                onClick={() =>
                                  editingScheduleId === entry.id
                                    ? setEditingScheduleId(null)
                                    : openScheduleEditor(entry)
                                }
                              >
                                {editingScheduleId === entry.id ? "Close" : "Schedule"}
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={busyId === entry.id}
                              onClick={() => void handleRemove(entry)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                        {showScheduleFields && editingScheduleId === entry.id ? (
                          <div className="grid gap-3 rounded-md border border-dashed border-border bg-muted/40 p-3 sm:grid-cols-[1fr_1fr_auto]">
                            <label className="space-y-1.5 text-sm">
                              <span className="font-medium text-admin-label">Starts at</span>
                              <Input
                                type="datetime-local"
                                value={editStartsAt}
                                onChange={(e) => setEditStartsAt(e.target.value)}
                              />
                            </label>
                            <label className="space-y-1.5 text-sm">
                              <span className="font-medium text-admin-label">Ends at</span>
                              <Input
                                type="datetime-local"
                                value={editEndsAt}
                                onChange={(e) => setEditEndsAt(e.target.value)}
                              />
                            </label>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                size="sm"
                                disabled={busyId === entry.id}
                                onClick={() => void handleSaveSchedule(entry)}
                              >
                                {busyId === entry.id ? "Saving..." : "Save schedule"}
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </li>
                    ))
                  )}
                </ul>
              </AdminPanel>
            )}
          </div>

          <div className="space-y-6">
            <AdminPanel>
              <h2 className="mb-1 text-base font-bold text-admin-heading">Live preview</h2>
              <p className="mb-4 text-sm text-admin-label">
                Merged public list (manual + algorithmic), limited by settings.
                {!isEnabled ? " Section is disabled - public site hides this card." : ""}
              </p>
              <ol className="space-y-2">
                {preview.length === 0 ? (
                  <li className="text-sm text-admin-label">No items in preview.</li>
                ) : (
                  preview.map((article, index) => (
                    <li
                      key={article.id}
                      className="rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <span className="mr-2 font-bold text-primary">{index + 1}.</span>
                      {article.title}
                      {article.is_live ? (
                        <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                          Live
                        </span>
                      ) : null}
                    </li>
                  ))
                )}
              </ol>
            </AdminPanel>

            <AdminPanel>
              <h2 className="mb-1 text-base font-bold text-admin-heading">
                {showLiveControls
                  ? "Currently live (algorithmic)"
                  : showScheduleFields
                    ? "Fallback latest (algorithmic)"
                    : "Algorithmic feed"}
              </h2>
              <p className="mb-4 text-sm text-admin-label">
                {showLiveControls
                  ? "Articles with live coverage enabled."
                  : showScheduleFields
                    ? "Latest published articles used when picks don't fill the limit."
                    : "Ranked candidates before manual merge."}
              </p>
              <ol className="space-y-2">
                {algorithmic.length === 0 ? (
                  <li className="text-sm text-admin-label">No algorithmic items yet.</li>
                ) : (
                  algorithmic.map((article, index) => (
                    <li
                      key={article.id}
                      className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-admin-label"
                    >
                      <span className="mr-2 font-semibold">{index + 1}.</span>
                      {article.title}
                    </li>
                  ))
                )}
              </ol>
            </AdminPanel>
          </div>
        </div>
      )}
    </div>
  );
}
