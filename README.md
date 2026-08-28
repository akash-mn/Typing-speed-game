# Keystroke — Typing Speed Game

A full-stack typing speed game. Type 20 randomly generated letters as fast as
possible; every wrong key costs a 0.5-second penalty. Beat your personal
best for **Success**, or fall short for **Try Again**. Every run is saved
and ranked on a global leaderboard.

```
┌────────────┐        GraphQL         ┌──────────────────┐        ┌────────────┐
│  Next.js 16 │ ─────────────────────▶ │  Bun + GraphQL    │ ─────▶ │ PostgreSQL │
│  Tailwind 4 │ ◀───────────────────── │  Yoga + Prisma     │ ◀───── │ (Supabase  │
│  TypeScript │      JWT bearer        │  (auth, game logic)│        │  or Docker)│
└────────────┘                         └──────────────────┘        └────────────┘
```

## Repository layout

```
.
├── backend/     Bun + TypeScript + GraphQL Yoga + Prisma API
├── frontend/    Next.js 16 + Tailwind CSS v4 + TypeScript UI
└── docker-compose.yml   Postgres (dev + test) and the backend container
```

## Quick start (local development)

**1. Start Postgres**

```bash
docker compose up -d postgres postgres_test
```

**2. Backend**

```bash
cd backend
cp .env.example .env
bun install
bun run prisma:generate
bun run prisma:migrate
bun run db:seed        # optional demo data (login: demo@example.com / password123)
bun run dev            # http://localhost:4000/graphql
```

**3. Frontend** (in a second terminal)

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev             # http://localhost:3000
```

Open **http://localhost:3000**, create an account, and play.

Full details, including how to run the automated test suite and how to
point at a **Supabase** Postgres database for production, are in
`backend/README.md` and `frontend/README.md`.

## Feature checklist (per assignment spec)

- [x] Timer starts at 0 seconds when a game begins
- [x] 20 randomly generated letters, one at a time
- [x] Advances only on the correct key press
- [x] +0.5s penalty per incorrect key press
- [x] Game area stays focused throughout the round
- [x] Live progress indicator (`N / 20`) plus a punch-card style dot tracker
- [x] Final score shown on completion (time + error count)
- [x] Success vs. Failure / Try Again based on personal best
- [x] Best score persisted locally (`localStorage`) **and** server-side per account
- [x] Game results persisted to PostgreSQL via Prisma
- [x] Global leaderboard (ranked by best time)
- [x] Registration + login with hashed passwords and JWT auth
- [x] Zod input validation surfaced as structured GraphQL errors (`extensions.code`)
- [x] Automated tests, including integration tests that run against a real Postgres instance
- [x] Prisma migrations
- [x] Docker Compose for local infra
- [x] Setup documentation (this file + per-package READMEs)

## Deploying with Supabase

1. Create a Supabase project and copy its Postgres connection string.
2. Set `backend`'s `DATABASE_URL` to that string (see `backend/.env.example` for the exact format, including `?pgbouncer=true` if you're using Supabase's connection pooler).
3. Run `bunx prisma migrate deploy` once against that database to create the tables.
4. Deploy the backend (any Node/Bun-compatible host, or the provided `backend/Dockerfile`) and the frontend (e.g. Vercel), setting `NEXT_PUBLIC_API_URL` on the frontend to the deployed backend's `/graphql` URL.
