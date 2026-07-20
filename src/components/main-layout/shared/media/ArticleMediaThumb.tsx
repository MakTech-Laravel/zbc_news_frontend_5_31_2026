import { Music2, Play } from "lucide-react";

import { ArticleImage } from "@/components/main-layout/shared/ArticleImage";
import type { ArticleFeaturedMedia } from "@/components/main-layout/shared/media/types";
import { cn } from "@/lib/utils";

type ArticleMediaThumbProps = {
  media: ArticleFeaturedMedia | null | undefined;
  fallbackSrc: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
};

/** Static thumbnail with optional video/audio badge (no hover play). */
export function ArticleMediaThumb({
  media,
  fallbackSrc,
  alt,
  className,
  imageClassName,
  width,
  height,
}: ArticleMediaThumbProps) {
  const src = media?.posterUrl || media?.url || fallbackSrc;
  const showVideo = media?.type === "video";
  const showAudio = media?.type === "audio";

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <ArticleImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn("h-full w-full object-cover", imageClassName)}
      />
      {showVideo ? (
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 inline-flex size-6 items-center justify-center rounded-full bg-black/65 text-white">
          <Play className="size-3 fill-current" aria-hidden />
        </span>
      ) : null}
      {showAudio ? (
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 inline-flex size-6 items-center justify-center rounded-full bg-black/65 text-white">
          <Music2 className="size-3" aria-hidden />
        </span>
      ) : null}
    </div>
  );
}
