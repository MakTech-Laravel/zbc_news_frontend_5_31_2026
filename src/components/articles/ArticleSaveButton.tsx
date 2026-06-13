import { Bookmark } from "lucide-react";

import { useArticleSave, type UseArticleSaveOptions } from "@/hooks/useArticleSave";
import { cn } from "@/lib/utils";

export type ArticleSaveButtonVariant = "toolbar" | "card";

type ArticleSaveButtonProps = {
  articleId: string | number | undefined | null;
  variant?: ArticleSaveButtonVariant;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
} & UseArticleSaveOptions;

const VARIANT_CLASS: Record<ArticleSaveButtonVariant, string> = {
  toolbar:
    "inline-flex size-8 items-center justify-center text-zbc-gray-700 transition-colors hover:text-zbc-gray-1000 disabled:opacity-50",
  card: "inline-flex size-8 items-center justify-center rounded-lg border border-border text-admin-label transition-colors hover:bg-muted disabled:opacity-50 sm:size-9",
};

const ICON_SIZE: Record<ArticleSaveButtonVariant, string> = {
  toolbar: "size-[18px]",
  card: "size-4",
};

export function ArticleSaveButton({
  articleId,
  variant = "card",
  className,
  iconClassName,
  disabled = false,
  checkOnMount,
  showToast,
  redirectOnUnauthorized,
}: ArticleSaveButtonProps) {
  const { saved, loading, isValidId, toggle } = useArticleSave(articleId, {
    checkOnMount,
    showToast,
    redirectOnUnauthorized,
  });

  if (!isValidId) return null;

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={disabled || loading}
      aria-label={saved ? "Remove from saved articles" : "Save article"}
      aria-pressed={saved}
      className={cn(VARIANT_CLASS[variant], className)}
    >
      <Bookmark
        className={cn(
          ICON_SIZE[variant],
          "transition-colors",
          saved && "fill-current text-primary",
          iconClassName,
        )}
        aria-hidden
      />
    </button>
  );
}
