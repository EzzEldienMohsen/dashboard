# School Dashboard

A multi-tenant school management dashboard — schools, classes, students, grades,
attendance, announcements, and an audit trail, with role-based access for
managers and teachers. Full English/Arabic localization on both ends.

**Stack:** NestJS 11 · Prisma 7 (driver adapters, no engine binary) · PostgreSQL ·
Redis/BullMQ · Next.js 16 (App Router, Turbopack) · React 19 · daisyUI/Tailwind 4 ·
next-intl · Sentry · pnpm workspaces + Turborepo

## Quick start (Docker)

Requires Docker and Node/pnpm (for the frontend dev server).

```bash
git clone <this-repo>
cd "students dashboard"
pnpm install

# Backend: Postgres + Redis + the NestJS API, migrated and ready
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))") docker compose up -d --build

# Frontend
pnpm --filter web dev
```

Open **http://localhost:3001**. Log in with a seeded demo account:

| Role | Email | Password |
|---|---|---|
| Manager | `manager@schooldashboard.dev` | `Password123!` |
| Teacher | `teacher@schooldashboard.dev` | `Password123!` |

(Demo data isn't seeded automatically — run this once after the stack is up:
```bash
DATABASE_URL="postgresql://school_dashboard:school_dashboard_dev@localhost:5432/school_dashboard?schema=public" \
  pnpm --filter api exec prisma db seed
```
)

The API's Swagger docs are at **http://localhost:3000/docs**; a liveness/readiness
probe is at `/health`.

## Repo layout

```
apps/api/      NestJS backend — modular monolith, Controller → Service →
               Repository-interface → Prisma pattern per domain module
apps/web/      Next.js frontend — server-only BFF calls to the API, no
               browser-to-API calls (see apps/web/src/lib/api/)
packages/      Shared workspace packages (config, shared-types)
```

Each app has its own deeper README:
- [`apps/api/README.md`](apps/api/README.md) — architecture, DI conventions,
  caching, performance notes
- [`apps/web/README.md`](apps/web/README.md) — Next.js specifics

For native (non-Docker) local dev and the PR checklist, see
[`CONTRIBUTING.md`](CONTRIBUTING.md). For deploying this to real infrastructure
(free-tier Postgres/Redis/hosting), see [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Notable design decisions

- **Prisma driver adapters** (`@prisma/adapter-pg`) instead of the classic query
  engine binary — lighter Docker image, no native-binary platform matching.
- **BFF pattern**: the browser never talks to the API directly; only the Next.js
  server does (Server Components, Server Actions), so CORS isn't a factor for the
  app's own traffic.
- **Repository-interface DI**: every domain service depends on a `Symbol`-bound
  repository interface, never the concrete Prisma implementation, making the
  persistence layer swappable and services trivially unit-testable.
