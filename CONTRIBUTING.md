# Contributing

This is a pnpm workspace (Turborepo) with two apps: `apps/api` (NestJS backend) and `apps/web` (Next.js frontend).

## Setup

```bash
pnpm install
cp .env.example .env                      # docker compose reads this even for `up postgres` alone
docker compose up -d postgres
cp apps/api/.env.example apps/api/.env    # fill in JWT_SECRET, etc. — read by the Node app itself
pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma db seed
```

## Before opening a PR

```bash
pnpm lint        # turbo run lint — both apps
pnpm test        # turbo run test — apps/api unit tests
pnpm typecheck    # turbo run typecheck
pnpm --filter api test:e2e
```

A Husky pre-commit hook runs `lint-staged` (ESLint + Prettier) automatically on staged files, but running the full checks above before pushing catches what staged-file linting can't (typecheck, e2e).

## Conventions

- Follow the existing layering in `apps/api/src/<module>`: Controller → Service → Repository interface (DI token) → Prisma repository. See `apps/api/README.md` for the full architecture rundown.
- New unit tests are co-located as `*.spec.ts` next to the file under test; e2e tests live in `apps/api/test/*.e2e-spec.ts`.
- `apps/api`'s `tsconfig.json` runs full `strict: true` and ESLint treats `no-explicit-any`/`no-floating-promises`/`no-unsafe-argument` as errors — don't loosen these without discussion.
- Commit messages: short, imperative, focused on *why* over *what*.

## Reporting issues

Open a GitHub issue with reproduction steps. For security-sensitive issues, do not open a public issue — contact a maintainer directly.
