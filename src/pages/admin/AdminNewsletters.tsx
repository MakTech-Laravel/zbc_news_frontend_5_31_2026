import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { NewsletterHtmlEditor } from "@/components/admin/newsletters/NewsletterHtmlEditor";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { toApiDatetimeValue, toDatetimeLocalValue } from "@/lib/datetime";
import {
  createNewsletterCampaign,
  deleteNewsletterSubscriber,
  EMPTY_ANALYTICS,
  EMPTY_ELIGIBLE_COUNT,
  fetchNewsletterAnalytics,
  fetchNewsletterArticleEmailBlock,
  fetchNewsletterCampaignEligibleCount,
  fetchNewsletterCampaigns,
  fetchNewsletterSubscribers,
  getNewsletterApiError,
  resendNewsletterVerification,
  scheduleNewsletterCampaign,
  searchNewsletterArticles,
  sendNewsletterCampaign,
  sendNewsletterCampaignTest,
  updateNewsletterCampaign,
  updateNewsletterSubscriberStatus,
  type NewsletterAnalytics,
  type NewsletterArticleOption,
  type NewsletterCampaign,
  type NewsletterEligibleCount,
  type NewsletterSubscriber,
} from "@/services/admin/newsletters";

type TabId = "overview" | "campaigns" | "subscribers";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "campaigns", label: "Campaigns" },
  { id: "subscribers", label: "Subscribers" },
];

export default function AdminNewsletters() {
  const { settings } = useSiteSettings();
  const siteTimeZone = settings.timezone || "America/New_York";

  const [activeTab, setActiveTab] = useState<TabId>("subscribers");
  const [analytics, setAnalytics] = useState<NewsletterAnalytics>(EMPTY_ANALYTICS);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [editorScheduleAt, setEditorScheduleAt] = useState("");
  const [articleQuery, setArticleQuery] = useState("");
  const [articleOptions, setArticleOptions] = useState<NewsletterArticleOption[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [addingArticle, setAddingArticle] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [eligibleByPremium, setEligibleByPremium] = useState<{
    standard: NewsletterEligibleCount;
    premium: NewsletterEligibleCount;
  }>({
    standard: EMPTY_ELIGIBLE_COUNT,
    premium: EMPTY_ELIGIBLE_COUNT,
  });
  const [campaignScheduleTimes, setCampaignScheduleTimes] = useState<Record<number, string>>({});
  const [campaignActionId, setCampaignActionId] = useState<number | null>(null);

  async function loadData() {
    setLoading(true);
    setLoadError(null);

    const results = await Promise.allSettled([
      fetchNewsletterAnalytics(),
      fetchNewsletterSubscribers(statusFilter || undefined),
      fetchNewsletterCampaigns(),
    ]);

    const errors: string[] = [];

    if (results[0].status === "fulfilled") {
      setAnalytics(results[0].value);
    } else {
      setAnalytics(EMPTY_ANALYTICS);
      errors.push(getNewsletterApiError(results[0].reason, "Unable to load analytics"));
    }

    if (results[1].status === "fulfilled") {
      setSubscribers(results[1].value);
    } else {
      setSubscribers([]);
      errors.push(getNewsletterApiError(results[1].reason, "Unable to load subscribers"));
    }

    if (results[2].status === "fulfilled") {
      const nextCampaigns = results[2].value;
      setCampaigns(nextCampaigns);

      const nextScheduleTimes: Record<number, string> = {};
      for (const campaign of nextCampaigns) {
        if (campaign.scheduled_at) {
          nextScheduleTimes[campaign.id] = toDatetimeLocalValue(
            campaign.scheduled_at,
            siteTimeZone,
          );
        }
      }
      setCampaignScheduleTimes(nextScheduleTimes);

      const eligibleResults = await Promise.allSettled([
        fetchNewsletterCampaignEligibleCount(false),
        fetchNewsletterCampaignEligibleCount(true),
      ]);

      const standardEligible =
        eligibleResults[0].status === "fulfilled"
          ? eligibleResults[0].value
          : EMPTY_ELIGIBLE_COUNT;
      const premiumEligible =
        eligibleResults[1].status === "fulfilled"
          ? eligibleResults[1].value
          : EMPTY_ELIGIBLE_COUNT;

      setEligibleByPremium({
        standard: standardEligible,
        premium: premiumEligible,
      });
    } else {
      setCampaigns([]);
      setCampaignScheduleTimes({});
      setEligibleByPremium({
        standard: EMPTY_ELIGIBLE_COUNT,
        premium: EMPTY_ELIGIBLE_COUNT,
      });
      errors.push(getNewsletterApiError(results[2].reason, "Unable to load campaigns"));
    }

    if (errors.length > 0) {
      setLoadError(errors[0]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, [statusFilter]);

  function resetEditor() {
    setEditingId(null);
    setTitle("");
    setPreviewText("");
    setContentHtml("");
    setPremiumOnly(false);
    setEditorScheduleAt("");
    setArticleQuery("");
    setArticleOptions([]);
    setSelectedArticleId(null);
    setTestEmail("");
  }

  function loadCampaignIntoEditor(campaign: NewsletterCampaign) {
    setEditingId(campaign.id);
    setTitle(campaign.title);
    setPreviewText(campaign.preview_text ?? "");
    setContentHtml(campaign.content_html ?? "");
    setPremiumOnly(Boolean(campaign.premium_only));
    setEditorScheduleAt(toDatetimeLocalValue(campaign.scheduled_at, siteTimeZone));
    setSelectedArticleId(campaign.article_id ?? null);
    setArticleQuery("");
    setArticleOptions([]);
    setTestEmail("");
    setActiveTab("campaigns");
  }

  function formatCampaignSchedule(value?: string | null) {
    if (!value) return "—";
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: siteTimeZone,
      }).format(new Date(value));
    } catch {
      return new Date(value).toLocaleString();
    }
  }

  async function handleSearchArticles() {
    try {
      const results = await searchNewsletterArticles(articleQuery.trim() || undefined);
      setArticleOptions(results);
      if (results.length === 0) {
        toast.error("No published articles matched that search.");
      }
    } catch (error) {
      toast.error(getNewsletterApiError(error, "Failed to search articles"));
    }
  }

  async function handleInsertArticleBlock() {
    if (!selectedArticleId) {
      toast.error("Select an article first.");
      return;
    }

    setAddingArticle(true);
    try {
      const block = await fetchNewsletterArticleEmailBlock(selectedArticleId);
      setContentHtml((current) =>
        current.trim() ? `${current}\n${block.html}` : block.html,
      );
      if (!title.trim()) {
        setTitle(block.title);
      }
      toast.success("Article block added to campaign content");
    } catch (error) {
      toast.error(getNewsletterApiError(error, "Failed to insert article"));
    } finally {
      setAddingArticle(false);
    }
  }

  async function handleSendTest() {
    if (!editingId) {
      toast.error("Save the campaign first, then send a test.");
      return;
    }
    if (!testEmail.trim()) {
      toast.error("Enter a test email address.");
      return;
    }

    setSendingTest(true);
    try {
      await sendNewsletterCampaignTest(editingId, testEmail.trim());
      toast.success("Test email sent");
    } catch (error) {
      toast.error(getNewsletterApiError(error, "Failed to send test email"));
    } finally {
      setSendingTest(false);
    }
  }

  async function handleSaveCampaign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const plainContent = contentHtml.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    if (!title.trim() || !plainContent) {
      toast.error("Add a title and campaign content.");
      return;
    }

    const payload = {
      title: title.trim(),
      preview_text: previewText.trim() || undefined,
      content_html: contentHtml,
      premium_only: premiumOnly,
      article_id: selectedArticleId,
    };

    try {
      const campaign = editingId
        ? await updateNewsletterCampaign(editingId, payload)
        : await createNewsletterCampaign(payload);

      if (editorScheduleAt) {
        const scheduleUtc = toApiDatetimeValue(editorScheduleAt, siteTimeZone);
        const scheduleInstant = scheduleUtc ? new Date(scheduleUtc).getTime() : NaN;
        const isPastOrDue = Number.isFinite(scheduleInstant) && scheduleInstant <= Date.now();
        await scheduleNewsletterCampaign(campaign.id, scheduleUtc);
        toast.success(
          isPastOrDue
            ? editingId
              ? "Campaign updated and sending now"
              : "Campaign created and sending now"
            : editingId
              ? "Campaign updated and scheduled"
              : "Campaign created and scheduled",
        );
      } else {
        toast.success(editingId ? "Campaign updated" : "Campaign saved to the list");
      }

      resetEditor();
      await loadData();
    } catch (error) {
      toast.error(getNewsletterApiError(error, "Failed to save campaign"));
    }
  }

  async function handleSchedule(campaignId: number) {
    const scheduleValue = campaignScheduleTimes[campaignId];

    if (!scheduleValue) {
      toast.error("Choose a schedule date and time for this campaign");
      return;
    }

    const scheduleUtc = toApiDatetimeValue(scheduleValue, siteTimeZone);
    if (!scheduleUtc) {
      toast.error("Invalid schedule date and time");
      return;
    }

    const isPastOrDue = new Date(scheduleUtc).getTime() <= Date.now();

    setCampaignActionId(campaignId);
    try {
      await scheduleNewsletterCampaign(campaignId, scheduleUtc);
      toast.success(isPastOrDue ? "Campaign is sending now" : "Campaign scheduled");
      await loadData();
    } catch (error) {
      toast.error(getNewsletterApiError(error, "Failed to schedule campaign"));
    } finally {
      setCampaignActionId(null);
    }
  }

  async function handleSend(campaignId: number) {
    setCampaignActionId(campaignId);
    try {
      await sendNewsletterCampaign(campaignId);
      toast.success("Campaign is sending now");
      await loadData();
    } catch (error) {
      toast.error(getNewsletterApiError(error, "Failed to send campaign"));
    } finally {
      setCampaignActionId(null);
    }
  }

  async function handleDeleteSubscriber(id: number) {
    try {
      await deleteNewsletterSubscriber(id);
      toast.success("Subscriber removed");
      await loadData();
    } catch (error) {
      toast.error(getNewsletterApiError(error, "Failed to remove subscriber"));
    }
  }

  async function handleSubscriberStatusChange(
    id: number,
    status: NewsletterSubscriber["status"],
  ) {
    try {
      await updateNewsletterSubscriberStatus(id, status);
      toast.success("Subscriber status updated");
      await loadData();
    } catch (error) {
      toast.error(getNewsletterApiError(error, "Failed to update subscriber status"));
    }
  }

  async function handleResendVerification(id: number) {
    try {
      await resendNewsletterVerification(id);
      toast.success("Verification email sent");
    } catch (error) {
      toast.error(getNewsletterApiError(error, "Failed to send verification email"));
    }
  }

  function getCampaignEligibleCount(campaign: NewsletterCampaign): NewsletterEligibleCount {
    return campaign.premium_only ? eligibleByPremium.premium : eligibleByPremium.standard;
  }

  function getEditorEligibleCount(): NewsletterEligibleCount {
    return premiumOnly ? eligibleByPremium.premium : eligibleByPremium.standard;
  }

  const editorEligibleCount = getEditorEligibleCount();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletters"
        description="Manage subscribers, campaigns, delivery, and engagement analytics"
        actions={
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-zbc-gray-700 hover:bg-muted disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        }
      />

      <div className="flex flex-wrap gap-2 border-b border-border pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-zbc-gray-600 hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}. Deploy the latest backend and run database migrations if this is a new
          release.
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-zbc-gray-500">Loading newsletter data…</p>
      ) : null}

      {activeTab === "overview" ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Verified subscribers" value={analytics.subscribers.verified} />
          <MetricCard label="Pending verification" value={analytics.subscribers.pending} />
          <MetricCard label="Avg open rate" value={`${analytics.engagement.avg_open_rate}%`} />
          <MetricCard label="Avg click rate" value={`${analytics.engagement.avg_click_rate}%`} />
        </section>
      ) : null}

      {activeTab === "overview" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-zbc-gray-1000">Subscriber growth (30 days)</h2>
            <div className="mt-4 space-y-2">
              {analytics.growth.length === 0 ? (
                <p className="text-sm text-zbc-gray-500">No signups yet.</p>
              ) : (
                analytics.growth.map((point) => (
                  <div key={point.date} className="flex items-center justify-between text-sm">
                    <span className="text-zbc-gray-600">{point.date}</span>
                    <span className="font-medium text-zbc-gray-1000">+{point.count}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-zbc-gray-1000">Recent activity</h2>
            <div className="mt-4 space-y-2">
              {analytics.recent_events.length === 0 ? (
                <p className="text-sm text-zbc-gray-500">No events recorded yet.</p>
              ) : (
                analytics.recent_events.map((event) => (
                  <div key={event.id} className="rounded-md border border-border/70 px-3 py-2 text-sm">
                    <div className="font-medium capitalize text-zbc-gray-1000">{event.event_type}</div>
                    <div className="text-zbc-gray-500">
                      {event.email ?? "—"} {event.campaign ? `· ${event.campaign}` : ""}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "overview" ? (
        <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-zbc-gray-1000">Recent subscribers</h2>
          <div className="mt-4 space-y-2">
            {subscribers.length === 0 ? (
              <p className="text-sm text-zbc-gray-500">No subscribers yet.</p>
            ) : (
              subscribers.slice(0, 8).map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium text-zbc-gray-1000">{subscriber.email}</div>
                    <div className="text-zbc-gray-500">
                      {subscriber.preferences?.categories?.join(", ") || "All categories"} ·{" "}
                      <span className="capitalize">{subscriber.status}</span>
                    </div>
                  </div>
                  <div className="text-xs text-zbc-gray-500">
                    {subscriber.created_at
                      ? new Date(subscriber.created_at).toLocaleString()
                      : "—"}
                  </div>
                </div>
              ))
            )}
          </div>
          {subscribers.length > 0 ? (
            <button
              type="button"
              onClick={() => setActiveTab("subscribers")}
              className="mt-4 text-sm font-medium text-primary"
            >
              View all subscribers
            </button>
          ) : null}
        </section>
      ) : null}

      {activeTab === "campaigns" ? (
        <>
          <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-zbc-gray-1000">
                {editingId ? "Edit Campaign" : "Create Campaign"}
              </h2>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetEditor}
                  className="text-sm font-medium text-primary"
                >
                  New campaign
                </button>
              ) : null}
            </div>

            <form onSubmit={(e) => void handleSaveCampaign(e)} className="mt-4 space-y-4">
              <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                placeholder="Campaign title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                placeholder="Preview text (optional)"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
              />

              <NewsletterHtmlEditor value={contentHtml} onChange={setContentHtml} />

              <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
                <div>
                  <label className="block text-sm font-medium text-zbc-gray-800">
                    Insert published article
                  </label>
                  <p className="mt-1 text-xs text-zbc-gray-500">
                    Search and insert headline, image, summary, and link HTML into the campaign body.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    className="min-w-[220px] flex-1 rounded-md border border-border px-3 py-2 text-sm"
                    placeholder="Search published articles…"
                    value={articleQuery}
                    onChange={(e) => setArticleQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleSearchArticles();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => void handleSearchArticles()}
                    className="rounded-md border border-border px-3 py-2 text-sm font-medium text-zbc-gray-700"
                  >
                    Search
                  </button>
                </div>
                {articleOptions.length > 0 ? (
                  <select
                    className="w-full rounded-md border border-border px-3 py-2 text-sm"
                    value={selectedArticleId ?? ""}
                    onChange={(e) =>
                      setSelectedArticleId(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value="">Select an article…</option>
                    {articleOptions.map((article) => (
                      <option key={article.id} value={article.id}>
                        {article.title}
                      </option>
                    ))}
                  </select>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleInsertArticleBlock()}
                  disabled={!selectedArticleId || addingArticle}
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium text-zbc-gray-700 disabled:opacity-50"
                >
                  {addingArticle ? "Inserting…" : "Insert article block"}
                </button>
              </div>

              <div className="space-y-3 rounded-lg border border-border/70 bg-muted/30 p-4">
                <label className="flex items-center gap-2 text-sm text-zbc-gray-700">
                  <input
                    type="checkbox"
                    checked={premiumOnly}
                    onChange={(e) => setPremiumOnly(e.target.checked)}
                  />
                  Premium only (verified subscribers)
                </label>
                <p className="text-sm text-zbc-gray-700">
                  <span className="font-semibold text-zbc-gray-1000">
                    Eligible recipients: {editorEligibleCount.count}
                  </span>
                  {premiumOnly ? (
                    <span className="text-zbc-gray-500">
                      {" "}
                      (verified subscribers only)
                    </span>
                  ) : (
                    <span className="text-zbc-gray-500">
                      {" "}
                      ({editorEligibleCount.breakdown.subscribers} subscribers — verified or pending ·{" "}
                      {editorEligibleCount.breakdown.users} users with role user)
                    </span>
                  )}
                </p>
                {editorEligibleCount.count === 0 ? (
                  <p className="text-sm text-amber-700">
                    {premiumOnly
                      ? "No verified subscribers yet. Uncheck “Premium only” to include pending subscribers and site users."
                      : "No eligible recipients right now. Add subscribers or users with the user role."}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  {editingId
                    ? editorScheduleAt
                      ? "Update & schedule"
                      : "Update draft"
                    : editorScheduleAt
                      ? "Save & schedule"
                      : "Save to list"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetEditor}
                    className="rounded-md border border-border px-4 py-2 text-sm font-medium text-zbc-gray-700"
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <label className="block text-sm font-medium text-zbc-gray-800">
                  Schedule send (optional)
                </label>
                <p className="mt-1 text-xs text-zbc-gray-500">
                  Uses the website timezone ({siteTimeZone}) and is stored as UTC. Leave empty to
                  save as a draft. If the time is already past, the campaign sends immediately.
                </p>
                <input
                  type="datetime-local"
                  value={editorScheduleAt}
                  onChange={(e) => setEditorScheduleAt(e.target.value)}
                  className="mt-3 w-full max-w-xs rounded-md border border-border px-3 py-2 text-sm"
                />
              </div>

              {editingId ? (
                <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                  <label className="block text-sm font-medium text-zbc-gray-800">
                    Send test email
                  </label>
                  <p className="mt-1 text-xs text-zbc-gray-500">
                    Sends the current saved campaign HTML to one address with a [TEST] subject. Does
                    not mark the campaign as sent.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      type="email"
                      className="min-w-[220px] flex-1 rounded-md border border-border px-3 py-2 text-sm"
                      placeholder="you@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => void handleSendTest()}
                      disabled={sendingTest}
                      className="rounded-md border border-border px-3 py-2 text-sm font-medium text-zbc-gray-700 disabled:opacity-50"
                    >
                      {sendingTest ? "Sending…" : "Send test"}
                    </button>
                  </div>
                </div>
              ) : null}
            </form>
          </section>

          <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-zbc-gray-1000">Campaign list</h2>
                <p className="mt-1 text-xs text-zbc-gray-500">
                  Save drafts below, send instantly, or pick a schedule time per campaign (website
                  timezone: {siteTimeZone}, stored as UTC). Past times send immediately. Scheduled
                  campaigns also run automatically every minute.
                </p>
              </div>
            </div>
            <div className="mt-3 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-zbc-gray-500">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Scheduled for</th>
                    <th className="py-2 pr-4">Sent</th>
                    <th className="py-2 pr-4">Opens</th>
                    <th className="py-2 pr-4">Clicks</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-zbc-gray-500">
                        No campaigns yet. Create one above and it will appear here.
                      </td>
                    </tr>
                  ) : (
                  campaigns.map((campaign) => {
                    const eligible = getCampaignEligibleCount(campaign);
                    const canDispatch =
                      (campaign.status === "draft" || campaign.status === "scheduled") &&
                      eligible.count > 0;
                    const isBusy = campaignActionId === campaign.id;

                    return (
                    <tr key={campaign.id} className="border-b border-border/70">
                      <td className="py-2 pr-4 font-medium text-zbc-gray-1000">{campaign.title}</td>
                      <td className="py-2 pr-4 capitalize">
                        {campaign.status}
                        {campaign.premium_only ? (
                          <span className="ml-1 text-xs text-zbc-gray-500">(premium only)</span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-4 text-zbc-gray-600">
                        {formatCampaignSchedule(campaign.scheduled_at)}
                      </td>
                      <td className="py-2 pr-4">{campaign.subscriber_count ?? 0}</td>
                      <td className="py-2 pr-4">{campaign.open_count ?? 0}</td>
                      <td className="py-2 pr-4">{campaign.click_count ?? 0}</td>
                      <td className="py-2 pr-4">
                        <div className="flex min-w-[280px] flex-col gap-2">
                          <span className="text-xs text-zbc-gray-500">
                            {eligible.count} eligible recipient{eligible.count === 1 ? "" : "s"}
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => loadCampaignIntoEditor(campaign)}
                              className="text-xs font-medium text-primary"
                            >
                              Edit
                            </button>
                            {campaign.status === "draft" || campaign.status === "scheduled" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void handleSend(campaign.id)}
                                  disabled={!canDispatch || isBusy}
                                  title={
                                    canDispatch
                                      ? "Send this campaign immediately"
                                      : "No eligible recipients for this campaign"
                                  }
                                  className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isBusy ? "Sending..." : "Send now"}
                                </button>
                                <input
                                  type="datetime-local"
                                  value={campaignScheduleTimes[campaign.id] ?? ""}
                                  onChange={(e) =>
                                    setCampaignScheduleTimes((current) => ({
                                      ...current,
                                      [campaign.id]: e.target.value,
                                    }))
                                  }
                                  className="rounded border border-border px-2 py-1 text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => void handleSchedule(campaign.id)}
                                  disabled={!canDispatch || isBusy}
                                  title={
                                    canDispatch
                                      ? "Schedule this campaign for the selected time"
                                      : "No eligible recipients for this campaign"
                                  }
                                  className="text-xs font-medium text-zbc-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Schedule
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === "subscribers" ? (
        <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zbc-gray-1000">Subscribers</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>

          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-zbc-gray-500">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Categories</th>
                  <th className="py-2 pr-4">Subscribed</th>
                  <th className="py-2 pr-4" />
                </tr>
              </thead>
              <tbody>
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-zbc-gray-500">
                      No subscribers found{statusFilter ? ` with status "${statusFilter}"` : ""}.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-border/70">
                    <td className="py-2 pr-4">{subscriber.email}</td>
                    <td className="py-2 pr-4">
                      {subscriber.status === "verified" ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium capitalize text-green-800">
                          Verified
                        </span>
                      ) : (
                        <select
                          value={subscriber.status}
                          onChange={(e) =>
                            void handleSubscriberStatusChange(
                              subscriber.id,
                              e.target.value as NewsletterSubscriber["status"],
                            )
                          }
                          className="rounded-md border border-border px-2 py-1 text-sm capitalize"
                        >
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="unsubscribed">Unsubscribed</option>
                        </select>
                      )}
                    </td>
                    <td className="py-2 pr-4">{subscriber.source ?? "—"}</td>
                    <td className="py-2 pr-4">
                      {subscriber.preferences?.categories?.join(", ") || "All"}
                    </td>
                    <td className="py-2 pr-4">
                      {subscriber.created_at
                        ? new Date(subscriber.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {subscriber.status === "pending" ? (
                          <button
                            type="button"
                            onClick={() => void handleResendVerification(subscriber.id)}
                            className="text-xs font-medium text-zbc-gray-700"
                          >
                            Resend email
                          </button>
                        ) : null}
                        {subscriber.status === "verified" ? (
                          <button
                            type="button"
                            onClick={() => void handleSubscriberStatusChange(subscriber.id, "unsubscribed")}
                            className="text-xs font-medium text-zbc-gray-700"
                          >
                            Unsubscribe
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void handleDeleteSubscriber(subscriber.id)}
                          className="text-xs font-medium text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs uppercase tracking-wide text-zbc-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-zbc-gray-1000">{value}</p>
    </div>
  );
}
