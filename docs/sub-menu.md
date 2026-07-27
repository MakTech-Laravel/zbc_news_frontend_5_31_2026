# Sub Menu (frontend)

Admin **Sub Menu** APIs power the header quick-link filters on the main column. The right sidebar stays on classic cards (Most Read + trending tags).

Full API / merge rules / QA checklist:

→ [`zbc_news_backend_5_31_2026/docs/sub-menu.md`](../../zbc_news_backend_5_31_2026/docs/sub-menu.md)

## Public behaviour

| Surface | Behaviour |
|---|---|
| Header quick links | `/?section=trending\|most_read\|live_updates\|editorial_picks` filters the **main** home feed |
| Right sidebar | Classic: Most Read (period tabs) + ad + Trending tags |
| Admin `/admin/sub-menu` | Configures settings / pins / live |

## Key frontend files

| Area | Path |
|---|---|
| Main filter view | `src/components/main-layout/content/SubMenuFeed.tsx` |
| Home wiring | `src/pages/frontend/Home.tsx` (`?section=`) |
| Header links | `src/components/partials/frontend/FrontendHeader.tsx` |
| Admin page | `src/pages/admin/AdminSubMenu.tsx` |
| Public API | `src/services/frontend/subMenu.ts` |
| Admin API | `src/services/admin/subMenu.ts` |

## Smoke checklist

1. Click **Trending** in header → main column curated grid; right sidebar unchanged.
2. Click **Most Read** → same article grid layout as other filters.
3. Click **Live Updates** / **Editorial Picks** → section API items.
4. Clear `?section=` (logo / Home) → default home returns.
5. Right sidebar still shows Most Read list + trending tag pills only.
