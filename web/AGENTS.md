# AGENTS.md — frontend (web)

> Place this file at `web/AGENTS.md`. Context from the root AGENTS.md still applies here.

## What this app does

A Next.js UI on top of the backend API (`api`). No business logic (matching, calculations) lives here — the frontend just collects user input and displays results computed by the backend.

## Key screens (MVP)

Note: `web/` is the package root; `web/app/` is Next.js's own App Router folder (the repeated "app" is just Next.js's naming convention, not a mistake).

```
web/
├── app/
│   ├── (auth)/login, register
│   ├── owned-parts/           add a set by number OR add parts manually
│   └── matches/                 list of matching results, sorted by match %,
│                                    missing parts detail + export
```

## Connecting to the backend

- All communication happens via REST calls to the backend API (base URL from an env variable, never hardcoded)
- Import request/response types from `packages/shared-types` — if a type is missing, add it there, not locally in a component
- No business logic (percentage calculation, part comparison) on the frontend — display only what the backend returns
- Configure `NEXT_PUBLIC_API_URL` in `.env.local` (see `.env.example`)

## Server state (TanStack Query)

- **Server data lives in TanStack Query only** — do not mirror API responses in Zustand, Context, or local component state beyond form drafts
- Import query hooks from `@/lib/queries` — never call `fetch` directly in components or pages
- Query keys are defined in `lib/queries/keys.ts` — extend the factory when adding new resources
- Colocate fetchers, `queryOptions`, and hooks in `lib/queries/{domain}/`
- Authenticated requests use `credentials: "include"` in `apiFetch` — session lives in httpOnly cookies set by the API, never in localStorage or client JS
- Collection mutations (owned parts writes) must call `invalidateCollectionQueries` so matches stay in sync
- Use `AsyncQueryState` for loading, error, empty, stale, and background-refetch UI

## Conventions

- TypeScript strict mode
- Server components by default, client components only where interactivity is needed (forms, filtering results)
- Forms for adding parts: client-side validation for UX (fast feedback), but final validation always happens on the backend — the frontend is never the source of truth

## What's NOT in the MVP

Wishlists, tags, social sharing, mobile UI — if you find yourself designing for any of these, check the root `AGENTS.md` to confirm it's in scope.

## Commands (fill in once the project is set up)

```
pnpm --filter @lego-matcher/web dev
pnpm --filter @lego-matcher/web build
pnpm --filter @lego-matcher/web check
pnpm --filter @lego-matcher/web typecheck
pnpm --filter @lego-matcher/web test:run
```