// import { createSchema, createYoga } from "graphql-yoga";
// import { typeDefs } from "./schema";
// import { resolvers } from "./resolvers";
// import { createContext } from "./context";

// const schema = createSchema({
//   typeDefs,
//   resolvers,
// });

// const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",");

// const yoga = createYoga({
//   schema,
//   context: createContext,
//   graphiql: process.env.NODE_ENV !== "production",
//   cors: {
//     origin: allowedOrigins,
//     credentials: true,
//     methods: ["POST", "GET", "OPTIONS"],
//   },
//   maskedErrors: {
//     // Preserve our own thrown GraphQLErrors (with extensions.code) as-is;
//     // only mask truly unexpected internal errors so we don't leak stack
//     // traces, while still returning meaningful messages for known errors.
//     isDev: process.env.NODE_ENV !== "production",
//   },
// });

// const port = Number(process.env.PORT ?? 4000);

// Bun.serve({
//   port,
//   fetch: yoga.fetch,
// });

// console.log(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);
import { createSchema, createYoga } from "graphql-yoga";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { createContext } from "./context";

const schema = createSchema({
  typeDefs,
  resolvers,
});

// Exact origins from CORS_ORIGIN (comma-separated), e.g. your production Vercel domain.
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

// Vercel gives every preview/branch deploy a unique subdomain like
// typing-speed-game-git-main-akash-mn-projects.vercel.app, so an exact-match
// list alone breaks on every new preview. Allow any *.vercel.app subdomain
// in addition to the explicit list above.
const previewPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin) || previewPattern.test(origin);
}

const yoga = createYoga({
  schema,
  context: createContext,
  graphiql: process.env.NODE_ENV !== "production",
  cors: (request) => {
    const origin = request.headers.get("origin");
    return {
      origin: isAllowedOrigin(origin) ? origin! : allowedOrigins[0],
      credentials: true,
      methods: ["POST", "GET", "OPTIONS"],
    };
  },
  maskedErrors: {
    isDev: process.env.NODE_ENV !== "production",
  },
});

const port = Number(process.env.PORT ?? 4000);

Bun.serve({
  port,
  fetch: yoga.fetch,
});

console.log(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);