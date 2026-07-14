# SSR Conversion Plan — React Router v7 Framework Mode

**Status:** Phase 1 (plan) — awaiting review before any Phase 2 code.
**Goal / only success criterion:** `curl` (not a browser) of a public page returns fully-populated `<title>`, meta tags, and JSON-LD `<script>` in the **raw** HTML — the same check that exposed the CSR gap.
**Scope:** the `publicRoutes.tsx` tree only (home, `/:slug` article/category, `/author/:slug`, `/tag/:slug`, static pages). `/user/*`, `/admin/*`, `authRoutes` stay client-rendered.
**Base branch:** off **`seo-integration`** (confirmed **not** merged to `main` — 5 commits ahead; and the SSR loaders build directly on its `SeoResolverService` + resolve endpoint). New branch: `ssr-framework-mode`.

---

## 0. Phase 0 findings (evidence, not assumption)

### The Vite plugin conflict — **resolved, NOT a blocker** (spiked, built, curled)
The task flagged `@vitejs/plugin-react` + `@rolldown/plugin-babel` (react-compiler) vs `@react-router/dev/vite` as a known open risk. Verified concretely:

- Installed `vite` is genuinely **8.0.16 → 8.1.4** (Vite 8 = Rolldown-powered). `@react-router/dev@7.18.x` peer deps declare `vite: '^5.1.0 || ^6.0.0 || ^7.0.0 || ^8.0.0'` — **Vite 8 explicitly supported**, and 7.18.x matches the project's `react-router-dom@7.18.0` exactly (bump to 7.18.1 patch).
- Built a minimal RR7 framework-mode app in scratch with the project's **exact** plugin stack — `reactRouter()` + `react()` + `babel({ presets: [reactCompilerPreset()] })` — and `ssr: true`. Result: `react-router build` **exit 0**, produced `build/client/` + a real `build/server/index.js`. Warnings only (v8 future-flags, `envFile` deprecation) — non-blocking.
- `react-router-serve` + **`curl`** of `/` returned raw HTML containing `<title>Spiked Home — Real SSR</title>`, `<meta name="description" …>`, and the rendered `<h1>`/`<p>` **before any JS**. A `compiler-runtime-*.js` modulepreload confirmed React Compiler runs at runtime under framework mode.

> ⚠️ One caveat to carry into Phase 2: RR v8 future-flag warnings appeared. We're on v7 and will **not** opt into v8 flags during this task; if a warning becomes an error on a specific route we handle it then.

### `@react-router/dev` version choice
Use the **7.18.x** line (`@react-router/dev`, `@react-router/node`, `@react-router/serve`, `react-router` all pinned to `7.18.1`). Do **not** jump to `@react-router/dev@8` — it peer-requires `react-router@^8` and pulls an RSC/`@vitejs/plugin-rsc` stack; that's a separate major migration.

### Browser-only assumptions in the SEO/data code
- **`useDocumentHead`** uses `window.location`, `document.head`, `getPublicSiteOrigin()` (window). It runs in a `useEffect` (client-only) but is the wrong mechanism for SSR. **For public routes it is replaced by the route `meta()` export** driven by loader data — the server emits the tags directly. `useDocumentHead`/`useResolvedSeo` are retired on public routes (kept only for any client-rendered route that still wants them).
- **`useResolvedSeo` → `fetchResolvedSeo` → `request.get`** uses the axios client, whose interceptors call `window.location` / `localStorage` (token). **Not usable in a Node loader.** Loaders will call the resolve endpoint with a **server-safe plain `fetch`** to `env.apiBaseUrl` (the resolve endpoint is public/unauthenticated) — see §5.
- **`AuthProvider`** touches `window` only inside `useEffect` bodies → SSR-safe at render (effects don't run on the server); it renders logged-out on the server and hydrates. **`AuthenticatedNotificationsProvider`** (Echo/Reverb/Pusher) and analytics must stay client-only (guard or mount in effect) — they already live behind effects but must be verified during the root migration.
- **`token.ts`** already guards `typeof window === 'undefined'` (returns null server-side) — good.

### Auth cookie situation — **localStorage bearer, no server-readable cookie**
`VITE_AUTH_STRATEGY=bearer_memory`, `VITE_BEARER_TOKEN_STORAGE=local`; the axios client only sends `withCredentials` for the unused `http_only_cookie` strategy. **SSR loaders cannot know if the user is logged in.** This is a **blocker for SSR personalization only** — flagged, not worked around. It does **not** affect this task: public content + SEO need no auth. Consequence: header/user-menu render logged-out on the server then hydrate to the real state (identical to today's shell). No public loader may depend on auth.

---

## 1. Structural reality: framework mode is app-wide (important)

Framework mode replaces `createBrowserRouter` + `RouterProvider` (`AppBootstrap`) with RR's own server/client entry and a `routes.ts` config. **You cannot run framework mode for public routes and `createBrowserRouter` for the rest in one app.** So:

- **All** routes (public + admin/user/auth) must be registered in `routes.ts`.
- **Only public routes get `loader` + `meta()`** (real SSR data). Admin/user/auth route modules simply render their **existing** components, which continue to fetch client-side in effects and hydrate — server-rendering only their current loading shell. This satisfies "leave their rendering path as-is" behaviorally. Per the task, we do **not** do per-route SSR toggling; `ssr: true` app-wide, and non-public routes just carry no loader.
- Prerendering/SPA-mode is **not** used — article/category/author pages are dynamic per request and need the server runtime.

This is the one place the work is structurally more than "only touch the public tree": route *registration* for every route moves into `routes.ts`, even though only public routes change *behavior*.

---

## 2. `react-router.config.ts`

```ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,
  appDirectory: "src", // keep existing src/ layout; avoids moving the whole tree to app/
} satisfies Config;
```

`vite.config.ts` becomes:
```ts
import { reactRouter } from "@react-router/dev/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default {
  plugins: [reactRouter(), react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: { proxy: { "/api": { target: "http://localhost:8000", changeOrigin: true } } },
};
```
(The `tsc -b && vite build` script is replaced — see §6. The proxy stays for dev API calls.)

New required modules under `src/`:
- `src/root.tsx` — the `<html>` document + the provider stack from `App.tsx` (QueryClient, SiteSettings, Auth, Notifications, ErrorBoundary, Toaster) wrapping `<Outlet/>`, plus `<Meta/>`/`<Links/>`/`<Scripts/>`/`<ScrollRestoration/>`. `AppEffects`/analytics/favicon move here (client-only effects).
- `src/routes.ts` — the route config (see §3).
- `src/entry.server.tsx` / `src/entry.client.tsx` — start from RR defaults; only customize if needed (e.g. streaming, `isbot`).
- `App.tsx`, `AppBootstrap.tsx`, `main.tsx`, `routes/router.tsx` are retired/absorbed.

---

## 3. Route mapping: `publicRoutes.tsx` (RouteObject) → `routes.ts` helpers

Near-mechanical translation using `route()`/`index()`/`layout()`:

```ts
import { type RouteConfig, route, index, layout } from "@react-router/dev/routes";

export default [
  layout("layouts/frontend/FrontendLayout.tsx", [
    route("about", "pages/frontend/AboutUs.tsx"),
    route("contact", "pages/frontend/Contact.tsx"),
    // …privacy, terms, cookie-policy, accessibility-statement, advertise, careers, newsletter
    layout("layouts/main/MainLayout.tsx", [
      index("pages/frontend/Home.tsx"),
      route("tag/:tagSlug", "pages/frontend/TagArticles.tsx"),
      route("author/:authorSlug", "pages/frontend/AuthorProfile.tsx"),
      route("news-details/:articleSlug", "routes/public/LegacyArticleRedirect.tsx"),
      route(":slug", "pages/frontend/SlugRoute.tsx"), // article-or-category (see §4)
    ]),
  ]),
  // admin/user/auth registered here too, WITHOUT loaders (client-only behavior)
  // e.g. route("admin", "layouts/admin/AdminLayout.tsx", [ … ]) with ProtectedRoute inside
] satisfies RouteConfig;
```
Redirect-only entries (`/privacy-policy` → `/privacy`, legacy article redirect) become tiny route modules returning `redirect()` from a loader (server-side 301/302, better than the current client `<Navigate>`).

---

## 4. Per-route-module plan (loaders + `meta()`)

Every public route module gets a **`loader`** (fetches primary entity + resolved SEO server-side) and a **`meta()`** (builds `<title>`/meta/OG + JSON-LD from `loaderData`). Secondary data (related articles, comments, tracking, ads) stays client-side in effects.

| Route | loader fetches | meta() emits | Notes |
|---|---|---|---|
| `index` (home) | resolve `/` | title/desc/OG + Organization+WebSite JSON-LD | |
| `:slug` | **article-or-category** (see below) | article → NewsArticle JSON-LD; category → title/OG | **highest risk** |
| `tag/:tagSlug` | resolve `/tag/:slug` + tag articles | title/OG | |
| `author/:authorSlug` | author profile + resolve | title/OG | |
| static pages | resolve `/{path}` | title/OG | thin loaders — SEO only |

### The `/:slug` disambiguation (highest-risk piece) — do this first
Currently in `Home.tsx`'s effect: fetch article by slug; if found render article, else render category (`CategoryArticlesView`). This becomes a **server loader** in `SlugRoute.tsx`:

```
loader({ params }):
  article = await fetchArticleBySlug(params.slug)      // server-safe fetch
  if (article) {
    seo = await fetchResolvedSeo(`/${slug}`)            // article branch
    return { kind: "article", article, seo }
  }
  category = await fetchCategoryBySlug(params.slug)     // + its articles
  if (category) {
    seo = await fetchResolvedSeo(`/${slug}`)            // category branch
    return { kind: "category", category, seo }
  }
  throw data(null, { status: 404 })                     // real 404, not soft
```
The component switches on `loaderData.kind` and renders `ArticleContent` or `CategoryArticlesView` (props from loader, no client refetch). The backend resolver **already** disambiguates identically (article-before-category), so server SEO and server content agree. This removes the CSR fallback flash entirely.

Backend note: the resolve endpoint gives SEO; primary content still comes from the existing article/category endpoints. Optionally add a single combined endpoint later, but not required — two server fetches in the loader is fine.

---

## 5. Data flow: loader instead of client `useResolvedSeo`

- **Server-safe fetch helper** (`src/lib/serverFetch.ts` or reuse `env.apiBaseUrl`): plain `fetch(`${apiBaseUrl}/…`)`, no axios interceptors, no `window`/`localStorage`. Used by loaders. All public endpoints hit are unauthenticated.
- **SEO:** loader returns the resolved payload; `meta()` maps it to descriptors including JSON-LD via RR7's `{ "script:ld+json": {...} }` meta descriptor (confirmed supported in v7). `useDocumentHead`/`useResolvedSeo` are **not** used on public routes → no double fetch, no post-hydration flash; RR also re-runs `meta()` on client navigations automatically.
- **Primary content:** loader returns article/category/author data; component reads `useLoaderData()`. No TanStack Query for this data on public routes.
- **TanStack Query:** kept for **client-only secondary** data (related, comments, tracking). We do **not** need to dehydrate/rehydrate the Query cache for the SSR-critical path since RR loaders own it — simpler and avoids a second serialization. (Dehydration remains a fallback option if we later want a unified cache.)
- **`SiteSettingsProvider`** still fetches public site settings; for SSR it should also be loader-fed (or fetched in `root.tsx`'s loader) so the shell's site name/logo are server-rendered. Minimal: a `root` loader returns site settings; provider seeds from it.

---

## 6. Deployment implication (flagged, not a surprise)

**This can no longer ship as a static `dist/`.** SSR needs a **persistent Node process**.

- `package.json` scripts:
  - `dev`: `react-router dev` (replaces `vite`)
  - `build`: `react-router build` (replaces `tsc -b && vite build`; typecheck runs separately as `react-router typegen && tsc`)
  - `start`: `react-router-serve ./build/server/index.js` (new — prod serve)
  - `typecheck`: `react-router typegen && tsc -b`
- New deps: `@react-router/dev`, `@react-router/node`, `@react-router/serve`, `react-router@7.18.1`, `isbot`. `react-router-dom` imports become `react-router` (v7 re-exports; codemod-level find/replace).
- Typegen: framework mode generates `.react-router/types/**` (route `Route.*` types). Add to `.gitignore`; run `react-router typegen` before `tsc`.
- **Hosting change:** the current static host (nginx serving `dist/`, per the ops guide) must change to run the Node server (or put nginx in front of `react-router-serve` / a Node container). The existing `Dockerfile`/`nginx.conf` for the frontend need revisiting. **This is an infra change requiring coordination — called out now.** Local dev/prable is unaffected functionally; only the deploy target changes.

---

## 7. Test plan

Per route type, after each increment:
1. `react-router typegen && tsc -b` — clean
2. `npm run lint` — parity with base (no new issues)
3. `npm run build` — green
4. **`curl` the running server for that route and paste raw `<head>`** — confirm real `<title>`, `<meta name="description">`, OG tags, and JSON-LD `<script type="application/ld+json">` with **real** content (not placeholder). A generic/empty shell = not done, regardless of browser behavior.
5. Commit (one route type per commit).

Phase 3: full curl matrix across all six public types in one pass (raw pasted); diff `/user`,`/admin`,`authRoutes` modules against `seo-integration` to prove untouched behavior; confirm `npm run dev` works; confirm `build` + `start` serves SSR locally end-to-end.

---

## 8. Sequencing (Phase 2)

1. Scaffold framework mode: deps, `react-router.config.ts`, `vite.config.ts`, `src/root.tsx` (+ provider migration), `src/entry.*`, `src/routes.ts` with **all** routes registered (public with placeholder loaders; admin/user/auth as client-only modules). Gate: build + `curl /` shows the shell SSR'd. Commit.
2. **`/:slug` article-or-category loader** (highest risk, first). curl an article + a category. Commit.
3. Home `index` loader + meta. Commit.
4. Category already covered by `/:slug`; author `/author/:slug`. Commit.
5. `tag/:tagSlug`. Commit.
6. Static pages (thin SEO loaders). Commit.
7. Legacy redirects as server `redirect()`. Commit.
8. Phase 3 cross-check.

---

## 8a. Implementation status (Phase 2/3 — code complete, curl-verified)

All six public route types server-render real `<title>`/meta/JSON-LD in raw HTML (verified by `curl`, backend live):

- [x] **Scaffold** (`907f1b9`) — framework mode boots; `curl /` returns a real SSR document.
- [x] **`/:slug`** (`2499454`) — server article-vs-category disambiguation; article emits full NewsArticle JSON-LD + SSR body; category emits title/OG.
- [x] **home** (`bfd3bac`) — Organization + WebSite (SearchAction) JSON-LD.
- [x] **author** (`575dc9d`), **tag** (`531d71e`) — loader + meta().
- [x] **static pages** (`c40a1cc`) — one shared `StaticSeoLayout` resolves SEO by request path for all eight.

**Phase 3 cross-check:** full six-type curl matrix passes; `/user`, `/admin`, auth pages + their layouts + `ProtectedRoute`/`GuestGate` are **byte-identical** to base (`git diff --stat` empty) — registered as client-only shells, behavior unchanged; `react-router dev` starts and SSRs; `build` + `react-router-serve` verified end-to-end. `tsc` clean, lint parity (99, zero new).

**Still open (not code):** the **Node-host deployment** — the frontend can no longer ship as static `dist/`; `react-router-serve` (or a Node container behind nginx) is required. This is the operational dependency being taken to the hosting owner separately; the task is not done-done until that lands.

**Follow-up cleanups (non-blocking):** public page components still call the client-side `useDocumentHead`; now that `meta()` owns SSR head, that client path is redundant (harmless — same values, `upsertMeta` updates in place) and can be removed per page. A stale `package-lock.json` remains from the npm→pnpm history; the project uses pnpm.

## 8b. Pre-deploy checklist (config, not code)

- [ ] **Set `FRONTEND_URL` on the backend** (`.env`, backend repo) to the real production/staging origin (e.g. `https://zbc.news`) **before launch**. This is the single source of truth for `canonical`, `og:url`, `article:*`, and every JSON-LD `url`/`mainEntityOfPage` — `SeoResolverService::frontendUrl()` reads `config('app.frontend_url')`; `ArticleSharePreviewController` uses the same value. **Until it is set, those URLs point at the dev SPA port** (`http://localhost:5173`, the config default) and are wrong. This is a deployment-config item, **not a code bug** — verified: no host is hardcoded in `SeoResolverService` or the frontend `src/` (`grep` for `localhost:5173` in both returns only the `config/app.php` env default). The wrong host seen in a dev `curl` (served from `:3000`/`:5173` while `FRONTEND_URL` was still the dev value) is exactly this: the config wasn't pointed at the serving origin.
- [ ] Set `VITE_API_BASE_URL` (frontend) to the real API origin the **SSR Node process** can reach server-side (loaders fetch it directly, bypassing the dev `/api` proxy).
- [ ] Set `OG_DEFAULT_IMAGE` (backend, optional) if a branded default social card is wanted.

### Every consumer of `config('app.frontend_url')` that reaches SEO output (grep-verified)

The frontend origin has **exactly one source of truth**: the config key `app.frontend_url`,
defined once in `config/app.php:136` as `env('FRONTEND_URL', 'http://localhost:5173')` — the
only hardcoded fallback in the codebase. Every SEO-output URL flows from it:

| Consumer (`grep -rn "app.frontend_url" app`) | Feeds |
|---|---|
| `app/Services/SeoResolverService.php:543` (`frontendUrl()`) | `canonical`, `og:url`, JSON-LD `mainEntityOfPage`, `publisher.url`, author/Organization/WebSite `url`, `SearchAction.target`, **and every sitemap `<loc>`** (SitemapService calls `$this->seo->frontendUrl()`) |
| `app/Http/Controllers/SitemapController.php:43` | `robots.txt` `Sitemap:` lines |
| `app/Http/Controllers/ArticleSharePreviewController.php:24` | `/share/` crawler-preview canonical/OG |

Confirmed single source, no disagreeing fallback:
- These three read `config('app.frontend_url')` with **no** secondary fallback.
- Sitemap `<loc>`: spatie's `url.blade.php` wraps in `url()`, which is a **no-op for the
  absolute URL** `frontendUrl()` returns — verified by curl (`<loc>` shows the
  `frontend_url` host, not `APP_URL`/`localhost:8000`). It is **not** a second source.
- The **only** place with a secondary fallback is the newsletter link builders
  (`NewsletterService.php`, `NewsletterTrackingService.php`: `config('app.frontend_url', config('app.url'))`).
  That fallback (a) does not touch SEO output and (b) never fires — `config/app.php` always
  defines `frontend_url`. Flagged for completeness; harmless here.
- **Frontend client-side head** (`useDocumentHead` → `getPublicSiteOrigin()`): in production
  this resolves to the **same** backend value, because the public site-settings API returns
  `config('app.frontend_url')` (`PublicSiteSettingsResource::publicAppUrl`, which returns
  `null` for a localhost host). `VITE_SITE_URL` is only the dev/last-resort origin. So the
  raw SSR HTML (what crawlers read) is single-sourced from `app.frontend_url`; the hydrated
  head agrees **provided `FRONTEND_URL` is a real public domain and `VITE_SITE_URL` matches it**.

## 8c. Vite plugin note: no `react()` alongside `reactRouter()`

`@vitejs/plugin-react`'s `react()` plugin **must not** be registered in `vite.config.ts` next to `@react-router/dev/vite`'s `reactRouter()`. Both inject the React Fast Refresh preamble, so `npm run dev` throws `Uncaught SyntaxError: Identifier 'RefreshRuntime' has already been declared` and the page hangs (weather widget and ad slots never resolve). `reactRouter()` already provides the React transform + Fast Refresh. React Compiler stays enabled through `reactCompilerPreset()` (the babel *preset*, imported from `@vitejs/plugin-react` but independent of the plugin instance) fed to `@rolldown/plugin-babel`. Verified after removal: `compiler-runtime` chunk present in both `npm run build` output and dev, and `dev`/`build`/`start` all green. The `react()` line + its default import are removed (not commented) with an inline warning so it isn't re-added.

## 9. Open risks / flags

- **Infra/deploy** (persistent Node process, Dockerfile/nginx) — the biggest non-code change; needs owner sign-off before it can actually ship.
- **Provider SSR-safety** — `AuthenticatedNotificationsProvider` (Echo/Reverb), analytics, favicon must stay client-only in `root.tsx`; verify no top-level `window`/socket access at render.
- **Auth personalization in SSR is impossible** with the current localStorage bearer setup (no server-readable cookie). Out of scope here; if personalized SSR is ever wanted, that's a separate auth-strategy change (httpOnly cookie).
- **RR v8 future-flag warnings** appear on build; we stay on v7 semantics and don't opt in during this task.
- **`react-router-dom` → `react-router` import migration** across the codebase (mechanical, but touches many files).
