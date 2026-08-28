import { PrismaClient } from "@prisma/client";
import { graphql, type ExecutionResult } from "graphql";
import { createSchema } from "graphql-yoga";
import { typeDefs } from "../schema";
import { resolvers } from "../resolvers";
import type { GraphQLContext } from "../context";

// This suite talks to a REAL Postgres instance (the `postgres_test` service
// in docker-compose.yml) via Prisma — it is an integration test, not a mock.
// Point it at TEST_DATABASE_URL so it never touches dev/prod data.
const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://typing_game_test:typing_game_test@localhost:5433/typing_game_test?schema=public";

export const testPrisma = new PrismaClient({
  datasources: { db: { url: testDatabaseUrl } },
});

export const schema = createSchema({ typeDefs, resolvers });

/** Deletes all rows between tests so each test starts from a clean slate. */
export async function resetDatabase() {
  await testPrisma.gameResult.deleteMany();
  await testPrisma.user.deleteMany();
}

/**
 * Executes a GraphQL operation directly against the schema (no HTTP hop),
 * using the real test-database-backed Prisma client. Optionally simulate an
 * authenticated request by passing a userId, mirroring what `createContext`
 * would produce after decoding a JWT.
 */
export async function execute(
  source: string,
  variableValues?: Record<string, unknown>,
  userId: string | null = null
): Promise<ExecutionResult> {
  const contextValue: GraphQLContext = { prisma: testPrisma, userId };
  return graphql({ schema, source, variableValues, contextValue });
}
