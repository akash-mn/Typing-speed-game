import { describe, it, expect, beforeEach, afterAll } from "bun:test";
import { execute, resetDatabase, testPrisma } from "./setup";
import { hashPassword } from "../lib/auth";

const SUBMIT = /* GraphQL */ `
  mutation Submit($timeMs: Int!, $errorCount: Int!) {
    submitGameResult(timeMs: $timeMs, errorCount: $errorCount) {
      outcome
      previousBestMs
      result {
        timeMs
        errorCount
        isNewBest
      }
    }
  }
`;

const LEADERBOARD = /* GraphQL */ `
  query Leaderboard($limit: Int) {
    leaderboard(limit: $limit) {
      rank
      username
      bestTimeMs
    }
  }
`;

async function createUser(email: string, username: string) {
  return testPrisma.user.create({
    data: { email, username, passwordHash: await hashPassword("password123") },
  });
}

describe("game results (integration, real Postgres)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await testPrisma.$disconnect();
  });

  it("rejects submission from an unauthenticated request", async () => {
    const result = await execute(SUBMIT, { timeMs: 9000, errorCount: 1 }, null);
    expect(result.data?.submitGameResult).toBeNull();
    expect(result.errors?.[0]?.extensions?.code).toBe("UNAUTHENTICATED");
  });

  it("marks the first submission as a new best (SUCCESS)", async () => {
    const user = await createUser("first@example.com", "first_runner");

    const result = await execute(SUBMIT, { timeMs: 12000, errorCount: 2 }, user.id);

    expect(result.errors).toBeUndefined();
    const data = result.data?.submitGameResult as any;
    expect(data.outcome).toBe("SUCCESS");
    expect(data.previousBestMs).toBeNull();
    expect(data.result.isNewBest).toBe(true);

    const updated = await testPrisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.bestTimeMs).toBe(12000);
  });

  it("returns FAILURE for a slower run and SUCCESS for a faster one", async () => {
    const user = await createUser("second@example.com", "second_runner");

    await execute(SUBMIT, { timeMs: 10000, errorCount: 0 }, user.id);

    const slower = await execute(SUBMIT, { timeMs: 15000, errorCount: 3 }, user.id);
    expect((slower.data?.submitGameResult as any).outcome).toBe("FAILURE");
    expect((slower.data?.submitGameResult as any).previousBestMs).toBe(10000);

    const faster = await execute(SUBMIT, { timeMs: 8000, errorCount: 1 }, user.id);
    expect((faster.data?.submitGameResult as any).outcome).toBe("SUCCESS");

    const updated = await testPrisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.bestTimeMs).toBe(8000);

    const history = await testPrisma.gameResult.count({ where: { userId: user.id } });
    expect(history).toBe(3); // all 3 runs persisted regardless of outcome
  });

  it("rejects an out-of-range timeMs with a validation error", async () => {
    const user = await createUser("invalid@example.com", "invalid_runner");
    const result = await execute(SUBMIT, { timeMs: 100, errorCount: 0 }, user.id);
    expect(result.data?.submitGameResult).toBeNull();
    expect(result.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
  });

  it("ranks the leaderboard by best time ascending", async () => {
    const alice = await createUser("alice@example.com", "alice");
    const bob = await createUser("bob@example.com", "bob");
    const carol = await createUser("carol@example.com", "carol");

    await execute(SUBMIT, { timeMs: 9000, errorCount: 0 }, alice.id);
    await execute(SUBMIT, { timeMs: 7000, errorCount: 1 }, bob.id);
    await execute(SUBMIT, { timeMs: 11000, errorCount: 2 }, carol.id);

    const result = await execute(LEADERBOARD, { limit: 10 });
    const entries = result.data?.leaderboard as any[];

    expect(entries.map((e) => e.username)).toEqual(["bob", "alice", "carol"]);
    expect(entries[0].rank).toBe(1);
    expect(entries[0].bestTimeMs).toBe(7000);
  });
});
