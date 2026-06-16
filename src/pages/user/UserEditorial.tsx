import { useEffect, useState } from "react";
import { Loader2, Newspaper } from "lucide-react";

import { UserEditorialFeaturedCard } from "@/components/user/shared/UserEditorialFeaturedCard";
import { UserNewsFeedList } from "@/components/user/shared/UserNewsFeedList";
import { UserSectionHeader } from "@/components/user/shared/UserSectionHeader";
import { EditorPicks } from "@/components/user/editorial/EditorPicks";
import { About } from "@/components/user/editorial/About";
import { PopularTopics } from "@/components/user/editorial/PopularTopics";
import {
  fetchEditorialPageData,
  type EditorialPageData,
} from "@/services/user/editorial";

const EMPTY_EDITORIAL: EditorialPageData = {
  featured: null,
  latestEditorials: [],
  guestCommentary: [],
  editorPicks: [],
  boardMembers: [],
};

export default function UserEditorial() {
  const [data, setData] = useState<EditorialPageData>(EMPTY_EDITORIAL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchEditorialPageData()
      .then((result) => {
        if (!isMounted) return;
        setData(result);
      })
      .catch(() => {
        if (!isMounted) return;
        setData(EMPTY_EDITORIAL);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <UserSectionHeader
          title="Editorial & Opinion"
          description="In-depth analysis and perspectives from our editorial team"
          Icon={Newspaper}
        />
        <div className="flex items-center gap-2 rounded-[14px] border border-border-light bg-white px-6 py-10 text-sm text-admin-label">
          <Loader2 className="size-4 animate-spin" />
          Loading editorials…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserSectionHeader
        title="Editorial & Opinion"
        description="In-depth analysis and perspectives from our editorial team"
        Icon={Newspaper}
      />

      {data.featured ? (
        <UserEditorialFeaturedCard {...data.featured} />
      ) : (
        <div className="rounded-[14px] border border-border-light bg-white px-6 py-10 text-sm text-admin-label">
          No editorial articles yet. Publish articles tagged with Opinion or Editorial to populate this page.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="col-span-2 space-y-10">
          <UserNewsFeedList articles={data.latestEditorials} title="Latest Editorials" />
          <UserNewsFeedList articles={data.guestCommentary} title="Guest Commentary" />
        </div>
        <div className="col-span-1">
          <EditorPicks picks={data.editorPicks} />
          <About members={data.boardMembers} />
          <PopularTopics />
        </div>
      </div>
    </div>
  );
}
