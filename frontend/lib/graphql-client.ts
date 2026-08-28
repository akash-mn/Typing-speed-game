import type { GraphQLErrorItem } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/graphql";
const TOKEN_KEY = "typing-speed-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class GraphQLRequestError extends Error {
  code?: string;
  fieldErrors?: Record<string, string[]>;

  constructor(errors: GraphQLErrorItem[]) {
    super(errors[0]?.message ?? "Something went wrong.");
    this.name = "GraphQLRequestError";
    this.code = errors[0]?.extensions?.code;
    this.fieldErrors = errors[0]?.extensions?.fieldErrors;
  }
}

export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const token = getToken();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Network error (${res.status}). Is the backend running?`);
  }

  const json = await res.json();

  if (json.errors && json.errors.length > 0) {
    throw new GraphQLRequestError(json.errors);
  }

  return json.data as T;
}
