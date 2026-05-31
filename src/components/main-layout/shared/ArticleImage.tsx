import { useState } from "react";
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
};

export function ArticleImage({
  src,
  alt,
  className,
  width,
  height,
  loading = "lazy",
  fetchPriority,
}: ArticleImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
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
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
