import { request } from "@/api/request";

export type AdminAdSlot = {
  id: number;
  slot_key: string;
  name: string;
  placement?: string | null;
  provider: "manual" | "google";
  is_active: boolean;
  google_ad_client?: string | null;
  google_ad_slot?: string | null;
  manual_image_url?: string | null;
  manual_click_url?: string | null;
  manual_html?: string | null;
};

export type AdminNavigationLink = {
  id: number;
  location: string;
  label: string;
  url: string;
  icon?: string | null;
  sort_order: number;
  is_active: boolean;
};

export async function fetchAdminAdSlots(): Promise<AdminAdSlot[]> {
  const response = await request.get("/admin/ad-slots");
  return Array.isArray(response.data?.data) ? response.data.data : [];
}

export type AdminAdSlotUpdatePayload = Partial<AdminAdSlot> & {
  manual_image?: File;
};

export async function updateAdminAdSlot(
  id: number,
  payload: AdminAdSlotUpdatePayload,
): Promise<void> {
  const { manual_image, ...rest } = payload;

  if (manual_image) {
    const formData = new FormData();
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value));
      }
    });
    formData.append("manual_image", manual_image);
    await request.post(`/admin/ad-slots/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return;
  }

  await request.post(`/admin/ad-slots/update/${id}`, rest);
}

export async function fetchAdminNavigationLinks(location?: string): Promise<AdminNavigationLink[]> {
  const response = await request.get("/admin/navigation-links", {
    params: location ? { location } : undefined,
  });
  return Array.isArray(response.data?.data) ? response.data.data : [];
}

export async function createAdminNavigationLink(
  payload: Omit<AdminNavigationLink, "id">,
): Promise<void> {
  await request.post("/admin/navigation-links/store", payload);
}

export async function updateAdminNavigationLink(
  id: number,
  payload: Partial<AdminNavigationLink>,
): Promise<void> {
  await request.post(`/admin/navigation-links/update/${id}`, payload);
}

export async function deleteAdminNavigationLink(id: number): Promise<void> {
  await request.delete(`/admin/navigation-links/delete/${id}`);
}

export type MonetizationMetric = {
  value: number;
  previous: number;
  trend_percent: number;
  trend_direction: "up" | "down";
  format: "currency" | "count" | "percent";
};

export type MonetizationOverview = {
  metrics: {
    today_revenue: MonetizationMetric;
    week_revenue: MonetizationMetric;
    total_impressions: MonetizationMetric;
    average_ctr: MonetizationMetric;
  };
  monthly_earnings: Array<{
    label: string;
    ad_revenue_cents: number;
    subscription_revenue_cents: number;
  }>;
  weekly_performance: Array<{
    label: string;
    impressions: number;
    revenue_cents: number;
  }>;
  placements: Array<{
    id: number;
    slot_key: string;
    name: string;
    placement?: string | null;
    is_active: boolean;
    impressions: number;
    clicks: number;
    ctr: number;
    revenue_cents: number;
  }>;
};

export async function fetchMonetizationOverview(): Promise<MonetizationOverview | null> {
  const response = await request.get("/admin/monetization/overview");
  const data = response.data?.data;
  if (!data || typeof data !== "object") return null;
  return data as MonetizationOverview;
}

export function formatMonetizationMetric(metric: MonetizationMetric): string {
  if (metric.format === "currency") {
    return formatCurrencyCents(metric.value);
  }
  if (metric.format === "percent") {
    return `${metric.value.toFixed(1)}%`;
  }
  return formatCompactCount(metric.value);
}

export function formatCurrencyCents(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(dollars >= 10000 ? 0 : 1)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: dollars >= 100 ? 0 : 2,
  }).format(dollars);
}

export function formatCompactCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatTrendPercent(metric: MonetizationMetric): string {
  const sign = metric.trend_percent > 0 ? "+" : "";
  return `${sign}${metric.trend_percent}%`;
}

