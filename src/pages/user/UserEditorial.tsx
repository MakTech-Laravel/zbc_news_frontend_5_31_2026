import { Newspaper } from "lucide-react";

import { UserEditorialFeaturedCard } from "@/components/user/shared/UserEditorialFeaturedCard";
import { UserNewsFeedList } from "@/components/user/shared/UserNewsFeedList";
import { UserSectionHeader } from "@/components/user/shared/UserSectionHeader";
import { editorialArticles, editorialFeatured } from "@/data/dummy/userPages";
import { EditorPicks } from "@/components/user/editorial/EditorPicks";
import { About } from "@/components/user/editorial/About";
import { PopularTopics } from "@/components/user/editorial/PopularTopics";

export default function UserEditorial() {
  return (
    <div className="space-y-6">
      <UserSectionHeader
        title="Editorial & Opinion"
        description="In-depth analysis and perspectives from our editorial team"
        Icon={Newspaper}
      />
      <UserEditorialFeaturedCard {...editorialFeatured} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2">
          <UserNewsFeedList articles={editorialArticles} title="Latest Editorials" />
          <UserNewsFeedList articles={editorialArticles} className="mt-10" title="Guest Commentary" />
        </div>
        <div className="col-span-1">
          <EditorPicks />
          <About />
          <PopularTopics />
        </div>
      </div>
    </div>
  );
}
