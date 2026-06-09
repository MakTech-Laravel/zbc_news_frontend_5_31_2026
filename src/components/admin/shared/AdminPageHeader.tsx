import { Plus } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  actions,
  actionLabel,
  onAction,
  actionIcon,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-admin-heading sm:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-admin-label sm:text-base">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          {actions}
        </div>
      ) : actionLabel ? (
        <Button
          type="button"
          onClick={onAction}
          className="h-10 w-full gap-2 rounded-[10px] bg-zbc-blue px-4 text-base font-medium hover:bg-zbc-blue/90 sm:w-auto"
        >
          {actionIcon ?? <Plus className="size-5" aria-hidden />}
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
