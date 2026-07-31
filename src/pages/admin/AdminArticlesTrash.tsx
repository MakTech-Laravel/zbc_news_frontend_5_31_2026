import * as React from "react";
import { Loader2, Trash2, Undo2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePermission, PERMISSIONS } from "@/hooks/usePermission";

const PAGE_SIZE = 10;

export default function AdminArticlesTrash() {
  const { can } = usePermission();
  const canRestore = can(PERMISSIONS.ARTICLES.RESTORE);
  const canForceDelete = can(PERMISSIONS.ARTICLES.FORCE_DELETE);

  const [articles, setArticles] = React.useState<AdminArticle[]>([]);
  const [categories, setCategories] = React.useState<AdminArticleApiCategory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [pendingForceDelete, setPendingForceDelete] =
    React.useState<AdminArticle | null>(null);
  const [deleting, setDeleting] = React.useState(false);

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

  const confirmPermanentDelete = React.useCallback(async () => {
    if (!pendingForceDelete) return;
    setDeleting(true);
    try {
      await permanentlyDeleteAdminArticle(pendingForceDelete.slug);
      toast.success("Article permanently deleted");
      setPendingForceDelete(null);
      await fetchArticles();
    } catch (error) {
      console.error("Failed to permanently delete article:", error);
      toast.error("Failed to permanently delete article");
    } finally {
      setDeleting(false);
    }
  }, [fetchArticles, pendingForceDelete]);

  const actions = React.useMemo<DataTableAction<AdminArticle>[]>(() => {
    const next: DataTableAction<AdminArticle>[] = [];

    if (canRestore) {
      next.push({
        id: "restore",
        label: "Restore article",
        icon: Undo2,
        variant: "primary",
        onClick: restore,
      });
    }

    if (canForceDelete) {
      next.push({
        id: "permanent-delete",
        label: "Permanently delete article",
        icon: Trash2,
        variant: "destructive",
        onClick: (article) => setPendingForceDelete(article),
      });
    }

    return next;
  }, [canRestore, canForceDelete, restore]);

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

      <Dialog
        open={Boolean(pendingForceDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingForceDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently delete article?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Permanently delete{" "}
                  <span className="font-medium text-foreground">
                    “{pendingForceDelete?.title}”
                  </span>
                  ?
                </p>
                <p className="font-medium text-destructive">
                  This cannot be undone. The article and its associated images will be
                  removed forever.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setPendingForceDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              disabled={deleting}
              onClick={() => void confirmPermanentDelete()}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Confirm permanent delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
