import { useParams } from "react-router-dom";

import { TagArticlesView } from "@/components/main-layout/content/TagArticlesView";
import NotFound from "@/pages/global/NotFound";

export default function TagArticles() {
  const { tagSlug } = useParams<{ tagSlug: string }>();

  if (!tagSlug?.trim()) {
    return <NotFound />;
  }

  return <TagArticlesView tagSlug={decodeURIComponent(tagSlug)} />;
}
