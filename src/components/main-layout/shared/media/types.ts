export type ArticleFeaturedMediaType = "image" | "video" | "audio";

export type ArticleFeaturedMedia = {
  type: ArticleFeaturedMediaType;
  provider?: "native" | "youtube";
  url: string;
  posterUrl: string;
  thumbnailUrl?: string;
  mimeType?: string | null;
  uuid?: string | null;
};

export function resolveFeaturedMediaFromApi(
  raw: Record<string, unknown>,
  fallbackImageUrl = "",
): ArticleFeaturedMedia | null {
  const media =
    raw.featured_media && typeof raw.featured_media === "object"
      ? (raw.featured_media as Record<string, unknown>)
      : null;

  if (media) {
    const typeRaw = typeof media.type === "string" ? media.type : "image";
    const type: ArticleFeaturedMediaType =
      typeRaw === "video" || typeRaw === "audio" || typeRaw === "image"
        ? typeRaw
        : "image";
    const url = typeof media.url === "string" ? media.url.trim() : "";
    const thumbnailUrl =
      typeof media.thumbnail_url === "string" ? media.thumbnail_url.trim() : "";
    const explicitPoster =
      typeof media.poster_url === "string" ? media.poster_url.trim() : "";

    // Never fall back to a video/audio URL for <img> posters.
    const posterUrl =
      explicitPoster ||
      thumbnailUrl ||
      (type === "image" ? url : "") ||
      fallbackImageUrl ||
      "";

    const resolvedUrl = type === "image" ? url || posterUrl : url;
    if (!resolvedUrl && !posterUrl) return null;

    return {
      type,
      provider: media.provider === "youtube" ? "youtube" : "native",
      url: resolvedUrl || posterUrl,
      posterUrl: posterUrl || (type === "image" ? resolvedUrl : ""),
      thumbnailUrl: thumbnailUrl || undefined,
      mimeType: typeof media.mime_type === "string" ? media.mime_type : null,
      uuid: typeof media.uuid === "string" ? media.uuid : null,
    };
  }

  if (fallbackImageUrl) {
    return {
      type: "image",
      url: fallbackImageUrl,
      posterUrl: fallbackImageUrl,
    };
  }

  return null;
}
