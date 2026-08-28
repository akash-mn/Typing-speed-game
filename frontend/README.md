# Typing Speed Game — Frontend

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.

## Setup

```bash
cd frontend
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm install                        # or bun install / pnpm install
npm run dev
```

Open **http://localhost:3000**. Make sure the backend (see `../backend/README.md`) is running first.

## Pages

- `/` — landing page with the combined login / register form
- `/game` — the typing challenge (requires login)
- `/leaderboard` — global leaderboard of best times

## Notes

- The best score is persisted **locally** in `localStorage` (`typing-speed-best-ms`) for instant Success/Failure feedback even offline, and is also submitted to the backend (`submitGameResult`) so it's tied to the account and shows up on the shared leaderboard. The server's outcome is treated as authoritative once available.
- The JWT returned by `login` / `register` is stored in `localStorage` and sent as `Authorization: Bearer <token>` on every GraphQL request.
- Styling uses Tailwind v4's CSS-based theme (`app/globals.css`, `@theme` block) — no `tailwind.config.js` needed.

## Production build

```bash
npm run build
npm run start
```

Deploy anywhere that supports Next.js (Vercel, a Node server, or a container). Set `NEXT_PUBLIC_API_URL` to your deployed backend's `/graphql` URL.
