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

const MAX_COMMENT_LENGTH = 5000;
const INITIAL_VISIBLE_COMMENTS = 5;
const LOAD_MORE_STEP = 5;
const COMMENT_PREVIEW_LENGTH = 280;

function CommentBody({ body }: { body: string }) {
  const [expanded, setExpanded] = React.useState(false);
  const needsTruncate = body.length > COMMENT_PREVIEW_LENGTH;
  const displayBody =
    !needsTruncate || expanded ? body : `${body.slice(0, COMMENT_PREVIEW_LENGTH).trimEnd()}…`;

  return (
    <div className="mt-2 min-w-0 max-w-full">
      <p className="max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] font-inter text-sm leading-6 text-zbc-gray-700">
        {displayBody}
      </p>
      {needsTruncate ? (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="mt-1 font-inter text-xs font-semibold text-primary hover:underline"
        >
          {expanded ? "See less" : "See more"}
        </button>
      ) : null}
    </div>
  );
}

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

function CommentAuthorAvatar({
  name,
  avatar,
  className,
}: {
  name: string;
  avatar?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 overflow-hidden rounded-full bg-primary/10",
        className,
      )}
    >
      {avatar ? (
        <HeaderAvatar src={avatar} alt={name} className="size-9 rounded-full" />
      ) : (
        <span className="inline-flex size-full items-center justify-center font-inter text-xs font-bold text-primary">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}

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

  const loginHref = `/login?next=${encodeURIComponent(`/${articleSlug}`)}`;

  if (requireRegistration && !isAuthenticated) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-zbc-gray-100/70 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <MessageCircle className="size-5 text-primary" aria-hidden />
          </span>
          <div className="min-w-0 text-left">
            <p className="font-inter text-sm font-semibold text-zbc-gray-1000">
              Sign in to comment
            </p>
            <p className="mt-0.5 font-inter text-sm text-zbc-gray-500">
              Join the conversation on this article.
            </p>
          </div>
        </div>
        <Link
          to={loginHref}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-primary px-4 font-inter text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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

    if (body.trim().length > MAX_COMMENT_LENGTH) {
      toast.error(`Comments must be ${MAX_COMMENT_LENGTH} characters or fewer.`);
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

  const displayName = user?.name ?? user?.email ?? "You";
  const remainingChars = MAX_COMMENT_LENGTH - body.length;

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      {!isAuthenticated ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            placeholder="Your name"
            className="h-10 rounded-lg border-admin-input-border bg-white font-inter text-sm"
            required
            autoComplete="name"
          />
          <Input
            type="email"
            value={guestEmail}
            onChange={(event) => setGuestEmail(event.target.value)}
            placeholder="Your email"
            className="h-10 rounded-lg border-admin-input-border bg-white font-inter text-sm"
            required
            autoComplete="email"
          />
        </div>
      ) : null}

      <div className="flex gap-3">
        {isAuthenticated ? (
          <CommentAuthorAvatar
            name={displayName}
            avatar={user?.avatar}
            className="mt-1"
          />
        ) : null}
        <div className="min-w-0 flex-1 space-y-3">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={placeholder}
            rows={compact ? 3 : 4}
            maxLength={MAX_COMMENT_LENGTH}
            className={cn(
              "w-full resize-y rounded-lg border border-admin-input-border bg-white px-4 py-3",
              "font-inter text-sm text-zbc-gray-900 placeholder:text-zbc-gray-500/80",
              "focus-visible:border-zbc-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zbc-blue/20",
            )}
            required
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              className={cn(
                "font-inter text-xs text-zbc-gray-500",
                remainingChars < 100 && "text-amber-600",
              )}
            >
              {remainingChars} characters remaining
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {onCancel ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-lg px-4 font-inter text-sm"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              ) : null}
              <Button
                type="submit"
                disabled={submitting}
                className="h-9 gap-2 rounded-lg px-4 font-inter text-sm"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-4" aria-hidden />
                )}
                {parentId ? "Post Reply" : "Post Comment"}
              </Button>
            </div>
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
        "min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5",
        depth > 0 && "ml-4 border-l-4 border-l-primary/30 sm:ml-8",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <CommentAuthorAvatar name={comment.authorName} avatar={comment.authorAvatar} />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-inter text-sm font-semibold text-zbc-gray-1000">
              {comment.authorName}
            </p>
            {comment.isOwn ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-inter text-[10px] font-medium text-primary">
                You
              </span>
            ) : null}
            <time className="font-inter text-xs text-zbc-gray-500">{comment.time}</time>
          </div>
          <CommentBody body={comment.body} />
          {depth < 1 ? (
            <button
              type="button"
              onClick={() => setReplyOpen((open) => !open)}
              className="mt-3 inline-flex items-center gap-1.5 font-inter text-xs font-medium text-primary hover:underline"
            >
              <Reply className="size-3.5" aria-hidden />
              {replyOpen ? "Hide reply" : "Reply"}
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
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = React.useState<ArticleComment[]>([]);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [visibleCount, setVisibleCount] = React.useState(INITIAL_VISIBLE_COMMENTS);

  const loadComments = React.useCallback(async () => {
    setLoading(true);
    setVisibleCount(INITIAL_VISIBLE_COMMENTS);
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

  const visibleComments = comments.slice(0, visibleCount);
  const hasMore = comments.length > visibleCount;

  return (
    <section
      id="comments"
      className="min-w-0 max-w-full overflow-hidden border-t border-border pt-8 sm:pt-10"
      aria-labelledby="comments-heading"
    >
      <div className="text-center sm:text-left">
        <h2
          id="comments-heading"
          className="font-inter text-xl font-bold text-zbc-gray-1000 sm:text-2xl"
        >
          Comments
        </h2>
        <p className="mt-2 font-inter text-sm text-zbc-gray-500">
          {count} {count === 1 ? "comment" : "comments"}
          {!requireRegistration ? " · Guests and signed-in readers can participate" : null}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-zbc-gray-100/70 p-4 sm:p-5">
        {!requireRegistration && !isAuthenticated ? (
          <p className="mb-4 font-inter text-sm text-zbc-gray-700">
            Commenting as a guest.{" "}
            <Link
              to={`/login?next=${encodeURIComponent(`/${articleSlug}`)}`}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>{" "}
            to use your account profile.
          </p>
        ) : null}
        <CommentForm
          articleSlug={articleSlug}
          requireRegistration={requireRegistration}
          onSuccess={() => void loadComments()}
        />
      </div>

      <div className="mt-6 min-w-0 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-10">
            <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
            <p className="font-inter text-sm text-zbc-gray-500">Loading comments…</p>
          </div>
        ) : comments.length === 0 ? (
          <p className="rounded-xl border border-border bg-card px-4 py-10 text-center font-inter text-sm text-zbc-gray-500">
            No comments yet. Be the first to share your thoughts.
          </p>
        ) : (
          <>
            {visibleComments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                articleSlug={articleSlug}
                requireRegistration={requireRegistration}
                onRefresh={() => void loadComments()}
              />
            ))}
            {hasMore ? (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-lg px-5 font-inter text-sm"
                  onClick={() =>
                    setVisibleCount((current) =>
                      Math.min(current + LOAD_MORE_STEP, comments.length),
                    )
                  }
                >
                  Load more
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
