import { useMemo, useState } from "react";

import { LongReadsArticleList } from "@/components/user/long-reads/LongReadsArticleList";
import { LongReadsSidebar } from "@/components/user/long-reads/LongReadsSidebar";
import { LongReadsTabs } from "@/components/user/long-reads/LongReadsTabs";
import {
  filterLongReadArticles,
  longReadArticles,
  type LongReadTab,
} from "@/data/dummy/longReads";

export function LongReadsContent() {
  const [activeTab, setActiveTab] = useState<LongReadTab>("all");

  const filteredArticles = useMemo(
    () => filterLongReadArticles(longReadArticles, activeTab),
    [activeTab],
  );

  return (
    <div className="mt-8 space-y-6">
      <LongReadsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:items-start">
        <div role="tabpanel" aria-label={activeTab}>
          <LongReadsArticleList articles={filteredArticles} />
        </div>
        <LongReadsSidebar className="xl:sticky xl:top-6" />
      </div>
    </div>
  );
}
  