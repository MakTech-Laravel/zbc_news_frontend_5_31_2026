import * as React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useArticlesDataTable } from "@/components/admin/articles/useArticlesDataTable";
import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { DataTable } from "@/components/ui/data-table";
import {
  ARTICLE_STATUS_FILTER_OPTIONS,
  type AdminArticle,
} from "@/data/admin/mockArticles";
import {
  buildArticleCategoryFilterOptions,
  fetchAdminArticles,
  matchesArticleSearch,
  type AdminArticleApiCategory,
} from "@/services/admin/articles";
import { request } from "@/api/request";

const PAGE_SIZE = 10;

export default function AdminArticles() {
  const navigate = useNavigate();
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

  const draftCount = React.useMemo(
    () => articles.filter((a) => a.status === "draft" || a.hasUnsavedDraft).length,
    [articles],
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

  const table = useArticlesDataTable({
    data: paged,
    selectedIds,
    onSelectionChange: setSelectedIds,
    onEdit: (article) => {
      navigate(`/admin/articles/edit/${encodeURIComponent(article.slug)}`);
    },
    onDelete: () => {
      /* confirm delete */
    },
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
        actionLabel="New Article"
        onAction={() => navigate("/admin/articles/create")}
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
