import { request } from "@/api/request";

export type NewsletterSubscriber = {
  id: number;
  email: string;
  name?: string | null;
  status: "pending" | "verified" | "unsubscribed";
  created_at: string;
  verified_at?: string | null;
};

export type NewsletterCampaign = {
  id: number;
  title: string;
  subject: string;
  status: "draft" | "scheduled" | "sent";
  scheduled_at?: string | null;
  sent_at?: string | null;
  subscriber_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
};

export async function fetchNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const response = await request.get("/admin/newsletter/subscribers");
  const rows = response.data?.data?.data;
  return Array.isArray(rows) ? rows : [];
}

export async function fetchNewsletterCampaigns(): Promise<NewsletterCampaign[]> {
  const response = await request.get("/admin/newsletter/campaigns");
  const rows = response.data?.data?.data;
  return Array.isArray(rows) ? rows : [];
}

export async function createNewsletterCampaign(payload: {
  title: string;
  subject: string;
  content_html: string;
  status?: "draft" | "scheduled" | "sent";
  scheduled_at?: string;
  segments?: string[];
}): Promise<void> {
  await request.post("/admin/newsletter/campaigns/store", payload);
}

