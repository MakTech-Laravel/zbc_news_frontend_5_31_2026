import { request } from "@/api/request";

export type AdminMetricItem = {
  label: string;
  value: string | number;
  trend?: string;
  iconTone: "blue" | "green" | "purple" | "orange" | "yellow" | "indigo" | "red";
};

export type AdminTrafficChart = {
  labels: string[];
  visitors: number[];
  page_views: number[];
};

export type AdminRevenueChart = {
  labels: string[];
  ad_revenue: number[];
  subscriptions: number[];
};

export type AdminRecentArticle = {
  id: number;
  title: string;
  status: string;
  statusLabel: string;
  timeAgo: string;
};

export type AdminTopArticle = {
  rank: number;
  title: string;
  category: string;
  categoryLabel: string;
  views: number;
  trend: "up" | "down";
};

export type AdminDashboardOverview = {
  primary_metrics: AdminMetricItem[];
  secondary_metrics: AdminMetricItem[];
  traffic_chart: AdminTrafficChart;
  revenue_chart: AdminRevenueChart;
  recent_articles: AdminRecentArticle[];
  top_articles: AdminTopArticle[];
};

export async function fetchAdminDashboardOverview(): Promise<AdminDashboardOverview> {
  const response = await request.get("/admin/dashboard/overview");
  const d = response.data?.data ?? response.data;
  return d as AdminDashboardOverview;
}
