import { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";

import {
  ArticleContent,
  DetailsSkeleton,
} from "@/components/main-layout/NewsDetails/Details";
import { AdUnit } from "@/components/main-layout/shared/AdUnit";
import { ArticleGrid } from "@/components/main-layout/content/ArticleGrid";
import { CategoryArticlesView } from "@/components/main-layout/content/CategoryArticlesView";
import { FeaturedSection } from "@/components/main-layout/content/FeaturedSection";
import { HeroSection } from "@/components/main-layout/content/HeroSection";
import { LatestStories } from "@/components/main-layout/content/LatestStories";
import { getTagPath } from "@/lib/tagPaths";
import {
  fetchArticleBySlug,
  type ArticleDetail,
} from "@/services/frontend/articles";

type SlugView = "loading" | "article" | "category";

export default function Home() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const legacyTag = searchParams.get("tag");
  const [view, setView] = useState<SlugView>(slug ? "loading" : "category");
  const [article, setArticle] = useState<ArticleDetail | null>(null);

  useEffect(() => {
    if (!slug) {
      setView("category");
      setArticle(null);
      return;
    }

    let cancelled = false;
    setView("loading");
    setArticle(null);

    fetchArticleBySlug(decodeURIComponent(slug))
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setArticle(data);
          setView("article");
          return;
        }
        setView("category");
      })
      .catch((error) => {
        console.error("Failed to resolve slug as article:", error);
        if (!cancelled) setView("category");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug && legacyTag?.trim()) {
    return <Navigate to={getTagPath(legacyTag)} replace />;
  }

  if (!slug) {
    return (
      <article className="flex flex-col gap-5 sm:gap-7 lg:gap-8">
        <HeroSection />
        <AdUnit variant="banner" />
        <FeaturedSection />
        <ArticleGrid />
        <AdUnit variant="banner" />
        <LatestStories />
        <AdUnit variant="banner" />
      </article>
    );
  }

  if (view === "loading") {
    return (
      <article className="flex flex-col gap-5 bg-background sm:gap-7 lg:gap-8">
        <DetailsSkeleton />
      </article>
    );
  }

  if (view === "article" && article) {
    return (
      <article className="flex flex-col gap-5 bg-background sm:gap-7 lg:gap-8">
        <ArticleContent article={article} />
      </article>
    );
  }

  return <CategoryArticlesView categorySlug={slug} />;
}
