import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { UserFeedArticleCard } from "@/components/user/dashboard/UserFeedArticleCard";
import { userFeedArticles } from "@/data/dummy/userDashboard";
import type { TagArticleFeeds } from "@/services/user/tagArticles";
import type { UserFeedArticle } from "@/types/user";
import { cn } from "@/lib/utils";

const TABS = ["Recommended", "Latest", "Trending"] as const;
type FeedTab = (typeof TABS)[number];

const TAB_TO_FEED_KEY: Record<FeedTab, keyof TagArticleFeeds> = {
  Recommended: "recommended",
  Latest: "latest",
  Trending: "trending",
};



type UserPersonalizedFeedProps = {
  title?: string;
  viewAllHref?: string;
  feeds?: TagArticleFeeds;
  loading?: boolean;
};



export function UserPersonalizedFeed({
  title = "Your Personalized Feed",
  viewAllHref = "/user/saved-articles",
  feeds,
  loading = false,
}: UserPersonalizedFeedProps) {

  const [activeTab, setActiveTab] = React.useState<FeedTab>("Recommended");



  const articles: UserFeedArticle[] = feeds
    ? feeds[TAB_TO_FEED_KEY[activeTab]]
    : userFeedArticles;
  return (

    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">

        <h2 className="text-lg font-semibold leading-7 text-admin-heading sm:text-xl">

          {title}

        </h2>

        <Link

          to={viewAllHref}

          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-sm font-medium text-admin-heading transition-colors hover:bg-muted"

        >

          View All

          <ChevronRight className="size-4" aria-hidden />

        </Link>

      </div>



      <div className="-mx-1 max-w-full overflow-x-auto px-1 pb-0.5">

        <div className="inline-flex w-max flex-nowrap rounded-lg border border-border bg-muted p-1">

          {TABS.map((tab) => (

            <button

              key={tab}

              type="button"

              onClick={() => setActiveTab(tab)}

              className={cn(

                "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",

                activeTab === tab

                  ? "bg-card text-admin-heading shadow-sm"

                  : "text-admin-label hover:text-admin-heading",

              )}

            >

              {tab}

            </button>

          ))}

        </div>

      </div>



      {loading ? (

        <p className="text-sm text-admin-label">Loading articles…</p>

      ) : articles.length === 0 ? (

        <p className="text-sm text-admin-label">No articles in this feed yet.</p>

      ) : (

        <div key={activeTab} className="user-portal-fade-in space-y-3">

          {articles.map((article) => (

            <UserFeedArticleCard

              key={`${activeTab}-${article.id}`}

              article={article}

              density="compact"

            />

          ))}

        </div>

      )}

    </div>

  );

}

