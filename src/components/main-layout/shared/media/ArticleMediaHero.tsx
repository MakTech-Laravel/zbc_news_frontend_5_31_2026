import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { ArticleImage } from "@/components/main-layout/shared/ArticleImage";
import type { ArticleFeaturedMedia } from "@/components/main-layout/shared/media/types";
import { cn } from "@/lib/utils";

function withYouTubePlaybackParams(url: string, autoPlay: boolean): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("playsinline", "1");
    parsed.searchParams.set("rel", "0");
    if (autoPlay) {
      parsed.searchParams.set("autoplay", "1");
      parsed.searchParams.set("mute", "1");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

type ArticleMediaHeroProps = {
  media: ArticleFeaturedMedia;
  alt: string;
  className?: string;
  overlay?: ReactNode;
  /** Muted autoplay for live-blog featured video (browser policy requires muted). */
  autoPlay?: boolean;
};

export function ArticleMediaHero({
  media,
  alt,
  className,
  overlay,
  autoPlay = false,
}: ArticleMediaHeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (media.type !== "video" || !autoPlay) return;
    const el = videoRef.current;
    if (!el) return;

    el.muted = true;
    void el
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [media.type, media.url, autoPlay]);

  if (media.type === "image") {
    return (
      <div className={cn("relative aspect-[16/9] min-h-[200px] w-full sm:min-h-[280px] lg:min-h-[360px]", className)}>
        <ArticleImage
          src={media.url || media.posterUrl}
          alt={alt}
          width={1200}
          height={675}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        {overlay}
      </div>
    );
  }

  if (media.type === "video" && media.provider === "youtube") {
    return (
      <div
        className={cn(
          "relative aspect-video min-h-[200px] w-full bg-black sm:min-h-[280px] lg:min-h-[360px]",
          className,
        )}
      >
        <iframe
          src={withYouTubePlaybackParams(media.url, autoPlay)}
          title={alt}
          className="absolute inset-0 size-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (media.type === "video") {
    const toggle = () => {
      const el = videoRef.current;
      if (!el) return;
      if (el.paused) {
        void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      } else {
        el.pause();
        setPlaying(false);
      }
    };

    return (
      <div className={cn("relative aspect-[16/9] min-h-[200px] w-full bg-black sm:min-h-[280px] lg:min-h-[360px]", className)}>
        <video
          ref={videoRef}
          src={media.url}
          poster={media.posterUrl || undefined}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted={autoPlay}
          loop={autoPlay}
          preload={autoPlay ? "auto" : "metadata"}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
        {!playing ? overlay : null}
        <button
          type="button"
          onClick={toggle}
          className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white transition hover:bg-black/85"
          aria-label={playing ? "Pause video" : "Play video"}
        >
          {playing ? (
            <Pause className="size-4" aria-hidden />
          ) : (
            <Play className="size-4" aria-hidden />
          )}
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    );
  }

  const toggleAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={cn("relative aspect-[16/9] min-h-[200px] w-full sm:min-h-[280px] lg:min-h-[360px]", className)}>
      <ArticleImage
        src={media.posterUrl || media.url}
        alt={alt}
        width={1200}
        height={675}
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        fetchPriority="high"
      />
      {overlay}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 bg-gradient-to-t from-black/85 to-transparent p-4 sm:p-6">
        <button
          type="button"
          onClick={toggleAudio}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-zbc-gray-1000 shadow"
          aria-label={playing ? "Pause audio" : "Play audio"}
        >
          {playing ? (
            <Pause className="size-5" aria-hidden />
          ) : (
            <Play className="size-5 fill-current" aria-hidden />
          )}
        </button>
        <audio
          ref={audioRef}
          src={media.url}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="w-full"
          controls
        />
      </div>
    </div>
  );
}
