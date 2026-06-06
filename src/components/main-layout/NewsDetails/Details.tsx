import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, Clock, MessageCircle } from "lucide-react";

import { ArticleImage } from "@/components/main-layout/shared/ArticleImage";
import { CategoryTag } from "@/components/main-layout/shared/CategoryTag";
import NotFound from "@/pages/global/NotFound";
import { cn } from "@/lib/utils";
import {
  fetchArticleBySlug,
  type ArticleDetail,
} from "@/services/frontend/articles";
import { AdUnit } from "../shared/AdUnit";

type SocialIconProps = { className?: string };

function FacebookIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const SHARE_LINKS = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: FacebookIcon,
    className: "bg-[#1877F2] hover:bg-[#166fe5]",
  },
  {
    label: "Twitter",
    href: "https://x.com",
    icon: XIcon,
    className: "bg-[#1DA1F2] hover:bg-[#1a94da]",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: LinkedInIcon,
    className: "bg-[#0A66C2] hover:bg-[#0958aa]",
  },
] as const;

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
      <div className="mx-auto w-full max-w-4xl animate-pulse space-y-6 px-0 sm:px-2">
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
    </article>
  );
}

function ArticleContent({ article }: { article: ArticleDetail }) {
  return (
    <article className="bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-0 sm:px-2">
        <header className="space-y-4 pb-6 sm:space-y-5 sm:pb-8">
          <CategoryTag label={article.category} className="bg-primary/10 text-primary" />

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
                  <Calendar className="size-4 shrink-0 text-zbc-gray-400" aria-hidden />
                  <time dateTime={article.publishedAtIso}>{article.publishedAt}</time>
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4 shrink-0 text-zbc-gray-400" aria-hidden />
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
          <div className="mt-5 flex items-center justify-center gap-3">
            {SHARE_LINKS.map(({ label, href, icon: Icon, className }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xs px-3 sm:px-5 font-inter text-sm font-semibold text-white transition-colors sm:max-w-[200px] sm:flex-initial ${className}`}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </a>
            ))}
          </div>
        </section>

        <section className="border-t border-border pt-8 sm:pt-10" aria-labelledby="related-heading">
          <h2
            id="related-heading"
            className="text-center font-inter text-xl font-bold text-zbc-gray-1000 sm:text-2xl"
          >
            Related Articles
          </h2>
          <div className="border-b border-border pb-8" />
        </section>

        <section className="pt-3 sm:pt-5" aria-labelledby="comments-heading">
          <h2
            id="comments-heading"
            className="text-center font-inter text-xl font-bold text-zbc-gray-1000 sm:text-2xl"
          >
            Comments
          </h2>
          <div className="mt-5 flex flex-col gap-4 rounded-lg border border-border bg-zbc-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <MessageCircle className="size-5 shrink-0 text-zbc-gray-400" aria-hidden />
              <p className="font-inter text-sm text-zbc-gray-700 sm:text-base">
                Sign In to join the conversation
              </p>
            </div>
            <Link
              to="/login"
              className="shrink-0 font-inter text-sm font-semibold text-primary hover:underline sm:text-base"
            >
              Sign In
            </Link>
          </div>
        </section>

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
        if (!cancelled) {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
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
