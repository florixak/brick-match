# nextjs-starter

Personal Next.js project template. Production-ready foundation for every new project.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict + erasableSyntaxOnly) |
| Styling | Tailwind CSS v4 + shadcn/ui (base-lyra) |
| Linting | Biome v2 |
| Testing | Vitest |
| Git hooks | Husky + lint-staged + commitlint |
| Package manager | pnpm |

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server (Turbopack)
pnpm dev
```

## Environment Variables

See [`.env.example`](.env.example) for all available variables.

The only required variable is:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm check` | Run Biome linter + formatter check |
| `pnpm check:write` | Auto-fix with Biome |
| `pnpm typecheck` | TypeScript type check |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once (CI) |

## Project Structure

```
app/                  # Next.js App Router
  (marketing)/        # Public marketing pages
  api/                # Route handlers
  error.tsx           # Runtime error boundary ("use client")
  global-error.tsx    # Root layout error fallback ("use client")
  not-found.tsx       # 404 page
  loading.tsx         # Suspense loading UI
  robots.ts           # robots.txt
  sitemap.ts          # sitemap.xml
  manifest.ts         # Web app manifest
  opengraph-image.tsx # OG image generation

actions/              # Server Actions (domain-split, "use server")
components/
  layout/             # Header, Footer, ThemeProvider, ThemeToggle
  skeletons/          # Loading skeleton components
  ui/                 # shadcn/ui components
hooks/                # Custom hooks (use-kebab-case.ts)
lib/
  config.ts           # siteConfig
  env.ts              # Type-safe environment variables
  metadata.ts         # createMetadata() factory
  structured-data.ts  # JSON-LD schema helpers
  utils.ts            # cn(), absoluteUrl()
types/
  index.ts            # Shared type definitions
```

## Conventions

- **No enums** — use `as const` objects with derived union types
- **Server Components by default** — add `"use client"` only when needed
- **Type-safe env vars** — always access via `@/lib/env`, never raw `process.env`
- **Commits** — follow [Conventional Commits](https://www.conventionalcommits.org)

## Adding Optional Integrations

Documented in `.env.example`. Install per project:

- **Database**: `drizzle-orm` + `drizzle-kit` + `@neondatabase/serverless`
- **Auth**: `better-auth` (Drizzle adapter, email + Google OAuth)
- **Payments**: `stripe`
- **Email**: `resend`
- **State**: `@tanstack/react-query` + `zustand`
- **Forms**: `@tanstack/react-form`
