# syntax=docker/dockerfile:1
# Multi-stage build for the api service out of the pnpm workspace monorepo.
# Build from the repo root: `docker build -f apps/api/Dockerfile .`

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

# ---- deps: full workspace install (dev deps included) for building ----
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma.config.ts apps/api/prisma.config.ts
COPY apps/api/prisma/schema.prisma apps/api/prisma/schema.prisma
COPY apps/api/scripts apps/api/scripts
COPY packages/config/package.json packages/config/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN pnpm install --frozen-lockfile

# ---- build: generate the Prisma client and compile TypeScript ----
FROM deps AS build
COPY . .
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

# ---- prod-deps: apps/api's production dependencies only ----
FROM base AS prod-deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma.config.ts apps/api/prisma.config.ts
COPY apps/api/prisma/schema.prisma apps/api/prisma/schema.prisma
COPY apps/api/scripts apps/api/scripts
COPY packages/config/package.json packages/config/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN pnpm install --frozen-lockfile --prod --filter api...

# ---- runtime: minimal final image ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=prod-deps /repo/apps/api/node_modules ./apps/api/node_modules
COPY apps/api/package.json apps/api/package.json
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/generated ./apps/api/generated

USER node
EXPOSE 3000
CMD ["node", "apps/api/dist/src/main.js"]
