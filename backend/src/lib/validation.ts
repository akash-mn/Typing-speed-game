import { z } from "zod";
import { ValidationError } from "./errors";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username must be at most 20 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const submitGameResultSchema = z.object({
  // Total time in milliseconds to complete all 20 characters, including penalties.
  timeMs: z
    .number()
    .int("Time must be a whole number of milliseconds.")
    .min(1000, "That time looks too fast to be real (minimum 1 second).")
    .max(600000, "That time exceeds the maximum allowed (10 minutes)."),
  errorCount: z
    .number()
    .int("Error count must be a whole number.")
    .min(0, "Error count cannot be negative.")
    .max(1000, "Error count is unreasonably high."),
});

export const leaderboardArgsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
});

/**
 * Runs a zod schema and throws a well-formed GraphQL validation error
 * (with per-field messages) instead of letting a ZodError leak through.
 */
export function parseOrThrow<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "_";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }
    const firstMessage = result.error.issues[0]?.message ?? "Invalid input.";
    throw ValidationError(firstMessage, fieldErrors);
  }
  return result.data;
}
