import { useParams } from "react-router-dom";

import { AuthorProfileView } from "@/components/main-layout/author/AuthorProfileView";
import NotFound from "@/pages/global/NotFound";

export default function AuthorProfile() {
  const { authorSlug } = useParams<{ authorSlug: string }>();

  if (!authorSlug?.trim()) {
    return <NotFound />;
  }

  return <AuthorProfileView authorSlug={decodeURIComponent(authorSlug)} />;
}
