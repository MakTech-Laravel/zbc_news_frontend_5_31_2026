import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { NewsletterHtmlEditor } from "@/components/admin/newsletters/NewsletterHtmlEditor";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  createNewsletterCampaign,
  deleteNewsletterSubscriber,
  fetchNewsletterAnalytics,
  fetchNewsletterCampaigns,
  fetchNewsletterCategories,
  fetchNewsletterSubscribers,
  scheduleNewsletterCampaign,
  sendNewsletterCampaign,
  updateNewsletterCampaign,
  type NewsletterAnalytics,
  type NewsletterCampaign,
  type NewsletterCategory,
  type NewsletterSubscriber,
} from "@/services/admin/newsletters";

type TabId = "overview" | "campaigns" | "subscribers";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "campaigns", label: "Campaigns" },
  { id: "subscribers", label: "Subscribers" },
];

export default function AdminNewsletters() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [analytics, setAnalytics] = useState<NewsletterAnalytics | null>(null);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [categories, setCategories] = useState<NewsletterCategory[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  async function loadData() {
    const [analyticsData, subs, camps, cats] = await Promise.all([
      fetchNewsletterAnalytics(),
      fetchNewsletterSubscribers(statusFilter || undefined),
      fetchNewsletterCampaigns(),
      fetchNewsletterCategories(),
    ]);
    setAnalytics(analyticsData);
    setSubscribers(subs);
    setCampaigns(camps);
    setCategories(cats);
  }

  useEffect(() => {
    void loadData();
  }, [statusFilter]);

  function resetEditor() {
    setEditingId(null);
    setTitle("");
    setSubject("");
    setPreviewText("");
    setContentHtml("");
    setSelectedCategories([]);
    setPremiumOnly(false);
    setScheduledAt("");
  }

  function loadCampaignIntoEditor(campaign: NewsletterCampaign) {
    setEditingId(campaign.id);
    setTitle(campaign.title);
    setSubject(campaign.subject);
    setPreviewText(campaign.preview_text ?? "");
    setContentHtml(campaign.content_html ?? "");
    setSelectedCategories(campaign.segments?.category_slugs ?? []);
    setPremiumOnly(Boolean(campaign.premium_only));
    setScheduledAt(campaign.scheduled_at ? campaign.scheduled_at.slice(0, 16) : "");
    setActiveTab("campaigns");
  }

  async function handleSaveCampaign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !contentHtml.trim()) return;

    const payload = {
      title: title.trim(),
      subject: subject.trim(),
      preview_text: previewText.trim() || undefined,
      content_html: contentHtml,
      category_slugs: selectedCategories,
      premium_only: premiumOnly,
    };

    try {
      if (editingId) {
        await updateNewsletterCampaign(editingId, payload);
        toast.success("Campaign updated");
      } else {
        await createNewsletterCampaign(payload);
        toast.success("Campaign created");
      }
      resetEditor();
      await loadData();
    } catch {
      toast.error("Failed to save campaign");
    }
  }

  async function handleSchedule(campaignId: number) {
    if (!scheduledAt) {
      toast.error("Choose a schedule date and time first");
      return;
    }

    try {
      await scheduleNewsletterCampaign(campaignId, new Date(scheduledAt).toISOString());
      toast.success("Campaign scheduled");
      await loadData();
    } catch {
      toast.error("Failed to schedule campaign");
    }
  }

  async function handleSend(campaignId: number) {
    try {
      await sendNewsletterCampaign(campaignId);
      toast.success("Campaign dispatch started");
      await loadData();
    } catch {
      toast.error("Failed to send campaign");
    }
  }

  async function handleDeleteSubscriber(id: number) {
    try {
      await deleteNewsletterSubscriber(id);
      toast.success("Subscriber removed");
      await loadData();
    } catch {
      toast.error("Failed to remove subscriber");
    }
  }

  function toggleCategory(slug: string) {
    setSelectedCategories((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletters"
        description="Manage subscribers, campaigns, delivery, and engagement analytics"
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

      {activeTab === "overview" && analytics ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Verified subscribers" value={analytics.subscribers.verified} />
          <MetricCard label="Pending verification" value={analytics.subscribers.pending} />
          <MetricCard label="Avg open rate" value={`${analytics.engagement.avg_open_rate}%`} />
          <MetricCard label="Avg click rate" value={`${analytics.engagement.avg_click_rate}%`} />
        </section>
      ) : null}

      {activeTab === "overview" && analytics ? (
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
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  placeholder="Campaign title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <input
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <input
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                placeholder="Preview text (optional)"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
              />

              <NewsletterHtmlEditor value={contentHtml} onChange={setContentHtml} />

              <div className="space-y-2">
                <p className="text-sm font-medium text-zbc-gray-800">Audience segments</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const active = selectedCategories.includes(category.slug);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.slug)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-zbc-gray-600"
                        }`}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>
                <label className="flex items-center gap-2 text-sm text-zbc-gray-700">
                  <input
                    type="checkbox"
                    checked={premiumOnly}
                    onChange={(e) => setPremiumOnly(e.target.checked)}
                  />
                  Premium / member subscribers only
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  {editingId ? "Update campaign" : "Save draft"}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-zbc-gray-1000">Campaigns</h2>
            <div className="mt-3 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-zbc-gray-500">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Sent</th>
                    <th className="py-2 pr-4">Opens</th>
                    <th className="py-2 pr-4">Clicks</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-border/70">
                      <td className="py-2 pr-4">{campaign.title}</td>
                      <td className="py-2 pr-4 capitalize">{campaign.status}</td>
                      <td className="py-2 pr-4">{campaign.subscriber_count ?? 0}</td>
                      <td className="py-2 pr-4">{campaign.open_count ?? 0}</td>
                      <td className="py-2 pr-4">{campaign.click_count ?? 0}</td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => loadCampaignIntoEditor(campaign)}
                            className="text-xs font-medium text-primary"
                          >
                            Edit
                          </button>
                          {campaign.status === "draft" || campaign.status === "scheduled" ? (
                            <>
                              <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="rounded border border-border px-2 py-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => void handleSchedule(campaign.id)}
                                className="text-xs font-medium text-zbc-gray-700"
                              >
                                Schedule
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleSend(campaign.id)}
                                className="text-xs font-medium text-zbc-gray-700"
                              >
                                Send now
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
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
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-border/70">
                    <td className="py-2 pr-4">{subscriber.email}</td>
                    <td className="py-2 pr-4 capitalize">{subscriber.status}</td>
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
                      <button
                        type="button"
                        onClick={() => void handleDeleteSubscriber(subscriber.id)}
                        className="text-xs font-medium text-red-600"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
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
