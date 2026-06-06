import type { ArticleEditorForm } from "@/components/admin/articles/editor/types";
import { ARTICLE_EDITOR_AUTHORS } from "@/components/admin/articles/editor/types";
import type { ArticlePreviewData } from "@/components/admin/articles/editor/ArticlePreviewDialog";
import type { ArticleStatus } from "@/data/admin/mockArticles";

export function getAuthorNameFromForm(form: ArticleEditorForm): string {
  const match = ARTICLE_EDITOR_AUTHORS.find((a) => a.value === form.authorId);
  if (!match?.value) return "Unknown author";
  return match.label;
}

export function buildArticlePreviewData(
  form: ArticleEditorForm,
  status: ArticleStatus,
): ArticlePreviewData {
  return {
    title: form.title,
    article_description: form.content,
    excerpt: form.excerpt,
    category: form.category,
    tags: form.tags,
    authorName: getAuthorNameFromForm(form),
    featuredImageUrl: form.featuredImagePreview,
    status,
  };
}
