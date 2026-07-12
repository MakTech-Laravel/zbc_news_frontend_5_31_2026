import { redirect, type LoaderFunctionArgs } from "react-router";

/** `/news-details/:articleSlug` is a legacy alias for the real `/:slug` route. */
export function loader({ params }: LoaderFunctionArgs) {
  const slug = params.articleSlug;
  return redirect(slug ? `/${encodeURIComponent(slug)}` : "/");
}

export default function LegacyArticleRedirect() {
  return null;
}
