import { createSchema, createYoga } from "graphql-yoga";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { createContext } from "./context";

const schema = createSchema({
  typeDefs,
  resolvers,
});

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",");

const yoga = createYoga({
  schema,
  context: createContext,
  graphiql: process.env.NODE_ENV !== "production",
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["POST", "GET", "OPTIONS"],
  },
  maskedErrors: {
    // Preserve our own thrown GraphQLErrors (with extensions.code) as-is;
    // only mask truly unexpected internal errors so we don't leak stack
    // traces, while still returning meaningful messages for known errors.
    isDev: process.env.NODE_ENV !== "production",
  },
});

const port = Number(process.env.PORT ?? 4000);

Bun.serve({
  port,
  fetch: yoga.fetch,
});

console.log(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);
