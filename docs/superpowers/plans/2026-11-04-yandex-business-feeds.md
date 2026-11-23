# Yandex Business Location Feeds Implementation Plan

> **For Codex:** Execute this plan in the current isolated worktree with test-driven development. Do not deploy or connect feeds in Yandex Business without the owner's explicit approval.

**Goal:** Add public, location-specific YML feeds for the Volzhskaya and Dynamo offices using the production catalog for product content and prices and office inventory for conservative availability.

**Architecture:** A pure feed builder owns XML escaping, category/vendor/image normalization, office configuration, and deterministic catalog-to-inventory matching. A thin Express router loads catalog and office inventory from the existing models and returns YML. Ambiguous or missing inventory never claims availability.

**Tech Stack:** TypeScript, Express, SQLite models, Jest/ts-jest.

---

### Task 1: Feed builder contract

**Files:**
- Create: `server/src/services/yandexBusinessFeed.test.ts`
- Create: `server/src/services/yandexBusinessFeed.ts`

1. Write failing tests for exact daily prices, XML escaping, categories, vendor, compatible image selection, UTM product URLs, and office-isolated availability.
2. Run the focused suite and confirm it fails because the builder does not exist.
3. Implement the smallest pure builder satisfying the tests.
4. Re-run the focused suite.

### Task 2: Public feed endpoints

**Files:**
- Create: `server/src/routes/yandexBusinessFeeds.test.ts`
- Create: `server/src/routes/yandexBusinessFeeds.ts`
- Modify: `server/src/index.ts`

1. Write failing route tests for both office slugs, YML content type, and unknown-location 404.
2. Add a router factory with injectable data loaders and register it at `/api/yandex-business/feeds`.
3. Re-run route tests.

### Task 3: Verification and release notes

**Files:**
- Modify: `.agents/board.md`
- Modify: `docs/changelog.md`

1. Document exact implementation status, audit findings, constraints, and pending owner actions.
2. Run focused tests, full tests, typecheck, lint, and build.
3. Review the diff and report that no production deployment or Yandex feed activation occurred.
