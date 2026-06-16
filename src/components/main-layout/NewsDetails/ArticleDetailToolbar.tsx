import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { ArticleSaveButton } from "@/components/articles/ArticleSaveButton";
import { ArticleShareButton } from "@/components/articles/ArticleShareButton";
import { cn } from "@/lib/utils";

type ArticleDetailToolbarProps = {
  articleId: string | number;
  articleTitle?: string;
  articleSlug?: string;
  articleSummary?: string;
  articleImageUrl?: string;
  className?: string;
};

export function ArticleDetailToolbar({
  articleId,
  articleTitle,
  articleSlug,
  articleSummary,
  articleImageUrl,
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

        <ArticleShareButton
          slug={articleSlug}
          title={articleTitle ?? "ZBC News"}
          excerpt={articleSummary}
          imageUrl={articleImageUrl}
          variant="toolbar"
        />
      </div>
    </div>
  );
}
