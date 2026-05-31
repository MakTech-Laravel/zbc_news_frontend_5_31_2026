import type { LucideIcon } from "lucide-react";

import {
  AdminStatusBadge,
  type AdminBadgeVariant,
} from "@/components/admin/shared/AdminStatusBadge";
import type {
  DataTableBadgeValue,
  DataTableColumn,
} from "@/components/ui/data-table/types";
import { HeaderAvatar } from "@/components/ui/HeaderAvatar";
import { cn } from "@/lib/utils";

const ADMIN_BADGE_VARIANTS = new Set<string>([
  "published",
  "draft",
  "scheduled",
  "pending_review",
  "archived",
  "politics",
  "technology",
  "sports",
]);

function isAdminBadgeVariant(v: string): v is AdminBadgeVariant {
  return ADMIN_BADGE_VARIANTS.has(v);
}

function BadgeCell({ value }: { value: DataTableBadgeValue }) {
  if (isAdminBadgeVariant(value.variant)) {
    return (
      <AdminStatusBadge variant={value.variant}>
        {value.label}
      </AdminStatusBadge>
    );
  }

  return (
    <span className="inline-flex h-6 items-center rounded bg-muted px-2 text-xs leading-4 text-foreground">
      {value.label ?? value.variant}
    </span>
  );
}

function AvatarCircle({
  src,
  fallback,
  alt,
  size = "md",
}: {
  src?: string | null;
  fallback: string;
  alt: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "size-8" : "size-10";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-zbc-blue",
        sizeClass,
      )}
    >
      {src ? (
        <HeaderAvatar src={src} alt={alt} className={cn(sizeClass, "rounded-full")} />
      ) : (
        <span className="inline-flex size-full items-center justify-center text-xs font-semibold text-white">
          {fallback}
        </span>
      )}
    </span>
  );
}

function resolveCellType<T>(column: DataTableColumn<T>): DataTableColumn<T>["type"] {
  if (column.type) return column.type;
  if (column.render) return "custom";
  if (column.badge) return "badge";
  if (column.avatarStack) return "avatarStack";
  if (column.avatar) return "avatar";
  if (column.icon && column.iconText) return "iconText";
  if (column.primary) return "stack";
  if (column.accessor) return "text";
  return "text";
}

type DataTableCellProps<T> = {
  column: DataTableColumn<T>;
  row: T;
};

export function DataTableCell<T>({ column, row }: DataTableCellProps<T>) {
  const type = resolveCellType(column);

  switch (type) {
    case "custom":
      return <>{column.render?.(row)}</>;

    case "badge": {
      const value = column.badge?.(row);
      if (!value) return <span className="text-sm text-admin-trend-muted">—</span>;
      return <BadgeCell value={value} />;
    }

    case "avatar": {
      const cfg = column.avatar;
      const fallback = cfg?.fallback?.(row) ?? "?";
      const alt = cfg?.alt?.(row) ?? fallback;
      return (
        <AvatarCircle
          src={cfg?.src?.(row)}
          fallback={fallback}
          alt={alt}
        />
      );
    }

    case "avatarStack": {
      const cfg = column.avatarStack!;
      const fallback = cfg.fallback?.(row) ?? "?";
      const alt = cfg.alt?.(row) ?? fallback;
      return (
        <div className="flex items-center gap-2 sm:gap-3">
          <AvatarCircle
            src={cfg.src?.(row)}
            fallback={fallback}
            alt={alt}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-admin-heading">{cfg.primary(row)}</p>
            {cfg.secondary ? (
              <p className="truncate text-sm text-admin-trend-muted">{cfg.secondary(row)}</p>
            ) : null}
          </div>
        </div>
      );
    }

    case "stack":
      return (
        <div className="min-w-0">
          <p className="font-medium text-admin-heading">{column.primary?.(row) ?? "—"}</p>
          {column.secondary ? (
            <p className="text-sm text-admin-trend-muted">{column.secondary(row)}</p>
          ) : null}
        </div>
      );

    case "iconText": {
      const Icon = column.icon as LucideIcon;
      const text = column.iconText?.(row) ?? String(column.accessor?.(row) ?? "—");
      return (
        <span className="inline-flex items-center gap-1 text-sm text-admin-heading">
          {Icon ? <Icon className="size-4 text-admin-trend-muted" aria-hidden /> : null}
          {text}
        </span>
      );
    }

    case "text":
    default: {
      const value = column.accessor?.(row);
      return (
        <span className="text-sm text-admin-heading">
          {value === null || value === undefined || value === "" ? "—" : String(value)}
        </span>
      );
    }
  }
}
