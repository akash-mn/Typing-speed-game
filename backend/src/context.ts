import type { YogaInitialContext } from "graphql-yoga";
import { prisma } from "./lib/prisma";
import { extractBearerToken, verifyToken } from "./lib/auth";

export interface GraphQLContext {
  prisma: typeof prisma;
  userId: string | null;
}

export async function createContext({ request }: YogaInitialContext): Promise<GraphQLContext> {
  const authHeader = request.headers.get("authorization");
  const token = extractBearerToken(authHeader);
  const payload = token ? verifyToken(token) : null;

  return {
    prisma,
    userId: payload?.userId ?? null,
  };
}
