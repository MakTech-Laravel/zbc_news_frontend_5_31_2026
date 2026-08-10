import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ArticleImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  /** Tried when `src` fails (e.g. broken Cloudinary thumbnail → original URL). */
  fallbackSrc?: string;
};

export function ArticleImage({
  src,
  alt,
  className,
  width,
  height,
  loading = "lazy",
  fetchPriority,
  fallbackSrc,
}: ArticleImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
  }, [src]);

  if (failed || !currentSrc) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="size-8 opacity-40" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
      onError={() => {
        const next = fallbackSrc?.trim();
        if (next && next !== currentSrc) {
          setCurrentSrc(next);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
