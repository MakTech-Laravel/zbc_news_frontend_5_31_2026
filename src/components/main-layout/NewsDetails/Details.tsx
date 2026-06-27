import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Clock, Timer } from "lucide-react";

import { ArticleComments } from "@/components/main-layout/NewsDetails/ArticleComments";
import { ArticleDetailToolbar } from "@/components/main-layout/NewsDetails/ArticleDetailToolbar";
import { ArticleShareButton } from "@/components/articles/ArticleShareButton";
import { ArticleGrid } from "@/components/main-layout/content/ArticleGrid";
import { ArticleImage } from "@/components/main-layout/shared/ArticleImage";
import { CategoryTag } from "@/components/main-layout/shared/CategoryTag";
import NotFound from "@/pages/global/NotFound";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/context/SiteSettingsProvider";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import {
  fetchArticleBySlug,
  fetchRelatedArticles,
  type ArticleDetail,
} from "@/services/frontend/articles";
import type { Article } from "@/data/dummy/types";
import { AdUnit } from "../shared/AdUnit";
import { useArticleTracking } from "@/hooks/useArticleTracking";
import {
  getArticlePageUrl,
} from "@/lib/articleShare";


const articleBodyClassName = cn(
  "article-detail-body space-y-4",
  "font-inter text-base leading-[1.75] text-zbc-gray-700 sm:text-[17px]",
  "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-zbc-gray-1000",
  "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zbc-gray-1000",
  "[&_p]:leading-[1.75] [&_strong]:font-semibold [&_em]:italic",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_a]:text-primary [&_a]:underline",
  "[&_img]:my-4 [&_img]:max-h-[420px] [&_img]:w-full [&_img]:rounded-lg [&_img]:object-cover",
);

function DetailsSkeleton() {
  return (
    <article className="bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-0 sm:px-2">
        {/* <ArticleDetailToolbar /> */}
        <div className="flex items-center justify-between border-b border-border bg-background py-3">
          <div className="h-5 w-12 rounded bg-muted" />
          <div className="flex gap-4">
            <div className="size-8 rounded bg-muted" />
            <div className="size-8 rounded bg-muted" />
          </div>
        </div>
        <div className="animate-pulse space-y-6 pt-6">
          <div className="h-6 w-24 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="aspect-[16/9] w-full rounded-lg bg-muted" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </div>
      </div>
    </article>
  );
}

function ArticleContent({ article }: { article: ArticleDetail }) {
  const { settings } = useSiteSettings();
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useDocumentHead({
    path: `/news-details/${article.slug}`,
    title: article.metaTitle,
    description: article.metaDescription,
    keywords: article.metaKeywords,
    image: article.shareImageUrl || article.imageUrl,
    url: getArticlePageUrl(article.slug),
    type: "article",
    publishedAt: article.publishedAtIso || undefined,
    modifiedAt:
      article.showUpdated && article.updatedAtIso
        ? article.updatedAtIso
        : undefined,
  });

  useEffect(() => {
    if (settings.relatedArticlesCount <= 0) {
      setRelatedArticles([]);
      return;
    }

    fetchRelatedArticles(article.slug)
      .then(setRelatedArticles)
      .catch(() => setRelatedArticles([]));
  }, [article.slug, settings.relatedArticlesCount]);

  useArticleTracking(Number(article.id));

  return (
    <article className="bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-0 sm:px-2">
        <ArticleDetailToolbar
          articleId={article.id}
          articleTitle={article.title}
          articleSlug={article.slug}
          articleSummary={article.metaDescription || article.subtitle}
          articleImageUrl={article.shareImageUrl || article.imageUrl}
        />

        <header className="space-y-4 pb-6 pt-6 sm:space-y-5 sm:pb-8">
          <CategoryTag
            label={article.category}
            className="bg-primary/10 text-primary"
          />

          <h1 className="font-inter text-2xl font-bold leading-[1.2] tracking-tight text-zbc-gray-1000 sm:text-3xl sm:leading-[1.15] lg:text-4xl lg:leading-[1.12]">
            {article.title}
          </h1>

          {article.subtitle ? (
            <p className="font-inter text-base font-normal leading-7 text-zbc-gray-700 sm:text-lg sm:leading-8">
              {article.subtitle}
            </p>
          ) : null}

          <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary font-inter text-sm font-bold text-primary-foreground">
                {article.authorInitials}
              </span>
              <span className="min-w-0">
                <span className="block font-inter text-sm font-bold text-zbc-gray-1000">
                  {article.authorName}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-inter text-sm text-zbc-gray-500">
              {article.publishedAt ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar
                    className="size-4 shrink-0 text-zbc-gray-400"
                    aria-hidden
                  />
                  <span>
                    Published:{" "}
                    <time dateTime={article.publishedAtIso}>
                      {article.publishedAt}
                      {article.publishedTime ? ` ${article.publishedTime}` : ""}
                    </time>
                  </span>
                </span>
              ) : null}
              {article.showUpdated && article.updatedAt ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock
                    className="size-4 shrink-0 text-zbc-gray-400"
                    aria-hidden
                  />
                  <span>
                    Updated:{" "}
                    <time dateTime={article.updatedAtIso}>
                      {article.updatedAt}
                      {article.updatedTime ? ` ${article.updatedTime}` : ""}
                    </time>
                  </span>
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Timer
                  className="size-4 shrink-0 text-zbc-gray-400"
                  aria-hidden
                />
                {article.readTime}
              </span>
            </div>
          </div>
        </header>

        {article.imageUrl ? (
          <figure className="overflow-hidden rounded-lg border border-border bg-muted shadow-sm">
            <div className="relative aspect-[16/9] min-h-[200px] w-full sm:min-h-[280px] lg:min-h-[360px]">
              <ArticleImage
                src={article.imageUrl}
                alt={article.title}
                width={1200}
                height={675}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-zbc-gray-900/90 via-zbc-gray-900/35 to-transparent"
                aria-hidden
              />
              <figcaption className="absolute inset-x-0 bottom-0 space-y-2 p-4 sm:space-y-3 sm:p-6 lg:p-8">
                <CategoryTag label={article.category} />
                <p className="font-inter text-xl font-bold leading-tight text-primary-foreground sm:text-2xl lg:text-3xl">
                  {article.title}
                </p>
                {article.subtitle ? (
                  <p className="line-clamp-2 max-w-3xl font-inter text-sm leading-6 text-white/90 sm:text-base">
                    {article.subtitle}
                  </p>
                ) : null}
              </figcaption>
            </div>
          </figure>
        ) : null}

        <div className="py-8 sm:py-10">
          <div
            className={articleBodyClassName}
            dangerouslySetInnerHTML={{
              __html:
                article.articleDescription.trim() ||
                "<p>No content available for this article.</p>",
            }}
          />
        </div>

        {article.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-border pt-6">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-zbc-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <section
          className="border-t border-border py-8 sm:py-5"
          aria-labelledby="share-article-heading"
        >
          <h2
            id="share-article-heading"
            className="text-center font-inter text-sm font-bold text-zbc-gray-1000"
          >
            Share this article
          </h2>
          <div className="mt-5 flex justify-center">
            <ArticleShareButton
              variant="labeled"
              slug={article.slug}
              title={article.metaTitle}
              excerpt={article.metaDescription || article.subtitle}
              imageUrl={article.shareImageUrl || article.imageUrl}
            />
          </div>
        </section>

        <section
          className="border-t border-border pt-8 sm:pt-10"
          aria-labelledby="related-heading"
        >
          <h2
            id="related-heading"
            className="text-center font-inter text-xl font-bold text-zbc-gray-1000 sm:text-2xl"
          >
            Related Articles
          </h2>
          {relatedArticles.length > 0 ? (
            <div className="mt-6">
              <ArticleGrid articles={relatedArticles} />
            </div>
          ) : (
            <div className="border-b border-border pb-8" />
          )}
        </section>

        <ArticleComments
          articleSlug={article.slug}
          allowComments={settings.allowComments && !settings.disqusShortname}
          requireRegistration={settings.requireRegistrationToComment}
        />

        <div className="mt-3 space-y-6 pb-4 sm:mt-5 sm:space-y-3 sm:pb-3">
          <AdUnit variant="banner" />
          <AdUnit variant="banner" />
        </div>
      </div>
    </article>
  );
}

export default function Details() {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!articleSlug) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;

    fetchArticleBySlug(decodeURIComponent(articleSlug))
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
          return;
        }
        setArticle(data);
      })
      .catch((error) => {
        console.error("Failed to fetch article:", error);
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [articleSlug]);

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (notFound || !article) {
    return <NotFound />;
  }

  return <ArticleContent article={article} />;
}
