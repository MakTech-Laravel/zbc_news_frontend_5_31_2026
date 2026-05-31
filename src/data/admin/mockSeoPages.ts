export type SeoPage = {
  id: string;
  name: string;
  url: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

function slugToPath(slug: string) {
  return `/${slug.replace(/-/g, "/")}`;
}

const PAGE_NAMES: { id: string; name: string }[] = [
  { id: "blog", name: "Blog" },
  { id: "blog-category", name: "Blog Category (template)" },
  { id: "blog-category-pagination", name: "Blog Category Pagination (template)" },
  { id: "blog-details", name: "Blog Details (template)" },
  { id: "consumer-rights-act", name: "Consumer Rights Act" },
  { id: "contact", name: "Contact" },
  { id: "cookie-policy", name: "Cookie Policy" },
  { id: "home", name: "Home" },
  { id: "investment-opportunity", name: "Investment Opportunity" },
  { id: "lpa", name: "LPA" },
  { id: "lpa-start", name: "LPA start" },
  { id: "privacy-policy", name: "privacy policy" },
  { id: "probate", name: "Probate" },
];

export const MOCK_SEO_PAGES: SeoPage[] = PAGE_NAMES.map(({ id, name }) => ({
  id,
  name,
  url: id === "home" ? "/" : slugToPath(id),
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
}));

const pagesById = new Map(MOCK_SEO_PAGES.map((p) => [p.id, { ...p }]));

export function getSeoPage(id: string): SeoPage | undefined {
  const page = pagesById.get(id);
  return page ? { ...page } : undefined;
}

export function updateSeoPage(id: string, patch: Partial<Omit<SeoPage, "id" | "name">>) {
  const page = pagesById.get(id);
  if (!page) return;
  Object.assign(page, patch);
}

export function listSeoPages(): SeoPage[] {
  return MOCK_SEO_PAGES.map((p) => ({ ...pagesById.get(p.id)! }));
}
