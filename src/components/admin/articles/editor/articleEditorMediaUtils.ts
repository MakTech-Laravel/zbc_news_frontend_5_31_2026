export type EditorNativeMediaElement =
  | HTMLImageElement
  | HTMLVideoElement
  | HTMLAudioElement;

export type EditorMediaElement = EditorNativeMediaElement | HTMLElement;

export type MediaAlign = "left" | "center" | "right";

export type ArticleEditorMediaStyle = {
  width: string;
  height: string;
  aspectRatio: string;
  objectFit: string;
  align: MediaAlign;
};

export const MEDIA_ASPECT_RATIO_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "16 / 9", label: "16:9" },
  { value: "4 / 3", label: "4:3" },
  { value: "3 / 2", label: "3:2" },
  { value: "1 / 1", label: "1:1" },
  { value: "9 / 16", label: "9:16" },
] as const;

export const MEDIA_OBJECT_FIT_OPTIONS = [
  { value: "contain", label: "Contain" },
  { value: "cover", label: "Cover" },
  { value: "fill", label: "Fill" },
] as const;

export const ARTICLE_EDITOR_MEDIA_SELECTED_CLASS = "article-editor-media-selected";
export const YOUTUBE_EMBED_CLASS = "article-embed--youtube";
export const ARTICLE_EMBED_CLASS = "article-embed";

export function isYouTubeEmbedElement(node: EventTarget | null): node is HTMLElement {
  return (
    node instanceof HTMLElement &&
    node.classList.contains(YOUTUBE_EMBED_CLASS) &&
    node.classList.contains(ARTICLE_EMBED_CLASS)
  );
}

export function isEditorNativeMediaElement(
  node: EventTarget | null,
): node is EditorNativeMediaElement {
  return (
    node instanceof HTMLImageElement ||
    node instanceof HTMLVideoElement ||
    node instanceof HTMLAudioElement
  );
}

export function isEditorMediaElement(node: EventTarget | null): node is EditorMediaElement {
  return isEditorNativeMediaElement(node) || isYouTubeEmbedElement(node);
}

export function resolveEditorMediaFromTarget(
  target: EventTarget | null,
): EditorMediaElement | null {
  if (!(target instanceof Element)) return null;
  if (isEditorMediaElement(target)) return target;

  const closest = target.closest(
    `img, video, audio, .${YOUTUBE_EMBED_CLASS}`,
  );
  return isEditorMediaElement(closest) ? closest : null;
}

export function getEditorMediaLabel(element: EditorMediaElement): string {
  if (isYouTubeEmbedElement(element)) return "YouTube";
  if (element instanceof HTMLImageElement) return "Image";
  if (element instanceof HTMLVideoElement) return "Video";
  return "Audio";
}

export function supportsObjectFit(element: EditorMediaElement): boolean {
  if (isYouTubeEmbedElement(element)) return false;
  return element instanceof HTMLImageElement || element instanceof HTMLVideoElement;
}

function readAlign(element: EditorMediaElement): MediaAlign {
  const marginLeft = element.style.marginLeft;
  const marginRight = element.style.marginRight;
  if (marginLeft === "auto" && marginRight === "auto") return "center";
  if (marginLeft === "auto" && marginRight !== "auto") return "right";
  return "left";
}

export function readMediaStyle(element: EditorMediaElement): ArticleEditorMediaStyle {
  const defaultAspect = isYouTubeEmbedElement(element) ? "16 / 9" : "auto";
  return {
    width: element.style.width || "100%",
    height: element.style.height || "auto",
    aspectRatio: element.style.aspectRatio || defaultAspect,
    objectFit: element.style.objectFit || "contain",
    align: readAlign(element),
  };
}

function applyAlign(element: EditorMediaElement, align: MediaAlign) {
  element.style.display = "block";
  if (align === "center") {
    element.style.marginLeft = "auto";
    element.style.marginRight = "auto";
    return;
  }
  if (align === "right") {
    element.style.marginLeft = "auto";
    element.style.marginRight = "0";
    return;
  }
  element.style.marginLeft = "0";
  element.style.marginRight = "auto";
}

export function applyMediaStyle(element: EditorMediaElement, style: ArticleEditorMediaStyle) {
  element.style.maxWidth = "100%";
  element.style.width = style.width.trim() || "100%";
  element.style.height = style.height.trim() || "auto";

  if (style.aspectRatio === "auto" || !style.aspectRatio.trim()) {
    element.style.removeProperty("aspect-ratio");
  } else {
    element.style.aspectRatio = style.aspectRatio;
  }

  if (supportsObjectFit(element)) {
    element.style.objectFit = style.objectFit || "contain";
  }

  if (isYouTubeEmbedElement(element)) {
    element.style.position = "relative";
    element.style.overflow = "hidden";
    if (!element.style.marginTop) element.style.marginTop = "1rem";
    if (!element.style.marginBottom) element.style.marginBottom = "1rem";

    const iframe = element.querySelector("iframe");
    if (iframe instanceof HTMLIFrameElement) {
      iframe.style.position = "absolute";
      iframe.style.inset = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "0";
    }
  }

  applyAlign(element, style.align);
  element.setAttribute("contenteditable", "false");
}

export function buildDefaultMediaStyle(): ArticleEditorMediaStyle {
  return {
    width: "100%",
    height: "auto",
    aspectRatio: "auto",
    objectFit: "contain",
    align: "left",
  };
}

export function buildMediaInsertHtml(
  tag: "img" | "video" | "audio",
  attrs: Record<string, string>,
): string {
  const attrString = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

  const defaultStyle = "max-width:100%;width:100%;height:auto;display:block;object-fit:contain;";
  if (tag === "img") {
    return `<img ${attrString} style="${defaultStyle}" contenteditable="false" /><p><br></p>`;
  }
  if (tag === "video") {
    return `<video ${attrString} controls preload="metadata" style="${defaultStyle}" contenteditable="false"></video><p><br></p>`;
  }
  return `<audio ${attrString} controls preload="metadata" style="max-width:100%;width:100%;display:block;" contenteditable="false"></audio><p><br></p>`;
}

export function extractYouTubeVideoId(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  let videoId: string | null = null;

  if (host === "youtu.be") {
    videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com"
  ) {
    if (parsed.pathname.startsWith("/embed/")) {
      videoId = parsed.pathname.split("/")[2] ?? null;
    } else if (parsed.pathname.startsWith("/live/")) {
      videoId = parsed.pathname.split("/")[2] ?? null;
    } else if (parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.split("/")[2] ?? null;
    } else {
      videoId = parsed.searchParams.get("v");
    }
  }

  if (!videoId || !/^[a-zA-Z0-9_-]{6,}$/.test(videoId)) {
    return null;
  }

  return videoId;
}

/**
 * Convert a YouTube watch / share / live / youtu.be URL into an embeddable iframe src.
 */
export function resolveYouTubeEmbedUrl(rawUrl: string): string | null {
  const videoId = extractYouTubeVideoId(rawUrl);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

export type YouTubeValidationResult =
  | { ok: true; embedUrl: string; videoId: string }
  | { ok: false; error: string };

/**
 * Parse the URL, then confirm the video exists via YouTube oEmbed.
 */
export async function validateYouTubeUrl(rawUrl: string): Promise<YouTubeValidationResult> {
  const videoId = extractYouTubeVideoId(rawUrl);
  if (!videoId) {
    return {
      ok: false,
      error: "Wrong URL. Use a YouTube watch, share, live, Shorts, or youtu.be link.",
    };
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
    );

    if (response.status === 404 || response.status === 401) {
      return {
        ok: false,
        error: "Video not found. Check the URL and try again.",
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: "Could not verify this YouTube URL. Check the link and try again.",
      };
    }

    return { ok: true, embedUrl, videoId };
  } catch {
    // Network/CORS failure — still allow insert if the URL shape is valid.
    return { ok: true, embedUrl, videoId };
  }
}

export function buildYouTubeEmbedHtml(embedUrl: string): string {
  const safeSrc = embedUrl
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  return (
    `<div class="${ARTICLE_EMBED_CLASS} ${YOUTUBE_EMBED_CLASS}" contenteditable="false" ` +
    `data-embed-type="youtube" ` +
    `style="position:relative;display:block;max-width:100%;width:100%;aspect-ratio:16 / 9;overflow:hidden;margin:1rem 0;">` +
    `<iframe src="${safeSrc}" title="YouTube video" ` +
    `style="position:absolute;inset:0;width:100%;height:100%;border:0;" ` +
    `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
    `allowfullscreen loading="lazy"></iframe></div><p><br></p>`
  );
}

export function notifyEditorInput(editor: HTMLDivElement) {
  editor.dispatchEvent(new Event("input", { bubbles: true }));
}

export function clearMediaSelection(editor: HTMLDivElement) {
  editor
    .querySelectorAll(`.${ARTICLE_EDITOR_MEDIA_SELECTED_CLASS}`)
    .forEach((node) => node.classList.remove(ARTICLE_EDITOR_MEDIA_SELECTED_CLASS));
}

export function selectMediaElement(element: EditorMediaElement, editor: HTMLDivElement) {
  clearMediaSelection(editor);
  element.classList.add(ARTICLE_EDITOR_MEDIA_SELECTED_CLASS);
}
