import type { GraphQLContext } from "../context";
import { AuthError, NotFoundError } from "../lib/errors";
import { parseOrThrow, submitGameResultSchema } from "../lib/validation";

export const gameResolvers = {
  Query: {
    leaderboard: async (
      _parent: unknown,
      args: { limit?: number },
      ctx: GraphQLContext
    ) => {
      const limit = args.limit && args.limit > 0 ? Math.min(args.limit, 100) : 10;

      // Rank users by their personal best time. Users with no best yet are excluded.
      const topUsers = await ctx.prisma.user.findMany({
        where: { bestTimeMs: { not: null } },
        orderBy: { bestTimeMs: "asc" },
        take: limit,
      });

      return topUsers.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        bestTimeMs: user.bestTimeMs as number,
        achievedAt: user.createdAt.toISOString(),
      }));
    },

    myResults: async (_parent: unknown, args: { limit?: number }, ctx: GraphQLContext) => {
      if (!ctx.userId) throw AuthError();
      const limit = args.limit && args.limit > 0 ? Math.min(args.limit, 100) : 20;

      return ctx.prisma.gameResult.findMany({
        where: { userId: ctx.userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    },
  },

  Mutation: {
    submitGameResult: async (
      _parent: unknown,
      args: { timeMs: number; errorCount: number },
      ctx: GraphQLContext
    ) => {
      if (!ctx.userId) throw AuthError("Log in to save your game results.");

      const input = parseOrThrow(submitGameResultSchema, args);

      const user = await ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
      if (!user) throw NotFoundError("User not found.");

      const previousBestMs = user.bestTimeMs;
      const isNewBest = previousBestMs === null || input.timeMs < previousBestMs;

      const [result] = await ctx.prisma.$transaction([
        ctx.prisma.gameResult.create({
          data: {
            userId: ctx.userId,
            timeMs: input.timeMs,
            errorCount: input.errorCount,
            isNewBest,
          },
          include: { user: true },
        }),
        ...(isNewBest
          ? [
              ctx.prisma.user.update({
                where: { id: ctx.userId },
                data: { bestTimeMs: input.timeMs },
              }),
            ]
          : []),
      ]);

      return {
        result,
        outcome: isNewBest ? "SUCCESS" : "FAILURE",
        previousBestMs,
      };
    },
  },
};
