export type EditorMediaElement = HTMLImageElement | HTMLVideoElement | HTMLAudioElement;

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

export function isEditorMediaElement(node: EventTarget | null): node is EditorMediaElement {
  return (
    node instanceof HTMLImageElement ||
    node instanceof HTMLVideoElement ||
    node instanceof HTMLAudioElement
  );
}

export function getEditorMediaLabel(element: EditorMediaElement): string {
  if (element instanceof HTMLImageElement) return "Image";
  if (element instanceof HTMLVideoElement) return "Video";
  return "Audio";
}

export function supportsObjectFit(element: EditorMediaElement): boolean {
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
  return {
    width: element.style.width || "100%",
    height: element.style.height || "auto",
    aspectRatio: element.style.aspectRatio || "auto",
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
