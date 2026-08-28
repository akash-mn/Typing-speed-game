import { authResolvers } from "./auth";
import { gameResolvers } from "./game";

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...gameResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...gameResolvers.Mutation,
  },
  User: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
  },
  GameResult: {
    createdAt: (parent: { createdAt: Date }) => parent.createdAt.toISOString(),
  },
};
