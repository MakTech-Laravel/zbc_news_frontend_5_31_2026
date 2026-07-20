import { Music2, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ArticleImage } from "@/components/main-layout/shared/ArticleImage";
import type { ArticleFeaturedMedia } from "@/components/main-layout/shared/media/types";
import { cn } from "@/lib/utils";

type ArticleMediaHoverThumbProps = {
  media: ArticleFeaturedMedia | null | undefined;
  fallbackSrc: string;
  alt: string;
  className?: string;
  imageClassName?: string;
};

/** Only one hover preview should play at a time across the page. */
let activeHoverVideo: HTMLVideoElement | null = null;

export function ArticleMediaHoverThumb({
  media,
  fallbackSrc,
  alt,
  className,
  imageClassName,
}: ArticleMediaHoverThumbProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hovering, setHovering] = useState(false);
  const [canHoverPlay, setCanHoverPlay] = useState(false);
  const poster = media?.posterUrl || media?.url || fallbackSrc;
  const isVideo = media?.type === "video" && Boolean(media.url);
  const isAudio = media?.type === "audio";

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHoverPlay(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (!hovering || !canHoverPlay) {
      el.pause();
      el.currentTime = 0;
      if (activeHoverVideo === el) activeHoverVideo = null;
      return;
    }

    if (activeHoverVideo && activeHoverVideo !== el) {
      activeHoverVideo.pause();
      activeHoverVideo.currentTime = 0;
    }
    activeHoverVideo = el;
    el.muted = true;
    void el.play().catch(() => {
      /* autoplay may be blocked */
    });
  }, [hovering, canHoverPlay]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          el.pause();
          el.currentTime = 0;
          setHovering(false);
          if (activeHoverVideo === el) activeHoverVideo = null;
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVideo]);

  return (
    <div
      className={cn("relative overflow-hidden bg-muted", className)}
      onMouseEnter={() => isVideo && canHoverPlay && setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            src={media!.url}
            poster={poster || undefined}
            className={cn("h-full w-full object-cover", imageClassName)}
            muted
            playsInline
            loop
            preload="none"
          />
          {!hovering ? (
            <span className="pointer-events-none absolute bottom-2 left-2 inline-flex size-7 items-center justify-center rounded-full bg-black/65 text-white">
              <Play className="size-3.5 fill-current" aria-hidden />
            </span>
          ) : null}
        </>
      ) : (
        <>
          <ArticleImage
            src={poster || fallbackSrc}
            alt={alt}
            className={cn("h-full w-full object-cover", imageClassName)}
          />
          {isAudio ? (
            <span className="pointer-events-none absolute bottom-2 left-2 inline-flex size-7 items-center justify-center rounded-full bg-black/65 text-white">
              <Music2 className="size-3.5" aria-hidden />
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}
