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
export const FACEBOOK_EMBED_CLASS = "article-embed--facebook";
export const ARTICLE_EMBED_CLASS = "article-embed";
export const VIDEO_REPLACE_TARGET_ATTR = "data-editor-video-replace-id";

export function markVideoReplaceTarget(element: EditorMediaElement): string {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `replace-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  element.setAttribute(VIDEO_REPLACE_TARGET_ATTR, id);
  return id;
}

export function resolveVideoReplaceTarget(
  editor: HTMLDivElement,
  replaceId: string | null,
): EditorMediaElement | null {
  if (!replaceId) return null;

  const marked = editor.querySelector(`[${VIDEO_REPLACE_TARGET_ATTR}="${replaceId}"]`);
  if (marked instanceof HTMLElement) return marked;

  return null;
}

export function clearVideoReplaceTargetMarker(element: EditorMediaElement | null | undefined) {
  element?.removeAttribute(VIDEO_REPLACE_TARGET_ATTR);
}

export function isYouTubeEmbedElement(node: EventTarget | null): node is HTMLElement {
  return (
    node instanceof HTMLElement &&
    node.classList.contains(YOUTUBE_EMBED_CLASS) &&
    node.classList.contains(ARTICLE_EMBED_CLASS)
  );
}

export function isFacebookEmbedElement(node: EventTarget | null): node is HTMLElement {
  return (
    node instanceof HTMLElement &&
    node.classList.contains(FACEBOOK_EMBED_CLASS) &&
    node.classList.contains(ARTICLE_EMBED_CLASS)
  );
}

export function isExternalEmbedElement(node: EventTarget | null): node is HTMLElement {
  return isYouTubeEmbedElement(node) || isFacebookEmbedElement(node);
}

export function isVideoMediaElement(node: EventTarget | null): node is EditorMediaElement {
  return node instanceof HTMLVideoElement || isExternalEmbedElement(node);
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
  return isEditorNativeMediaElement(node) || isExternalEmbedElement(node);
}

export function resolveEditorMediaFromTarget(
  target: EventTarget | null,
): EditorMediaElement | null {
  if (!(target instanceof Element)) return null;
  if (isEditorMediaElement(target)) return target;

  const closest = target.closest(
    `img, video, audio, .${YOUTUBE_EMBED_CLASS}, .${FACEBOOK_EMBED_CLASS}`,
  );
  return isEditorMediaElement(closest) ? closest : null;
}

export function getEditorMediaLabel(element: EditorMediaElement): string {
  if (isYouTubeEmbedElement(element)) return "YouTube video";
  if (isFacebookEmbedElement(element)) return "Facebook video";
  if (element instanceof HTMLImageElement) return "Image";
  if (element instanceof HTMLVideoElement) return "Video";
  return "Audio";
}

export function supportsObjectFit(element: EditorMediaElement): boolean {
  if (isExternalEmbedElement(element)) return false;
  return element instanceof HTMLImageElement || element instanceof HTMLVideoElement;
}

export function supportsVideoReplace(element: EditorMediaElement): boolean {
  return element instanceof HTMLVideoElement || isExternalEmbedElement(element);
}

function readAlign(element: EditorMediaElement): MediaAlign {
  const marginLeft = element.style.marginLeft;
  const marginRight = element.style.marginRight;
  if (marginLeft === "auto" && marginRight === "auto") return "center";
  if (marginLeft === "auto" && marginRight !== "auto") return "right";
  return "left";
}

export function readMediaStyle(element: EditorMediaElement): ArticleEditorMediaStyle {
  const dataAspect =
    element instanceof HTMLElement ? element.getAttribute("data-aspect-ratio")?.trim() : "";
  const defaultAspect =
    dataAspect || (isExternalEmbedElement(element) ? "16 / 9" : "auto");
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

  if (isExternalEmbedElement(element)) {
    element.style.position = "relative";
    element.style.overflow = "hidden";
    if (!element.style.marginTop) element.style.marginTop = "1rem";
    if (!element.style.marginBottom) element.style.marginBottom = "1rem";

    if (style.aspectRatio !== "auto" && style.aspectRatio.trim()) {
      element.setAttribute("data-aspect-ratio", style.aspectRatio);
    }

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

function escapeHtmlAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildMediaInsertHtml(
  tag: "img" | "video" | "audio",
  attrs: Record<string, string>,
): string {
  const defaultStyle =
    "max-width:100%;width:100%;height:auto;display:block;object-fit:contain;";

  if (tag === "img") {
    const caption = attrs.caption?.trim() ?? "";
    const credit = attrs.credit?.trim() ?? "";
    const copyright = attrs.copyright?.trim() ?? "";
    const {
      caption: _caption,
      credit: _credit,
      copyright: _copyright,
      ...rest
    } = attrs;

    const imgAttrs: Record<string, string> = { ...rest };
    if (caption) imgAttrs["data-caption"] = caption;
    if (credit) imgAttrs["data-credit"] = credit;
    if (copyright) imgAttrs["data-copyright"] = copyright;

    const attrString = Object.entries(imgAttrs)
      .map(([key, value]) => `${key}="${escapeHtmlAttr(value)}"`)
      .join(" ");

    const figParts = [caption, credit, copyright].filter(Boolean).map(escapeHtmlAttr);
    const figcaption = figParts.length
      ? `<figcaption>${figParts.join(" · ")}</figcaption>`
      : "";

    return (
      `<figure class="article-figure">` +
      `<img ${attrString} style="${defaultStyle}" contenteditable="false" />` +
      figcaption +
      `</figure><p><br></p>`
    );
  }

  const attrString = Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeHtmlAttr(value)}"`)
    .join(" ");

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
  | { ok: true; embedUrl: string; videoId: string; aspectRatio: string }
  | { ok: false; error: string };

export type VideoEmbedPayload = {
  embedUrl: string;
  aspectRatio: string;
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function formatAspectRatio(width: number, height: number): string {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return "16 / 9";
  }
  const factor = gcd(Math.round(width), Math.round(height));
  return `${Math.round(width) / factor} / ${Math.round(height) / factor}`;
}

export function isPortraitAspectRatio(ratio: string): boolean {
  const parts = ratio.split("/").map((part) => Number.parseFloat(part.trim()));
  if (parts.length !== 2 || parts.some((value) => !Number.isFinite(value) || value <= 0)) {
    return false;
  }
  return parts[1] > parts[0];
}

export function isYouTubeShortsUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.pathname.toLowerCase().includes("/shorts/");
  } catch {
    return false;
  }
}

export function defaultYouTubeAspectRatio(rawUrl: string): string {
  return isYouTubeShortsUrl(rawUrl) ? "9 / 16" : "16 / 9";
}

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
  const watchUrl = isYouTubeShortsUrl(rawUrl)
    ? `https://www.youtube.com/shorts/${videoId}`
    : `https://www.youtube.com/watch?v=${videoId}`;
  const fallbackAspect = defaultYouTubeAspectRatio(rawUrl);

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
      return { ok: true, embedUrl, videoId, aspectRatio: fallbackAspect };
    }

    const data = (await response.json()) as { width?: number; height?: number };
    const aspectRatio =
      data.width && data.height
        ? formatAspectRatio(data.width, data.height)
        : fallbackAspect;

    return { ok: true, embedUrl, videoId, aspectRatio };
  } catch {
    return { ok: true, embedUrl, videoId, aspectRatio: fallbackAspect };
  }
}

function escapeEmbedSrc(url: string): string {
  return url
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const EMBED_IFRAME_STYLE = "position:absolute;inset:0;width:100%;height:100%;border:0;";

function buildEmbedWrapperStyle(aspectRatio: string): string {
  const safeRatio = aspectRatio.trim() || "16 / 9";
  return (
    `position:relative;display:block;max-width:100%;width:100%;aspect-ratio:${safeRatio};` +
    `overflow:hidden;margin:1rem 0;`
  );
}

export function buildYouTubeEmbedHtml(
  embedUrl: string,
  aspectRatio = "16 / 9",
): string {
  const safeSrc = escapeEmbedSrc(embedUrl);
  const safeRatio = aspectRatio.replace(/"/g, "");

  return (
    `<div class="${ARTICLE_EMBED_CLASS} ${YOUTUBE_EMBED_CLASS}" contenteditable="false" ` +
    `data-embed-type="youtube" data-aspect-ratio="${safeRatio}" ` +
    `style="${buildEmbedWrapperStyle(safeRatio)}">` +
    `<iframe src="${safeSrc}" title="YouTube video" ` +
    `style="${EMBED_IFRAME_STYLE}" ` +
    `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
    `allowfullscreen loading="lazy"></iframe></div><p><br></p>`
  );
}

/**
 * Normalize a Facebook watch / videos / reel / fb.watch URL for the embed plugin.
 */
export function normalizeFacebookVideoUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "").toLowerCase();

  if (host === "fb.watch") {
    const slug = parsed.pathname.split("/").filter(Boolean)[0];
    return slug ? `https://fb.watch/${slug}/` : null;
  }

  if (host !== "facebook.com" && host !== "fb.com") {
    return null;
  }

  const path = parsed.pathname.toLowerCase();

  if (path.includes("/plugins/video.php")) {
    const href = parsed.searchParams.get("href");
    return href ? normalizeFacebookVideoUrl(href) : null;
  }

  if (path.includes("/watch")) {
    const videoId = parsed.searchParams.get("v");
    return videoId ? `https://www.facebook.com/watch/?v=${videoId}` : null;
  }

  if (path.includes("/videos/") || path.includes("/reel/") || path.endsWith("video.php")) {
    const base = `https://www.facebook.com${parsed.pathname}`.replace(/\/+$/, "");
    const videoId = parsed.searchParams.get("v");
    return videoId ? `${base}?v=${videoId}` : `${base}/`;
  }

  return null;
}

export function resolveFacebookEmbedUrl(rawUrl: string): string | null {
  const href = normalizeFacebookVideoUrl(rawUrl);
  if (!href) return null;
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false&width=560`;
}

export type FacebookValidationResult =
  | { ok: true; embedUrl: string; videoUrl: string; aspectRatio: string }
  | { ok: false; error: string };

export async function validateFacebookUrl(rawUrl: string): Promise<FacebookValidationResult> {
  const videoUrl = normalizeFacebookVideoUrl(rawUrl);
  if (!videoUrl) {
    return {
      ok: false,
      error: "Wrong URL. Use a Facebook watch, videos, reel, or fb.watch link.",
    };
  }

  const embedUrl = resolveFacebookEmbedUrl(rawUrl);
  if (!embedUrl) {
    return { ok: false, error: "Could not build a Facebook embed for this URL." };
  }

  const isReel = videoUrl.toLowerCase().includes("/reel/");
  const fallbackAspect = isReel ? "9 / 16" : "16 / 9";

  try {
    const response = await fetch(
      `https://www.facebook.com/plugins/video/oembed.json/?url=${encodeURIComponent(videoUrl)}`,
    );

    if (response.status === 404 || response.status === 400) {
      return {
        ok: false,
        error: "Video not found or not embeddable. Check the URL and privacy settings.",
      };
    }

    if (!response.ok) {
      return { ok: true, embedUrl, videoUrl, aspectRatio: fallbackAspect };
    }

    const data = (await response.json()) as { width?: number; height?: number };
    const aspectRatio =
      data.width && data.height
        ? formatAspectRatio(data.width, data.height)
        : fallbackAspect;

    return { ok: true, embedUrl, videoUrl, aspectRatio };
  } catch {
    return { ok: true, embedUrl, videoUrl, aspectRatio: fallbackAspect };
  }
}

export function buildFacebookEmbedHtml(
  embedUrl: string,
  aspectRatio = "16 / 9",
): string {
  const safeSrc = escapeEmbedSrc(embedUrl);
  const safeRatio = aspectRatio.replace(/"/g, "");

  return (
    `<div class="${ARTICLE_EMBED_CLASS} ${FACEBOOK_EMBED_CLASS}" contenteditable="false" ` +
    `data-embed-type="facebook" data-aspect-ratio="${safeRatio}" ` +
    `style="${buildEmbedWrapperStyle(safeRatio)}">` +
    `<iframe src="${safeSrc}" title="Facebook video" ` +
    `style="${EMBED_IFRAME_STYLE}" ` +
    `allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" ` +
    `allowfullscreen loading="lazy"></iframe></div><p><br></p>`
  );
}

/** Insert or replace video HTML in the editor at the saved cursor or replace target. */
export function insertVideoHtmlInEditor(
  editor: HTMLDivElement,
  html: string,
  replaceTarget: EditorMediaElement | null,
  restoreSelection?: () => void,
): HTMLElement | null {
  const temp = document.createElement("div");
  temp.innerHTML = html.trim();
  const newNode = temp.firstElementChild;
  if (!(newNode instanceof HTMLElement)) return null;

  const trailingParagraph = temp.querySelector("p");

  if (replaceTarget && editor.contains(replaceTarget)) {
    const previousStyle = readMediaStyle(replaceTarget);
    const adopted = document.importNode(newNode, true);

    replaceTarget.replaceWith(adopted);

    if (adopted instanceof HTMLElement) {
      const nextAspect =
        adopted.getAttribute("data-aspect-ratio")?.trim() || previousStyle.aspectRatio;
      applyMediaStyle(adopted, {
        ...previousStyle,
        aspectRatio: nextAspect,
        height: "auto",
      });
    }

    if (trailingParagraph instanceof HTMLParagraphElement) {
      adopted.after(document.importNode(trailingParagraph, true));
    }

    clearVideoReplaceTargetMarker(replaceTarget);
    return adopted instanceof HTMLElement ? adopted : null;
  }

  restoreSelection?.();
  document.execCommand("insertHTML", false, html);

  const selection = window.getSelection();
  const anchor = selection?.anchorNode;
  const inserted =
    anchor instanceof HTMLElement
      ? anchor
      : anchor?.parentElement instanceof HTMLElement
        ? anchor.parentElement
        : null;

  return inserted && editor.contains(inserted) ? inserted : newNode;
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
