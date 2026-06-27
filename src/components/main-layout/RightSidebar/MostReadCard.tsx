import { Link } from "react-router-dom";
import { ChartNoAxesColumn, Eye } from "lucide-react";

import { SidebarCard } from "@/components/main-layout/shared/SidebarCard";
import { useMostReadArticles } from "@/hooks/useMostReadArticles";
import { formatCount } from "@/utils/format";

export function MostReadCard() {
  const { articles, loading } = useMostReadArticles();

  if (loading) {
    return <div className="h-[320px] animate-pulse rounded-xs bg-muted" />;
  }

  return (
    <SidebarCard className="rounded-xs bg-surface-soft p-0!">
      <div className="mb-3 flex items-center gap-2 border-b-2 border-border p-4 pb-3">
        <ChartNoAxesColumn className="size-5 text-primary" />
        <h2 className="font-inter text-sm font-bold text-zbc-gray-1000">Most Read</h2>
      </div>

      {articles.length === 0 ? (
        <p className="p-4 text-xs text-muted-foreground">No articles yet.</p>
      ) : (
        <ol className="space-y-3">
          {articles.map((article, index) => (
            <li key={article.id} className="flex gap-3 border-b-2 border-border p-4">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-sm font-inter text-2xl font-extrabold text-primary/20">
                {index + 1}
              </span>
              <div>
                <Link
                  to={
                    article.slug
                      ? `/news-details/${encodeURIComponent(article.slug)}`
                      : "/news-details"
                  }
                  className="line-clamp-3 font-inter text-xs font-semibold leading-snug text-zbc-gray-1000 hover:text-primary"
                >
                  {article.title}
                </Link>
                <span className="mt-1 flex items-center gap-1">
                  <Eye className="size-4 text-zbc-gray-500" />
                  <span className="font-inter text-xs text-zbc-gray-500">
                    {formatCount(article.views ?? 0)}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SidebarCard>
  );
}
