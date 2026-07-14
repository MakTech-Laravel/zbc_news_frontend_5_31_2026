# Production deployment checklist

Everything that must be true before this goes live that is **not** true in local dev right
now. Spans both repos (`zbc_news_frontend_5_31_2026`, `zbc_news_backend_5_31_2026`). Do not
submit to Search Console until every box is checked and verified against the live domain.

> **The one human decision — the real production domain.** The repos ship placeholder
> examples that **disagree with each other** and cannot be trusted:
> - backend `.env`: `# FRONTEND_URL=https://zbc.maktechlaravel.cloud`, `# APP_URL=https://api.zbc.maktechlaravel.cloud`
> - frontend `.env`: `VITE_SITE_URL=https://zbc.news`, `# VITE_API_BASE_URL=https://api.zbc.news/api/v1`
>
> Both sets imply a **two-origin layout**: public site on a **root domain**, backend API on
> an **`api.` subdomain**. Pick the real domain pair (call them `<PROD_SITE>` and
> `<PROD_API>` below) and set every value consistently. **Leave nothing on
> `maktechlaravel.cloud` vs `zbc.news` mismatched.** This checklist uses `<PROD_SITE>` /
> `<PROD_API>` as placeholders — replace them with the chosen real domains.

## Config

- [ ] **Backend `FRONTEND_URL` = `https://<PROD_SITE>`** (backend `.env`). Single source of
      truth for every SEO-output URL — see the consumer table in
      [`ssr-conversion-plan.md` §8b](./ssr-conversion-plan.md). Until set, canonical / `og:url`
      / JSON-LD / `robots.txt` `Sitemap:` / sitemap `<loc>` all point at `http://localhost:5173`.
- [ ] **Backend `APP_URL` = `https://<PROD_API>`** (backend `.env`) — the API's own origin.
- [ ] **Frontend `VITE_API_BASE_URL` = `https://<PROD_API>/api/v1`** (frontend `.env`). The
      **SSR Node process fetches this server-side** in loaders (it does not use the dev
      `/api` proxy), so it must be an origin the Node host can reach and must **not** be
      `http://localhost:8000`.
- [ ] **Frontend `VITE_SITE_URL` = `https://<PROD_SITE>`** (frontend `.env`). Only a
      client-side fallback origin — in prod the hydrated canonical resolves to the backend
      `FRONTEND_URL` via the site-settings API — but set it to match so the two never disagree
      if the API value is ever unavailable.
- [ ] Rebuild the frontend after changing any `VITE_*` value (Vite inlines them at build time).

## HTTPS

- [ ] **All emitted URLs are `https://`.** `SeoResolverService::frontendUrl()` concatenates
      `config('app.frontend_url')` verbatim (no scheme forcing/stripping), so the scheme is
      exactly whatever `FRONTEND_URL` specifies. Setting `FRONTEND_URL=https://<PROD_SITE>`
      makes canonical/OG/JSON-LD/sitemap/robots all emit `https://`. Verify with a live
      `curl https://<PROD_SITE>/<an-article-slug>` and `curl https://<PROD_SITE>/sitemap.xml`.

## Hosting (Node) — unresolved dependency, do not re-solve here

- [ ] **Node hosting provisioned to run `react-router-serve`.** The frontend can no longer
      ship as a static `dist/` — it needs a persistent Node process. This is the operational
      dependency flagged in the SSR conversion task and
      [`ssr-conversion-plan.md` §6 / §8a](./ssr-conversion-plan.md) and is **still open**;
      it is owned by whoever owns hosting. Cross-referenced here, not re-solved.
- [ ] Frontend `Dockerfile` / `nginx.conf` updated from static-serve to Node-serve (or a Node
      container behind the proxy).

## Reverse proxy / CDN routing (two-origin layout)

The public site lives on `<PROD_SITE>` (SSR Node); the API lives on `<PROD_API>` (Laravel).
Google requires `robots.txt` and the sitemaps at the **root domain**, but they are generated
by the **backend**. So the `<PROD_SITE>` edge (nginx/CDN in front of the SSR Node process)
must route these paths to the backend:

- [ ] `https://<PROD_SITE>/robots.txt` → backend
- [ ] `https://<PROD_SITE>/sitemap.xml` → backend
- [ ] `https://<PROD_SITE>/news-sitemap.xml` → backend
- [ ] `https://<PROD_SITE>/share/…` → backend (existing crawler-preview route)
- [ ] Everything else on `<PROD_SITE>` → the SSR Node process
- [ ] Verify against the live domain (not `localhost`): `curl https://<PROD_SITE>/robots.txt`
      returns the generated file with `Sitemap: https://<PROD_SITE>/sitemap.xml`, and both
      sitemap URLs return XML. (See [`backend docs/seo-sitemaps.md`](../../zbc_news_backend_5_31_2026/docs/seo-sitemaps.md).)

## Sitemap cache on deploy

- [ ] **Invalidate the sitemap cache on every deploy.** The sitemaps are cached with
      `Cache::remember` (general 1h, news 10m). A fresh deploy with new content would otherwise
      serve an up-to-an-hour-old cached `sitemap.xml`. Run **`php artisan sitemap:refresh`** as
      a post-deploy step (it flushes + warms both). The hourly scheduled run does not cover the
      deploy moment.
- [ ] Confirm the cache store is shared/persistent across the backend instances that serve
      `/sitemap.xml` (so the warm applies to whoever answers the request).

## Search Console — last, not first

- [ ] **Only after every box above is checked and verified live**, submit
      `https://<PROD_SITE>/sitemap.xml` and `https://<PROD_SITE>/news-sitemap.xml` in Google
      Search Console. Submitting earlier registers wrong-host URLs (localhost / mismatched
      domain) and an empty/incorrect crawl surface, which is harder to unwind than to delay.
