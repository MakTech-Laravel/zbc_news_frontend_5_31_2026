import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import {
  createNewsletterCampaign,
  fetchNewsletterCampaigns,
  fetchNewsletterSubscribers,
  type NewsletterCampaign,
  type NewsletterSubscriber,
} from "@/services/admin/newsletters";

export default function AdminNewsletters() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  async function loadData() {
    const [subs, camps] = await Promise.all([
      fetchNewsletterSubscribers(),
      fetchNewsletterCampaigns(),
    ]);
    setSubscribers(subs);
    setCampaigns(camps);
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreateCampaign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !contentHtml.trim()) return;

    try {
      await createNewsletterCampaign({
        title: title.trim(),
        subject: subject.trim(),
        content_html: contentHtml,
        status: "draft",
      });
      setTitle("");
      setSubject("");
      setContentHtml("");
      toast.success("Newsletter campaign created");
      await loadData();
    } catch {
      toast.error("Failed to create campaign");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletters"
        description="Manage subscribers, campaigns, and newsletter delivery workflows"
      />

      <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-zbc-gray-1000">Create Campaign</h2>
        <form onSubmit={(e) => void handleCreateCampaign(e)} className="mt-4 space-y-3">
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
          <textarea
            className="min-h-40 w-full rounded-md border border-border px-3 py-2 text-sm"
            placeholder="Campaign HTML content"
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Save Campaign
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-zbc-gray-1000">Subscribers</h2>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-zbc-gray-500">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Subscribed At</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-border/70">
                  <td className="py-2 pr-4">{subscriber.email}</td>
                  <td className="py-2 pr-4 capitalize">{subscriber.status}</td>
                  <td className="py-2 pr-4">
                    {subscriber.created_at ? new Date(subscriber.created_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-zbc-gray-1000">Campaigns</h2>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-zbc-gray-500">
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Subscribers</th>
                <th className="py-2 pr-4">Opens</th>
                <th className="py-2 pr-4">Clicks</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

