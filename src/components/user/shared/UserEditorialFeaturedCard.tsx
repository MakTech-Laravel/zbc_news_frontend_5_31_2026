import { Clock, Quote } from "lucide-react";

import { UserCategoryBadge } from "@/components/user/dashboard/UserCategoryBadge";
import { UserDashboardCard } from "@/components/user/dashboard/UserDashboardCard";

type UserEditorialFeaturedCardProps = {
  category: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  publishedAt: string;
};

export function UserEditorialFeaturedCard({
  category,
  title,
  excerpt,
  author,
  readTime,
  publishedAt,
}: UserEditorialFeaturedCardProps) {
  return (
    <UserDashboardCard>
      <div className="flex gap-4 p-6">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-deep">
          <Quote className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <UserCategoryBadge label={category} className="bg-zbc-gray-1000 text-primary-foreground" />
          <h2 className="font-inter text-2xl font-semibold leading-8 text-zbc-gray-1000">{title}</h2>
          <p className="text-base font-inter leading-6 text-zbc-gray-500">{excerpt}</p>
          <p className="flex flex-wrap items-center gap-2 text-sm text-admin-label">
            <span className="font-medium text-admin-heading">{author}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {readTime}
            </span>
            <span>·</span>
            <span>{publishedAt}</span>
          </p>
        </div>
      </div>
    </UserDashboardCard>
  );
}
