# Typing Speed Game — Backend

Bun + TypeScript + GraphQL Yoga + Prisma + PostgreSQL.

## Stack

- **Runtime:** Bun
- **API:** GraphQL Yoga (schema-first, `graphql-yoga`)
- **ORM / migrations:** Prisma
- **DB:** PostgreSQL (local via Docker Compose, or Supabase in production)
- **Auth:** JWT (bearer token) + bcrypt password hashing
- **Validation:** Zod, translated into structured GraphQL errors
- **Tests:** `bun:test`, run as real integration tests against a live Postgres instance

## 1. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

## 2. Start Postgres (local dev + test databases)

From the **repo root**:

```bash
docker compose up -d postgres postgres_test
```

This starts:
- `postgres` on `localhost:5432` — your dev database
- `postgres_test` on `localhost:5433` — a disposable database used only by the automated test suite

## 3. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
- For **local dev**, the default `DATABASE_URL` already points at the Docker Compose `postgres` service — no changes needed.
- For **production**, replace `DATABASE_URL` with your Supabase connection string, e.g.:
  ```
  DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public&pgbouncer=true"
  ```
- Set `JWT_SECRET` to a long random string in any real deployment.

## 4. Install dependencies & run migrations

```bash
bun install
bun run prisma:generate
bun run prisma:migrate   # creates the `users` and `game_results` tables
```

Also apply the same migrations to the test database once, before running tests:

```bash
DATABASE_URL="postgresql://typing_game_test:typing_game_test@localhost:5433/typing_game_test?schema=public" bunx prisma migrate deploy
```

## 5. (Optional) Seed demo data

```bash
bun run db:seed
```

Creates 5 demo users (all with password `password123`) with sample leaderboard scores.

## 6. Run the dev server

```bash
bun run dev
```

GraphQL endpoint + GraphiQL playground: **http://localhost:4000/graphql**

## 7. Run tests

Make sure `postgres_test` is running and migrated (steps 2 and 4), then:

```bash
bun test
```

`src/tests/auth.test.ts` and `src/tests/game.test.ts` execute real GraphQL operations against the schema, backed by a real Postgres instance (`TEST_DATABASE_URL`) via Prisma — registration, login, game-result submission, best-score tracking, and leaderboard ranking are all covered end-to-end against the database, not mocks.

## API overview

```graphql
mutation Register($email: String!, $username: String!, $password: String!) {
  register(email: $email, username: $username, password: $password) {
    token
    user { id username email }
  }
}

mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user { id username }
  }
}

# Authenticated (send `Authorization: Bearer <token>` header)
mutation Submit($timeMs: Int!, $errorCount: Int!) {
  submitGameResult(timeMs: $timeMs, errorCount: $errorCount) {
    outcome        # SUCCESS | FAILURE
    previousBestMs
    result { timeMs errorCount isNewBest }
  }
}

query Leaderboard {
  leaderboard(limit: 10) { rank username bestTimeMs }
}

query Me {
  me { id username email bestTimeMs }
}
```

Errors are returned with a stable `extensions.code` (`BAD_USER_INPUT`, `UNAUTHENTICATED`, `CONFLICT`, `NOT_FOUND`) plus a human-readable `message`, so the frontend can branch on error type reliably.

## Docker Compose (full stack)

From the repo root, `docker compose up --build` builds and runs the backend container itself (applying `prisma migrate deploy` on boot) alongside Postgres.
