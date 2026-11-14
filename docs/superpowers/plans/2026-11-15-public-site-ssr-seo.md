# Public Site SSR for SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render every public VozmiMenja page as complete, current HTML on the server while leaving `/admin/*` as an SPA and retaining the existing static build as an automatic fallback.

**Architecture:** Keep the current React/Vite application and add a dedicated Vite SSR bundle plus a small Node HTTP runtime on loopback port 3004. Nginx proxies public HTML to that process, caches safe responses for 60 seconds, and falls back to the existing static route entrypoints when SSR is unavailable; React Query dehydration and hydration keep server and browser data identical.

**Tech Stack:** React 18, React Router 7, TanStack React Query 5, Vite 8, `react-dom/server`, Node 20 HTTP server, PM2, Nginx, TypeScript, Node test runner.

---

## File map

### New files

- `client/src/query/queryClient.ts` — shared QueryClient defaults for browser and server.
- `client/src/query/equipmentQueries.ts` — reusable public equipment query options.
- `client/src/query/articleQueries.ts` — reusable public article query options.
- `client/src/ssr/publicRoutes.ts` — public route matching, redirect and cache policy.
- `client/src/ssr/prefetchRoute.ts` — route-specific server data prefetch.
- `client/src/ssr/serialize.ts` — safe dehydrated-state serialization.
- `client/src/ssr/renderContext.tsx` — one request timestamp shared by server and hydration.
- `client/src/ssr/renderStream.tsx` — buffered `renderToPipeableStream` helper.
- `client/src/entry-client.tsx` — browser hydration entrypoint.
- `client/src/entry-server.tsx` — SSR render entrypoint.
- `client/scripts/prepare-ssr-template.mjs` — preserves a clean HTML template before static route generation.
- `client/ssr-server.mjs` — production SSR HTTP process and health endpoint.
- `client/src/ssr/publicRoutes.test.ts` — route/status/cache policy tests.
- `client/src/ssr/serialize.test.ts` — serialization security tests.
- `client/src/ssr/prefetchRoute.test.ts` — loader contract tests with a local mock API.
- `scripts/ssr-runtime.test.mjs` — built runtime, HTML, health and failure tests.
- `docs/frontend-ssr-cloudru.md` — operating, rollout and rollback runbook.

### Modified files

- `client/src/lib/api.ts` — runtime-safe API origin and status-aware errors.
- `client/src/api/articles.ts` — runtime-safe origin and query-compatible public methods.
- `client/src/hooks/useEquipment.ts` — consume shared query options without reading `window` during render.
- `client/src/pages/HomePage.tsx` — React Query for recent articles.
- `client/src/pages/BlogPage.tsx` — React Query for list and popular articles.
- `client/src/pages/BlogArticlePage.tsx` — hydrated queries for article and related content.
- `client/src/pages/SitemapPage.tsx` — hydrated equipment and article queries.
- `client/src/pages/SelfServiceBookingPage.tsx` — derive Moscow booking dates from the shared request timestamp.
- `client/src/pages/EquipmentDetailsPage.tsx` — derive offer validity from the shared request timestamp.
- `client/src/lib/contactLinks.ts` — SSR-safe default contact message.
- `client/src/components/FloatingActions.tsx` — deterministic WhatsApp URL on first render.
- `client/src/components/layout/Footer.tsx` — deterministic WhatsApp URL on first render.
- `client/src/components/SEO.tsx` — inline JSON-LD escaping for server output.
- `client/src/pages/ContactPage.tsx` — deterministic WhatsApp URL on first render.
- `client/src/App.tsx` — expose shared public/admin route tree without changing URLs.
- `client/src/main.tsx` — compatibility re-export or removal after `index.html` switches entrypoint.
- `client/index.html` — SSR head/root/state markers and `entry-client` script.
- `client/package.json` — browser/SSR build and SSR unit test commands.
- `client/tsconfig.node.json` — include SSR build scripts where TypeScript validation applies.
- `package.json` — add SSR runtime/config tests to the project test gate.
- `ecosystem.config.js` — add `vozmimenya-ssr` without changing the API process.
- `deploy-local.sh` — validate SSR artifacts and restart both PM2 apps safely.
- `nginx/vozmimenya-site.conf` — SSR upstream, microcache, bypasses and static fallback.
- `scripts/nginx-site.test.mjs` — assert SSR routing, cache and fallback invariants.
- `docs/superpowers/specs/2026-11-15-public-site-ssr-seo-design.md` — record the lazy-route streaming correction.

## Task 1: Shared public query contracts

**Files:**
- Create: `client/src/query/queryClient.ts`
- Create: `client/src/query/equipmentQueries.ts`
- Create: `client/src/query/articleQueries.ts`
- Modify: `client/src/lib/api.ts`
- Modify: `client/src/api/articles.ts`
- Modify: `client/src/hooks/useEquipment.ts`
- Test: `client/src/ssr/prefetchRoute.test.ts`

- [ ] **Step 1: Write a failing API-origin and query-key test**

Create the first part of `client/src/ssr/prefetchRoute.test.ts` with a local HTTP server and assertions that the exported options use stable keys:

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { equipmentQueries } from '../query/equipmentQueries'
import { articleQueries } from '../query/articleQueries'

test('public query keys are stable across server and browser', () => {
  assert.deepEqual(equipmentQueries.list({ limit: 200 }).queryKey, ['equipment', { limit: 200 }])
  assert.deepEqual(equipmentQueries.detail('karcher-puzzi-8-1').queryKey, ['equipment', 'karcher-puzzi-8-1'])
  assert.deepEqual(articleQueries.list('all').queryKey, ['articles', 'list', 'all'])
  assert.deepEqual(articleQueries.detail('test-article').queryKey, ['articles', 'detail', 'test-article'])
})
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run: `npx tsx client/src/ssr/prefetchRoute.test.ts`
Expected: FAIL because `equipmentQueries` and `articleQueries` do not exist.

- [ ] **Step 3: Implement the shared QueryClient and query factories**

`client/src/query/queryClient.ts`:

```ts
import { QueryClient } from '@tanstack/react-query'

export const createAppQueryClient = (isServer = false) => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: isServer ? false : 1,
    },
  },
})
```

`client/src/query/equipmentQueries.ts` exports `list`, `detail`, `stats`, `categoryCounts` and `offices` factories using the existing keys and `apiClient` methods. `detail` converts a public 404 to `null`; other errors remain rejected so SSR can return 503 and trigger fallback.

```ts
import { queryOptions } from '@tanstack/react-query'
import { ApiRequestError, apiClient } from '../lib/api'

export const equipmentQueries = {
  list: (params?: { page?: number; limit?: number; category?: string; search?: string }) => queryOptions({
    queryKey: ['equipment', params] as const,
    queryFn: () => apiClient.getEquipment(params),
  }),
  detail: (id: string) => queryOptions({
    queryKey: ['equipment', id] as const,
    queryFn: async () => {
      try {
        return await apiClient.getEquipmentById(id)
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) return null
        throw error
      }
    },
    enabled: Boolean(id),
  }),
  stats: () => queryOptions({ queryKey: ['equipment-stats'] as const, queryFn: () => apiClient.getEquipmentStats() }),
  categoryCounts: () => queryOptions({ queryKey: ['category-counts'] as const, queryFn: () => apiClient.getCategoryCounts() }),
  offices: () => queryOptions({ queryKey: ['public-offices'] as const, queryFn: () => apiClient.getOffices() }),
}
```

`client/src/query/articleQueries.ts` exports `list`, `popular`, `recent` and `detail`. `detail` returns `null` only for HTTP 404.

- [ ] **Step 4: Make API origin selection and errors SSR-safe**

In `client/src/lib/api.ts`, replace the module-level origin with a resolver and export a status-aware error:

```ts
export class ApiRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

export const getPublicApiBaseUrl = () => import.meta.env.SSR
  ? process.env.SSR_API_URL || 'http://127.0.0.1:3003/api'
  : import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3002/api')
```

Resolve the base URL inside `request()` and throw `new ApiRequestError(message, response.status)`. Apply the same origin resolver and 404 handling to public methods in `client/src/api/articles.ts`; admin methods remain browser-only.

- [ ] **Step 5: Change equipment hooks to consume the factories**

Replace inline query objects in `client/src/hooks/useEquipment.ts` with `useQuery(equipmentQueries.*())`. Remove the `window.location` initial-data callback from `useEquipmentById`; dehydrated SSR data and the retained static fallback now provide first-render data.

- [ ] **Step 6: Run focused tests and typecheck**

Run: `npx tsx client/src/ssr/prefetchRoute.test.ts && npm run typecheck --workspace=client`
Expected: PASS with no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add client/src/query client/src/lib/api.ts client/src/api/articles.ts client/src/hooks/useEquipment.ts client/src/ssr/prefetchRoute.test.ts
git commit -m "refactor: share public query contracts for SSR"
```

## Task 2: Hydratable public pages and browser-safe first render

**Files:**
- Modify: `client/src/pages/HomePage.tsx`
- Modify: `client/src/pages/BlogPage.tsx`
- Modify: `client/src/pages/BlogArticlePage.tsx`
- Modify: `client/src/pages/SitemapPage.tsx`
- Modify: `client/src/pages/EquipmentDetailsPage.tsx`
- Modify: `client/src/lib/contactLinks.ts`
- Modify: `client/src/components/FloatingActions.tsx`
- Modify: `client/src/components/layout/Footer.tsx`
- Modify: `client/src/components/CallbackModal.tsx`
- Modify: `client/src/components/SEO.tsx`
- Modify: `client/src/pages/ContactPage.tsx`
- Test: `client/src/ssr/prefetchRoute.test.ts`

- [ ] **Step 1: Add failing query-usage and SSR-safety assertions**

Extend `prefetchRoute.test.ts` to read the four page sources and assert they import `articleQueries` or `equipmentQueries` and do not initialize state from `window.location`. Add a direct assertion for the contact helper:

```ts
import { getPageLeadMessage } from '../lib/contactLinks'

test('contact links have a deterministic server fallback', () => {
  assert.equal(
    getPageLeadMessage('Аренда техники', 'https://vozmimenya.ru/'),
    'Здравствуйте! Хочу уточнить аренду. Страница: Аренда техники https://vozmimenya.ru/',
  )
})
```

- [ ] **Step 2: Verify the test fails with the current browser-only helper**

Run: `npx tsx client/src/ssr/prefetchRoute.test.ts`
Expected: FAIL because the second URL parameter is unsupported and current page initializers still use effects/window.

- [ ] **Step 3: Refactor the data-driven pages**

- `HomePage` uses `useQuery(articleQueries.recent(3))` instead of an effect and local recent-article state.
- `BlogPage` uses `useQuery(articleQueries.list(selectedCategory))` and `useQuery(articleQueries.popular(5))`.
- `BlogArticlePage` uses `useQuery(articleQueries.detail(slug))` and `useQuery(articleQueries.recent(100))`; derive related articles with `pickRelatedArticles`.
- `SitemapPage` uses `useQuery(equipmentQueries.list({ limit: 200 }))` and `useQuery(articleQueries.list('all'))`.

Keep the current loading and recoverable-error UI, but derive it from query state. A `null` article or equipment item renders the shared `NotFoundPage`, including noindex metadata, rather than navigating or returning an indexable error screen during server render.

- [ ] **Step 4: Make contact links deterministic**

Use explicit arguments instead of reading browser globals in default parameters:

```ts
export function getPageLeadMessage(
  pageTitle = 'Аренда техники',
  pageUrl = 'https://vozmimenya.ru/',
) {
  return `Здравствуйте! Хочу уточнить аренду. Страница: ${pageTitle} ${pageUrl}`
}

export function getBrowserPageLeadMessage(pageTitle = document.title) {
  return getPageLeadMessage(
    pageTitle,
    `${window.location.origin}${window.location.pathname}${window.location.search}`,
  )
}

export function getWhatsAppUrl(message = getPageLeadMessage()) {
  return `https://wa.me/79933636464?text=${encodeURIComponent(message)}`
}
```

Event handlers in `ContactPage` and `CallbackModal` use `getBrowserPageLeadMessage`; render-time links in `FloatingActions`, `Footer` and `ContactPage` use the deterministic default.

Also escape `<` in JSON-LD generated by `SEO.tsx` as `\\u003c` before Helmet receives it, so admin-authored article or equipment text cannot terminate the script element.

- [ ] **Step 5: Run page tests, typecheck and lint**

Run: `npm run test --workspace=client && npm run typecheck --workspace=client && npm run lint --workspace=client`
Expected: all client tests pass and no browser-global render error remains in the modified paths.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages client/src/components client/src/lib/contactLinks.ts client/src/ssr/prefetchRoute.test.ts
git commit -m "refactor: make public pages hydratable"
```

## Task 3: Public route policy and server prefetch

**Files:**
- Create: `client/src/ssr/publicRoutes.ts`
- Create: `client/src/ssr/prefetchRoute.ts`
- Create: `client/src/ssr/publicRoutes.test.ts`
- Modify: `client/src/ssr/prefetchRoute.test.ts`

- [ ] **Step 1: Write failing route-policy tests**

`publicRoutes.test.ts` must cover exact pages, dynamic pages, admin exclusion, redirect preservation, booking cache bypass and unknown 404:

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { resolvePublicRoute } from './publicRoutes'

test('resolves public, dynamic, admin and missing routes', () => {
  assert.equal(resolvePublicRoute('/').kind, 'page')
  assert.deepEqual(resolvePublicRoute('/equipment/karcher-puzzi-8-1'), {
    kind: 'equipment', id: 'karcher-puzzi-8-1', cacheable: true,
  })
  assert.deepEqual(resolvePublicRoute('/blog/test-article'), {
    kind: 'article', slug: 'test-article', cacheable: true,
  })
  assert.deepEqual(resolvePublicRoute('/admin/rentals'), { kind: 'admin' })
  assert.equal(resolvePublicRoute('/booking').cacheable, false)
  assert.deepEqual(resolvePublicRoute('/missing-page'), { kind: 'not-found', cacheable: false })
})
```

- [ ] **Step 2: Run and verify the missing-module failure**

Run: `npx tsx client/src/ssr/publicRoutes.test.ts`
Expected: FAIL because `publicRoutes.ts` does not exist.

- [ ] **Step 3: Implement route resolution**

Export a discriminated union containing `page`, `equipment`, `article`, `redirect`, `admin` and `not-found`. Read redirect targets from `content/redirects.json`, normalize trailing slashes, decode path segments safely, mark `/booking` and `/booking/success` non-cacheable, and reject `/admin` from SSR.

- [ ] **Step 4: Write failing route-prefetch tests**

Extend `prefetchRoute.test.ts` with a mock API and assert:

- `/` stores equipment page 1, 200-item equipment, stats, counts and three recent articles;
- `/equipment/:id` stores the detail and its three-item category query;
- `/blog` stores all and popular articles;
- `/blog/:slug` stores the article and recent articles;
- `/sitemap` stores equipment and articles;
- `/booking` stores equipment and offices;
- a missing dynamic resource returns status 404;
- a 500 response rejects instead of being converted to 404.

- [ ] **Step 5: Implement `prefetchPublicRoute`**

The function accepts a `QueryClient` and resolved route, calls `fetchQuery` using only shared query factories, and returns `{ status: 200 | 404 }`. Route loaders use exact query keys consumed by components. Public informational pages prefetch the 200-item equipment query because shared pricing/CTA components use it.

- [ ] **Step 6: Run focused tests**

Run: `npx tsx client/src/ssr/publicRoutes.test.ts && npx tsx client/src/ssr/prefetchRoute.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add client/src/ssr client/src/query
git commit -m "feat: add SSR route data prefetch"
```

## Task 4: Server render and browser hydration

**Files:**
- Create: `client/src/ssr/serialize.ts`
- Create: `client/src/ssr/serialize.test.ts`
- Create: `client/src/ssr/renderContext.tsx`
- Create: `client/src/ssr/renderStream.tsx`
- Create: `client/src/entry-client.tsx`
- Create: `client/src/entry-server.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/main.tsx`
- Modify: `client/index.html`
- Modify: `client/src/pages/SelfServiceBookingPage.tsx`
- Modify: `client/src/pages/EquipmentDetailsPage.tsx`
- Modify: `client/src/components/layout/Footer.tsx`

- [ ] **Step 1: Write failing serializer tests**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { serializeForInlineScript } from './serialize'

test('escapes characters that can break an inline script', () => {
  const value = serializeForInlineScript({ text: '</script><script>alert(1)</script>\u2028\u2029&' })
  assert.doesNotMatch(value, /<\/script>/i)
  assert.match(value, /\\u003c/)
  assert.match(value, /\\u2028/)
  assert.match(value, /\\u2029/)
  assert.deepEqual(JSON.parse(value), { text: '</script><script>alert(1)</script>\u2028\u2029&' })
})
```

- [ ] **Step 2: Run and verify failure, then implement serializer**

Run: `npx tsx client/src/ssr/serialize.test.ts`
Expected: FAIL because `serialize.ts` is missing.

Implementation:

```ts
export const serializeForInlineScript = (value: unknown) => JSON.stringify(value)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029')
```

- [ ] **Step 3: Implement the buffered React stream**

`renderStream.tsx` wraps `renderToPipeableStream`, waits for `onAllReady`, pipes into a `PassThrough`, concatenates UTF-8 chunks, rejects on shell errors, records recoverable render errors, and aborts after 8 seconds. It returns `{ html, errors }` only after the stream ends.

Create `renderContext.tsx` with a `RenderEnvironmentProvider` and `useRenderEnvironment()` exposing one `nowIso` value. `entry-server` creates it once per request; `entry-client` reuses the serialized value. Use it in `SelfServiceBookingPage`, `EquipmentDetailsPage` and `Footer` so dates, `priceValidUntil` and copyright year cannot differ during hydration.

- [ ] **Step 4: Implement `entry-server`**

`renderPage(url)` performs these exact operations:

1. resolve route and return redirect/admin metadata without rendering;
2. create a server QueryClient;
3. call `prefetchPublicRoute`;
4. render `<HelmetProvider context={helmetContext}><QueryClientProvider><StaticRouter location={url}><App /></StaticRouter></QueryClientProvider></HelmetProvider>`;
5. dehydrate successful public queries;
6. return status, app HTML, Helmet title/meta/link/script strings and escaped `{ queryState, nowIso }` state;
7. set 404 for unknown or missing dynamic resources and 503 for upstream/render failures.

- [ ] **Step 5: Implement `entry-client`**

Declare `window.__VOZMIMENYA_SSR__`, create one browser QueryClient, and call `hydrateRoot` when `#root` contains SSR markup; use `createRoot` only for the static fallback. Wrap the browser tree in `RenderEnvironmentProvider`, `HydrationBoundary`, `HelmetProvider`, `QueryClientProvider`, `BrowserRouter` and `StrictMode`. Keep the service-worker cleanup and legacy Pages query normalization in browser-only functions.

- [ ] **Step 6: Add stable template markers**

Change `client/index.html` to load `/src/entry-client.tsx`, add `<!--ssr-head-->` immediately after the default title, keep `<div id="root"></div>` as the outlet anchor, and add `<!--ssr-state-->` immediately before the module script. `main.tsx` becomes a side-effect import of `entry-client.tsx` for compatibility until all references are migrated.

- [ ] **Step 7: Run SSR unit tests, client tests and typecheck**

Run: `npx tsx client/src/ssr/serialize.test.ts && npm run test --workspace=client && npm run typecheck --workspace=client`
Expected: PASS; no code path reads `window` merely by importing `entry-server`.

- [ ] **Step 8: Commit**

```bash
git add client/src/entry-client.tsx client/src/entry-server.tsx client/src/ssr client/src/App.tsx client/src/main.tsx client/index.html client/src/pages/SelfServiceBookingPage.tsx client/src/pages/EquipmentDetailsPage.tsx client/src/components/layout/Footer.tsx
git commit -m "feat: render and hydrate public React pages"
```

## Task 5: Production SSR bundle and HTTP runtime

**Files:**
- Create: `client/scripts/prepare-ssr-template.mjs`
- Create: `client/ssr-server.mjs`
- Create: `scripts/ssr-runtime.test.mjs`
- Modify: `client/package.json`
- Modify: `package.json`
- Modify: `client/tsconfig.node.json`

- [ ] **Step 1: Write failing runtime contract tests**

`scripts/ssr-runtime.test.mjs` first reads the package scripts and runtime source, asserting the build creates both `dist` and `dist-ssr`, the server binds only to `SSR_HOST`, and `/health` exists. A later integration subtest starts a mock API and built SSR server, then verifies:

```js
assert.equal(health.status, 200)
assert.equal(healthJson.status, 'ok')
assert.equal(page.status, 200)
assert.match(html, /<div id="root">[^<]/)
assert.match(html, /<h1/)
assert.match(html, /rel="canonical"/)
assert.match(html, /__VOZMIMENYA_SSR__/)
assert.equal(page.headers.get('x-vozmimenya-render'), 'ssr')
```

- [ ] **Step 2: Run and verify missing scripts/runtime failure**

Run: `node --test scripts/ssr-runtime.test.mjs`
Expected: FAIL because the SSR build and runtime do not exist.

- [ ] **Step 3: Prepare an immutable SSR template**

`prepare-ssr-template.mjs` reads `client/dist/index.html` immediately after the browser build, verifies all three markers exist, writes `client/dist-ssr/template.html`, and refuses to continue if the root is already populated. This runs before `generate-static-route-entrypoints.js` modifies `dist` for fallback pages.

- [ ] **Step 4: Add browser and server bundle commands**

Set client scripts to this sequence. The template is written after the SSR bundle has created a clean `dist-ssr`, but before the static generator modifies browser HTML:

```json
{
  "build:browser": "vite build --mode production",
  "build:ssr": "vite build --mode production --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prepare-ssr-template.mjs",
  "build": "npm run build:browser && npm run build:ssr && node scripts/generate-static-route-entrypoints.js",
  "test:ssr": "tsx src/ssr/publicRoutes.test.ts && tsx src/ssr/serialize.test.ts && tsx src/ssr/prefetchRoute.test.ts"
}
```

Add a root command `test:ssr-runtime` that runs `npm run build:browser --workspace=client`, `npm run build:ssr --workspace=client`, then `node --test scripts/ssr-runtime.test.mjs`. Append `npm run test:ssr --workspace=client` and `npm run test:ssr-runtime` to the root `test` command. Include scripts in TypeScript validation only where this does not enable JavaScript checking.

- [ ] **Step 5: Implement the Node runtime**

`ssr-server.mjs`:

- binds to `SSR_HOST` defaulting to `127.0.0.1` and `SSR_PORT` defaulting to `3004`;
- loads `dist-ssr/template.html` and the built `entry-server` export once at startup;
- accepts GET and HEAD only;
- returns JSON from `/health` after confirming template and renderer readiness;
- inserts Helmet output at `<!--ssr-head-->`, app HTML inside `#root`, and safe state at `<!--ssr-state-->`;
- returns `Location` for SSR-known redirects;
- returns 503 on render/upstream errors so Nginx can use static fallback;
- emits `X-VozmiMenja-Render: ssr` and structured JSON logs without query values or personal data;
- handles SIGTERM/SIGINT with `server.close()`.

- [ ] **Step 6: Build and run runtime tests**

Run: `npm run build --workspace=client && node --test scripts/ssr-runtime.test.mjs`
Expected: browser build, SSR bundle and static fallback generation succeed; runtime tests pass.

- [ ] **Step 7: Commit**

```bash
git add client/package.json client/tsconfig.node.json client/scripts/prepare-ssr-template.mjs client/ssr-server.mjs package.json scripts/ssr-runtime.test.mjs
git commit -m "feat: add production SSR runtime"
```

## Task 6: Nginx SSR proxy, cache and static fallback

**Files:**
- Modify: `nginx/vozmimenya-site.conf`
- Modify: `scripts/nginx-site.test.mjs`

- [ ] **Step 1: Write failing Nginx policy tests**

Add tests asserting:

- upstream `127.0.0.1:3004`;
- a 60-second `proxy_cache_valid 200`;
- a cache key based on scheme, method, host and URI but not args;
- bypass for `/booking` and `/booking/success`;
- `/admin` uses static SPA fallback and never `proxy_pass`;
- `proxy_intercept_errors on` plus `error_page 502 503 504 = @static_fallback`;
- stale use for timeout/5xx;
- named fallback uses `$uri`, `$uri.html` and `$uri/index.html` and preserves true 404;
- asset locations remain static and immutable.

- [ ] **Step 2: Verify tests fail**

Run: `npm run test:nginx-site`
Expected: FAIL because the current config is static-only.

- [ ] **Step 3: Implement Nginx policy**

At HTTP scope in the site file, add the cache path, upstream and booking bypass map. Keep TLS, security headers, `www` redirect and exact legacy redirects unchanged. Add exact static/admin locations before the public catch-all. The public location proxies to SSR, forwards host/proto/real IP, enables microcache and stale, and falls back only on 502/503/504. `@static_fallback` returns an existing route entrypoint or a real 404.

- [ ] **Step 4: Run Nginx tests and syntax check where available**

Run: `npm run test:nginx-site`
Expected: PASS.

If local Nginx is installed, run: `nginx -t -c "$PWD/nginx/vozmimenya-site.conf"` with a generated minimal prefix; otherwise rely on the repository parser test locally and run the real `sudo nginx -t` on the VM before activation.

- [ ] **Step 5: Commit**

```bash
git add nginx/vozmimenya-site.conf scripts/nginx-site.test.mjs
git commit -m "feat: proxy public HTML through SSR"
```

## Task 7: PM2 and deployment integration

**Files:**
- Modify: `ecosystem.config.js`
- Modify: `deploy-local.sh`
- Modify: `scripts/test-deploy-sitemap-restore.sh`
- Create: `scripts/ssr-deploy-config.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing deployment assertions**

`ssr-deploy-config.test.mjs` reads the PM2 and deploy files and asserts:

- API remains one process with its current script, cwd and port;
- SSR is a separate fork process using `client/ssr-server.mjs`;
- SSR binds to `127.0.0.1:3004` and uses `http://127.0.0.1:3003/api`;
- SSR has `max_memory_restart: '256M'`, restart limits and separate logs;
- deploy refuses to restart when template or SSR bundle is missing;
- deploy checks both `/health` endpoints before reloading Nginx;
- stopping the stack stops both named apps.

- [ ] **Step 2: Run and verify failure**

Run: `node --test scripts/ssr-deploy-config.test.mjs`
Expected: FAIL because the SSR PM2 app is absent.

- [ ] **Step 3: Add the PM2 app**

Append this independently restartable app without altering `vozmimenya-api`:

```js
{
  name: 'vozmimenya-ssr',
  script: './ssr-server.mjs',
  cwd: '/var/www/vozmimenya/client',
  instances: 1,
  exec_mode: 'fork',
  autorestart: true,
  max_memory_restart: '256M',
  max_restarts: 10,
  min_uptime: '10s',
  env: {
    NODE_ENV: 'production',
    SSR_HOST: '127.0.0.1',
    SSR_PORT: 3004,
    SSR_API_URL: 'http://127.0.0.1:3003/api'
  },
  error_file: './logs/ssr-error.log',
  out_file: './logs/ssr-out.log',
  time: true
}
```

Use the actual project path already defined by the canonical root ecosystem file; do not introduce a second production checkout path.

- [ ] **Step 4: Harden deploy checks**

Before PM2 restart, require:

```bash
[ -f "$PROJECT_DIR/client/dist-ssr/entry-server.js" ]
[ -f "$PROJECT_DIR/client/dist-ssr/template.html" ]
[ -f "$PROJECT_DIR/client/ssr-server.mjs" ]
```

After restart, poll API and SSR health on loopback with bounded retries. Reload Nginx only after both succeed. Keep the existing database backup, atomic static directory swap and sitemap restoration unchanged.

- [ ] **Step 5: Run deploy/config tests**

Run: `node --test scripts/ssr-deploy-config.test.mjs && npm run test:deploy`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add ecosystem.config.js deploy-local.sh scripts/test-deploy-sitemap-restore.sh scripts/ssr-deploy-config.test.mjs package.json
git commit -m "ops: deploy SSR as an isolated PM2 service"
```

## Task 8: Browser, SEO and failure-path verification

**Files:**
- Modify: `scripts/ssr-runtime.test.mjs`
- Create: `docs/frontend-ssr-cloudru.md`

- [ ] **Step 1: Expand the runtime fixture**

The test starts a deterministic mock API, builds the client once, starts the SSR server on an ephemeral loopback port, and checks these routes:

```text
/
/arenda-pylesosov-moskva
/equipment/karcher-puzzi-8-1
/blog
/blog/test-article
/arenda-tehniki-u-metro-volzhskaya-kuzminki
/booking
/booking/success
/missing-page
```

For indexable pages assert `200`, one H1, canonical, description, robots index and JSON-LD. Assert `noindex` on success and 404 pages. Parse the inline query state and verify it contains no token, cookie, authorization header or environment value.

- [ ] **Step 2: Add hydration verification**

Launch the built page in Chromium using the existing browser-testing capability. Capture console errors and fail on `Hydration failed`, `did not match`, uncaught exceptions or failed critical API calls. Verify navigation, cookie banner, WhatsApp link, booking form opening and one SPA transition.

- [ ] **Step 3: Test upstream failure**

Stop the mock API and assert the SSR runtime returns 503 for a data-dependent page. Start an Nginx test instance when available and confirm that the same request returns the static entrypoint with `X-SSR-Fallback`, while an unknown route remains 404.

- [ ] **Step 4: Write the operations runbook**

`docs/frontend-ssr-cloudru.md` records:

- processes, ports and health commands;
- build artifacts and log locations;
- local and VM verification commands;
- canary routes;
- Nginx activation procedure;
- cache/stale/fallback behavior;
- memory and TTFB checks;
- sitemap resubmission;
- rollback to static `try_files` without touching API or database;
- explicit rule that production activation requires «выкатывай».

- [ ] **Step 5: Run the full local gate**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

Expected: every command exits 0. Record existing non-fatal dependency audit warnings separately; do not run `npm audit fix --force` in this feature.

- [ ] **Step 6: Commit**

```bash
git add scripts/ssr-runtime.test.mjs docs/frontend-ssr-cloudru.md
git commit -m "test: verify SSR SEO and rollback paths"
```

## Task 9: Review and release preparation

**Files:**
- Modify only files required by review findings.

- [ ] **Step 1: Review the complete branch against the design**

Confirm every public route is classified, all dynamic routes prefetch matching query keys, admin remains static SPA, 404 and redirect status are real, and Nginx fallback cannot turn missing pages into 200 responses.

- [ ] **Step 2: Run a production-like local smoke**

Start mock API, SSR runtime and test Nginx. Measure uncached and cached TTFB for the home page, one category, one product and one article. Confirm cached responses are below 500 ms and process RSS remains below the PM2 256 MB restart threshold during repeated requests.

- [ ] **Step 3: Verify rollback**

Stop the SSR process and confirm indexable canary routes are served from static entrypoints, `/admin/rent/login` remains usable, the API health endpoint stays up, and unknown routes remain 404.

- [ ] **Step 4: Run final verification from a clean state**

Run the full gate from Task 8 after removing generated untracked build artifacts. Expected: clean git status except committed source and documentation; all tests pass.

- [ ] **Step 5: Push branch and open a pull request**

Use title `feat: add SSR for the public VozmiMenja site`. The PR body lists architecture, test evidence, memory/TTFB measurements, canary procedure, rollback and the fact that production remains static until explicit owner approval.

- [ ] **Step 6: Stop before production activation**

Do not install the Nginx config, restart production PM2, submit sitemap or switch traffic until the owner explicitly says «выкатывай». The prepared branch and runbook are the terminal state before that approval.
