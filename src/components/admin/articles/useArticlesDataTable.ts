import { Eye, History, Pencil, Trash2 } from "lucide-react";
import * as React from "react";

import type { DataTableAction, DataTableColumn } from "@/components/ui/data-table";
import { useDataTable } from "@/components/ui/data-table";
import type { AdminArticle } from "@/data/admin/mockArticles";
import {
  ARTICLE_STATUS_LABELS,
  formatArticleLastSaved,
} from "@/data/admin/articleWorkflow";
import { ARTICLE_VISIBILITY_LABELS } from "@/data/admin/articleVisibility";

function formatViews(views: number) {
  return views.toLocaleString("en-US");
}

const ARTICLES_COLUMNS: DataTableColumn<AdminArticle>[] = [
  {
    id: "title",
    header: "Title",
    type: "stack",
    primary: (row) => row.title,
    secondary: (row) => {
      const draftHint = row.hasUnsavedDraft ? " • Unsaved draft" : "";
      return `by ${row.author}${draftHint}`;
    },
    className: "max-w-md min-w-[180px]",
  },
  {
    id: "status",
    header: "Status",
    hideOnMobile: true,
    type: "badge",
    badge: (row) => ({
      variant: row.status,
      label: ARTICLE_STATUS_LABELS[row.status],
    }),
    className: "whitespace-nowrap",
  },
  {
    id: "visibility",
    header: "Visibility",
    hideOnMobile: true,
    type: "text",
    accessor: (row) => ARTICLE_VISIBILITY_LABELS[row.visibility],
    className: "whitespace-nowrap",
  },
  {
    id: "category",
    header: "Category",
    hideOnMobile: true,
    type: "text",
    accessor: (row) => row.category,
    className: "whitespace-nowrap",
  },
  {
    id: "views",
    header: "Views",
    hideOnMobile: true,
    type: "iconText",
    icon: Eye,
    iconText: (row) => formatViews(row.views),
    className: "whitespace-nowrap",
  },
  {
    id: "lastSaved",
    header: "Last saved",
    hideOnMobile: true,
    type: "text",
    accessor: (row) => formatArticleLastSaved(row.lastSavedAt),
    className: "whitespace-nowrap text-admin-trend-muted text-xs",
  },
  {
    id: "date",
    header: "Published",
    hideOnMobile: true,
    type: "text",
    accessor: (row) => row.date,
    className: "whitespace-nowrap text-admin-trend-muted",
  },
  {
    id: "updatedAt",
    header: "Updated",
    hideOnMobile: true,
    type: "text",
    accessor: (row) => row.updatedAt ?? "—",
    className: "whitespace-nowrap text-admin-trend-muted text-xs",
  },
];

export type UseArticlesDataTableOptions = {
  data: AdminArticle[];
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onEdit?: (article: AdminArticle) => void;
  onActivityLog?: (article: AdminArticle) => void;
  onDelete?: (article: AdminArticle) => void;
  actions?: DataTableAction<AdminArticle>[];
  columns?: DataTableColumn<AdminArticle>[];
  emptyMessage?: string;
};

export function useArticlesDataTable(options: UseArticlesDataTableOptions) {
  const { onEdit, onActivityLog, onDelete, actions, columns, ...rest } = options;

  const resolvedActions = React.useMemo<DataTableAction<AdminArticle>[]>(() => {
    if (actions) return actions;

    const built: DataTableAction<AdminArticle>[] = [];

    if (onEdit) {
      built.push({
        id: "edit",
        label: "Edit article",
        icon: Pencil,
        variant: "primary",
        onClick: onEdit,
      });
    }

    if (onActivityLog) {
      built.push({
        id: "activity-log",
        label: "View activity log",
        icon: History,
        variant: "muted",
        onClick: onActivityLog,
      });
    }

    if (onDelete) {
      built.push({
        id: "delete",
        label: "Delete article",
        icon: Trash2,
        variant: "destructive",
        onClick: onDelete,
      });
    }

    return built;
  }, [actions, onEdit, onActivityLog, onDelete]);

  return useDataTable<AdminArticle>({
    getRowId: (row: AdminArticle) => row.id,
    columns: columns ?? ARTICLES_COLUMNS,
    actions: resolvedActions,
    selectable: true,
    emptyMessage: "No articles match your filters.",
    ...rest,
  });
}
