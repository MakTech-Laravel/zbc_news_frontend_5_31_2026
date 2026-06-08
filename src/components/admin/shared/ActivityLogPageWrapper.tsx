import { ArrowLeft, History, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { AdminPanel } from "@/components/admin/shared/AdminPanel";

type ActivityLogPageWrapperProps = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  backTo: string;
  backLabel?: string;
  headerIcon?: LucideIcon;
  loading: boolean;
  isEmpty: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  children: ReactNode;
  pagination?: ReactNode;
};

export function ActivityLogPageWrapper({
  title,
  subtitle,
  meta,
  backTo,
  backLabel = "Back",
  headerIcon: HeaderIcon = History,
  loading,
  isEmpty,
  emptyTitle = "No activity logs found",
  emptyDescription = "No activity logs available.",
  emptyIcon: EmptyIcon = History,
  children,
  pagination,
}: ActivityLogPageWrapperProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 text-sm font-medium text-admin-label transition-colors hover:text-admin-heading"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {backLabel}
      </Link>

      <AdminPanel>
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-admin-label">
            <HeaderIcon className="size-4" aria-hidden />
            {title}
          </div>
          {subtitle ? (
            <h1 className="text-xl font-bold text-admin-heading sm:text-2xl">{subtitle}</h1>
          ) : null}
          {meta ? <div className="mt-2 text-sm text-admin-label">{meta}</div> : null}
        </div>
      </AdminPanel>

      <AdminPanel padding="none" className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : isEmpty ? (
          <div className="px-4 py-16 text-center sm:px-6">
            <EmptyIcon className="mx-auto size-10 text-admin-trend-muted" aria-hidden />
            <p className="mt-4 text-base font-medium text-admin-heading">{emptyTitle}</p>
            <p className="mt-1 text-sm text-admin-label">{emptyDescription}</p>
          </div>
        ) : (
          children
        )}
      </AdminPanel>

      {!loading && !isEmpty ? pagination : null}
    </div>
  );
}
