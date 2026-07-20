export type ArticleFeaturedMediaType = "image" | "video" | "audio";

export type ArticleFeaturedMedia = {
  type: ArticleFeaturedMediaType;
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
    const posterUrl =
      (typeof media.poster_url === "string" && media.poster_url.trim()) ||
      (typeof media.thumbnail_url === "string" && media.thumbnail_url.trim()) ||
      (type === "image" ? url : "") ||
      fallbackImageUrl;
    const resolvedUrl = url || posterUrl;
    if (!resolvedUrl && !posterUrl) return null;

    return {
      type,
      url: resolvedUrl,
      posterUrl: posterUrl || resolvedUrl,
      thumbnailUrl:
        typeof media.thumbnail_url === "string" ? media.thumbnail_url : undefined,
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
