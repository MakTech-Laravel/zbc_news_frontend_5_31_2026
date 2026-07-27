import { ArticleGrid } from "@/components/main-layout/content/ArticleGrid";
import { useSubMenuSection } from "@/hooks/useSubMenuSection";
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
            Showing up to {settings.limit} curated articles.
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-xs bg-muted" />
      ) : (
        <ArticleGrid articles={items} />
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
