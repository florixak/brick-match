# AGENTS.md — backend (api)

## What this app does

A NestJS API that:
1. manages users and their owned parts (`user_owned_parts`)
2. holds a local copy of the Rebrickable catalog (sets, parts, colors, inventories)
3. computes matching (match % + missing parts) between owned parts and the catalog of sets

## Module structure (target)

```
api/src/
├── catalog/          entities and services for parts/colors/sets/inventory_parts (read-only catalog)
├── owned-parts/       CRUD over user_owned_parts
├── matching/           MatchingService — the core of the project, see below
├── import/             script/CLI for importing Rebrickable CSV into the DB
└── auth/                registration, login, guards
```

## Dependencies

Every dependency here is justified architecturally, not added by default. If you're about to add a new library, ask what specific problem it solves that the current set doesn't — and add the reasoning here.

### Database & ORM
- **`drizzle-orm`** — type-safe, close to SQL (no separate query-engine/codegen step like Prisma). Lets you drop into raw `sql` template literals for the matching query, which needs full control over the index-backed lookup, not an abstracted query builder.
- **`drizzle-kit`** — migration generation/runner. Dev dependency only.
- **`postgres`** (postgres.js driver) — faster than `pg`/node-postgres and Drizzle's recommended default driver for new projects.

### Auth
- **`@nestjs/jwt`** — token signing/verification, official Nest wrapper over `jsonwebtoken`.
- **`@nestjs/passport` + `passport` + `passport-jwt`** — Nest's idiomatic way to guard endpoints (`@UseGuards(AuthGuard('jwt'))`); not an extra abstraction, it's how Nest expects auth to be wired.
- **`argon2`** — password hashing. Chosen over bcrypt as the OWASP-recommended modern default. Note: `argon2` has a native compilation step — make sure the Docker/deploy image includes build tools (or use a prebuilt binary target), otherwise the install will fail on deploy.
- **MVP scope:** access token only, no refresh token rotation. Refresh tokens add real complexity (rotation, revocation, storage) that isn't justified for a project used by one person occasionally — revisit if the user base ever grows.

### Validation & config
- **`zod`** — chosen over Nest's default `class-validator`/`class-transformer` specifically because `packages/shared-types` is shared with the frontend. A Zod schema defines type + validation in one place and can be reused for frontend form validation too — `class-validator`'s decorator-on-class approach can't be shared that way.
- **`nestjs-zod`** — thin adapter wiring Zod schemas into Nest's `ValidationPipe`, avoids writing custom glue code.
- **`@nestjs/config`** — loads and validates env vars (DB connection string, JWT secret); validate through the same Zod schemas for consistency.

### Security
- **`@nestjs/throttler`** — rate limiting on two specific attack/failure surfaces, not a generic "best practice" add: (1) `/auth/login` is a brute-force target even on a small app; (2) the matching endpoint is the most computationally expensive route, and needs protection from accidental overload (e.g. a buggy frontend retry loop), not just malicious traffic.
- **`helmet`** — sets standard security HTTP headers (CSP, X-Frame-Options, etc.). Low cost, and worth having from the start rather than retrofitting once the API is public-facing.

### Data import
- **`csv-parse`** — streaming CSV parser. `inventory_parts.csv` has millions of rows; it must be processed line-by-line/in chunks, never loaded fully into memory.
- **No gzip library** — Node's built-in `zlib` module handles `.csv.gz` decompression; no need for an extra dependency.
- **No HTTP client library** — Node 18+ has native `fetch`; `axios`/`node-fetch` would be an unjustified dependency for a one-off download script.

### Deliberately not included
- **`axios`** — native `fetch` is sufficient.
- **`winston`/`pino`** — Nest's built-in `Logger` is enough at this project's scale; revisit if structured/external logging becomes an actual operational need.
- **`uuid`** — Node's native `crypto.randomUUID()` (or Postgres's `gen_random_uuid()` at the column level) covers this without an extra package.

## Data model

Two clearly separated groups of tables:
- **Catalog tables** (`parts`, `colors`, `sets`, `inventory_parts`) — read-only data from Rebrickable, populated by the import job, never written to by the app at runtime.
- **User tables** (`users`, `user_owned_parts`) — the only tables the app writes to during normal operation.

This separation matters because the catalog import runs repeatedly (e.g. monthly) and must never risk corrupting user data.

### `part_categories` (catalog)
`id INT PK`, `name VARCHAR`.

### `colors` (catalog)
`color_id INT PK`, `name VARCHAR`, `rgb VARCHAR(6)`, `is_trans BOOLEAN`. Use Rebrickable's own IDs as the primary key directly — don't renumber, so imports can be plain upserts.

### `themes` (catalog)
`id INT PK`, `name VARCHAR`, `parent_id INT FK → themes.id, nullable` (self-referencing — City → Police/Fire/Airport). For the MVP, just store the hierarchy; don't build UI for it yet.

### `parts` (catalog)
`part_num VARCHAR PK` (Rebrickable part numbers are alphanumeric, not integers), `name VARCHAR`, `part_cat_id INT FK → part_categories.id`.

### `sets` (catalog)
`set_num VARCHAR PK`, `name VARCHAR`, `year SMALLINT`, `theme_id INT FK → themes.id`, `num_parts INT`.

### `inventory_parts` (catalog, largest table — millions of rows)
`id SERIAL PK`, `set_num FK → sets`, `part_num FK → parts`, `color_id FK → colors`, `quantity INT`, `is_spare BOOLEAN`.
- **Unique constraint** on `(set_num, part_num, color_id, is_spare)` — required for idempotent upserts on re-import; without it, re-running the import duplicates rows.
- **Index** on `(part_num, color_id)` — this is the index the matching algorithm relies on (see below).

### `users`
`id UUID PK`, `email VARCHAR UNIQUE`, `password_hash VARCHAR`, `created_at TIMESTAMP`.

### `user_owned_parts` (the only table the app writes to outside of import)
`id SERIAL PK`, `user_id FK → users`, `part_num FK → parts`, `color_id FK → colors`, `quantity INT`.
- **Unique constraint** on `(user_id, part_num, color_id)` — adding a part the user already owns should increment `quantity` via upsert, not create a duplicate row.

### Deliberate simplifications for the MVP
1. **One inventory version per set.** Rebrickable tracks multiple inventory revisions per set; the import always takes the latest version. Versioning is out of scope for the MVP.
2. **Adding a set expands into `user_owned_parts`.** There is no separate "owned sets" entity — adding a set just upserts (adds quantities from) its `inventory_parts` rows into `user_owned_parts`. This keeps the model simple, but means "removing a set" would need to subtract exactly what was added — worth deciding explicitly whether to support removal in the MVP, or only additions.
3. **Match results are never persisted.** They're computed on demand for every query, not cached in a materialized table. The index should make this fast enough without caching — but this is a prediction, not a verified fact (the spike was dropped), so if Sprint 1 shows it's too slow, add caching/a materialized view as a fix at that point, not as a pre-built part of the plan.

## Matching algorithm — how to implement it

This is the most important part of the backend. Don't treat it as "load everything into memory and loop" — the heavy lifting should be done by the database index, with application code just composing queries and computing over a small result set.

### Step 1 — candidate sets
For the input list of owned `(part_num, color_id)[]`, run a query that uses the index on `inventory_parts(part_num, color_id)`:

```sql
SELECT DISTINCT set_num
FROM inventory_parts
WHERE (part_num, color_id) IN ((?, ?), (?, ?), ...)
```

This returns only sets with at least one overlap — typically hundreds, not tens of thousands. **Never scan the full catalog in application code.**

### Step 2 — exact match calculation
For each candidate set (from step 1), load its full `inventory_parts` and compute:

```
match_% = SUM(LEAST(owned_quantity, required_quantity)) / SUM(required_quantity)
```

This can be computed directly in SQL (a JOIN between the set's `inventory_parts` and a temp table/CTE of owned parts), which is more efficient than pulling the data into Node and computing there.

### Step 3 — missing parts
For the displayed (top N) results, compute the difference `required_quantity - owned_quantity` for each part+color pair where it's positive.

### Decisions to keep consistent
- Spare parts (`is_spare = true`) are excluded from the required quantity
- Exact color match only (no "similar colors" in the MVP)
- Minifigure parts — out of scope for now, unless specified otherwise

## Data import

### Source files (from the Rebrickable CSV export)

**Required:**
- `part_categories.csv` → `part_categories`
- `colors.csv` → `colors`
- `themes.csv` → `themes`
- `parts.csv` → `parts`
- `sets.csv` → `sets`
- `inventories.csv` → **not stored as its own table** — used only during import to resolve `inventory_id → set_num` (see join below)
- `inventory_parts.csv` → `inventory_parts`

**Not needed for the MVP:**
- `part_relationships.csv` (alternate/similar parts — a V2 matching improvement)
- `elements.csv` (physical element IDs — needed for BrickLink integration, not matching)
- `minifigs.csv`, `inventory_minifigs.csv` (minifig parts — out of scope)
- `inventory_sets.csv` (sets bundled inside other sets — rare edge case, known limitation, ignore for now)

### Import order

FK dependencies force a specific order — a table can't be imported before the tables it references exist:

```
part_categories → colors → themes → parts → sets → inventories (in-memory only) → inventory_parts
```

### The `inventory_id → set_num` join

`inventory_parts.csv` does **not** contain `set_num` directly — it references `inventory_id`. `inventories.csv` is the bridge table that maps `inventory_id → set_num` (and exists because a set can have multiple inventory revisions over time).

The import must therefore:
1. Load `inventories.csv`, and for each `set_num` keep only the latest version (`MAX(version)` or `MAX(id)` per `set_num`) — this is where the "one inventory version per set" simplification from the data model actually happens.
2. Join `inventory_parts.inventory_id` against that filtered set of `inventory_id`s to resolve each row's `set_num`.
3. Insert into our own `inventory_parts` table with `set_num` already denormalized onto the row — our schema doesn't need a separate `inventories` table at query time, only during this import step.

### Import script

Import script (runnable as a Nest CLI command, not an HTTP endpoint):
1. Downloads the current CSV export from Rebrickable
2. Runs the join described above and imports into `parts`, `colors`, `sets`, `inventory_parts` (upsert, not truncate+insert, so FK references from `user_owned_parts` don't break)
3. Idempotent — can be run repeatedly (e.g. monthly cron) without duplicating data

## Conventions

- TypeScript strict mode enabled
- Import shared types (request/response shapes) from `packages/shared-types`, don't redefine them in the backend
- Write `MatchingService` tests against a small seed dataset (a few sets, a few parts), not the full imported catalog — tests must be fast and deterministic

## Commands (fill in once the project is set up)

```
npm run start:dev      # local dev server
npm run test            # unit tests
npm run import:catalog  # runs the Rebrickable data import
npm run db:migrate      # Drizzle migrations
```