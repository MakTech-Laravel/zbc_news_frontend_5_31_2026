import { useState } from "react";

import { LongReadsContent } from "@/components/user/long-reads/LongReadsContent";
import { LongReadsHeader } from "@/components/user/long-reads/LongReadsHeader";
import { useLongReads } from "@/hooks/useLongReads";
import type { LongReadTab } from "@/types/longReads";

export default function UserLongReads() {
  const [activeTab, setActiveTab] = useState<LongReadTab>("all");
  const { data, articles, loading, error } = useLongReads(activeTab);

  return (
    <div className="space-y-6">
      <LongReadsHeader stats={data.stats} loading={loading} />
      <LongReadsContent
        articles={articles}
        collections={data.collections}
        loading={loading}
        error={error}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
