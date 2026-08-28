import type { GraphQLContext } from "../context";
import { hashPassword, signToken, verifyPassword } from "../lib/auth";
import { ConflictError, ValidationError } from "../lib/errors";
import { loginSchema, parseOrThrow, registerSchema } from "../lib/validation";
import { Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";

export const authResolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      if (!ctx.userId) return null;
      return ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
    },
  },
  Mutation: {
    guest: async (_parent: unknown, _args: unknown, ctx: GraphQLContext) => {
      const passwordHash = await hashPassword(randomBytes(32).toString("hex"));

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const username = `guest${randomBytes(3).toString("hex")}`;
        const email = `${username}@guest.local`;

        try {
          const user = await ctx.prisma.user.create({
            data: { email, username, passwordHash },
          });
          const token = signToken({ userId: user.id, email: user.email, username: user.username });
          return { token, user };
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            continue;
          }
          throw err;
        }
      }

      throw ConflictError("Couldn't create a guest account. Please try again.");
    },
    register: async (
      _parent: unknown,
      args: { email: string; username: string; password: string },
      ctx: GraphQLContext
    ) => {
      const input = parseOrThrow(registerSchema, args);

      const passwordHash = await hashPassword(input.password);

      try {
        const user = await ctx.prisma.user.create({
          data: {
            email: input.email,
            username: input.username,
            passwordHash,
          },
        });

        const token = signToken({ userId: user.id, email: user.email, username: user.username });
        return { token, user };
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          const target = (err.meta?.target as string[] | undefined)?.[0];
          if (target === "email") throw ConflictError("An account with that email already exists.");
          if (target === "username") throw ConflictError("That username is already taken.");
          throw ConflictError("That account already exists.");
        }
        throw err;
      }
    },

    login: async (
      _parent: unknown,
      args: { email: string; password: string },
      ctx: GraphQLContext
    ) => {
      const input = parseOrThrow(loginSchema, args);

      const user = await ctx.prisma.user.findUnique({ where: { email: input.email } });
      if (!user) throw ValidationError("Incorrect email or password.");

      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) throw ValidationError("Incorrect email or password.");

      const token = signToken({ userId: user.id, email: user.email, username: user.username });
      return { token, user };
    },
  },
};
