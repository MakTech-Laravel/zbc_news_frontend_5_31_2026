import * as React from "react";
import { Share2 } from "lucide-react";

import { ArticleShareModal } from "@/components/articles/ArticleShareModal";
import { cn } from "@/lib/utils";

export type ArticleShareButtonProps = {
  slug?: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  className?: string;
  iconClassName?: string;
  variant?: "icon" | "toolbar" | "labeled";
};

export function ArticleShareButton({
  slug,
  title,
  excerpt,
  imageUrl,
  className,
  iconClassName,
  variant = "icon",
}: ArticleShareButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share article"
        className={cn(
          variant === "toolbar"
            ? "inline-flex size-8 items-center justify-center text-zbc-gray-700 transition-colors hover:text-zbc-gray-1000"
            : variant === "labeled"
              ? "inline-flex h-11 w-full max-w-sm items-center justify-center gap-2 rounded-xs bg-primary px-5 font-inter text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              : "inline-flex size-8 items-center justify-center rounded-lg border border-border text-admin-label transition-colors hover:bg-muted sm:size-9",
          className,
        )}
      >
        <Share2 className={cn("size-4", variant === "toolbar" && "size-[18px]", iconClassName)} />
        {variant === "labeled" ? "Share this article" : null}
      </button>

      <ArticleShareModal
        open={open}
        onOpenChange={setOpen}
        slug={slug}
        title={title}
        summary={excerpt}
        imageUrl={imageUrl}
      />
    </>
  );
}
