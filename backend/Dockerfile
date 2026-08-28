FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

COPY . .
RUN bunx prisma generate

EXPOSE 4000
CMD ["sh", "-c", "bunx prisma migrate deploy && bun run start"]
