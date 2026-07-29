import { ArticleCard } from "@/components/main-layout/content/ArticleCard";
import { useSubMenuSection } from "@/hooks/useSubMenuSection";
import type { Article } from "@/data/dummy/types";
import type { SubMenuKey } from "@/services/frontend/subMenu";

const SECTION_TITLES: Record<SubMenuKey, string> = {
  trending: "Trending",
  most_read: "Most Read",
  live_updates: "Live Updates",
  editorial_picks: "Editorial Picks",
};

type SubMenuFeedProps = {
  section: SubMenuKey;
};

/**
 * Keep API array order exactly (no client re-sort). Serial badge matches backend `serial`.
 */
function OrderedSubMenuGrid({ articles }: { articles: Article[] }) {
  return (
    <ol className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-5 lg:gap-6">
      {articles.map((article, index) => {
        const serial = article.serial ?? index + 1;
        return (
          <li key={article.id} className="relative min-w-0">
            {/* <span
              className="absolute left-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground shadow-sm"
              aria-label={`Position ${serial}`}
            >
              {serial}
            </span> */}
            <ArticleCard article={article} />
          </li>
        );
      })}
    </ol>
  );
}

export function SubMenuFeed({ section }: SubMenuFeedProps) {
  const { items, loading, enabled, settings } = useSubMenuSection(section);
  const title = SECTION_TITLES[section];

  if (!loading && !enabled) {
    return (
      <section className="space-y-3" aria-labelledby="section-feed-heading">
        <h1
          id="section-feed-heading"
          className="font-inter text-2xl font-bold text-zbc-gray-1000"
        >
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          This section is currently disabled.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="section-feed-heading">
      <div>
        <p className="font-inter text-xs font-semibold uppercase tracking-wide text-primary">
          Filtered
        </p>
        <h1
          id="section-feed-heading"
          className="font-inter text-2xl font-bold text-zbc-gray-1000"
        >
          {title}
        </h1>
        {settings?.limit ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Showing up to {settings.limit} curated articles in admin order.
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-xs bg-muted" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No articles in this section yet.</p>
      ) : (
        <OrderedSubMenuGrid articles={items} />
      )}
    </section>
  );
}

export function parseSubMenuSectionParam(
  value: string | null,
): SubMenuKey | null {
  if (
    value === "trending" ||
    value === "most_read" ||
    value === "live_updates" ||
    value === "editorial_picks"
  ) {
    return value;
  }
  return null;
}
