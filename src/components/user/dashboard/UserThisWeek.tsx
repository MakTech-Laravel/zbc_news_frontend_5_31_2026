import {
  UserDashboardCard,
  UserDashboardCardHeader,
} from "@/components/user/dashboard/UserDashboardCard";
import { userThisWeekStats } from "@/data/dummy/userDashboard";

type StatRowProps = {
  label: string;
  value: string;
  progress: number;
};

function StatRow({ label, value, progress }: StatRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-admin-label">{label}</span>
        <span className="font-semibold text-admin-heading">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-zbc-blue transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

type UserThisWeekProps = {
  stats?: {
    articlesRead: { value: number; progress: number };
    readingTime: { value: string; progress: number };
  };
};

export function UserThisWeek({ stats }: UserThisWeekProps) {
  const { articlesRead, readingTime } = stats ?? userThisWeekStats;

  return (
    <UserDashboardCard>
      <UserDashboardCardHeader title="This Week" />
      <div className="space-y-5 p-6">
        <StatRow
          label="Articles Read"
          value={String(articlesRead.value)}
          progress={articlesRead.progress}
        />
        <StatRow
          label="Reading Time"
          value={readingTime.value}
          progress={readingTime.progress}
        />
      </div>
    </UserDashboardCard>
  );
}
