import * as React from "react";
import { Link } from "react-router-dom";
import { Loader2, MessageCircle, Reply, Send } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "@/auth/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HeaderAvatar } from "@/components/ui/HeaderAvatar";
import { cn } from "@/lib/utils";
import {
  fetchArticleComments,
  postArticleComment,
} from "@/services/frontend/comments";
import type { ArticleComment } from "@/types/comments";

type ArticleCommentsProps = {
  articleSlug: string;
  allowComments: boolean;
  requireRegistration: boolean;
};

type CommentFormProps = {
  articleSlug: string;
  parentId?: string;
  placeholder?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  requireRegistration: boolean;
  compact?: boolean;
};

function CommentForm({
  articleSlug,
  parentId,
  placeholder = "Share your thoughts…",
  onSuccess,
  onCancel,
  requireRegistration,
  compact = false,
}: CommentFormProps) {
  const { isAuthenticated, user } = useAuth();
  const [body, setBody] = React.useState("");
  const [guestName, setGuestName] = React.useState("");
  const [guestEmail, setGuestEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  if (requireRegistration && !isAuthenticated) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-zbc-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <MessageCircle className="size-5 shrink-0 text-zbc-gray-400" aria-hidden />
          <p className="font-inter text-sm text-zbc-gray-700 sm:text-base">
            Sign in to join the conversation
          </p>
        </div>
        <Link
          to="/login"
          className="shrink-0 font-inter text-sm font-semibold text-primary hover:underline"
        >
          Sign In
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await postArticleComment(articleSlug, {
        body: body.trim(),
        parentId,
        guestName: !isAuthenticated ? guestName.trim() : undefined,
        guestEmail: !isAuthenticated ? guestEmail.trim() : undefined,
      });

      toast.success(result.message);
      setBody("");
      if (!isAuthenticated) {
        setGuestName("");
        setGuestEmail("");
      }
      onSuccess();
      onCancel?.();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Unable to post your comment.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      {!isAuthenticated ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            placeholder="Your name"
            className="h-10 rounded-lg border-admin-input-border"
            required
          />
          <Input
            type="email"
            value={guestEmail}
            onChange={(event) => setGuestEmail(event.target.value)}
            placeholder="Your email"
            className="h-10 rounded-lg border-admin-input-border"
            required
          />
        </div>
      ) : null}

      <div className="flex gap-3">
        {isAuthenticated ? (
          <span className="relative mt-1 inline-flex size-9 shrink-0 overflow-hidden rounded-full bg-muted">
            {user?.avatar ? (
              <HeaderAvatar
                src={user.avatar}
                alt={user?.name ?? user?.email ?? "You"}
                className="size-9 rounded-full"
              />
            ) : (
              <span className="inline-flex size-full items-center justify-center text-xs font-semibold text-admin-heading">
                {(user?.name ?? user?.email ?? "U").slice(0, 2).toUpperCase()}
              </span>
            )}
          </span>
        ) : null}
        <div className="min-w-0 flex-1 space-y-3">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={placeholder}
            rows={compact ? 3 : 4}
            className={cn(
              "w-full resize-y rounded-lg border border-admin-input-border bg-white px-4 py-3",
              "font-inter text-sm text-zbc-gray-900 placeholder:text-zbc-gray-500/80",
              "focus-visible:border-zbc-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zbc-blue/20",
            )}
            required
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="submit"
              disabled={submitting}
              className="h-9 gap-2 rounded-lg px-4 text-sm"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
              {parentId ? "Post Reply" : "Post Comment"}
            </Button>
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-lg px-4 text-sm"
                onClick={onCancel}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}

function CommentThread({
  comment,
  articleSlug,
  requireRegistration,
  onRefresh,
  depth = 0,
}: {
  comment: ArticleComment;
  articleSlug: string;
  requireRegistration: boolean;
  onRefresh: () => void;
  depth?: number;
}) {
  const [replyOpen, setReplyOpen] = React.useState(false);

  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        depth > 0 && "ml-4 border-l-4 border-l-brand-deep/30 sm:ml-8",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="relative inline-flex size-9 shrink-0 overflow-hidden rounded-full bg-muted">
          {comment.authorAvatar ? (
            <HeaderAvatar
              src={comment.authorAvatar}
              alt={comment.authorName}
              className="size-9 rounded-full"
            />
          ) : (
            <span className="inline-flex size-full items-center justify-center text-xs font-semibold text-admin-heading">
              {comment.authorName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-inter text-sm font-semibold text-zbc-gray-1000">
              {comment.authorName}
            </p>
            {comment.isOwn ? (
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand-deep">
                You
              </span>
            ) : null}
            <time className="text-xs text-admin-label">{comment.time}</time>
          </div>
          <p className="mt-2 whitespace-pre-wrap font-inter text-sm leading-6 text-zbc-gray-700">
            {comment.body}
          </p>
          {depth < 1 ? (
            <button
              type="button"
              onClick={() => setReplyOpen((open) => !open)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Reply className="size-3.5" aria-hidden />
              Reply
            </button>
          ) : null}
        </div>
      </div>

      {replyOpen ? (
        <div className="mt-4 border-t border-border pt-4">
          <CommentForm
            articleSlug={articleSlug}
            parentId={comment.id}
            placeholder={`Reply to ${comment.authorName}…`}
            requireRegistration={requireRegistration}
            compact
            onSuccess={onRefresh}
            onCancel={() => setReplyOpen(false)}
          />
        </div>
      ) : null}

      {comment.replies.length > 0 ? (
        <div className="mt-4 space-y-3">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              articleSlug={articleSlug}
              requireRegistration={requireRegistration}
              onRefresh={onRefresh}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function ArticleComments({
  articleSlug,
  allowComments,
  requireRegistration,
}: ArticleCommentsProps) {
  const [comments, setComments] = React.useState<ArticleComment[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const loadComments = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchArticleComments(articleSlug);
      setComments(data.comments);
      setCount(data.count);
    } catch {
      setComments([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [articleSlug]);

  React.useEffect(() => {
    if (!allowComments) return;
    void loadComments();
  }, [allowComments, loadComments]);

  if (!allowComments) {
    return null;
  }

  return (
    <section className="pt-3 sm:pt-5" aria-labelledby="comments-heading">
      <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
        <h2
          id="comments-heading"
          className="font-inter text-xl font-bold text-zbc-gray-1000 sm:text-2xl"
        >
          Comments
        </h2>
        <p className="font-inter text-sm text-admin-label">
          {count} {count === 1 ? "comment" : "comments"}
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-zbc-gray-100/70 p-4 sm:p-5">
        <CommentForm
          articleSlug={articleSlug}
          requireRegistration={requireRegistration}
          onSuccess={() => void loadComments()}
        />
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-admin-label">
            Loading comments…
          </p>
        ) : comments.length === 0 ? (
          <p className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-admin-label">
            No comments yet. Start the conversation.
          </p>
        ) : (
          comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              articleSlug={articleSlug}
              requireRegistration={requireRegistration}
              onRefresh={() => void loadComments()}
            />
          ))
        )}
      </div>
    </section>
  );
}
