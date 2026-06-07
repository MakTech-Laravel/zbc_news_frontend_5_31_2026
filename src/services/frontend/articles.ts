import { request } from "@/api/request";
import { resolveMediaUrl } from "@/lib/mediaUrl";

export type ArticleDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  articleDescription: string;
  category: string;
  imageUrl: string;
  authorName: string;
  authorInitials: string;
  publishedAt: string;
  publishedAtIso: string;
  readTime: string;
  tags: string[];
};

function formatPublishedAt(value: unknown): { label: string; iso: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { label: "", iso: "" };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { label: value, iso: value };
  }

  return {
    label: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    iso: date.toISOString(),
  };
}

function resolveAuthorName(raw: Record<string, unknown>): string {
  if (typeof raw.author === "string") return raw.author;
  if (raw.user && typeof raw.user === "object") {
    const user = raw.user as Record<string, unknown>;
    if (typeof user.name === "string") return user.name;
  }
  return "ZBC News";
}

function resolveCategoryLabel(raw: Record<string, unknown>): string {
  if (typeof raw.category === "string") return raw.category;
  if (raw.category && typeof raw.category === "object") {
    const category = raw.category as Record<string, unknown>;
    if (typeof category.title === "string") return category.title;
    if (typeof category.name === "string") return category.name;
  }
  return "News";
}

function parseTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((tag) => {
      if (typeof tag === "string") return tag;
      if (tag && typeof tag === "object") {
        const record = tag as Record<string, unknown>;
        if (typeof record.name === "string") return record.name;
        if (typeof record.title === "string") return record.title;
      }
      return "";
    })
    .filter(Boolean);
}

function toInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ZN"
  );
}

function mapApiArticleDetail(raw: unknown): ArticleDetail | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const id = record.id;
  const title = record.title;
  const slug = record.slug;

  if (id == null || typeof title !== "string" || typeof slug !== "string") {
    return null;
  }

  const articleDescription =
    typeof record.article_description === "string"
      ? record.article_description
      : typeof record.content === "string"
        ? record.content
        : "";

  const subtitle =
    (typeof record.sub_title === "string" && record.sub_title) ||
    (typeof record.excerpt === "string" && record.excerpt) ||
    "";

  const published = formatPublishedAt(record.published_at ?? record.created_at);
  const authorName = resolveAuthorName(record);

  return {
    id: String(id),
    slug,
    title,
    subtitle,
    articleDescription,
    category: resolveCategoryLabel(record),
    imageUrl: resolveMediaUrl(
      typeof record.featured_image === "string"
        ? record.featured_image
        : typeof record.featured_image_url === "string"
          ? record.featured_image_url
          : "",
    ),
    authorName,
    authorInitials: toInitials(authorName),
    publishedAt: published.label,
    publishedAtIso: published.iso,
    readTime:
      typeof record.read_time === "string" && record.read_time.trim()
        ? record.read_time
        : "5 min read",
    tags: parseTags(record.tags),
  };
}

export async function fetchArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const encodedSlug = encodeURIComponent(slug);
  const response = await request.get(`/articles/show/${encodedSlug}`);
  const payload = response.data?.data ?? response.data;
  return mapApiArticleDetail(payload);
}

export async function recordArticleView(slug: string): Promise<void> {
  const encodedSlug = encodeURIComponent(slug);
  await request.post(`/articles/view/${encodedSlug}`).catch(() => {});
}
