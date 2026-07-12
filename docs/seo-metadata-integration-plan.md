# SEO Metadata Integration Plan

**Status:** Phase 1 (plan) — awaiting review before implementation.
**Repos:** `zbc_news_backend_5_31_2026` (Laravel 13, branch `seo`), `zbc_news_frontend_5_31_2026` (React 19 / Vite / RR7, currently `main`).
**Scope guard:** Wire the existing `seo_pages` admin data into public pages. Do **not** touch the SSR migration — but design the backend contract so the future RR7 Framework-Mode loader calls it unchanged (see §2).

---

## 0. Corrected premise (from Phase 0 discovery)

The original brief assumed public pages don't consume SEO data. **They already do**, client-side, via `useDocumentHead` ([src/hooks/useDocumentHead.ts](../src/hooks/useDocumentHead.ts)), wired into home, article, category, author, tag, and static pages. Interpolation of `{title}/{category}/{author}/{tag}/{bio}/{excerpt}/{tags}` happens **on the client**; the backend `/resolve` endpoint exists but is **dead code** (frontend never calls it and it returns raw, un-interpolated templates).

Template matching is by **`page_key` via a hardcoded regex ladder** in [`SeoPageService::resolveForPath()`](../../zbc_news_backend_5_31_2026/app/Services/SeoPageService.php), **not** by the DB `url_path` column. For templates, `url_path` (`/:categorySlug`, `/news-details/:articleSlug`, …) is an **admin display label only**. Non-template rows (home, `/newsletter`, `/news-details`, one row per category at `/business` etc.) match by exact `url_path`.

**Consequences this plan fixes:**
- Article template never applies to real articles (they live at `/:slug`; `/news-details/:slug` only redirects). → §3 resolver disambiguation.
- `/:slug` is ambiguous between article and category; the ladder always returns `category`. → §3 (backend loads the entity to disambiguate).
- `/tag/:slug` has no template (resolves to `home`); static pages have no admin entry. → §5 seeds.
- No JSON-LD, no `noindex`, no canonical override, no per-template OG image anywhere. → §4, §6.

---

## 1. Decisions locked (from review)

1. **Interpolation → server-side, single source of truth.** Build the Laravel resolve+interpolate endpoint; CSR consumes it. This fixes `/share` previews and Googlebot's deferred JS-render pass. **It does NOT make content visible to non-JS crawlers by itself** — the RR7 Framework-Mode SSR conversion is the immediate next task, and this endpoint's contract is designed to be exactly what an SSR loader will call.
2. **Article-detail template applies at `/:slug`.** Fallback chain: entity meta → interpolated `article-detail` template (for blank fields) → site defaults. Same chain the admin UI already promises ("empty fields fall back to…").
3. **Full admin coverage.** Seed a `tag` template + a non-template row per static page.
4. **Field scope: JSON-LD + noindex + canonical + OG image**, sequenced (1) JSON-LD (no new columns), (2) canonical + noindex, (3) OG image (reuse AdminMedia/Cloudinary).

---

## 2. API contract — `GET /api/v1/public/seo-pages/resolve`

Single "resolve SEO for this URL" endpoint. Input is **only the request path** — exactly what an SSR loader has. The backend owns article/category/author data, so it disambiguates and interpolates server-side; the client never sees a raw `{token}`.

**Request:** `GET /api/v1/public/seo-pages/resolve?path=/some-article-slug`

**Response** (via new `ResolvedSeoResource`, wrapped in the app's standard `sendResponse` envelope):

```jsonc
{
  "success": true,
  "message": "SEO resolved successfully",
  "data": {
    "page_key": "article-detail",
    "matched_entity": "article",          // article | category | author | tag | static | null
    "title": "Full interpolated title — ZBC News",
    "description": "…",
    "keywords": "…",
    "canonical": "https://frontend/some-article-slug",
    "robots": "index,follow",             // or "noindex,nofollow" when noindex set
    "og": {
      "title": "…", "description": "…", "type": "article", "url": "…",
      "site_name": "ZBC News",
      "image": "https://…", "image_alt": "…",
      "published_time": "2026-…T…Z", "modified_time": "2026-…T…Z"  // articles only
    },
    "twitter": { "card": "summary_large_image", "title": "…", "description": "…", "image": "…", "image_alt": "…" },
    "json_ld": [ { "@context": "https://schema.org", "@type": "NewsArticle", … }, { "@type": "Organization", … } ]
  }
}
```

**Contract notes for the future SSR loader:** stateless, cacheable by path, no auth, no cookies; a loader calls it with `new URL(request.url).pathname` and dumps `data` straight into `<head>` + a JSON-LD `<script>`. Keep it side-effect free.

Retire the current `resolve()` that returns a raw `SeoPageResource`; replace with the interpolated version above. Keep the bulk `index` endpoint (still used by the admin list; the public provider can migrate off it — see §7).

---

## 3. Backend resolver logic (`SeoResolverService`, new)

New service orchestrating `SeoPageService` + `SeoMetaService` + entity services. Pseudocode:

```
normalize path
1. exact non-template row (home, /newsletter, /news-details, static rows, per-category rows)
     → interpolate site tokens; matched_entity = "static" (or "category" for per-cat rows)
2. /author/{slug}      → UserService::getPublicAuthorBySlug → author-profile template
                         interpolate {author},{bio}; matched_entity = "author"
3. /tag/{slug}         → tag template; interpolate {tag}; matched_entity = "tag"
4. /news-details/{slug} OR /{slug} (single segment, not reserved):
     a. ArticleService::getPublishedBySlug(slug)  // disambiguation: article wins if it exists
          → matched_entity = "article"
          → title/desc/keywords = SeoMetaService::resolveArticleMeta(article)['resolved']
             (entity meta first) with blanks filled by interpolated article-detail template,
             then site defaults
          → og.type=article, published/modified, image = open_graph_image ?: featured_image
          → json_ld = NewsArticle (see §4)
     b. else CategoryService::getBySlug(slug)
          → matched_entity = "category"; category meta first, else category template {category}
     c. else → home template / 404 handling
5. fallback → home template
Every branch ends: fill any remaining blank from site_settings.meta_* then site_name / site_tag.
```

This mirrors what `Home.tsx` does client-side today (fetch article → fall back to category), but authoritatively on the server, resolving the `/:slug` collision.

**Priority confirmed against live code (not assumed):** [`Home.tsx:43-51`](../src/pages/frontend/Home.tsx) calls `fetchArticleBySlug(slug)` first; if it returns data → `setView("article")` and `return` (line 46-49); only when no article is returned does it `setView("category")` (line 51), and likewise on error (line 55). So the server resolver's **article-before-category** order for `/:slug` matches the current runtime fallback exactly.

**Fallback chain (documented, matches UI promise):**
`entity field` → `interpolated template field` → `site_settings.meta_{title,description,keywords}` → `site_name` (title) / `site_tag` (description).

**Reserved single-segment guard:** reuse the reserved set already in `useDocumentHead` (`login`, `admin`, `user`, static-page slugs, …) so `/login` etc. don't get treated as article/category slugs.

---

## 4. JSON-LD (step 1 — no new columns)

Built from data we already have. Rendered server-side into the `json_ld` array and client-side into a `<script type="application/ld+json">`.

- **NewsArticle** (article pages): `headline`, `description`, `image[]` (og image), `datePublished` (`published_at`), `dateModified` (`updated_at`), `author` → `{ "@type":"Person","name":…, "url": frontend + /author/{authorSlug} }`, `publisher` → Organization block, `mainEntityOfPage` (canonical), `isAccessibleForFree: true` (paywall flag deferred; hardcode `true` for now, note as future column when membership gating lands), `articleSection` (category), `keywords`.
- **Organization / publisher block** (from `site_settings`): `name` = `site_name`, `logo` = `ImageObject{ url: site_logo }`, `url` = frontend base. Emitted on article pages (as `publisher`) and once on home (standalone `Organization` + `WebSite` with `SearchAction` pointing at `/search`).
- **BreadcrumbList** (category/article) — optional, include if cheap.

**Field-level validation (enforced in the JSON-LD builder):**
- **`headline` ≤ 110 chars.** Google drops `NewsArticle.headline` values over 110 characters. The builder truncates on a word boundary and appends `…` (reuse `SeoMetaService::truncate()` semantics with `max = 110`). The truncation is applied to the JSON-LD `headline` specifically — the `<title>`/`og:title` keep their own (255) limit.
- **Dates are ISO 8601 *with timezone offset*.** `datePublished`/`dateModified` are emitted via `Carbon::toIso8601String()` (yields `…+00:00`/offset form). The builder rejects/normalizes any value lacking an offset: if a raw date can't be parsed to an offset-bearing ISO 8601 string, the field is omitted rather than emitted malformed. No naive/floating datetimes in output.

No schema changes needed for this step; ship and verify JSON-LD first (Google News / Top Stories eligibility is the most urgent gap).

---

## 5. Migrations & seed changes

**Migration B — canonical + noindex** (step 2):
```php
Schema::table('seo_pages', function (Blueprint $t) {
    $t->string('canonical_url')->nullable()->after('meta_keywords');   // absolute override; blank = auto from path
    $t->boolean('noindex')->default(false)->after('canonical_url');    // true → robots: noindex,nofollow
});
```

**Migration C — OG image** (step 3):
```php
Schema::table('seo_pages', function (Blueprint $t) {
    $t->string('og_image')->nullable()->after('noindex');   // Cloudinary path/URL; per-template social image
});
```
(Optional `og_title` / `og_description` deferred unless requested — `meta_title/description` already feed OG.)

**Seed additions** ([SeoPageSeeder](../../zbc_news_backend_5_31_2026/database/seeders/SeoPageSeeder.php), `updateOrCreate` so it's idempotent):
- `tag` template — `page_key: 'tag'`, `url_path: '/tag/:tagSlug'`, `is_template: true`, `meta_title: '{tag} — ZBC News'`, `meta_description: 'Latest {tag} stories…'`, `meta_keywords: '{tag}, news'`.
- Non-template rows for each static page: `/about`, `/contact`, `/privacy`, `/terms`, `/cookie-policy`, `/accessibility-statement`, `/advertise`, `/careers` with sensible default meta.

Add resolver branches so `/tag/{slug}` and each static path resolve to these rows.

> **Ask-before-destructive:** all three migrations are additive (new nullable columns / new rows). No data loss. Will confirm before running `migrate` against any shared DB.

---

## 6. Admin UI (shadcn, sequenced)

Update in lockstep with §5 columns: [`SeoPageEditForm.tsx`](../src/components/admin/settings/SeoPageEditForm.tsx), [`useSeoPageEditor.ts`](../src/components/admin/settings/useSeoPageEditor.ts), [`SeoPageUpdateRequest`](../../zbc_news_backend_5_31_2026/app/Http/Requests/Api/V1/SeoPageUpdateRequest.php), [`SeoPageResource`](../../zbc_news_backend_5_31_2026/app/Http/Resources/Api/V1/SeoPageResource.php), and the FE `SeoPage`/`SeoPageApi` types + `mapSeoPageFromApi`.

- **Step 2:** `noindex` → shadcn `Switch`; `canonical_url` → text input (URL validation, placeholder "auto from page URL").
- **Step 3:** `og_image` → picker. **Reuse AdminMedia's existing Cloudinary integration** before building new upload UI (verify `MigrateImagesToCloudinary` / media service surface first). Fall back to a plain URL input if reuse is non-trivial.
- Token help text: surface the available `{tokens}` per template in the form (currently undocumented in the UI).

---

## 7. Frontend integration per page type

Refactor [`useDocumentHead`](../src/hooks/useDocumentHead.ts) to consume the resolve endpoint instead of re-implementing resolution:

- New `useResolvedSeo(path)` — TanStack Query keyed by `path`, calls `/seo-pages/resolve`. Retire the duplicated client-side `resolveSeoPage` + `applyReplacements` ladder (delete once parity is verified).
- `useDocumentHead` keeps its `upsertMeta`/`upsertLink` DOM logic; adds a `<script type="application/ld+json">` upsert from `data.json_ld`, and a `<meta name="robots">` from `data.robots`.
- Pages stop passing `replacements` (server interpolates). To avoid a paint flash while the query resolves, article/category/author pages may pass their already-fetched entity meta as an immediate override; the resolved payload remains source of truth.

Per-page integration points:

| Page type | Component | Change |
|---|---|---|
| Home `/` | `Home.tsx` | `useResolvedSeo('/')`; render Organization+WebSite JSON-LD |
| Article `/:slug` | `NewsDetails/Details.tsx` (`ArticleContent`) | consume resolved payload; NewsArticle JSON-LD |
| Category `/:slug` | `CategoryArticlesView.tsx` | consume resolved payload (drop manual `{category}` replacement) |
| Author `/author/:slug` | `AuthorProfileView.tsx` | consume resolved payload |
| Tag `/tag/:slug` | `TagArticlesView.tsx` | consume resolved payload (now backed by `tag` template) |
| Static pages | each `pages/frontend/*` | pass `path`; backed by seeded rows |

---

## 8. Test plan

**Backend (Pest feature tests, one per template type + fallback):**
- `/resolve?path=/` → home; `/newsletter`, `/about` (static rows) → exact match.
- `/{articleSlug}` → article-detail, entity meta wins, `NewsArticle` JSON-LD present, og:type=article.
- **JSON-LD `headline` ≤ 110 chars:** seed an article whose title is > 110 chars; assert the resolved `json_ld` `headline` is ≤ 110 and ends with `…` (and that a short title is left untouched).
- **JSON-LD dates ISO 8601 + offset:** assert `datePublished`/`dateModified` match `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)$/`; assert an article with an unparseable/naive date omits the field rather than emitting it without an offset.
- `/{categorySlug}` (slug that is a category, not an article) → category; `/{articleSlug}` with a slug that is BOTH — assert article wins.
- `/author/{slug}`, `/tag/{slug}` → respective templates interpolated (no `{` left in output).
- Fallback matrix: (a) template fields cleared → site_settings.meta_* → site_name/site_tag; (b) entity meta cleared → template → site defaults.
- `noindex=true` → `robots: noindex,nofollow`; `canonical_url` override respected; `og_image` surfaces in `og.image`.
- Gates: `php artisan test --filter=Seo`, `./vendor/bin/pint`.

**Frontend:** `tsc -b`, `npm run lint`, `npm run build` after each page type.

**Raw-response verification (per brief):** these routes are CSR, so "view source" shows an empty `<head>` — document this. Verify instead: (1) the `/resolve` JSON via `claude-in-chrome`/curl contains fully interpolated tags + JSON-LD; (2) the existing SSR `/share/articles/{slug}` preview reflects resolved meta; (3) post-hydration DOM head via the browser MCP for the CSR path. Real non-JS-crawler coverage is explicitly the next task (SSR).

---

## 9. Sequencing (Phase 2 order)

1. Backend `SeoResolverService` + `ResolvedSeoResource` + rewired `/resolve` (+ JSON-LD from existing data). Pest + Pint. Commit.
2. **Seed `tag` template + static-page rows, and add the resolver branches for `/tag/{slug}` and each static path.** This must land *before* the frontend wiring below, because the tag and static page types can't be wired against templates that don't exist yet. Pest (coverage of the new branches) + Pint. Commit.
3. Frontend `useResolvedSeo` + `useDocumentHead` refactor; wire **one** page type (article), verify, commit. Then category → author → tag → home → static, one at a time. (Tag and static now resolve to real seeded rows from step 2.)
4. Migration B (canonical + noindex) + admin UI + resolver/render support. Verify. Commit.
5. Migration C (og_image) + picker (Cloudinary reuse). Verify. Commit.
6. Final coverage pass: confirm 1:1 admin↔route mapping, all fallbacks. Commit.

Each unit: backend `php artisan test` + `pint`; frontend `tsc -b` + `lint` + `build`; raw-response check; commit before next. Feature branch per repo (backend continues on `seo` or a child branch; frontend new `seo-integration` branch off `main`). Never push to `main`.

---

## 10. Open items / flags

- **`isAccessibleForFree`** hardcoded `true` until membership paywall gating exists — add a column then.
- **Duplicated resolution logic** (backend `SeoPageService::resolveForPath` vs FE `resolveSeoPage`) collapses into the server resolver; delete the FE copy after parity is proven.
- **`/news-details` orphan** row and legacy redirect retained for back-compat; resolver still answers for it.
- **Canonical base URL** comes from `config('app.frontend_url')` (already used by `ArticleSharePreviewController`); confirm it's set in all envs.
- The whole CSR consumption benefit is capped until SSR lands — this is called out per the review decision as the immediate follow-on task.
