import { Link } from "react-router-dom";

// import { mostReadItems } from "@/data/dummy/sidebar";
import { SidebarCard } from "@/components/main-layout/shared/SidebarCard";
import { ChartNoAxesColumn, Eye } from "lucide-react";

import { useEffect, useState } from "react";
import { request } from "@/api/request";

export function MostReadCard() {

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMostRead = async () => {
      try {
        const response = await request.get("/articles/most-read");
        setArticles(response.data.data);
      } catch (error) {
        console.error("Failed to fetch most read articles:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMostRead();
  }, []);
  
  if (loading) {
    return (
      <div className="h-[320px] animate-pulse rounded-xs bg-muted" />
    );
  }


  return (
    <SidebarCard className="bg-surface-soft rounded-xs p-0!">

      <div className="flex items-center gap-2 border-b-2 border-border pb-3 mb-3 p-4">
        <ChartNoAxesColumn className="size-5 text-primary" />
        <h2 className="font-inter text-sm font-bold text-zbc-gray-1000">Most Read</h2>
      </div>

      <ol className="space-y-3">
        {articles.map((article, index) => (
          <li key={article.id} className="flex gap-3 border-b-2 border-border p-4">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-sm font-inter font-extrabold text-2xl text-primary/20">
            {index + 1}
            </span>
            <div>
              <Link
                to={`/news-details/${article.slug}`}
                className="line-clamp-3 font-inter text-xs font-semibold leading-snug text-zbc-gray-1000 hover:text-primary"
              >
                {article.title}
              </Link>
             <span className="flex items-center gap-1 mt-1">
              <Eye className="size-4 text-zbc-gray-500" />
              <span className="font-inter text-xs text-zbc-gray-500">{article.views?.toLocaleString() ?? 0}</span>
             </span>
            </div>
          </li>
        ))}
      </ol>
    </SidebarCard>
  );
}
