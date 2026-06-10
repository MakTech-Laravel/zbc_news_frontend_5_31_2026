import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, ChevronLeft, Share2 } from "lucide-react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";

type ArticleDetailToolbarProps = {
  articleTitle?: string;
  articleSlug?: string;
  className?: string;
};

export function ArticleDetailToolbar({
  articleTitle,
  articleSlug,
  className,
}: ArticleDetailToolbarProps) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

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
      toast.error("Unable to share this article");
    }
  }

  function handleBookmark() {
    setSaved((current) => !current);
    toast.success(saved ? "Removed from saved articles" : "Saved for later");
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
        <button
          type="button"
          onClick={handleBookmark}
          aria-label={saved ? "Remove from saved articles" : "Save article"}
          aria-pressed={saved}
          className="inline-flex size-8 items-center justify-center text-zbc-gray-700 transition-colors hover:text-zbc-gray-1000"
        >
          <Bookmark
            className={cn("size-[18px]", saved && "fill-current text-primary")}
            aria-hidden
          />
        </button>

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
