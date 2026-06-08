import * as React from "react";
import { Trash2, Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableAction } from "@/components/ui/data-table/types";
import {
  ARTICLE_STATUS_FILTER_OPTIONS,
  type AdminArticle,
} from "@/data/admin/mockArticles";
import {
  buildArticleCategoryFilterOptions,
  fetchAdminTrashedArticles,
  matchesArticleSearch,
  permanentlyDeleteAdminArticle,
  restoreAdminArticle,
  type AdminArticleApiCategory,
} from "@/services/admin/articles";
import { useArticlesDataTable } from "@/components/admin/articles/useArticlesDataTable";
import { Button } from "@/components/ui/button";
import { request } from "@/api/request";

const PAGE_SIZE = 10;

export default function AdminArticlesTrash() {
  const [articles, setArticles] = React.useState<AdminArticle[]>([]);
  const [categories, setCategories] = React.useState<AdminArticleApiCategory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const fetchArticles = React.useCallback(async () => {
    try {
      setLoading(true);
      const { articles: nextArticles, categories: nextCategories } =
        await fetchAdminTrashedArticles();
      setArticles(nextArticles);
      setCategories(nextCategories);
    } catch (error) {
      console.error("Failed to fetch trashed articles:", error);
      toast.error("Failed to load trashed articles");
      setArticles([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchArticles();
  }, [fetchArticles]);

  const categoryOptions = React.useMemo(
    () => buildArticleCategoryFilterOptions(categories, articles),
    [categories, articles],
  );

  const filtered = React.useMemo(() => {
    return articles.filter((article) => {
      if (!matchesArticleSearch(article, search)) return false;
      if (statusFilter !== "all" && article.status !== statusFilter) return false;
      if (categoryFilter !== "all" && article.category !== categoryFilter) return false;
      return true;
    });
  }, [articles, search, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const restore = React.useCallback(
    async (article: AdminArticle) => {
      try {
        await restoreAdminArticle(article.slug);
        toast.success("Article restored successfully");
        await fetchArticles();
      } catch (error) {
        console.error("Failed to restore article:", error);
        toast.error("Failed to restore article");
      }
    },
    [fetchArticles],
  );

  const permanentDelete = React.useCallback(
    async (article: AdminArticle) => {
      try {
        await permanentlyDeleteAdminArticle(article.slug);
        toast.success("Article permanently deleted");
        await fetchArticles();
      } catch (error) {
        console.error("Failed to permanently delete article:", error);
        toast.error("Failed to permanently delete article");
      }
    },
    [fetchArticles],
  );

  const actions = React.useMemo<DataTableAction<AdminArticle>[]>(
    () => [
      {
        id: "restore",
        label: "Restore article",
        icon: Undo2,
        variant: "primary",
        onClick: restore,
      },
      {
        id: "permanent-delete",
        label: "Permanently delete article",
        icon: Trash2,
        variant: "destructive",
        onClick: permanentDelete,
      },
    ],
    [restore, permanentDelete],
  );

  const table = useArticlesDataTable({
    data: paged,
    selectedIds,
    onSelectionChange: setSelectedIds,
    actions,
    emptyMessage: "No trashed articles match your filters.",
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Article Trash"
        description="Restore or permanently delete trashed articles."
        actions={
          <>
            <Button asChild variant="outline" className="h-10 w-full sm:w-auto">
              <Link to="/admin/articles">Back to Articles</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void fetchArticles()}
              className="h-10 w-full gap-2 sm:w-auto"
            >
              <Trash2 className="size-4" aria-hidden />
              Refresh
            </Button>
          </>
        }
      />

      <AdminPanel>
        <AdminFilterBar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search trashed articles by title or author..."
          statusValue={statusFilter}
          onStatusChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          statusOptions={[...ARTICLE_STATUS_FILTER_OPTIONS]}
          categoryValue={categoryFilter}
          onCategoryChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
          categoryOptions={categoryOptions}
        />
      </AdminPanel>

      <AdminPanel padding="none" className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <DataTable {...table} />
        )}
      </AdminPanel>

      <AdminPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

