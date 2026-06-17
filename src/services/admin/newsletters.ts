import { request } from "@/api/request";

export type NewsletterSubscriber = {
  id: number;
  email: string;
  name?: string | null;
  status: "pending" | "verified" | "unsubscribed";
  source?: string | null;
  preferences?: { categories?: string[] } | null;
  is_premium?: boolean;
  created_at: string;
  verified_at?: string | null;
};

export type NewsletterCampaign = {
  id: number;
  title: string;
  subject: string;
  preview_text?: string | null;
  content_html?: string;
  status: "draft" | "scheduled" | "sending" | "sent";
  scheduled_at?: string | null;
  sent_at?: string | null;
  subscriber_count: number;
  open_count: number;
  click_count: number;
  failed_count?: number;
  premium_only?: boolean;
  segments?: {
    category_slugs?: string[];
    audience_tags?: string[];
  } | null;
  created_at: string;
};

export type NewsletterAnalytics = {
  subscribers: {
    verified: number;
    pending: number;
    unsubscribed: number;
    total: number;
  };
  growth: { date: string; count: number }[];
  campaigns: {
    id: number;
    title: string;
    sent_at?: string | null;
    subscriber_count: number;
    open_count: number;
    click_count: number;
    failed_count: number;
    open_rate: number;
    click_rate: number;
  }[];
  recent_events: {
    id: number;
    event_type: string;
    campaign?: string | null;
    email?: string | null;
    created_at: string;
  }[];
  engagement: {
    emails_sent: number;
    opens: number;
    clicks: number;
    avg_open_rate: number;
    avg_click_rate: number;
  };
};

export type NewsletterCategory = {
  id: number;
  name: string;
  slug: string;
};

function extractPaginatedRows(body: unknown): unknown[] {
  if (!body || typeof body !== "object") return [];
  const root = body as Record<string, unknown>;
  const data = root.data as Record<string, unknown> | undefined;
  const rows = data?.data;
  return Array.isArray(rows) ? rows : [];
}

function extractData<T>(body: unknown): T {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid API response");
  }
  const root = body as Record<string, unknown>;
  return (root.data ?? root) as T;
}

export async function fetchNewsletterAnalytics(): Promise<NewsletterAnalytics> {
  const response = await request.get("/admin/newsletter/analytics");
  return extractData<NewsletterAnalytics>(response.data);
}

export async function fetchNewsletterSubscribers(status?: string): Promise<NewsletterSubscriber[]> {
  const response = await request.get("/admin/newsletter/subscribers", {
    params: status ? { status } : undefined,
  });
  return extractPaginatedRows(response.data) as NewsletterSubscriber[];
}

export async function deleteNewsletterSubscriber(id: number): Promise<void> {
  await request.delete(`/admin/newsletter/subscribers/${id}`);
}

export async function fetchNewsletterCampaigns(): Promise<NewsletterCampaign[]> {
  const response = await request.get("/admin/newsletter/campaigns");
  return extractPaginatedRows(response.data) as NewsletterCampaign[];
}

export async function fetchNewsletterCampaign(id: number): Promise<NewsletterCampaign> {
  const response = await request.get(`/admin/newsletter/campaigns/${id}`);
  return extractData<NewsletterCampaign>(response.data);
}

export async function fetchNewsletterCategories(): Promise<NewsletterCategory[]> {
  const response = await request.get("/admin/newsletter/categories");
  const data = extractData<NewsletterCategory[]>(response.data);
  return Array.isArray(data) ? data : [];
}

export async function createNewsletterCampaign(payload: {
  title: string;
  subject: string;
  preview_text?: string;
  content_html: string;
  status?: "draft" | "scheduled";
  scheduled_at?: string;
  category_slugs?: string[];
  premium_only?: boolean;
}): Promise<NewsletterCampaign> {
  const response = await request.post("/admin/newsletter/campaigns/store", payload);
  return extractData<NewsletterCampaign>(response.data);
}

export async function updateNewsletterCampaign(
  id: number,
  payload: Partial<{
    title: string;
    subject: string;
    preview_text: string;
    content_html: string;
    category_slugs: string[];
    premium_only: boolean;
  }>,
): Promise<NewsletterCampaign> {
  const response = await request.post(`/admin/newsletter/campaigns/update/${id}`, payload);
  return extractData<NewsletterCampaign>(response.data);
}

export async function scheduleNewsletterCampaign(id: number, scheduledAt: string): Promise<void> {
  await request.post(`/admin/newsletter/campaigns/schedule/${id}`, {
    scheduled_at: scheduledAt,
  });
}

export async function sendNewsletterCampaign(id: number): Promise<void> {
  await request.post(`/admin/newsletter/campaigns/send/${id}`);
}
