import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pin,
  Plus,
  Radio,
  Trash2,
} from "lucide-react";
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
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

type ScheduleBadge = "live" | "scheduled" | "expired" | "off" | null;

function resolveScheduleBadge(entry: SubMenuManualEntry, now = Date.now()): ScheduleBadge {
  if (!entry.is_active) return "off";

  const startsMs = entry.starts_at ? new Date(entry.starts_at).getTime() : null;
  const endsMs = entry.ends_at ? new Date(entry.ends_at).getTime() : null;

  if (startsMs != null && !Number.isNaN(startsMs) && startsMs > now) return "scheduled";
  if (endsMs != null && !Number.isNaN(endsMs) && endsMs <= now) return "expired";
  if (startsMs != null || endsMs != null) return "live";

  return null;
}

function scheduleBadgeLabel(badge: ScheduleBadge): string | null {
  switch (badge) {
    case "live":
      return "In window";
    case "scheduled":
      return "Scheduled";
    case "expired":
      return "Expired";
    case "off":
      return "Off";
    default:
      return null;
  }
}

function MetaChip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "pin" | "live" | "scheduled" | "expired" | "off";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        tone === "neutral" && "bg-muted text-admin-label",
        tone === "pin" && "bg-primary/10 text-primary",
        tone === "live" && "bg-emerald-100 text-emerald-800",
        tone === "scheduled" && "bg-sky-100 text-sky-800",
        tone === "expired" && "bg-amber-100 text-amber-900",
        tone === "off" && "bg-zinc-200 text-zinc-700",
      )}
    >
      {children}
    </span>
  );
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
            results.articles
              // Sub menu public feed only shows published articles.
              .filter((article) => article.status === "published")
              .map((article) => ({
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
      // Omit sort_order so the backend appends after existing entries.
      await upsertSubMenuManualEntry(activeTab, {
        article_id: selectedArticleId,
        is_pinned: addAsPinned,
        is_active: true,
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
      toast.error("Only published articles can be added.");
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
      // Re-enable when saving an open/future window (expired entries stay off until this).
      await upsertSubMenuManualEntry(activeTab, {
        article_id: entry.article_id,
        is_pinned: entry.is_pinned,
        is_active: true,
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

  function canMoveManual(entryId: number, direction: -1 | 1): boolean {
    const index = orderedManualIds.indexOf(entryId);
    if (index < 0) return false;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= manual.length) return false;
    // Keep Up/Down inside the same pin group so order sticks after reload.
    return Boolean(manual[index]?.is_pinned) === Boolean(manual[nextIndex]?.is_pinned);
  }

  async function moveManual(entryId: number, direction: -1 | 1) {
    if (!canMoveManual(entryId, direction)) return;

    const index = orderedManualIds.indexOf(entryId);
    const nextIndex = index + direction;
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

  function renderManualEntry(
    entry: SubMenuManualEntry,
    index: number,
    options: { showSchedule?: boolean } = {},
  ) {
    const { showSchedule = false } = options;
    const busy = busyId === entry.id;
    const badge = showSchedule ? resolveScheduleBadge(entry) : null;
    const badgeLabel = scheduleBadgeLabel(badge);
    const scheduleTone =
      badge === "live" || badge === "scheduled" || badge === "expired" || badge === "off"
        ? badge
        : "neutral";
    const hasSchedule = Boolean(entry.starts_at || entry.ends_at);
    const editing = showSchedule && editingScheduleId === entry.id;
    const articleStatus = entry.article?.status?.toLowerCase() ?? null;
    const isPublished = articleStatus === "published";
    const unpublishedLabel = !isPublished
      ? articleStatus
        ? articleStatus.replaceAll("_", " ")
        : "missing"
      : null;

    return (
      <li
        key={entry.id}
        className={cn(
          "rounded-md border border-border bg-background p-3",
          badge === "expired" && "border-amber-200 bg-amber-50/40",
          !isPublished && "border-rose-200 bg-rose-50/40",
          !entry.is_active && "opacity-75",
        )}
      >
        <div className="space-y-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[11px] font-bold text-admin-label">
                {index + 1}
              </span>
              <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-admin-heading">
                {entry.article?.title ?? `Article #${entry.article_id}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pl-8">
              <MetaChip tone={entry.is_pinned ? "pin" : "neutral"}>
                {entry.is_pinned ? "Pinned" : "Manual"}
              </MetaChip>
              <MetaChip tone={entry.is_active ? "live" : "off"}>
                {entry.is_active ? "Active" : "Inactive"}
              </MetaChip>
              {badgeLabel ? <MetaChip tone={scheduleTone}>{badgeLabel}</MetaChip> : null}
              {unpublishedLabel ? (
                <MetaChip tone="expired">Not on site · {unpublishedLabel}</MetaChip>
              ) : null}
            </div>
            {!isPublished ? (
              <p className="pl-8 text-xs text-rose-700">
                This article is not published, so it will not appear in Live preview or on the
                public site. Publish it first, or remove this pin.
              </p>
            ) : null}
            {showSchedule && hasSchedule ? (
              <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pl-8 text-xs text-admin-label">
                <CalendarClock className="size-3.5 shrink-0" />
                <span>{formatWhen(entry.starts_at)}</span>
                <span className="text-muted-foreground">→</span>
                <span>{formatWhen(entry.ends_at)}</span>
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-2.5">
            <div className="inline-flex overflow-hidden rounded-md border border-border">
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 border-r border-border px-2.5 text-xs font-medium text-admin-heading transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                disabled={busy || !canMoveManual(entry.id, -1)}
                onClick={() => void moveManual(entry.id, -1)}
                aria-label="Move up"
              >
                <ChevronUp className="size-3.5" />
                Up
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1 px-2.5 text-xs font-medium text-admin-heading transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                disabled={busy || !canMoveManual(entry.id, 1)}
                onClick={() => void moveManual(entry.id, 1)}
                aria-label="Move down"
              >
                <ChevronDown className="size-3.5" />
                Down
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => void handleTogglePin(entry)}
              >
                <Pin className="size-3.5" />
                {entry.is_pinned ? "Unpin" : "Pin"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => void handleToggleActive(entry)}
              >
                {entry.is_active ? "Disable" : "Enable"}
              </Button>
              {showSchedule ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    editing ? setEditingScheduleId(null) : openScheduleEditor(entry)
                  }
                >
                  <CalendarClock className="size-3.5" />
                  {editing ? "Close" : "Schedule"}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="size-8 px-0 text-destructive hover:text-destructive"
                disabled={busy}
                onClick={() => void handleRemove(entry)}
                aria-label="Remove"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>

          {editing ? (
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
                  disabled={busy}
                  onClick={() => void handleSaveSchedule(entry)}
                >
                  {busy ? "Saving..." : "Save schedule"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </li>
    );
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
                    min={0}
                    value={pinnedSlots}
                    onChange={(e) => setPinnedSlots(e.target.value)}
                  />
                  <span className="block text-xs text-admin-label">
                    Reserved top slots for pinned manuals (0 = all pinned first, no cap).
                  </span>
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
                    manual.map((entry, index) => renderManualEntry(entry, index))
                  )}
                </ul>
              </AdminPanel>
            ) : (
              <AdminPanel>
                <h2 className="mb-1 text-base font-bold text-admin-heading">Manual pins</h2>
                <p className="mb-4 text-sm text-admin-label">
                  {showScheduleFields
                    ? "Add picks with optional schedule windows. Manual items always appear before auto-fill."
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
                    manual.map((entry, index) =>
                      renderManualEntry(entry, index, { showSchedule: showScheduleFields }),
                    )
                  )}
                </ul>
              </AdminPanel>
            )}
          </div>

          <div className="space-y-6">
            <AdminPanel>
              <h2 className="mb-1 text-base font-bold text-admin-heading">Live preview</h2>
              <p className="mb-4 text-sm text-admin-label">
                Merged public list (manual + algorithmic), limited by settings. Only
                published manuals appear here.
                {!isEnabled ? " Section is disabled - public site hides this card." : ""}
              </p>
              <ol className="space-y-2">
                {preview.length === 0 ? (
                  <li className="text-sm text-admin-label">No items in preview.</li>
                ) : (
                  preview.map((article, index) => {
                    const serial = article.serial && article.serial > 0 ? article.serial : index + 1;
                    return (
                      <li
                        key={article.id}
                        className="rounded-md border border-border px-3 py-2 text-sm"
                      >
                        <span className="mr-2 font-bold text-primary">{serial}.</span>
                        {article.title}
                        {article.is_live ? (
                          <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                            Live
                          </span>
                        ) : null}
                      </li>
                    );
                  })
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
