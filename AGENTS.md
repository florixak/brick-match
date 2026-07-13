# AGENTS.md — LEGO Set Matcher (root)

## What this project does

The user enters which LEGO parts/sets they own. The application calculates which LEGO sets from the full catalog (Rebrickable) they can build, at what percentage completion, and exactly what's missing.

The core value is **not** AI or a polished UI — it's a matching algorithm over a large dataset (tens of thousands of sets, hundreds of thousands of inventory rows), built on a database index instead of brute-force scanning. See `api/AGENTS.md` for the algorithm details.

## Monorepo structure

```
lego-matcher/
├── AGENTS.md                 ← this file
├── api/                       NestJS — API, matching engine, data import
│   └── AGENTS.md
├── web/                       Next.js — UI
│   └── AGENTS.md
├── shared-types/              shared Zod schemas + TS types between backend and frontend
└── docker-compose.yml         local Postgres for development
```

## How backend and frontend communicate

- Frontend (Next.js) calls the backend (NestJS) via REST API.
- Shared types (request/response shapes, e.g. `MatchResult`, `OwnedPart`) live in `shared-types/`, imported by both apps — no manual type duplication. Schemas are defined with **Zod** so the same schema drives both TypeScript types and runtime validation on the backend and frontend.
- The backend never calls any external API (BrickLink, Rebrickable) at runtime — all catalog data is imported locally into Postgres. Exception: the one-off/periodic import script.

## Data model

Full schema (tables, types, constraints, indexes) lives in `api/AGENTS.md` — the short version: a read-only catalog (`parts`, `colors`, `sets`, `inventory_parts`) imported from Rebrickable, plus two tables the app actually writes to (`users`, `user_owned_parts`). The `(part_num, color_id)` index on `inventory_parts` is what makes matching fast.

## Tech stack (rationale, see full project plan)

- Frontend: Next.js + TypeScript
- Backend: NestJS + TypeScript
- DB: PostgreSQL (B-tree indexes over `(part_num, color_id)` are the core of matching performance)
- ORM: Drizzle
- Data: Rebrickable CSV export, imported locally

## Scope — what IS and IS NOT part of the MVP

**IS:** auth, adding owned parts (by set or manually), matching against the catalog, showing match % and missing parts, exporting the list.

**IS NOT (deferred to V2/V3):** AI part recognition from photos, BrickLink price integration, wishlists/tags/social features, mobile app.

If unsure whether a feature belongs in the MVP: if it doesn't directly answer "what can I build and what's missing", it doesn't belong there.

### Later (V2/V3, outside this roadmap)
AI part estimation from photos, BrickLink price integration, color-similarity matching.

## Success criteria

- Matching over the full catalog completes in seconds, not minutes
- Results check out against reality when tested on a real collection
- Design decisions (DB-backed inverted index, quantity-weighted matching) can be clearly explained in a portfolio setting