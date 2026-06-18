import * as React from "react";
import { Check, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { AdminPanel } from "@/components/admin/shared/AdminPanel";
import { AdminStatusBadge } from "@/components/admin/shared/AdminStatusBadge";
import { Button } from "@/components/ui/button";
import {
  approveAdminComment,
  deleteAdminComment,
  fetchAdminComments,
  rejectAdminComment,
  type AdminCommentRow,
} from "@/services/admin/comments";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminComments() {
  const [comments, setComments] = React.useState<AdminCommentRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState("pending");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const loadComments = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminComments({
        status: status === "all" ? undefined : status,
        search: search.trim() || undefined,
        page,
      });
      setComments(data.comments);
      setMeta(data.meta);
    } catch {
      toast.error("Failed to load comments.");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  React.useEffect(() => {
    void loadComments();
  }, [loadComments]);

  async function handleApprove(id: string) {
    try {
      await approveAdminComment(id);
      toast.success("Comment approved.");
      await loadComments();
    } catch {
      toast.error("Unable to approve comment.");
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectAdminComment(id);
      toast.success("Comment rejected.");
      await loadComments();
    } catch {
      toast.error("Unable to reject comment.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAdminComment(id);
      toast.success("Comment deleted.");
      await loadComments();
    } catch {
      toast.error("Unable to delete comment.");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Comments"
        description="Review, approve, and moderate reader comments"
      />

      <AdminFilterBar
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search comments, authors, or articles…"
        statusValue={status}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        statusOptions={STATUS_OPTIONS}
        showCategoryFilter={false}
      />

      <AdminPanel>
        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-admin-label">Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-admin-label">No comments found.</p>
        ) : (
          <div className="divide-y divide-border">
            {comments.map((comment) => (
              <article key={comment.id} className="space-y-3 px-4 py-5 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-admin-heading">
                        {comment.authorName}
                      </p>
                      <AdminStatusBadge
                        variant={
                          comment.status === "approved"
                            ? "published"
                            : comment.status === "pending"
                              ? "pending_review"
                              : "archived"
                        }
                      >
                        {comment.status === "approved"
                          ? "Approved"
                          : comment.status === "pending"
                            ? "Pending"
                            : "Rejected"}
                      </AdminStatusBadge>
                      <span className="text-xs text-admin-label">{comment.time}</span>
                    </div>
                    {comment.articleTitle && comment.articleSlug ? (
                      <Link
                        to={`/news-details/${comment.articleSlug}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {comment.articleTitle}
                      </Link>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {comment.status === "pending" ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 gap-1.5 rounded-lg px-3"
                          onClick={() => void handleApprove(comment.id)}
                        >
                          <Check className="size-4" aria-hidden />
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 rounded-lg px-3"
                          onClick={() => void handleReject(comment.id)}
                        >
                          <X className="size-4" aria-hidden />
                          Reject
                        </Button>
                      </>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={cn(
                        "h-8 gap-1.5 rounded-lg px-3 text-admin-notification",
                        "hover:bg-admin-notification/10",
                      )}
                      onClick={() => void handleDelete(comment.id)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Delete
                    </Button>
                  </div>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-6 text-admin-label">
                  {comment.body}
                </p>
              </article>
            ))}
          </div>
        )}
      </AdminPanel>

      <AdminPagination
        page={meta.current_page}
        totalPages={meta.last_page}
        totalItems={meta.total}
        pageSize={meta.per_page}
        onPageChange={setPage}
      />
    </div>
  );
}
