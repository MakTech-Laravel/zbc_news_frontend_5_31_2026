import { useNavigate } from "react-router-dom";
import { ChevronLeft, Share2 } from "lucide-react";
import toast from "react-hot-toast";

import { ArticleSaveButton } from "@/components/articles/ArticleSaveButton";
import { cn } from "@/lib/utils";

type ArticleDetailToolbarProps = {
  articleId: string | number;
  articleTitle?: string;
  articleSlug?: string;
  className?: string;
};

export function ArticleDetailToolbar({
  articleId,
  articleTitle,
  articleSlug,
  className,
}: ArticleDetailToolbarProps) {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  }

  async function handleShare() {
    const url = articleSlug
      ? `${window.location.origin}/news-details/${encodeURIComponent(articleSlug)}`
      : window.location.href;

    const title = articleTitle ?? "ZBC News";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Unable to share article");
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border bg-background py-3",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1 font-inter text-sm font-medium text-zbc-gray-600 transition-colors hover:text-zbc-gray-1000"
      >
        <ChevronLeft className="size-4 shrink-0" aria-hidden />
        Back
      </button>

      <div className="flex items-center gap-4">
        <ArticleSaveButton articleId={articleId} variant="toolbar" />

        <button
          type="button"
          onClick={() => void handleShare()}
          aria-label="Share article"
          className="inline-flex size-8 items-center justify-center text-zbc-gray-700 transition-colors hover:text-zbc-gray-1000"
        >
          <Share2 className="size-[18px]" aria-hidden />
        </button>
      </div>
    </div>
  );
}
