const ALLOWED_TAGS = new Set([
  "p", "br", "h2", "h3", "strong", "b", "em", "i", "u", "a",
  "ul", "ol", "li", "blockquote", "table", "thead", "tbody", "tr", "th", "td",
  "img", "video", "audio", "figure", "figcaption", "div", "iframe",
]);

const GLOBAL_ATTRS = new Set([
  "class", "style", "contenteditable", "data-embed-type", "data-aspect-ratio",
  "data-embed-orientation", "data-embed-width", "data-embed-height",
  "data-caption", "data-credit", "data-copyright",
]);

function isAllowedIframeSrc(src: string): boolean {
  try {
    const parsed = new URL(src);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const path = parsed.pathname;

    if (["youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)) {
      return path.startsWith("/embed/");
    }
    if (host === "facebook.com") {
      return path === "/plugins/video.php";
    }
  } catch {
    return false;
  }
  return false;
}

function isAllowedMediaSrc(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const parsed = new URL(src);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isAllowedLinkHref(href: string): boolean {
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  if (href.startsWith("#") || href.startsWith("mailto:")) return true;
  try {
    const parsed = new URL(href);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function allowedAttrsForTag(tag: string): Set<string> {
  const attrs = new Set(GLOBAL_ATTRS);
  if (tag === "a") ["href", "target", "rel"].forEach((a) => attrs.add(a));
  if (tag === "img" || tag === "video" || tag === "audio") {
    ["src", "poster", "alt", "title", "controls", "preload", "loading"].forEach((a) =>
      attrs.add(a),
    );
  }
  if (tag === "iframe") {
    ["src", "title", "allow", "allowfullscreen", "loading"].forEach((a) => attrs.add(a));
  }
  if (tag === "th" || tag === "td") ["colspan", "rowspan"].forEach((a) => attrs.add(a));
  return attrs;
}

function isAllowedEmbedDiv(element: Element): boolean {
  return element.classList.contains("article-embed");
}

const EDITOR_ONLY_ATTRS = new Set(["data-editor-video-replace-id"]);

function sanitizeElement(element: Element, doc: Document): Element | DocumentFragment | null {
  const tag = element.tagName.toLowerCase();

  if (!ALLOWED_TAGS.has(tag)) {
    const fragment = doc.createDocumentFragment();
    Array.from(element.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        fragment.appendChild(child.cloneNode());
        return;
      }
      if (child instanceof Element) {
        const sanitized = sanitizeElement(child, doc);
        if (sanitized) fragment.appendChild(sanitized);
      }
    });
    return fragment;
  }

  if (tag === "div" && !isAllowedEmbedDiv(element)) {
    const fragment = doc.createDocumentFragment();
    Array.from(element.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        fragment.appendChild(child.cloneNode());
        return;
      }
      if (child instanceof Element) {
        const sanitized = sanitizeElement(child, doc);
        if (sanitized) fragment.appendChild(sanitized);
      }
    });
    return fragment;
  }

  if (tag === "iframe") {
    const src = element.getAttribute("src")?.trim() ?? "";
    if (!isAllowedIframeSrc(src)) return null;
  }

  const clone = doc.createElement(tag);
  const allowed = allowedAttrsForTag(tag);

  Array.from(element.attributes).forEach((attr) => {
    const name = attr.name.toLowerCase();
    if (name.startsWith("on") || !allowed.has(name) || EDITOR_ONLY_ATTRS.has(name)) return;
    clone.setAttribute(name, attr.value);
  });

  if (tag === "img" || tag === "video" || tag === "audio") {
    const src = clone.getAttribute("src")?.trim() ?? "";
    if (src && !isAllowedMediaSrc(src)) clone.removeAttribute("src");
    if (tag === "video") {
      const poster = clone.getAttribute("poster")?.trim() ?? "";
      if (poster && !isAllowedMediaSrc(poster)) clone.removeAttribute("poster");
    }
  }

  if (tag === "a") {
    const href = clone.getAttribute("href")?.trim() ?? "";
    if (href && !isAllowedLinkHref(href)) clone.removeAttribute("href");
  }

  if (tag === "iframe") {
    const src = clone.getAttribute("src")?.trim() ?? "";
    if (!src || !isAllowedIframeSrc(src)) {
      clone.setAttribute("src", "about:blank");
    }
  }

  Array.from(element.childNodes).forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      clone.appendChild(doc.createTextNode(child.textContent ?? ""));
      return;
    }
    if (child instanceof Element) {
      const sanitized = sanitizeElement(child, doc);
      if (sanitized) clone.appendChild(sanitized);
    }
  });

  return clone;
}

/** Strip unsafe HTML before paste or when syncing editor content. */
export function sanitizeArticleEditorHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  const doc = new DOMParser().parseFromString(`<div id="root">${trimmed}</div>`, "text/html");
  const root = doc.getElementById("root");
  if (!root) return "";

  const output = doc.createElement("div");
  Array.from(root.childNodes).forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      output.appendChild(doc.createTextNode(child.textContent ?? ""));
      return;
    }
    if (child instanceof Element) {
      const sanitized = sanitizeElement(child, doc);
      if (sanitized) output.appendChild(sanitized);
    }
  });

  return output.innerHTML;
}
