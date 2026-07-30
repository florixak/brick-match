# Build context must be the repository root:
#   docker build -f api/Dockerfile .
FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV CI=true
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared-types/package.json shared-types/tsconfig.json ./shared-types/
COPY api/package.json api/nest-cli.json api/tsconfig.json api/tsconfig.app.json api/tsconfig.build.json ./api/

# Skip lifecycle scripts until source is copied (shared-types `prepare` runs tsc).
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY shared-types ./shared-types
COPY api ./api

RUN pnpm --filter @lego-matcher/shared-types build && \
    pnpm --filter api build && \
    pnpm rebuild argon2 && \
    pnpm deploy --filter api --prod --legacy /app/deploy

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/deploy ./
COPY --from=builder /app/api/dist ./dist

USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
