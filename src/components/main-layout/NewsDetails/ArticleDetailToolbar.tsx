import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, ChevronLeft, Share2 } from "lucide-react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { api } from "@/api/client";

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

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const numericArticleId = Number(articleId);

  useEffect(() => {
    if (!numericArticleId) return;
    fetchSavedStatus();
  }, [numericArticleId]);

  async function fetchSavedStatus() {
    try {
      const response = await api.get(`/admin/save-articles/check/${numericArticleId}`);
      setSaved(response.data.data.saved);
    } catch (error: any) {
      if (error?.response?.status === 401) return;
      console.error(error);
    }
  }

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

  async function handleBookmark() {
    if (loading) return;

    try {
      setLoading(true);

      const response = await api.post("/admin/save-articles/toggle", {
        article_id: numericArticleId,
      });

      const isSaved = response.data.data.saved;
      setSaved(isSaved);

      toast.success(
        isSaved ? "Saved for later" : "Removed from saved articles",
      );
    } catch (error: any) {
      if (error?.response?.status === 401) {
        toast.error("Please login to save articles");
        navigate("/login");
        return;
      }
      console.error(error);
      toast.error("Failed to update saved article");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border bg-background py-3",
        className,
      )}
    >
      {/* Back Button */}
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1 font-inter text-sm font-medium text-zbc-gray-600 transition-colors hover:text-zbc-gray-1000"
      >
        <ChevronLeft className="size-4 shrink-0" aria-hidden />
        Back
      </button>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Bookmark / Save Button */}
        <button
          type="button"
          onClick={() => void handleBookmark()}
          disabled={loading}
          aria-label={saved ? "Remove from saved articles" : "Save article"}
          aria-pressed={saved}
          className="inline-flex size-8 items-center justify-center text-zbc-gray-700 transition-colors hover:text-zbc-gray-1000 disabled:opacity-50"
        >
          <Bookmark
            className={cn(
              "size-[18px] transition-colors",
              saved && "fill-current text-primary",
            )}
            aria-hidden
          />
        </button>

        {/* Share Button */}
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
