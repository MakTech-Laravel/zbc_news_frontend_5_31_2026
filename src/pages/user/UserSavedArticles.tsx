import * as React from "react";

import { UserFeedArticleCard } from "@/components/user/dashboard/UserFeedArticleCard";
import { UserFilterPanel } from "@/components/user/shared/UserFilterPanel";
import { UserPageHeader } from "@/components/user/shared/UserPageHeader";
import { UserPageTabs } from "@/components/user/shared/UserPageTabs";
import { UserSearchField } from "@/components/user/shared/UserSearchField";
import { USER_STICKY_SIDEBAR_CLASS } from "@/components/user/shared/userPortalLayout";
import { useSavedArticles } from "@/hooks/useSavedArticles";
import { cn } from "@/lib/utils";

export default function UserSavedArticles() {
  const [activeTab, setActiveTab] = React.useState("saved");
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [quickFilter, setQuickFilter] = React.useState<string>("Recently Saved");

  const { articles, categories, quickFilters, loading } = useSavedArticles({
    categoryId: activeCategory,
    quickFilter,
  });

  const savedArticles = activeTab === "saved" ? articles : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <UserPageHeader
        title="Saved Articles"
        description="Your collection of saved stories and bookmarks"
      />
      <UserSearchField placeholder="Search saved articles..." className="max-w-full" />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[min(100%,370px)_minmax(0,1fr)]">
        <div className={cn(USER_STICKY_SIDEBAR_CLASS)}>
          <UserFilterPanel
            categories={categories}
            activeCategoryId={activeCategory}
            onCategoryChange={setActiveCategory}
            quickFilters={[...quickFilters]}
            activeQuickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
          />
        </div>

        <div className="min-w-0 space-y-3 sm:space-y-4">
          <UserPageTabs
            tabs={[
              { id: "saved", label: `Saved (${savedArticles.length})` },
              // { id: "history", label: "Reading History" },
            ]}
            activeId={activeTab}
            onChange={setActiveTab}
          />
          {activeTab === "history" ? (
            <p className="text-sm text-admin-label">Reading history is not available yet.</p>
          ) : loading ? (
            <p className="text-sm text-admin-label">Loading saved articles…</p>
          ) : savedArticles.length === 0 ? (
            <p className="text-sm text-admin-label">No saved articles yet.</p>
          ) : (
            <div className="space-y-3">
              {savedArticles.map((article) => (
                <UserFeedArticleCard
                  key={article.savedRecordId ?? article.id}
                  article={article}
                  density="compact"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
