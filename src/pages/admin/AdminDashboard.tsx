import {
  Activity,
  CalendarClock,
  DollarSign,
  Eye,
  FileText,
  Users,
} from "lucide-react";

import { AdminMetricCard } from "@/components/admin/dashboard/AdminMetricCard";
import { RecentArticlesCard } from "@/components/admin/dashboard/RecentArticlesCard";
import { RevenueAnalyticsChart } from "@/components/admin/dashboard/RevenueAnalyticsChart";
import { TopPerformingArticlesCard } from "@/components/admin/dashboard/TopPerformingArticlesCard";
import { TrafficOverviewChart } from "@/components/admin/dashboard/TrafficOverviewChart";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { useNavigate } from "react-router-dom";

const PRIMARY_METRICS = [
  {
    label: "Published Articles",
    value: "1,248",
    trend: "+12.5%",
    iconTone: "blue" as const,
    Icon: FileText,
  },
  {
    label: "Active Users",
    value: "45,234",
    trend: "+8.2%",
    iconTone: "green" as const,
    Icon: Users,
  },
  {
    label: "Total Page Views",
    value: "2.4M",
    trend: "+15.3%",
    iconTone: "purple" as const,
    Icon: Eye,
  },
  {
    label: "Revenue (MTD)",
    value: "$41,800",
    trend: "+18.7%",
    iconTone: "orange" as const,
    Icon: DollarSign,
  },
];

const SECONDARY_METRICS = [
  {
    label: "Draft Articles",
    value: "87",
    iconTone: "yellow" as const,
    Icon: FileText,
  },
  {
    label: "Scheduled Posts",
    value: "24",
    iconTone: "indigo" as const,
    Icon: CalendarClock,
  },
  {
    label: "Engagement Rate",
    value: "68%",
    trend: "+5.2%",
    iconTone: "red" as const,
    Icon: Activity,
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard Overview"
        description="Welcome back, here's what's happening today"
        actionLabel="Create New Article"
        onAction={() => navigate("/admin/articles/create")}
      />

      <section className="grid gap-6 xl:grid-cols-4">
        {PRIMARY_METRICS.map((metric) => (
          <AdminMetricCard key={metric.label} {...metric} trendDirection="up" />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {SECONDARY_METRICS.map((metric) => (
          <AdminMetricCard key={metric.label} {...metric} trendDirection="up" />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <TrafficOverviewChart />
          <RevenueAnalyticsChart />
        </div>
        <div className="space-y-6">
          <RecentArticlesCard />
          <TopPerformingArticlesCard />
        </div>
      </section>
    </div>
  );
}
