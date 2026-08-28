import { GraphQLError } from "graphql";

/**
 * Wraps errors with a stable `code` in extensions so the frontend can branch
 * on error type (e.g. show a field-level message for VALIDATION_ERROR vs a
 * toast for UNAUTHENTICATED), while the `message` stays human-readable.
 */
export function gqlError(message: string, code: string, extra?: Record<string, unknown>) {
  return new GraphQLError(message, {
    extensions: { code, ...extra },
  });
}

export const AuthError = (message = "You must be logged in to do this.") =>
  gqlError(message, "UNAUTHENTICATED");

export const ForbiddenError = (message = "You are not allowed to do this.") =>
  gqlError(message, "FORBIDDEN");

export const ValidationError = (message: string, fieldErrors?: Record<string, string[]>) =>
  gqlError(message, "BAD_USER_INPUT", { fieldErrors });

export const NotFoundError = (message = "Not found.") => gqlError(message, "NOT_FOUND");

export const ConflictError = (message: string) => gqlError(message, "CONFLICT");
