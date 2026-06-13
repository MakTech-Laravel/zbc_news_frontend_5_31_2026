import { LongReadsArticleList } from "@/components/user/long-reads/LongReadsArticleList";
import { LongReadsSidebar } from "@/components/user/long-reads/LongReadsSidebar";
import { LongReadsTabs } from "@/components/user/long-reads/LongReadsTabs";
import type { LongReadArticle, LongReadCollection, LongReadTab } from "@/types/longReads";

type LongReadsContentProps = {
  articles: LongReadArticle[];
  collections: LongReadCollection[];
  loading: boolean;
  error: string | null;
  activeTab: LongReadTab;
  onTabChange: (tab: LongReadTab) => void;
};

export function LongReadsContent({
  articles,
  collections,
  loading,
  error,
  activeTab,
  onTabChange,
}: LongReadsContentProps) {
  return (
    <div className="mt-8 space-y-6">
      <LongReadsTabs activeTab={activeTab} onTabChange={onTabChange} />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:items-start">
        <div role="tabpanel" aria-label={activeTab}>
          {loading ? (
            <p className="text-sm text-admin-label">Loading long reads…</p>
          ) : (
            <LongReadsArticleList articles={articles} />
          )}
        </div>
        <LongReadsSidebar
          className="xl:sticky xl:top-6"
          collections={collections}
          loading={loading}
        />
      </div>
    </div>
  );
}
