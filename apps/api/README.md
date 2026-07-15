# School Dashboard API

NestJS backend for the School Dashboard monorepo — a modular monolith (module-per-domain in one deployable process, not physically separate microservices) backed by Postgres via Prisma.

## Architecture

Each domain module (`schools`, `classes`, `students`, `school-profile`, `announcements`, `auth`, `users`) follows the same layered pattern:

```
Controller → Service → Repository interface (DI token) → Prisma repository → Postgres
```

- **DI / SOLID**: repositories are bound behind an interface via a `Symbol` token (e.g. `SCHOOL_REPOSITORY`), so services depend only on the interface — never the concrete Prisma implementation. `auth` additionally abstracts password hashing (`IPasswordHasher`) and token issuance (`ITokenService`) the same way.
- **Errors**: every domain exception extends `AppException` (`src/common/exceptions/`); not-found exceptions share a `NotFoundAppException` base. A global `AllExceptionsFilter` normalizes all errors into a consistent JSON shape, logs via Pino, and reports 5xx errors to Sentry — masking the message in production.
- **Caching**: `@nestjs/cache-manager`, applied per-route via `CacheInterceptor` + an explicit `Cache-Control` header. The store is in-memory by default; set `REDIS_URL` to back it with Redis instead (required once you run more than one replica — see `src/app.module.ts`).
- **Public vs. protected routes**: `schools`/`classes`/`students` require `JwtAuthGuard` + `RolesGuard`; `school-profile`/`announcements`/`health` are intentionally public (no guards) since they're static/informational content, not per-user data.
- **Pagination**: every list endpoint shares `PaginationQueryDto` (`page`, `limit`, capped at 100) and a shared `paginate()` helper (`src/common/utils/paginate.ts`) that wraps the `findMany` + `count` pattern.

## Getting started

```bash
pnpm install
cp ../../.env.example ../../.env         # docker compose reads this even for `up postgres` alone
docker compose up -d postgres            # add `redis` too if you want to exercise the Redis cache path locally
cp .env.example .env                     # fill in JWT_SECRET etc. — this one is read by the Node app itself
pnpm exec prisma migrate deploy
pnpm exec prisma db seed
pnpm start:dev
```

(paths above are relative to `apps/api`; run from the repo root if you're using the `pnpm --filter api <script>` form instead)

`GET /health` reports database connectivity (via `@nestjs/terminus`) and is meant for orchestrator liveness/readiness probes.

## Running with Docker

```bash
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))") docker compose up -d --build
```

This builds `apps/api/Dockerfile` (multi-stage pnpm build) and starts `postgres`, `redis`, and `api` together — the api container automatically uses `REDIS_URL=redis://redis:6379`, so the cache is Redis-backed out of the box in this mode.

## Tests

```bash
pnpm --filter api test        # unit tests (co-located *.spec.ts, mocked repositories/services)
pnpm --filter api test:cov    # coverage — enforced via a coverageThreshold in package.json's jest config
pnpm --filter api test:e2e    # supertest against a real Nest app + Postgres (test/*.e2e-spec.ts)
```

Bootstrap files (`main.ts`, `instrument.ts`) and `*.module.ts` DI-wiring files are excluded from the coverage threshold — they contain no branching logic and are already exercised for real by the e2e suite (which boots the actual `AppModule`).

## Performance notes

- The Postgres connection pool is sized via `DB_POOL_SIZE` / `DB_POOL_IDLE_TIMEOUT_MS` / `DB_POOL_CONNECTION_TIMEOUT_MS` (see `.env.example`) — size `DB_POOL_SIZE` to `postgres max_connections / replica count`, leaving headroom for other services.
- Queries slower than `SLOW_QUERY_THRESHOLD_MS` (default 200ms) are logged as warnings outside production (`src/prisma/prisma.service.ts`).
- A load-test baseline (autocannon, 20 connections × 8s, local Docker Postgres) against representative routes: `/announcements` ~2250 req/s avg (7-8ms avg latency, p99 ~49ms), `/school-profile` ~2500 req/s avg (p99 ~47ms), authenticated+cached `/schools` ~2500 req/s avg (p99 ~48ms) — zero errors across all three.

## Code quality

- `pnpm --filter api lint` — ESLint (flat config, type-aware), `no-explicit-any`/`no-floating-promises`/`no-unsafe-argument` are hard errors.
- `tsconfig.json` runs full `strict: true`.
- A Husky pre-commit hook runs `lint-staged` (ESLint + Prettier) on staged files across both `apps/api` and `apps/web`.
