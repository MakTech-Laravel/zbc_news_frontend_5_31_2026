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

function youtubeHoverUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("autoplay", "1");
    parsed.searchParams.set("mute", "1");
    parsed.searchParams.set("controls", "0");
    parsed.searchParams.set("playsinline", "1");
    parsed.searchParams.set("rel", "0");
    return parsed.toString();
  } catch {
    return url;
  }
}

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
  const poster =
    media?.type === "image"
      ? media.url || media.posterUrl || fallbackSrc
      : media?.posterUrl || fallbackSrc;
  const isYouTube = media?.type === "video" && media.provider === "youtube";
  const isNativeVideo =
    media?.type === "video" && media.provider !== "youtube" && Boolean(media.url);
  const isVideo = isYouTube || isNativeVideo;
  const isAudio = media?.type === "audio";

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setCanHoverPlay(mq.matches && !reduced.matches);
    update();
    mq.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!isNativeVideo) return;
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
  }, [hovering, canHoverPlay, isNativeVideo]);

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
  }, [isNativeVideo]);

  return (
    <div
      className={cn("relative overflow-hidden bg-muted", className)}
      onMouseEnter={() => isVideo && canHoverPlay && setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {isYouTube ? (
        <>
          {hovering && canHoverPlay ? (
            <iframe
              src={youtubeHoverUrl(media!.url)}
              title=""
              className={cn(
                "pointer-events-none h-full w-full border-0 object-cover",
                imageClassName,
              )}
              allow="autoplay; encrypted-media; picture-in-picture"
              aria-hidden="true"
              tabIndex={-1}
            />
          ) : (
            <ArticleImage
              src={poster || fallbackSrc}
              alt={alt}
              className={cn("h-full w-full object-cover", imageClassName)}
              fallbackSrc={
                media?.type === "image" && media.url && media.url !== poster
                  ? media.url
                  : fallbackSrc && fallbackSrc !== poster
                    ? fallbackSrc
                    : undefined
              }
            />
          )}
          {!hovering ? (
            <span className="pointer-events-none absolute bottom-2 left-2 inline-flex size-7 items-center justify-center rounded-full bg-black/65 text-white">
              <Play className="size-3.5 fill-current" aria-hidden />
            </span>
          ) : null}
        </>
      ) : isNativeVideo ? (
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
            fallbackSrc={
              media?.type === "image" && media.url && media.url !== poster
                ? media.url
                : fallbackSrc && fallbackSrc !== poster
                  ? fallbackSrc
                  : undefined
            }
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
