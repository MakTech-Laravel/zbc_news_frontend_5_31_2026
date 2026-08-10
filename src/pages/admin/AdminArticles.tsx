import * as React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, Trash2 } from "lucide-react";

import { useArticlesDataTable } from "@/components/admin/articles/useArticlesDataTable";
import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { DataTable } from "@/components/ui/data-table";
import { request } from "@/api/request";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ARTICLE_STATUS_FILTER_OPTIONS,
  type AdminArticle,
} from "@/data/admin/mockArticles";
import {
  buildArticleCategoryFilterOptions,
  buildArchiveAuthorFilterOptions,
  buildArchiveMonthFilterOptions,
  buildArchiveYearFilterOptions,
  fetchAdminArticles,
  matchesArchivedArticleFilters,
  matchesArticleSearch,
  type AdminArticleApiCategory,
} from "@/services/admin/articles";
import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { DEFAULT_SITE_TIMEZONE } from "@/lib/articleTimestamps";
import { usePermission, PERMISSIONS } from "@/hooks/usePermission";

const PAGE_SIZE = 10;

export default function AdminArticles() {
  const navigate = useNavigate();
  const { can } = usePermission();
  const { settings } = useSiteSettings();
  const timeZone = settings.timezone || DEFAULT_SITE_TIMEZONE;

  const canCreate = can(PERMISSIONS.ARTICLES.CREATE);
  const canDelete = can(PERMISSIONS.ARTICLES.DELETE);
  const canTrashed = can(PERMISSIONS.ARTICLES.TRASHED);
  const canUpdate = can(PERMISSIONS.ARTICLES.UPDATE);
  const canActivities = can(PERMISSIONS.ARTICLES.ACTIVITIES);
  const canRevisions = can(PERMISSIONS.ARTICLES.REVISIONS);

  const [articles, setArticles] = React.useState<AdminArticle[]>([]);
  const [categories, setCategories] = React.useState<AdminArticleApiCategory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [archiveYearFilter, setArchiveYearFilter] = React.useState("all");
  const [archiveMonthFilter, setArchiveMonthFilter] = React.useState("all");
  const [archiveAuthorFilter, setArchiveAuthorFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = React.useState<AdminArticle | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchArticles = React.useCallback(async () => {
    try {
      setLoading(true);
      const { articles: nextArticles, categories: nextCategories } =
        await fetchAdminArticles();
      setArticles(nextArticles);
      setCategories(nextCategories);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      toast.error("Failed to load articles");
      setArticles([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchArticles();
  }, [fetchArticles]);

  React.useEffect(() => {
    const onFocus = () => void fetchArticles();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchArticles]);

  const categoryOptions = React.useMemo(
    () => buildArticleCategoryFilterOptions(categories, articles),
    [categories, articles],
  );

  const isArchiveView = statusFilter === "archived";

  const archiveYearOptions = React.useMemo(
    () => buildArchiveYearFilterOptions(articles),
    [articles],
  );

  const archiveMonthOptions = React.useMemo(
    () => buildArchiveMonthFilterOptions(articles, archiveYearFilter),
    [articles, archiveYearFilter],
  );

  const archiveAuthorOptions = React.useMemo(
    () => buildArchiveAuthorFilterOptions(articles),
    [articles],
  );

  React.useEffect(() => {
    if (!isArchiveView) {
      setArchiveYearFilter("all");
      setArchiveMonthFilter("all");
      setArchiveAuthorFilter("all");
    }
  }, [isArchiveView]);

  React.useEffect(() => {
    setArchiveMonthFilter("all");
  }, [archiveYearFilter]);

  const draftCount = React.useMemo(
    () => articles.filter((a) => a.status === "draft" || a.hasUnsavedDraft).length,
    [articles],
  );

  const filtered = React.useMemo(() => {
    return articles.filter((article) => {
      if (!matchesArticleSearch(article, search)) return false;
      if (statusFilter !== "all" && article.status !== statusFilter) return false;
      if (categoryFilter !== "all" && article.category !== categoryFilter) return false;
      if (
        isArchiveView &&
        !matchesArchivedArticleFilters(article, {
          year: archiveYearFilter,
          month: archiveMonthFilter,
          category: categoryFilter,
          author: archiveAuthorFilter,
        })
      ) {
        return false;
      }
      return true;
    });
  }, [
    articles,
    search,
    statusFilter,
    categoryFilter,
    isArchiveView,
    archiveYearFilter,
    archiveMonthFilter,
    archiveAuthorFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const confirmSoftDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await request.delete(`/admin/articles/delete/${pendingDelete.slug}`);
      toast.success("Article moved to Trash");
      setPendingDelete(null);
      await fetchArticles();
    } catch (error) {
      console.error("Failed to delete article:", error);
      toast.error("Failed to delete article");
    } finally {
      setDeleting(false);
    }
  };

  const table = useArticlesDataTable({
    data: paged,
    selectedIds,
    onSelectionChange: setSelectedIds,
    timeZone,
    onEdit: canUpdate
      ? (article) => {
          navigate(`/admin/articles/edit/${encodeURIComponent(article.slug)}`);
        }
      : undefined,
    onActivityLog: canActivities
      ? (article) => {
          navigate(`/admin/articles/${encodeURIComponent(article.slug)}/activities`, {
            state: { articleTitle: article.title },
          });
        }
      : undefined,
    onRevisions: canRevisions
      ? (article) => {
          navigate(`/admin/articles/${encodeURIComponent(article.slug)}/revisions`, {
            state: { articleTitle: article.title },
          });
        }
      : undefined,
    onDelete: canDelete ? (article) => setPendingDelete(article) : undefined,
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="Articles"
        description={
          draftCount > 0
            ? `Manage articles across your workflow • ${draftCount} draft${draftCount === 1 ? "" : "s"}`
            : "Manage articles across draft, review, scheduled, published, and archived states"
        }
        actions={
          <>
            {canTrashed ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/articles/trash")}
                className="h-10 w-full gap-2 sm:w-auto"
              >
                <Trash2 className="size-4" aria-hidden />
                Trash
              </Button>
            ) : null}
            {canCreate ? (
              <Button
                type="button"
                onClick={() => navigate("/admin/articles/create")}
                className="h-10 w-full gap-2 rounded-[10px] bg-zbc-blue px-4 text-base font-medium hover:bg-zbc-blue/90 sm:w-auto"
              >
                New Article
              </Button>
            ) : null}
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
          searchPlaceholder="Search articles by title or author..."
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
          showArchiveFilters={isArchiveView}
          archiveYearValue={archiveYearFilter}
          onArchiveYearChange={(v) => {
            setArchiveYearFilter(v);
            setPage(1);
          }}
          archiveYearOptions={archiveYearOptions}
          archiveMonthValue={archiveMonthFilter}
          onArchiveMonthChange={(v) => {
            setArchiveMonthFilter(v);
            setPage(1);
          }}
          archiveMonthOptions={archiveMonthOptions}
          archiveAuthorValue={archiveAuthorFilter}
          onArchiveAuthorChange={(v) => {
            setArchiveAuthorFilter(v);
            setPage(1);
          }}
          archiveAuthorOptions={archiveAuthorOptions}
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
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete article?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Move{" "}
                  <span className="font-medium text-foreground">
                    “{pendingDelete?.title}”
                  </span>{" "}
                  to Trash?
                </p>
                <p>
                  The article will leave the public site but can be restored from Trash later.
                  This is not a permanent delete.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              disabled={deleting}
              onClick={() => void confirmSoftDelete()}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
